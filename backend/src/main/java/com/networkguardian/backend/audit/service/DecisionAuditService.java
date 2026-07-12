package com.networkguardian.backend.audit;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;

import com.networkguardian.backend.common.dto.DecisionAudit;

@Service
public class DecisionAuditService {

    private final CopyOnWriteArrayList<DecisionAudit> audits = new CopyOnWriteArrayList<>();

    public void save(DecisionAudit audit) {
        audits.add(audit);
    }

    public List<DecisionAudit> findAll() {
        return List.copyOf(audits);
    }

    public Optional<DecisionAudit> findByDecisionId(String decisionId) {
        return audits.stream()
                .filter(audit -> audit.getDecisionId().equals(decisionId))
                .findFirst();
    }
}