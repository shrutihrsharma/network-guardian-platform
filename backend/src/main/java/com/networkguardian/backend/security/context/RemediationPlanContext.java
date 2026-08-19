package com.networkguardian.backend.security.context;

import java.util.List;

import com.networkguardian.backend.common.dto.DecisionResponse;
import com.networkguardian.backend.security.model.SecurityFinding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RemediationPlanContext {
    private SecurityFinding finding;
    private DecisionResponse existingAnalysis;
    private List<SecurityFinding> historicalFindings;
    private List<DecisionResponse> historicalDecisions;
}
