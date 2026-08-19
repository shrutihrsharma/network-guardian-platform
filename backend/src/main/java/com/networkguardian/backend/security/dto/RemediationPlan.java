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
public class RemediationPlan {

    private String planId;
    private String findingId;
    private String title;
    private String summary;
    private String severity;
    private String businessImpact;
    private String rootCause;
    private List<String> remediationSteps;
    private RecommendedOwner recommendedOwner;
    private String ownerReason;
    private String estimatedEffort;
    private String riskIfNotResolved;
    private double confidence;
    private LocalDateTime generatedAt;
    private String provider;
    private String model;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedOwner {
        private String userId;
        private String name;
        private String team;
        private String reason;
        private double confidence;
    }
}
