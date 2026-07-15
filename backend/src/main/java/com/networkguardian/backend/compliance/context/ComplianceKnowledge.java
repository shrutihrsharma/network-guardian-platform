package com.networkguardian.backend.compliance.context;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceKnowledge {

    private List<String> knowledgeArticles;
    private List<String> vendorBestPractices;
    private List<String> compliancePolicies;
    private List<String> historicalRca;
}
