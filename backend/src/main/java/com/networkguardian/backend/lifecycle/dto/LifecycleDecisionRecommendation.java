package com.networkguardian.backend.lifecycle.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** AI recommendation payload parsed from the lifecycle prompt response. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LifecycleDecisionRecommendation {

    private double confidence;
    private String recommendation;
    private String risk;
    private String summary;
    private String recommendedVersion;
    private String recommendedWindow;
    private String businessImpact;
    private List<String> justification;
    private boolean approvalRequired;
}
