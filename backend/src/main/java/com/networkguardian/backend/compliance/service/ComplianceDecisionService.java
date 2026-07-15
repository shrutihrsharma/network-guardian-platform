package com.networkguardian.backend.compliance.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.IntStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.networkguardian.backend.ai.AIClient;
import com.networkguardian.backend.ai.AIDecisionModule;
import com.networkguardian.backend.audit.service.DecisionAuditService;
import com.networkguardian.backend.common.dto.AIResponse;
import com.networkguardian.backend.common.dto.DecisionAudit;
import com.networkguardian.backend.common.dto.DecisionRequest;
import com.networkguardian.backend.common.dto.DecisionResponse;
import com.networkguardian.backend.common.service.DecisionEvidenceMapper;
import com.networkguardian.backend.compliance.context.ComplianceContext;
import com.networkguardian.backend.compliance.context.ComplianceContextBuilder;
import com.networkguardian.backend.compliance.dto.ComplianceDecisionRecommendation;
import com.networkguardian.backend.compliance.dto.ComplianceKriGenerationResult;
import com.networkguardian.backend.compliance.dto.ComplianceKriGenerationResponse;
import com.networkguardian.backend.compliance.dto.ComplianceKriSuggestion;
import com.networkguardian.backend.compliance.model.ComplianceKri;
import com.networkguardian.backend.compliance.prompt.ComplianceKriPromptBuilder;
import com.networkguardian.backend.compliance.prompt.CompliancePromptBuilder;
import com.networkguardian.backend.repository.ComplianceKriRepository;

@Service
public class ComplianceDecisionService implements AIDecisionModule {

    private static final Logger log = LoggerFactory.getLogger(ComplianceDecisionService.class);
    private static final String MODULE = "COMPLIANCE";

    private final ComplianceContextBuilder contextBuilder;
    private final CompliancePromptBuilder compliancePromptBuilder;
    private final ComplianceKriPromptBuilder complianceKriPromptBuilder;
    private final ComplianceKriRepository complianceKriRepository;
    private final AIClient aiClient;
    private final ObjectMapper objectMapper;
    private final DecisionAuditService decisionAuditService;
    private final DecisionEvidenceMapper decisionEvidenceMapper;

    public ComplianceDecisionService(
            ComplianceContextBuilder contextBuilder,
            CompliancePromptBuilder compliancePromptBuilder,
            ComplianceKriPromptBuilder complianceKriPromptBuilder,
            ComplianceKriRepository complianceKriRepository,
            @Qualifier("groqClient") AIClient aiClient,
            ObjectMapper objectMapper,
            DecisionAuditService decisionAuditService,
            DecisionEvidenceMapper decisionEvidenceMapper) {
        this.contextBuilder = contextBuilder;
        this.compliancePromptBuilder = compliancePromptBuilder;
        this.complianceKriPromptBuilder = complianceKriPromptBuilder;
        this.complianceKriRepository = complianceKriRepository;
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
        String deviceId = request != null ? request.getDeviceId() : null;

        ComplianceContext context = contextBuilder.build(deviceId);
        String prompt = compliancePromptBuilder.build(context);

        AIResponse aiResponse = generateWithFallback(prompt, mockDecisionResponseJson(context));
        ComplianceDecisionRecommendation recommendation = parseDecisionRecommendation(
          aiResponse.getContent(),
          mockDecisionResponseJson(context));

        String decisionId = UUID.randomUUID().toString();

        DecisionResponse response = DecisionResponse.builder()
                .decisionId(decisionId)
                .engine(MODULE)
                .decisionStatus("SUCCESS")
                .confidence(recommendation.getConfidence())
                .recommendation(recommendation.getRecommendation())
                .reasoning(String.join(" | ", safeList(recommendation.getRemediationPlan())))
                .businessImpact(recommendation.getBusinessImpact())
                .approvalRequired(true)
                .evidence(decisionEvidenceMapper.fromKnowledge(context.getEnterpriseKnowledge()))
                .risk(recommendation.getRisk())
                .summary("Priority=%s".formatted(recommendation.getPriority()))
                .provider(aiResponse.getProvider())
                .model(aiResponse.getModel())
                .executionTimeMs(aiResponse.getResponseTimeMs())
                .build();

        saveAudit(decisionId, deviceId, prompt, aiResponse.getContent(), aiResponse, response);
        return response;
    }

