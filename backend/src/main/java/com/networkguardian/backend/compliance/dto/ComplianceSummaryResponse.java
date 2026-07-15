package com.networkguardian.backend.compliance.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceSummaryResponse {

    private long totalDevices;
    private long compliantDevices;
    private long mediumRiskDevices;
    private long highRiskDevices;
    private long criticalRiskDevices;
    private double averageCompliance;
    private long totalActiveKRIs;
    private LocalDateTime lastCalculated;
}
