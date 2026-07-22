package com.networkguardian.backend.security.dto;

import lombok.Builder;

@Builder
public record SecurityFindingResponse(
        String id,
        String deviceId,
        String deviceName,
        String vendor,
        String region,
        String businessService,
        String severity,
        String category,
        String title,
        String description,
        String complianceImpact,
        String status,
        int riskScore,
        int affectedAssets,
        String createdAt) {
}
