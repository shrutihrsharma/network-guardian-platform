package com.networkguardian.backend.incident.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.networkguardian.backend.ai.AIDecisionModule;
import com.networkguardian.backend.ai.AIClient;
import com.networkguardian.backend.ai.PromptBuilder;
import com.networkguardian.backend.audit.service.DecisionAuditService;
import com.networkguardian.backend.common.dto.AIResponse;
import com.networkguardian.backend.common.dto.DecisionAudit;
import com.networkguardian.backend.incident.context.IncidentContext;
import com.networkguardian.backend.incident.context.IncidentContextBuilder;
import com.networkguardian.backend.common.service.DecisionEvidenceMapper;
import com.networkguardian.backend.common.dto.DecisionRecommendation;
import com.networkguardian.backend.common.dto.DecisionRequest;
import com.networkguardian.backend.common.dto.DecisionResponse;

@Service
public class IncidentDecisionService implements AIDecisionModule {

    private static final Logger log = LoggerFactory.getLogger(IncidentDecisionService.class);

    private final IncidentContextBuilder incidentContextBuilder;
    private final PromptBuilder promptBuilder;
    private final AIClient aiClient;
    private final ObjectMapper objectMapper;
    private final DecisionAuditService decisionAuditService;
    private final DecisionEvidenceMapper decisionEvidenceMapper;

    public IncidentDecisionService(
            IncidentContextBuilder incidentContextBuilder,
            PromptBuilder promptBuilder,
            @Qualifier("groqClient") AIClient aiClient,
            ObjectMapper objectMapper,
            DecisionAuditService decisionAuditService,
            DecisionEvidenceMapper decisionEvidenceMapper
    ) {
        this.incidentContextBuilder = incidentContextBuilder;
        this.promptBuilder = promptBuilder;
        this.aiClient = aiClient;
        this.objectMapper = objectMapper;
        this.decisionAuditService = decisionAuditService;
        this.decisionEvidenceMapper = decisionEvidenceMapper;
    }

    @Override
    public String moduleName() {
        return "INCIDENT";
    }

    @Override
    public DecisionResponse execute(DecisionRequest request) {

        IncidentContext incidentContext = incidentContextBuilder.build(request.getIncidentId());

        String prompt = promptBuilder.build(incidentContext);

        AIResponse aiResponse = aiClient.generate(prompt);

        log.info("Provider: {}", aiResponse.getProvider());
        log.info("Model: {}", aiResponse.getModel());
        log.info("Latency: {} ms", aiResponse.getResponseTimeMs());
        log.info("Prompt: {}", prompt);
        log.info("Content: {}", aiResponse.getContent());

        DecisionRecommendation recommendation = parseRecommendation(aiResponse);

        String decisionId = UUID.randomUUID().toString();

        DecisionResponse decisionResponse = DecisionResponse.builder()
                .decisionId(decisionId)
                .engine(request.getEngine())
                .decisionStatus("SUCCESS")
                .confidence(recommendation.getConfidence())
                .recommendation(recommendation.getRecommendation())
                .reasoning(recommendation.getReasoning())
                .businessImpact(recommendation.getBusinessImpact())
                .approvalRequired(recommendation.isApprovalRequired())
                .evidence(decisionEvidenceMapper.fromKnowledge(incidentContext.getEnterpriseKnowledge()))
                .build();

                DecisionAudit audit = DecisionAudit.builder()
                .decisionId(decisionId)
                .timestamp(LocalDateTime.now())
                .incidentId(request.getIncidentId())
                .module("INCIDENT")
                .engine(request.getEngine())
                .provider(aiResponse.getProvider())
                .model(aiResponse.getModel())
                .prompt(prompt)
                .rawResponse(aiResponse.getContent())
                .decisionResponse(decisionResponse)
                .build();

        decisionAuditService.save(audit);

        return decisionResponse;
    }

    private DecisionRecommendation parseRecommendation(AIResponse aiResponse) {
        try {
            return objectMapper.readValue(aiResponse.getContent(), DecisionRecommendation.class);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to parse AI recommendation. Raw AI response: " + aiResponse.getContent(), e);
        }
    }
}