package com.networkguardian.backend.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceSummaryCards {

    private long totalDevices;
    private long compliantDevices;
    private long atRiskDevices;
    private long criticalRiskDevices;
    private double averageCompliance;
    private long failedKriObservations;
}