    public ComplianceKriGenerationResponse generateKriSuggestions(String deviceId) {
        ComplianceContext context = contextBuilder.build(deviceId);
        String prompt = complianceKriPromptBuilder.build(context);

        AIResponse aiResponse = generateWithFallback(prompt, mockKriGenerationResponseJson());
        ComplianceKriGenerationResult result = parseKriGeneration(
          aiResponse.getContent(),
          mockKriGenerationResponseJson());

        List<ComplianceKriSuggestion> suggestions = result.getSuggestedKris() == null
                ? List.of()
                : result.getSuggestedKris();

        String decisionId = UUID.randomUUID().toString();

        // Persist AI-suggested KRIs as pending approvals.
        List<ComplianceKri> existing = complianceKriRepository.findAll();
        int startIndex = existing.size() + 1;
        Set<String> existingNames = existing.stream()
          .map(ComplianceKri::getName)
          .filter(name -> name != null)
          .map(name -> name.toLowerCase(Locale.ROOT))
          .collect(java.util.stream.Collectors.toSet());

        List<ComplianceKriSuggestion> uniqueSuggestions = suggestions.stream()
          .filter(s -> s.getName() != null)
          .filter(s -> !existingNames.contains(s.getName().toLowerCase(Locale.ROOT)))
          .toList();

        List<ComplianceKri> generated = IntStream.range(0, uniqueSuggestions.size())
          .mapToObj(idx -> {
              ComplianceKriSuggestion s = uniqueSuggestions.get(idx);
              return ComplianceKri.builder()
                .id("KRI-AI-%03d".formatted(startIndex + idx))
                .name(s.getName())
                .description(s.getDescription())
                .category(s.getCategory())
                .severity(s.getSeverity())
                .threshold(s.getThreshold())
                .measurementFormula(s.getMeasurementFormula())
                .enabled(false)
                .approved(false)
                .aiGenerated(true)
                .createdDate(LocalDateTime.now())
                .build();
          })
                .sorted(Comparator.comparing(ComplianceKri::getName))
                .toList();

        if (!generated.isEmpty()) {
            complianceKriRepository.saveAll(generated);
        }

        DecisionResponse decisionSummary = DecisionResponse.builder()
                .decisionId(decisionId)
                .engine(MODULE)
                .decisionStatus("SUCCESS")
                .confidence(80)
                .recommendation("Generated compliance KRI suggestions")
                .reasoning("AI proposed new KRIs based on compliance posture, lifecycle, incidents, and knowledge inputs.")
                .businessImpact("Medium")
                .approvalRequired(true)
                .evidence(decisionEvidenceMapper.fromTextEvidence(
                  "Operational Context",
                  "Compliance Engine",
                  List.of("Compliance context", "Lifecycle summary", "Incident summary")))
                .provider(aiResponse.getProvider())
                .model(aiResponse.getModel())
                .executionTimeMs(aiResponse.getResponseTimeMs())
                .build();

        saveAudit(decisionId, deviceId, prompt, aiResponse.getContent(), aiResponse, decisionSummary);

        return ComplianceKriGenerationResponse.builder()
                .decisionId(decisionId)
                .provider(aiResponse.getProvider())
                .model(aiResponse.getModel())
                .executionTimeMs(aiResponse.getResponseTimeMs())
                .suggestedKris(suggestions)
                .build();
    }

    public ComplianceKri approveKri(String kriId, boolean enabled) {
        ComplianceKri kri = complianceKriRepository.findById(kriId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "KRI not found: " + kriId));

        kri.setApproved(true);
        kri.setEnabled(enabled);

        ComplianceKri saved = complianceKriRepository.save(kri);

        DecisionResponse decisionSummary = DecisionResponse.builder()
                .decisionId(UUID.randomUUID().toString())
                .engine(MODULE)
                .decisionStatus("SUCCESS")
                .confidence(100)
                .recommendation("KRI approved")
                .reasoning("Compliance KRI has been approved for use in deterministic compliance calculations.")
                .businessImpact("Low")
                .approvalRequired(false)
                .evidence(decisionEvidenceMapper.fromTextEvidence(
                  "Operational Context",
                  "Compliance Approval Workflow",
                  List.of("KRI approval workflow")))
                .build();

        AIResponse synthetic = AIResponse.builder()
                .provider("SYSTEM")
                .model("manual-approval")
                .content("{\"status\":\"approved\",\"kriId\":\"" + kriId + "\"}")
                .responseTimeMs(0)
                .build();

        saveAudit(
                decisionSummary.getDecisionId(),
                kriId,
                "Manual compliance KRI approval",
                synthetic.getContent(),
                synthetic,
                decisionSummary);

