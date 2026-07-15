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
public class DeviceComplianceResponse {

    private String deviceId;
    private String hostname;
    private String vendor;
    private String region;
    private String deviceType;
    private String lifecycleStage;
    private long incidentCount;
    private double overallCompliance;
    private String riskLevel;
    private List<String> passedKRIs;
    private List<String> failedKRIs;
    private LocalDateTime lastCalculated;
}
