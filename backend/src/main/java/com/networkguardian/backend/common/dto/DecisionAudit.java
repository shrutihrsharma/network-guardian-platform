package com.networkguardian.backend.common.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionAudit {

    private String decisionId;
    private LocalDateTime timestamp;
    private String incidentId;
    private String engine;
    private String provider;
    private String model;
    private String prompt;
    private String rawResponse;
    private DecisionResponse decisionResponse;
}
