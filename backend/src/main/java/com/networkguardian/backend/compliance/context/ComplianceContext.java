package com.networkguardian.backend.compliance.context;

import java.time.LocalDateTime;
import java.util.List;

import com.networkguardian.backend.compliance.dto.ComplianceSummaryResponse;
import com.networkguardian.backend.compliance.dto.DeviceComplianceResponse;
import com.networkguardian.backend.compliance.model.ComplianceKri;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceContext {

    private ComplianceSummaryResponse summary;
    private String lifecycleSummary;
    private String incidentSummary;
    private List<String> topFailedKris;
    private List<DeviceComplianceResponse> criticalDevices;
    private List<String> criticalBusinessServices;
    private List<ComplianceKri> activeKris;
    private DeviceComplianceResponse targetDevice;
    private ComplianceKnowledge knowledge;
    private LocalDateTime decisionTimestamp;
}
