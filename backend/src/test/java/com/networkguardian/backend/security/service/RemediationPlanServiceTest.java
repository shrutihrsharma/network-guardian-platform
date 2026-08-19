package com.networkguardian.backend.security.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.networkguardian.backend.ai.AIClient;
import com.networkguardian.backend.audit.service.DecisionAuditService;
import com.networkguardian.backend.common.dto.AIResponse;
import com.networkguardian.backend.repository.SecurityFindingRepository;
import com.networkguardian.backend.security.context.RemediationPlanContext;
import com.networkguardian.backend.security.dto.RemediationPlan;
import com.networkguardian.backend.security.model.SecurityFinding;
import com.networkguardian.backend.security.prompt.RemediationPlanPromptBuilder;

class RemediationPlanServiceTest {

    private SecurityFindingRepository findingRepository;
    private DecisionAuditService auditService;
    private RemediationPlanPromptBuilder promptBuilder;
    private AIClient aiClient;
    private RemediationPlanService service;

    @BeforeEach
    void setUp() {
        findingRepository = mock(SecurityFindingRepository.class);
        auditService = mock(DecisionAuditService.class);
        promptBuilder = mock(RemediationPlanPromptBuilder.class);
        aiClient = mock(AIClient.class);
        service = new RemediationPlanService(findingRepository, auditService, promptBuilder, aiClient, new ObjectMapper());
        when(auditService.findLatestByFindingId(any(), any())).thenReturn(Optional.empty());
        when(auditService.findByFindingIds(any(), any())).thenReturn(List.of());
        when(promptBuilder.build(any(RemediationPlanContext.class))).thenReturn("prompt");
    }

    @Test
    void generatesPlanAndDoesNotFabricateOwner() {
        SecurityFinding finding = finding("F-1", "FIREWALL", "Payments");
        when(findingRepository.findById("F-1")).thenReturn(Optional.of(finding));
        when(findingRepository.findAll()).thenReturn(List.of(finding));
        when(aiClient.generate("prompt")).thenReturn(response("""
                {"summary":"Contain exposure","rootCause":"Drift","remediationSteps":["Apply baseline"],
                 "recommendedOwner":{"name":"Invented User"},"ownerReason":"They resolved similar issues","confidence":90}
                """));

        RemediationPlan plan = service.generate("F-1");

        assertThat(plan.getRecommendedOwner()).isNull();
        assertThat(plan.getOwnerReason()).isEqualTo("Insufficient historical evidence to recommend an owner");
        assertThat(plan.getFindingId()).isEqualTo("F-1");
        verify(auditService).save(any());
    }

    @Test
    void rejectsMalformedResponse() {
        SecurityFinding finding = finding("F-1", "FIREWALL", "Payments");
        when(findingRepository.findById("F-1")).thenReturn(Optional.of(finding));
        when(findingRepository.findAll()).thenReturn(List.of(finding));
        when(aiClient.generate("prompt")).thenReturn(response("not json"));

        assertThatThrownBy(() -> service.generate("F-1"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("malformed remediation plan");
    }

    @Test
    void reportsMissingFindingAndAiFailure() {
        when(findingRepository.findById("missing")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.generate("missing"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Security finding not found");

        SecurityFinding finding = finding("F-1", "FIREWALL", "Payments");
        when(findingRepository.findById("F-1")).thenReturn(Optional.of(finding));
        when(findingRepository.findAll()).thenReturn(List.of(finding));
        when(aiClient.generate("prompt")).thenThrow(new IllegalStateException("offline"));
        assertThatThrownBy(() -> service.generate("F-1"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("AI is unavailable");
    }

    private SecurityFinding finding(String id, String category, String businessService) {
        return SecurityFinding.builder().id(id).title("Firewall drift").category(category)
                .businessService(businessService).severity("High").build();
    }

    private AIResponse response(String content) {
        return AIResponse.builder().provider("TEST").model("test-model").content(content).build();
    }
}