package com.networkguardian.backend.security.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.networkguardian.backend.ai.AIClient;
import com.networkguardian.backend.ai.AIDecisionModule;
import com.networkguardian.backend.audit.service.DecisionAuditService;
import com.networkguardian.backend.common.dto.AIResponse;
import com.networkguardian.backend.common.dto.DecisionAudit;
import com.networkguardian.backend.common.dto.DecisionRequest;
import com.networkguardian.backend.common.dto.DecisionResponse;
import com.networkguardian.backend.common.service.DecisionEvidenceMapper;
import com.networkguardian.backend.security.context.SecurityFindingContext;
import com.networkguardian.backend.security.context.SecurityFindingContextBuilder;
import com.networkguardian.backend.security.dto.SecurityDecisionRecommendation;
import com.networkguardian.backend.security.model.SecurityFinding;
import com.networkguardian.backend.security.prompt.SecurityPromptBuilder;

@Service
public class SecurityDecisionService implements AIDecisionModule {

    private static final Logger log = LoggerFactory.getLogger(SecurityDecisionService.class);
    private static final String MODULE = "SECURITY";
    private static final String PROMPT_VERSION = "security-posture-v1";

    private final SecurityFindingContextBuilder contextBuilder;
    private final SecurityPromptBuilder promptBuilder;
    private final AIClient aiClient;
    private final ObjectMapper objectMapper;
    private final DecisionAuditService decisionAuditService;
    private final DecisionEvidenceMapper decisionEvidenceMapper;

    public SecurityDecisionService(
            SecurityFindingContextBuilder contextBuilder,
            SecurityPromptBuilder promptBuilder,
            @Qualifier("groqClient") AIClient aiClient,
            ObjectMapper objectMapper,
            DecisionAuditService decisionAuditService,
            DecisionEvidenceMapper decisionEvidenceMapper) {
        this.contextBuilder = contextBuilder;
        this.promptBuilder = promptBuilder;
        this.aiClient = aiClient;
        this.objectMapper = objectMapper;
        this.decisionAuditService = decisionAuditService;
        this.decisionEvidenceMapper = decisionEvidenceMapper;
    }

    @Override
    public String moduleName() {
        return MODULE;
    }

    @Override
    public DecisionResponse execute(DecisionRequest request) {
        String findingId = request != null ? request.getFindingId() : null;

        SecurityFindingContext context = contextBuilder.build(findingId);
        SecurityFinding finding = context.getFinding();
        String prompt = promptBuilder.build(context);

        AIResponse aiResponse = generateWithFallback(prompt, mockDecisionResponseJson(finding));
        SecurityDecisionRecommendation recommendation = parseRecommendation(
                aiResponse.getContent(),
                mockDecisionResponseJson(finding));

        String decisionId = UUID.randomUUID().toString();

        DecisionResponse response = DecisionResponse.builder()
                .decisionId(decisionId)
                .engine(MODULE)
                .decisionStatus("SUCCESS")
                .confidence(recommendation.getConfidence())
                .recommendation(recommendation.getRecommendation())
                .reasoning(recommendation.getRootCause())
                .businessImpact(recommendation.getBusinessImpact())
                .approvalRequired(recommendation.isApprovalRequired())
                .evidence(decisionEvidenceMapper.fromTextEvidence(
                        "Supporting Evidence",
                        "Security AI",
                        safeList(recommendation.getSupportingEvidence()))
                        .stream()
                        .map(item -> (Object) item)
                        .toList())
                .provider(aiResponse.getProvider())
                .model(aiResponse.getModel())
                .executionTimeMs(aiResponse.getResponseTimeMs())
                .promptVersion(PROMPT_VERSION)
                .risk(finding.getSeverity())
                .summary(recommendation.getExecutiveSummary())
                .complianceImpact(recommendation.getComplianceImpact())
                .rootCause(recommendation.getRootCause())
                .automationAvailable(recommendation.getAutomationAvailable())
                .build();

        DecisionAudit audit = DecisionAudit.builder()
                .decisionId(decisionId)
                .timestamp(LocalDateTime.now())
                .incidentId(findingId)
                .module(MODULE)
                .engine(MODULE)
                .provider(aiResponse.getProvider())
                .model(aiResponse.getModel())
                .prompt(prompt)
                .rawResponse(aiResponse.getContent())
                .decisionResponse(response)
                .build();

        decisionAuditService.save(audit);
        return response;
    }

    private AIResponse generateWithFallback(String prompt, String fallbackJson) {
        try {
            AIResponse generated = aiClient.generate(prompt);
            log.info("Security AI | provider={} model={} latency={}ms",
                    generated.getProvider(), generated.getModel(), generated.getResponseTimeMs());
            return generated;
        } catch (Exception ex) {
            log.warn("Security AI client unavailable, using mock response: {}", ex.getMessage());
            return AIResponse.builder()
                    .provider("MOCK")
                    .model("security-posture-mock-v1")
                    .content(fallbackJson)
                    .responseTimeMs(1)
                    .build();
        }
    }

    private SecurityDecisionRecommendation parseRecommendation(String content, String fallback) {
        try {
            return objectMapper.readValue(content, SecurityDecisionRecommendation.class);
        } catch (Exception e) {
            try {
                return objectMapper.readValue(fallback, SecurityDecisionRecommendation.class);
            } catch (Exception nested) {
                throw new RuntimeException("Failed to parse security decision recommendation. Raw response: " + content, e);
            }
        }
    }

    private List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }

    private String mockDecisionResponseJson(SecurityFinding finding) {
        String severity = finding.getSeverity() == null ? "Medium" : finding.getSeverity();
        String complianceImpact = finding.getComplianceImpact() == null ? "Internal Policy" : finding.getComplianceImpact();
        boolean highRisk = finding.getRiskScore() >= 80 || "critical".equalsIgnoreCase(severity) || "high".equalsIgnoreCase(severity);
        String automationAvailable = switch (Objects.toString(finding.getCategory(), "").toUpperCase(Locale.ROOT)) {
            case "LOGGING", "CONFIGURATION", "ENCRYPTION" -> "YES";
            default -> "NO";
        };

        return """
                {
                  "confidence": %d,
                  "executiveSummary": "Security posture finding %s on %s requires prioritized remediation to reduce operational and control exposure.",
                  "businessImpact": "%s",
                  "complianceImpact": "%s",
                  "rootCause": "The finding indicates control drift or incomplete hardening on the affected device, leaving a persistent exposure in the current security baseline.",
                  "supportingEvidence": [
                    "Severity is %s with a risk score of %d.",
                    "Category is %s affecting business service %s.",
                    "Current status is %s with %d affected assets."
                  ],
                  "recommendation": "Validate scope, assign the owning network security team, implement the control correction, and verify the finding is moved to mitigated after change review.",
                  "automationAvailable": "%s",
                  "approvalRequired": true
                }
                """.formatted(
                highRisk ? 88 : 80,
                finding.getId(),
                finding.getDeviceName(),
                highRisk ? "High operational impact to critical services if the exposure is exploited or remains unaddressed." : "Moderate operational impact with increased likelihood of policy exceptions and delayed detection.",
                complianceImpact,
                severity,
                finding.getRiskScore(),
                finding.getCategory(),
                finding.getBusinessService(),
                finding.getStatus(),
                finding.getAffectedAssets(),
                automationAvailable);
    }
}
