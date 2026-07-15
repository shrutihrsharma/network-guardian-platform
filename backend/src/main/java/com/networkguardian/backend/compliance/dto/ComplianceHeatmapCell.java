package com.networkguardian.backend.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceHeatmapCell {

    private String region;
    private String riskLevel;
    private long deviceCount;
    private double averageCompliance;
}
