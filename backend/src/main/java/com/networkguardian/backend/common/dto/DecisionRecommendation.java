package com.networkguardian.backend.common.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionRecommendation {

    private double confidence;
    private String recommendation;
    private String reasoning;
    private String businessImpact;
    private boolean approvalRequired;
    private List<String> evidence;
}