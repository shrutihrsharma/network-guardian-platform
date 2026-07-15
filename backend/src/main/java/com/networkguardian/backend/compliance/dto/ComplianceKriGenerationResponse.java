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
public class ComplianceKriGenerationResponse {

    private String decisionId;
    private String provider;
    private String model;
    private long executionTimeMs;
    private List<ComplianceKriSuggestion> suggestedKris;
}
