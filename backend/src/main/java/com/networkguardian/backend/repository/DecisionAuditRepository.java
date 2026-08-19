package com.networkguardian.backend.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.common.dto.DecisionAudit;

public interface DecisionAuditRepository extends MongoRepository<DecisionAudit, String> {
    Optional<DecisionAudit> findByDecisionId(String decisionId);
    Optional<DecisionAudit> findTopByIncidentIdAndModuleOrderByTimestampDesc(String incidentId, String module);
    List<DecisionAudit> findByIncidentIdInAndModule(List<String> incidentIds, String module);
        Optional<DecisionAudit> findTopByIncidentIdAndModuleAndRemediationPlanIsNotNullOrderByTimestampDesc(
            String incidentId, String module);
        Optional<DecisionAudit> findTopByIncidentIdAndModuleAndJiraKeyIsNotNullOrderByJiraCreatedAtDesc(
            String incidentId, String module);
}
