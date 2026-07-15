package com.networkguardian.backend.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceKriSuggestion {

    private String name;
    private String description;
    private String category;
    private String severity;
    private double threshold;
    private String measurementFormula;
}
