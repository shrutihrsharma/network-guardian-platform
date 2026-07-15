package com.networkguardian.backend.compliance.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceDecisionRecommendation {

    private double confidence;
    private String recommendation;
    private String risk;
    private String businessImpact;
    private List<String> evidence;
    private List<String> remediationPlan;
    private String priority;
    private List<String> suggestedKRIs;
}
