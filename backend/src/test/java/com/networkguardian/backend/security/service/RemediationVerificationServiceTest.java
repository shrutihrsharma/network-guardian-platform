package com.networkguardian.backend.security.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import com.networkguardian.backend.audit.service.DecisionAuditService;
import com.networkguardian.backend.common.dto.DecisionAudit;
import com.networkguardian.backend.repository.SecurityFindingRepository;
import com.networkguardian.backend.security.model.SecurityFinding;

class RemediationVerificationServiceTest {
    private DecisionAuditService auditService;
    private SecurityFindingRepository findingRepository;
    private RemediationVerificationService service;

    @BeforeEach
    void setUp() {
        auditService = mock(DecisionAuditService.class);
        findingRepository = mock(SecurityFindingRepository.class);
        service = new RemediationVerificationService(auditService, findingRepository);
    }

    @Test
    void resolvedJiraWithActiveRiskIsNotVerified() {
        SecurityFinding original = finding("Open", 92);
        SecurityFinding current = finding("Open", 92);
        DecisionAudit audit = audit(original);
        when(auditService.findExistingJiraTicket("F-1", "SECURITY")).thenReturn(Optional.of(audit));
        when(findingRepository.findById("F-1")).thenReturn(Optional.of(current));

        var response = service.verify("F-1");

        assertThat(response.getResult()).isEqualTo("NOT_VERIFIED");
        assertThat(response.getReason()).contains("remains active");
        verify(auditService).save(audit);
    }

    @Test
    void resolvedJiraWithRemovedRiskIsVerified() {
        SecurityFinding original = finding("Open", 92);
        DecisionAudit audit = audit(original);
        when(auditService.findExistingJiraTicket("F-1", "SECURITY")).thenReturn(Optional.of(audit));
        when(findingRepository.findById("F-1")).thenReturn(Optional.empty());

        var response = service.verify("F-1");

        assertThat(response.getResult()).isEqualTo("VERIFIED");
        assertThat(response.getEvidence()).contains("Vulnerability no longer detected");
    }

    @Test
    void rejectsMissingTicketAndUnresolvedTicket() {
        when(auditService.findExistingJiraTicket("missing", "SECURITY")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.verify("missing")).isInstanceOf(ResponseStatusException.class);

        DecisionAudit audit = audit(finding("Open", 92));
        audit.setJiraStatus("In Progress");
        audit.setJiraRemediationState("IN_PROGRESS");
        when(auditService.findExistingJiraTicket("F-1", "SECURITY")).thenReturn(Optional.of(audit));
        assertThatThrownBy(() -> service.verify("F-1")).isInstanceOf(ResponseStatusException.class);
    }

    private DecisionAudit audit(SecurityFinding original) {
        return DecisionAudit.builder().incidentId("F-1").module("SECURITY").jiraKey("SEC-1")
            .jiraStatus("RESOLVED").jiraRemediationState("RESOLVED").originalFinding(original).build();
    }

    private SecurityFinding finding(String status, int riskScore) {
        return SecurityFinding.builder().id("F-1").status(status).riskScore(riskScore).title("CVE-1").build();
    }
}