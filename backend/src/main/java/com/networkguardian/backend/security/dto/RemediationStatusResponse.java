package com.networkguardian.backend.security.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RemediationStatusResponse {
    private String findingId;
    private String remediationPlanId;
    private String jiraKey;
    private String jiraUrl;
    private String jiraStatus;
    private String assignee;
    private LocalDateTime lastUpdated;
    private String remediationState;
}