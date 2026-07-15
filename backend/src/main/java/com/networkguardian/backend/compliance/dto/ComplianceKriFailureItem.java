package com.networkguardian.backend.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceKriFailureItem {

    private String kriId;
    private String kriName;
    private String severity;
    private long failedDevices;
}
