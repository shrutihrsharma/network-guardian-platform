package com.networkguardian.backend.security.dto;

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
public class RemediationVerificationResponse {
    private String findingId;
    private String jiraKey;
    private String result;
    private String reason;
    private List<String> evidence;
    private Integer previousRiskScore;
    private Integer currentRiskScore;
    private LocalDateTime verifiedAt;
}