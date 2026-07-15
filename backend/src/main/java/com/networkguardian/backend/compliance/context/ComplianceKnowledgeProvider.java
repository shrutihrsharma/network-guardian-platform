package com.networkguardian.backend.compliance.context;

public interface ComplianceKnowledgeProvider {

    ComplianceKnowledge provide(ComplianceKnowledgeRequest request);
}
