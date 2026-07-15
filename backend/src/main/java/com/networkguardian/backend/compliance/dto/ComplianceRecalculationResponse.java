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
public class ComplianceRecalculationResponse {

    private long devicesProcessed;
    private double averageCompliance;
    private LocalDateTime recalculatedAt;
}
