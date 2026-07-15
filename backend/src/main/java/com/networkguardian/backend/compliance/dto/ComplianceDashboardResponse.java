package com.networkguardian.backend.compliance.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceDashboardResponse {

    private ComplianceSummaryCards summaryCards;
    private List<ComplianceBreakdownItem> vendorCompliance;
    private List<ComplianceBreakdownItem> regionCompliance;
    private List<ComplianceBreakdownItem> deviceTypeCompliance;
    private List<ComplianceKriFailureItem> topFailedKRIs;
    private List<ComplianceHeatmapCell> complianceHeatmap;
    private List<LifecycleCompliancePoint> lifecycleVsCompliance;
    private List<IncidentCompliancePoint> incidentVsCompliance;
    private LocalDateTime generatedAt;
}
