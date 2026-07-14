package com.networkguardian.backend.lifecycle.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LifecycleDashboardResponse {

    private long totalDevices;
    private long unsupportedDevices;
    private long disinvestDevices;
    private long maintainDevices;
    private long investDevices;
    private long engineeringTestingDevices;
    private long upcomingEol90Days;
    private double averageUpgradeRisk;
    private List<VendorSummary> vendorSummary;
    private List<DeviceLifecycleSummary> criticalDevices;
}
