package com.networkguardian.backend.security.model;

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
@Document(collection = "security_findings")
public class SecurityFinding {

    @Id
    private String id;
    private String deviceId;
    private String deviceName;
    private String vendor;
    private String region;
    private String businessService;
    private String severity;
    private String category;
    private String title;
    private String description;
    private String complianceImpact;
    private String status;
    private int riskScore;
    private int affectedAssets;
    private LocalDateTime createdAt;
}
