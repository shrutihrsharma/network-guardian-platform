package com.networkguardian.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.common.dto.DecisionAudit;

public interface DecisionAuditRepository extends MongoRepository<DecisionAudit, String> {
    Optional<DecisionAudit> findByDecisionId(String decisionId);
}
