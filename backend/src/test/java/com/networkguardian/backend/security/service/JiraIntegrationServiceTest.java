package com.networkguardian.backend.security.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import com.networkguardian.backend.audit.service.DecisionAuditService;
import com.networkguardian.backend.common.dto.DecisionAudit;
import com.networkguardian.backend.security.dto.RemediationPlan;
import com.networkguardian.backend.security.jira.JiraClient;
import com.networkguardian.backend.security.jira.JiraRestClient.JiraClientException;
import com.networkguardian.backend.repository.SecurityFindingRepository;
import com.networkguardian.backend.security.model.SecurityFinding;

class JiraIntegrationServiceTest {

    private DecisionAuditService auditService;
    private JiraClient jiraClient;
        private SecurityFindingRepository findingRepository;
    private JiraIntegrationService service;
    private DecisionAudit planAudit;

    @BeforeEach
    void setUp() {
        auditService = mock(DecisionAuditService.class);
        jiraClient = mock(JiraClient.class);
        findingRepository = mock(SecurityFindingRepository.class);
        service = new JiraIntegrationService(auditService, findingRepository, jiraClient,
                "https://jira.example", "SEC", "Highest", "High", "Medium", "Low");
        when(findingRepository.findById(any())).thenReturn(Optional.of(SecurityFinding.builder().id("F-1").build()));
        planAudit = DecisionAudit.builder()
                .decisionId("PLAN-1")
                .incidentId("F-1")
                .module("SECURITY")
                .timestamp(LocalDateTime.now())
                .remediationPlan(plan("F-1", "High"))
                .build();
        when(auditService.findLatestRemediationPlan("F-1", "SECURITY")).thenReturn(Optional.of(planAudit));
        when(auditService.findExistingJiraTicket("F-1", "SECURITY")).thenReturn(Optional.empty());
    }

    @Test
    void createsTicketWithMappedPriorityAndValidatedOwner() {
        when(jiraClient.isValidAccountId("account-1")).thenReturn(true);
        when(jiraClient.createIssue(eq("SEC"), any(), any(), eq("High"), eq("account-1")))
                .thenReturn(new JiraClient.JiraIssue("SEC-42", "https://jira.example/browse/SEC-42"));

        var response = service.createIssue("F-1");

        assertThat(response.getJiraKey()).isEqualTo("SEC-42");
        assertThat(response.getStatus()).isEqualTo("CREATED");
        verify(auditService).recordJiraTicket(eq(planAudit), eq("SEC-42"), eq("https://jira.example/browse/SEC-42"),
                eq("account-1"), eq("CREATED"), any());
    }

    @Test
    void returnsExistingTicketWithoutCreatingDuplicate() {
        DecisionAudit existing = DecisionAudit.builder().jiraKey("SEC-7").jiraUrl("https://jira.example/browse/SEC-7")
                .jiraAssignee("account-7").jiraCreatedAt(LocalDateTime.now()).build();
        when(auditService.findExistingJiraTicket("F-1", "SECURITY")).thenReturn(Optional.of(existing));

        var response = service.createIssue("F-1");

        assertThat(response.getStatus()).isEqualTo("ALREADY_EXISTS");
        assertThat(response.getJiraKey()).isEqualTo("SEC-7");
        verify(jiraClient, never()).createIssue(any(), any(), any(), any(), any());
    }

    @Test
    void leavesInvalidOwnerUnassigned() {
        when(jiraClient.isValidAccountId("not-a-jira-account")).thenReturn(false);
        when(jiraClient.createIssue(eq("SEC"), any(), any(), eq("High"), eq(null)))
                .thenReturn(new JiraClient.JiraIssue("SEC-43", "https://jira.example/browse/SEC-43"));

        var response = service.createIssue("F-1");

        assertThat(response.getAssignee()).isNull();
        verify(jiraClient).createIssue(eq("SEC"), any(), any(), eq("High"), eq(null));
    }

    @Test
    void handlesMissingPlanAndJiraFailures() {
        when(auditService.findLatestRemediationPlan("missing", "SECURITY")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.createIssue("missing"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Remediation plan not found");

        when(jiraClient.isValidAccountId("account-1")).thenReturn(true);
        when(jiraClient.createIssue(any(), any(), any(), any(), any()))
                .thenThrow(new JiraClientException("offline"));
        assertThatThrownBy(() -> service.createIssue("F-1"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("could not create");
    }

        @Test
        void rejectsMissingFindingBeforeLookingUpPlan() {
                when(findingRepository.findById("missing-finding")).thenReturn(Optional.empty());

                assertThatThrownBy(() -> service.createIssue("missing-finding"))
                                .isInstanceOf(ResponseStatusException.class)
                                .hasMessageContaining("Security finding not found");
        }

    @Test
    void rejectsUnavailableConfiguration() {
        JiraIntegrationService unconfigured = new JiraIntegrationService(auditService, findingRepository, jiraClient,
                "", "", "Highest", "High", "Medium", "Low");

        assertThatThrownBy(() -> unconfigured.createIssue("F-1"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not configured");
        verify(jiraClient, never()).createIssue(any(), any(), any(), any(), any());
    }

        @Test
        void retrievesAndNormalizesJiraStatus() {
                when(jiraClient.getIssueStatus("SEC-7")).thenReturn(
                                new JiraClient.JiraIssueStatus("SEC-7", "In Development", "account-7", LocalDateTime.now()));
                DecisionAudit existing = DecisionAudit.builder().jiraKey("SEC-7").jiraUrl("https://jira.example/browse/SEC-7")
                                .remediationPlan(plan("F-1", "High")).build();
                when(auditService.findExistingJiraTicket("F-1", "SECURITY")).thenReturn(Optional.of(existing));

                var response = service.getStatus("F-1");

                assertThat(response.getRemediationState()).isEqualTo("IN_PROGRESS");
                assertThat(response.getJiraStatus()).isEqualTo("In Development");
                verify(auditService).save(existing);
        }

        @Test
        void reportsStatusUnavailableAndMissingFinding() {
                DecisionAudit existing = DecisionAudit.builder().jiraKey("SEC-7").build();
                when(auditService.findExistingJiraTicket("F-1", "SECURITY")).thenReturn(Optional.of(existing));
                when(jiraClient.getIssueStatus("SEC-7")).thenThrow(new JiraClientException("offline"));

                assertThatThrownBy(() -> service.getStatus("F-1"))
                                .isInstanceOf(ResponseStatusException.class)
                                .hasMessageContaining("status is unavailable");

                when(findingRepository.findById("missing-finding")).thenReturn(Optional.empty());
                assertThatThrownBy(() -> service.getStatus("missing-finding"))
                                .isInstanceOf(ResponseStatusException.class)
                                .hasMessageContaining("Security finding not found");
        }

    private RemediationPlan plan(String findingId, String severity) {
        return RemediationPlan.builder().planId("PLAN-1").findingId(findingId).title("Firewall drift")
                .severity(severity).summary("Fix drift").businessImpact("Exposure")
                .rootCause("Configuration drift").remediationSteps(List.of("Apply baseline"))
                .recommendedOwner(RemediationPlan.RecommendedOwner.builder().userId("account-1")
                        .name("Network Security").build())
                .ownerReason("Validated historical account").confidence(90).build();
    }
}
