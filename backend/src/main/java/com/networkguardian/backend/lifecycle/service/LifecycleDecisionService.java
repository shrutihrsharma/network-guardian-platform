package com.networkguardian.backend.lifecycle.service;

import java.time.LocalDateTime;
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
import com.networkguardian.backend.lifecycle.context.LifecycleContext;
import com.networkguardian.backend.lifecycle.context.LifecycleContextBuilder;
import com.networkguardian.backend.lifecycle.dto.LifecycleDecisionRecommendation;
import com.networkguardian.backend.lifecycle.prompt.LifecyclePromptBuilder;

@Service
public class LifecycleDecisionService implements AIDecisionModule {

    private static final Logger log = LoggerFactory.getLogger(LifecycleDecisionService.class);
    private static final String MODULE = "LIFECYCLE";

    private final LifecycleContextBuilder contextBuilder;
    private final LifecyclePromptBuilder promptBuilder;
    private final AIClient aiClient;
    private final ObjectMapper objectMapper;
    private final DecisionAuditService decisionAuditService;

    public LifecycleDecisionService(
            LifecycleContextBuilder contextBuilder,
            LifecyclePromptBuilder promptBuilder,
            @Qualifier("groqClient") AIClient aiClient,
            ObjectMapper objectMapper,
            DecisionAuditService decisionAuditService) {
        this.contextBuilder = contextBuilder;
        this.promptBuilder = promptBuilder;
        this.aiClient = aiClient;
        this.objectMapper = objectMapper;
        this.decisionAuditService = decisionAuditService;
    }

    @Override
    public String moduleName() {
        return MODULE;
    }

    @Override
    public DecisionResponse execute(DecisionRequest request) {
        String deviceId = request.getDeviceId();

        LifecycleContext context = contextBuilder.build(deviceId);
        String prompt = promptBuilder.build(context);

        AIResponse aiResponse = aiClient.generate(prompt);

        log.info("Lifecycle AI | provider={} model={} latency={}ms",
                aiResponse.getProvider(), aiResponse.getModel(), aiResponse.getResponseTimeMs());
        log.debug("Lifecycle prompt: {}", prompt);
        log.debug("Lifecycle AI response: {}", aiResponse.getContent());

        LifecycleDecisionRecommendation rec = parseRecommendation(aiResponse);

        String decisionId = UUID.randomUUID().toString();

        DecisionResponse response = DecisionResponse.builder()
                .decisionId(decisionId)
                .engine(MODULE)
                .decisionStatus("SUCCESS")
                .confidence(rec.getConfidence())
                .recommendation(rec.getRecommendation())
                .reasoning(rec.getSummary())
                .businessImpact(rec.getBusinessImpact())
                .approvalRequired(rec.isApprovalRequired())
                .evidence(rec.getJustification())
                .risk(rec.getRisk())
                .summary(rec.getSummary())
                .recommendedVersion(rec.getRecommendedVersion())
                .recommendedWindow(rec.getRecommendedWindow())
                .provider(aiResponse.getProvider())
                .model(aiResponse.getModel())
                .executionTimeMs(aiResponse.getResponseTimeMs())
                .build();

        DecisionAudit audit = DecisionAudit.builder()
                .decisionId(decisionId)
                .timestamp(LocalDateTime.now())
                .incidentId(deviceId)   // entityId for lifecycle decisions
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

    private LifecycleDecisionRecommendation parseRecommendation(AIResponse aiResponse) {
        try {
            return objectMapper.readValue(aiResponse.getContent(), LifecycleDecisionRecommendation.class);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to parse lifecycle AI recommendation. Raw response: " + aiResponse.getContent(), e);
        }
    }
}
