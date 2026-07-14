package com.networkguardian.backend.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceLifecycleSummary {

    private String deviceId;
    private String hostname;
    private String vendor;
    private String family;
    private String model;
    private String region;
    private String businessService;
    private String criticality;
    private String osVersion;
    private String recommendedVersion;
    private String lifecycleStage;
    private long daysUntilUnsupported;
    private String engineeringTestingDate;
    private String investDate;
    private String maintainDate;
    private String disinvestDate;
    private String unsupportedDate;
    private String notes;
}
