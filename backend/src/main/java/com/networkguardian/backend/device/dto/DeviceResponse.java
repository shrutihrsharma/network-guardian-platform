package com.networkguardian.backend.device.dto;

import lombok.Builder;

@Builder
public record DeviceResponse(
        String id,
        String deviceName,
        String hostname,
        String vendor,
        String deviceType,
        String model,
        String region,
        String businessService,
        String lifecycleStatus,
        String complianceStatus,
        String predictiveRisk,
        String healthStatus,
        String criticality,
        String osVersion) {
}
