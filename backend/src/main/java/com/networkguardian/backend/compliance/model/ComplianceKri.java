package com.networkguardian.backend.compliance.model;

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
@Document(collection = "compliance_kri")
public class ComplianceKri {

    @Id
    private String id;
    private String name;
    private String description;
    private String category;
    private String severity;
    private double threshold;
    private String measurementFormula;
    private boolean enabled;
    private boolean approved;
    private boolean aiGenerated;
    private LocalDateTime createdDate;
}
