package com.networkguardian.backend.common.dto;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "decision_audits")
public class DecisionAudit {

    @Id
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
