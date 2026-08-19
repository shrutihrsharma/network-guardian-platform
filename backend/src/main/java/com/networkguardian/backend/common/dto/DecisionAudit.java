package com.networkguardian.backend.common.dto;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.networkguardian.backend.security.dto.RemediationPlan;

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
    /** Module that produced this decision: INCIDENT, LIFECYCLE, etc. */
    private String module;
    private String provider;
    private String model;
    private String prompt;
    private String rawResponse;
    private DecisionResponse decisionResponse;
    private RemediationPlan remediationPlan;
    private List<String> historicalEvidenceIds;
    private String jiraKey;
    private String jiraUrl;
    private String jiraStatus;
    private String jiraAssignee;
    private LocalDateTime jiraCreatedAt;
    private String jiraTriggeredBy;
}
