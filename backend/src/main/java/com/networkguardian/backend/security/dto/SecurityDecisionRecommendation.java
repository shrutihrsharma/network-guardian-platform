package com.networkguardian.backend.security.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityDecisionRecommendation {

    private double confidence;
    private String executiveSummary;
    private String businessImpact;
    private String complianceImpact;
    private String rootCause;
    private List<String> supportingEvidence;
    private String recommendation;
    private String automationAvailable;
    private boolean approvalRequired;
}
