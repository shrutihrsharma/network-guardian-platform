package com.networkguardian.backend.audit.service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.networkguardian.backend.common.dto.DecisionAudit;
import com.networkguardian.backend.repository.DecisionAuditRepository;

@Service
public class DecisionAuditService {

    private static final Logger log = LoggerFactory.getLogger(DecisionAuditService.class);

    private final DecisionAuditRepository decisionAuditRepository;

    public DecisionAuditService(DecisionAuditRepository decisionAuditRepository) {
        this.decisionAuditRepository = decisionAuditRepository;
    }

    public void save(DecisionAudit audit) {
        DecisionAudit validatedAudit = Objects.requireNonNull(audit, "audit must not be null");
        log.info("Persisting decision audit for decisionId={} incidentId={}",
                validatedAudit.getDecisionId(),
                validatedAudit.getIncidentId());
        decisionAuditRepository.save(validatedAudit);
    }

    public List<DecisionAudit> findAll() {
        return decisionAuditRepository.findAll();
    }

    public Optional<DecisionAudit> findByDecisionId(String decisionId) {
        return decisionAuditRepository.findByDecisionId(decisionId);
    }

    public Optional<DecisionAudit> findLatestByFindingId(String findingId, String module) {
        return decisionAuditRepository.findTopByIncidentIdAndModuleOrderByTimestampDesc(findingId, module);
    }

    public List<DecisionAudit> findByFindingIds(List<String> findingIds, String module) {
        if (findingIds == null || findingIds.isEmpty()) {
            return List.of();
        }
        return decisionAuditRepository.findByIncidentIdInAndModule(findingIds, module);
    }

    public Optional<DecisionAudit> findLatestRemediationPlan(String findingId, String module) {
        return decisionAuditRepository.findTopByIncidentIdAndModuleAndRemediationPlanIsNotNullOrderByTimestampDesc(
                findingId, module);
    }

    public Optional<DecisionAudit> findExistingJiraTicket(String findingId, String module) {
        return decisionAuditRepository.findTopByIncidentIdAndModuleAndJiraKeyIsNotNullOrderByJiraCreatedAtDesc(
                findingId, module);
    }

    public void recordJiraTicket(DecisionAudit audit, String jiraKey, String jiraUrl,
                                 String assignee, String status, java.time.LocalDateTime createdAt) {
        audit.setJiraKey(jiraKey);
        audit.setJiraUrl(jiraUrl);
        audit.setJiraAssignee(assignee);
        audit.setJiraStatus(status);
        audit.setJiraCreatedAt(createdAt);
        save(audit);
    }
}