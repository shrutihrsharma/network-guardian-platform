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
public class ComplianceKriGenerationResult {

    private List<ComplianceKriSuggestion> suggestedKris;
}
