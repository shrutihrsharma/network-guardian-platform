package com.networkguardian.backend.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceBreakdownItem {

    private String name;
    private long deviceCount;
    private long highRiskDevices;
    private double averageCompliance;
}
