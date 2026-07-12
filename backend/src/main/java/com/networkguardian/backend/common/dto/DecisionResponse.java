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
public class DecisionResponse {

    private String decisionId;
    private String engine;
    private String decisionStatus;
    private double confidence;
    private String recommendation;
    private String reasoning;
    private String businessImpact;
    private boolean approvalRequired;
    private List<String> evidence;
    private String provider;
    private String model;
    private long executionTimeMs;
    private String promptVersion;
}