package com.networkguardian.backend.security.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.networkguardian.backend.ai.AIClient;
import com.networkguardian.backend.audit.service.DecisionAuditService;
import com.networkguardian.backend.common.dto.AIResponse;
import com.networkguardian.backend.common.dto.DecisionAudit;
import com.networkguardian.backend.common.dto.DecisionResponse;
import com.networkguardian.backend.repository.SecurityFindingRepository;
import com.networkguardian.backend.security.context.RemediationPlanContext;
import com.networkguardian.backend.security.dto.RemediationPlan;
import com.networkguardian.backend.security.model.SecurityFinding;
import com.networkguardian.backend.security.prompt.RemediationPlanPromptBuilder;

@Service
public class RemediationPlanService {

    private static final String MODULE = "SECURITY";
    private static final String INSUFFICIENT_OWNER_EVIDENCE = "Insufficient historical evidence to recommend an owner";

    private final SecurityFindingRepository findingRepository;
    private final DecisionAuditService auditService;
    private final RemediationPlanPromptBuilder promptBuilder;
    private final AIClient aiClient;
    private final ObjectMapper objectMapper;

    public RemediationPlanService(
            SecurityFindingRepository findingRepository,
            DecisionAuditService auditService,
            RemediationPlanPromptBuilder promptBuilder,
            @Qualifier("groqClient") AIClient aiClient,
            ObjectMapper objectMapper) {
        this.findingRepository = findingRepository;
        this.auditService = auditService;
        this.promptBuilder = promptBuilder;
        this.aiClient = aiClient;
        this.objectMapper = objectMapper;
    }

    public RemediationPlan generate(String findingId) {
        SecurityFinding finding = findingRepository.findById(findingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Security finding not found: " + findingId));

        DecisionAudit existingAudit = auditService.findLatestByFindingId(findingId, MODULE).orElse(null);
        List<SecurityFinding> historicalFindings = findingRepository.findAll().stream()
                .filter(candidate -> !Objects.equals(candidate.getId(), findingId))
                .filter(candidate -> relevance(candidate, finding) > 0)
                .sorted(Comparator.comparingInt((SecurityFinding candidate) -> relevance(candidate, finding)).reversed()
                        .thenComparing(candidate -> candidate.getCreatedAt(), Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .toList();
        List<DecisionResponse> historicalDecisions = auditService.findByFindingIds(
                        historicalFindings.stream().map(candidate -> candidate.getId()).toList(), MODULE).stream()
                    .map(audit -> audit.getDecisionResponse())
                .filter(Objects::nonNull)
                .limit(5)
                .toList();

        RemediationPlanContext context = RemediationPlanContext.builder()
                .finding(finding)
                .existingAnalysis(existingAudit == null ? null : existingAudit.getDecisionResponse())
                .historicalFindings(historicalFindings)
                .historicalDecisions(historicalDecisions)
                .build();
        String prompt = promptBuilder.build(context);

        AIResponse aiResponse;
        try {
            aiResponse = aiClient.generate(prompt);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Security AI is unavailable. Remediation plan was not generated.", exception);
        }

        RemediationPlan plan;
        try {
            plan = objectMapper.readValue(aiResponse.getContent(), RemediationPlan.class);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Security AI returned a malformed remediation plan.", exception);
        }
        validate(plan, findingId);
        plan.setFindingId(findingId);
        plan.setPlanId(UUID.randomUUID().toString());
        plan.setTitle(defaultValue(plan.getTitle(), finding.getTitle()));
        plan.setSeverity(defaultValue(plan.getSeverity(), finding.getSeverity()));
        plan.setGeneratedAt(LocalDateTime.now());
        plan.setProvider(aiResponse.getProvider());
        plan.setModel(aiResponse.getModel());

        // No current historical model carries an owner identity, so never accept an unsupported model claim.
        plan.setRecommendedOwner(null);
        plan.setOwnerReason(INSUFFICIENT_OWNER_EVIDENCE);

        auditService.save(DecisionAudit.builder()
                .decisionId(plan.getPlanId())
                .timestamp(plan.getGeneratedAt())
                .incidentId(findingId)
                .module(MODULE)
                .engine(MODULE)
                .provider(aiResponse.getProvider())
                .model(aiResponse.getModel())
                .prompt(prompt)
                .rawResponse(aiResponse.getContent())
                .remediationPlan(plan)
                .originalFinding(finding)
                .historicalEvidenceIds(historicalFindings.stream().map(candidate -> candidate.getId()).toList())
                .build());
        return plan;
    }

    private void validate(RemediationPlan plan, String findingId) {
        if (plan == null || plan.getRemediationSteps() == null || plan.getRemediationSteps().isEmpty()
                || isBlank(plan.getSummary()) || isBlank(plan.getRootCause())) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Security AI returned an incomplete remediation plan for finding " + findingId);
        }
    }

    private int relevance(SecurityFinding candidate, SecurityFinding current) {
        int score = 0;
        if (equals(candidate.getCategory(), current.getCategory())) score += 4;
        if (equals(candidate.getBusinessService(), current.getBusinessService())) score += 3;
        if (equals(candidate.getVendor(), current.getVendor())) score += 2;
        if (equals(candidate.getDeviceId(), current.getDeviceId())) score += 2;
        return score;
    }

    private boolean equals(String left, String right) {
        return left != null && left.equalsIgnoreCase(right);
    }

    private String defaultValue(String value, String fallback) {
        return isBlank(value) ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
