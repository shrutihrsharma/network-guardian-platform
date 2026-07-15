package com.networkguardian.backend.compliance.context;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceKnowledgeRequest {

    private String vendor;
    private String businessService;
    private String deviceType;
}