        return saved;
    }

    private void saveAudit(
            String decisionId,
            String entityId,
            String prompt,
            String rawResponse,
            AIResponse aiResponse,
            DecisionResponse decisionResponse) {

        DecisionAudit audit = DecisionAudit.builder()
                .decisionId(decisionId)
                .timestamp(LocalDateTime.now())
                .incidentId(entityId != null ? entityId : "COMPLIANCE")
                .module(MODULE)
                .engine(MODULE)
                .provider(aiResponse.getProvider())
                .model(aiResponse.getModel())
                .prompt(prompt)
                .rawResponse(rawResponse)
                .decisionResponse(decisionResponse)
                .build();

        decisionAuditService.save(audit);
    }

    private AIResponse generateWithFallback(String prompt, String fallbackJson) {
        try {
            AIResponse generated = aiClient.generate(prompt);
            log.info("Compliance AI | provider={} model={} latency={}ms",
                    generated.getProvider(), generated.getModel(), generated.getResponseTimeMs());
            return generated;
        } catch (Exception ex) {
            log.warn("Compliance AI client unavailable, using mock response: {}", ex.getMessage());
            return AIResponse.builder()
                    .provider("MOCK")
                    .model("compliance-mock-v1")
                    .content(fallbackJson)
                    .responseTimeMs(1)
                    .build();
        }
    }

    private ComplianceDecisionRecommendation parseDecisionRecommendation(String content, String fallback) {
        try {
            return objectMapper.readValue(content, ComplianceDecisionRecommendation.class);
        } catch (Exception e) {
        try {
          return objectMapper.readValue(fallback, ComplianceDecisionRecommendation.class);
        } catch (Exception nested) {
          throw new RuntimeException("Failed to parse compliance decision recommendation. Raw response: " + content, e);
        }
        }
    }

    private ComplianceKriGenerationResult parseKriGeneration(String content, String fallback) {
        try {
            return objectMapper.readValue(content, ComplianceKriGenerationResult.class);
        } catch (Exception e) {
        try {
          return objectMapper.readValue(fallback, ComplianceKriGenerationResult.class);
        } catch (Exception nested) {
          throw new RuntimeException("Failed to parse compliance KRI generation response. Raw response: " + content, e);
        }
        }
    }

    private List<String> safeList(List<String> values) {
      return values == null ? List.of() : values;
    }

    private String mockDecisionResponseJson(ComplianceContext context) {
        String impact = context.getSummary() != null && context.getSummary().getCriticalRiskDevices() > 0 ? "High" : "Medium";
        String risk = context.getSummary() != null && context.getSummary().getCriticalRiskDevices() > 0 ? "Critical" : "High";

        return """
                {
                  "confidence": 84,
                  "recommendation": "Prioritize remediation for unsupported and repeated-incident devices",
                  "risk": "%s",
                  "businessImpact": "%s",
                  "evidence": [
                    "Failed KRIs include lifecycle and incident controls",
                    "Critical devices impact Tier-1 business services",
                    "Open critical incidents remain unresolved"
                  ],
                  "remediationPlan": [
                    "Approve and enable top AI-suggested KRIs after review",
                    "Patch unsupported/disinvest devices within 30 days",
                    "Resolve open critical incidents before next governance review"
                  ],
                  "priority": "P1",
                  "suggestedKRIs": [
                    "Unsupported Software %%",
                    "Certificate Expiry",
                    "Configuration Drift"
                  ]
                }
                """.formatted(risk, impact);
    }

    private String mockKriGenerationResponseJson() {
        return """
                {
                  "suggestedKris": [
                    {
                      "name": "Unsupported Software %",
                      "description": "Percentage of devices running unsupported software versions.",
                      "category": "Lifecycle",
                      "severity": "Critical",
                      "threshold": 0,
                      "measurementFormula": "unsupportedDevices/totalDevices*100"
                    },
                    {
                      "name": "Certificate Expiry",
                      "description": "Devices with certificates expiring within 90 days.",
                      "category": "Security",
                      "severity": "High",
                      "threshold": 90,
                      "measurementFormula": "certExpiringInDays<=90"
                    },
                    {
                      "name": "Patch Age",
                      "description": "Devices beyond approved patch age threshold.",
                      "category": "Security",
                      "severity": "High",
                      "threshold": 180,
                      "measurementFormula": "daysSinceLastPatch>180"
                    },
                    {
                      "name": "Configuration Drift",
                      "description": "Devices with baseline configuration deviations.",
                      "category": "Configuration",
                      "severity": "High",
                      "threshold": 0,
                      "measurementFormula": "driftIncidents>0"
                    },
                    {
                      "name": "Repeated Incidents",
                      "description": "Devices with recurring incidents over threshold.",
                      "category": "Incident",
                      "severity": "Medium",
                      "threshold": 2,
                      "measurementFormula": "incidentCount>2"
                    },
                    {
                      "name": "Lifecycle Compliance",
                      "description": "Devices outside Invest/Maintain lifecycle windows.",
                      "category": "Lifecycle",
                      "severity": "High",
                      "threshold": 0,
                      "measurementFormula": "lifecycleStage in [Disinvest, Unsupported]"
                    },
                    {
                      "name": "Missing Backups",
                      "description": "Critical services lacking validated backup controls.",
                      "category": "Operations",
                      "severity": "Medium",
                      "threshold": 0,
                      "measurementFormula": "unresolvedBackupControlFindings>0"
                    }
                  ]
                }
                """;
    }
}
