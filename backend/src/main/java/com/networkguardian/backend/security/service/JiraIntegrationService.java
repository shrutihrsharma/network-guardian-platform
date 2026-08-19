package com.networkguardian.backend.security.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.networkguardian.backend.audit.service.DecisionAuditService;
import com.networkguardian.backend.common.dto.DecisionAudit;
import com.networkguardian.backend.security.dto.JiraTicketResponse;
import com.networkguardian.backend.security.dto.RemediationPlan;
import com.networkguardian.backend.security.jira.JiraClient;
import com.networkguardian.backend.security.jira.JiraRestClient.JiraClientException;
import com.networkguardian.backend.repository.SecurityFindingRepository;

@Service
public class JiraIntegrationService {

    private static final String MODULE = "SECURITY";

    private final DecisionAuditService auditService;
    private final SecurityFindingRepository findingRepository;
    private final JiraClient jiraClient;
    private final String baseUrl;
    private final String projectKey;
    private final String criticalPriority;
    private final String highPriority;
    private final String mediumPriority;
    private final String lowPriority;

    public JiraIntegrationService(
            DecisionAuditService auditService,
            SecurityFindingRepository findingRepository,
            JiraClient jiraClient,
            @Value("${jira.base-url:}") String baseUrl,
            @Value("${jira.project-key:}") String projectKey,
            @Value("${jira.priority.critical:Highest}") String criticalPriority,
            @Value("${jira.priority.high:High}") String highPriority,
            @Value("${jira.priority.medium:Medium}") String mediumPriority,
            @Value("${jira.priority.low:Low}") String lowPriority) {
        this.auditService = auditService;
        this.findingRepository = findingRepository;
        this.jiraClient = jiraClient;
        this.baseUrl = baseUrl;
        this.projectKey = projectKey;
        this.criticalPriority = criticalPriority;
        this.highPriority = highPriority;
        this.mediumPriority = mediumPriority;
        this.lowPriority = lowPriority;
    }

    public JiraTicketResponse createIssue(String findingId) {
        if (findingRepository.findById(findingId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Security finding not found: " + findingId);
        }
        DecisionAudit planAudit = auditService.findLatestRemediationPlan(findingId, MODULE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Remediation plan not found for security finding: " + findingId));
        RemediationPlan plan = planAudit.getRemediationPlan();
        if (plan == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Remediation plan not found for security finding: " + findingId);
        }

        return auditService.findExistingJiraTicket(findingId, MODULE)
                .map(existing -> ticketResponse(existing, "ALREADY_EXISTS"))
                .orElseGet(() -> createNewTicket(planAudit, plan));
    }

    private JiraTicketResponse createNewTicket(DecisionAudit planAudit, RemediationPlan plan) {
        if (isBlank(baseUrl) || isBlank(projectKey)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Jira integration is not configured.");
        }

        String priority = priorityFor(plan.getSeverity());
        String assignee = resolveAssignee(plan);
        JiraClient.JiraIssue issue;
        try {
            issue = jiraClient.createIssue(projectKey, summaryFor(plan), descriptionFor(plan), priority, assignee);
        } catch (JiraClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Jira could not create the remediation ticket.", exception);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Jira could not create the remediation ticket.", exception);
        }

        LocalDateTime createdAt = LocalDateTime.now();
        auditService.recordJiraTicket(planAudit, issue.key(), issue.url(), assignee,
                "CREATED", createdAt);
        return JiraTicketResponse.builder()
                .jiraKey(issue.key())
                .jiraUrl(issue.url())
                .status("CREATED")
                .assignee(assignee)
                .assigneeName(plan.getRecommendedOwner() == null ? null : plan.getRecommendedOwner().getName())
                .createdAt(createdAt)
                .build();
    }

    private String resolveAssignee(RemediationPlan plan) {
        if (plan.getRecommendedOwner() == null || isBlank(plan.getRecommendedOwner().getUserId())) {
            return null;
        }
        try {
            return jiraClient.isValidAccountId(plan.getRecommendedOwner().getUserId())
                    ? plan.getRecommendedOwner().getUserId() : null;
        } catch (JiraClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Jira user validation failed; ticket was not created.", exception);
        }
    }

    private String summaryFor(RemediationPlan plan) {
        return "Security remediation: " + defaultValue(plan.getTitle(), plan.getFindingId());
    }

    private String descriptionFor(RemediationPlan plan) {
        String owner = plan.getRecommendedOwner() == null
                ? "Unassigned - no validated Jira account was available"
                : defaultValue(plan.getRecommendedOwner().getName(), plan.getRecommendedOwner().getUserId());
        return """
                Sentinel security finding: %s
                Severity: %s
                Business impact: %s
                Root cause: %s
                AI remediation steps:
                %s
                Recommended owner: %s
                Owner reasoning: %s
                AI confidence: %s%%
                Sentinel finding ID: %s
                """.formatted(plan.getTitle(), plan.getSeverity(), plan.getBusinessImpact(), plan.getRootCause(),
                String.join("\n", plan.getRemediationSteps().stream().map(step -> "- " + step).toList()),
                owner, plan.getOwnerReason(), plan.getConfidence(), plan.getFindingId());
    }

    private String priorityFor(String severity) {
        if ("critical".equalsIgnoreCase(severity)) return criticalPriority;
        if ("high".equalsIgnoreCase(severity)) return highPriority;
        if ("low".equalsIgnoreCase(severity)) return lowPriority;
        return mediumPriority;
    }

    private JiraTicketResponse ticketResponse(DecisionAudit audit, String status) {
        return JiraTicketResponse.builder()
                .jiraKey(audit.getJiraKey())
                .jiraUrl(audit.getJiraUrl())
                .status(status)
                .assignee(audit.getJiraAssignee())
                .assigneeName(audit.getRemediationPlan() == null || audit.getRemediationPlan().getRecommendedOwner() == null
                    ? null : audit.getRemediationPlan().getRecommendedOwner().getName())
                .createdAt(audit.getJiraCreatedAt())
                .build();
    }

    private String defaultValue(String value, String fallback) {
        return isBlank(value) ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
