package com.networkguardian.backend.security.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.networkguardian.backend.audit.service.DecisionAuditService;
import com.networkguardian.backend.common.dto.DecisionAudit;
import com.networkguardian.backend.repository.SecurityFindingRepository;
import com.networkguardian.backend.security.dto.RemediationVerificationResponse;
import com.networkguardian.backend.security.model.SecurityFinding;

@Service
public class RemediationVerificationService {
    private static final String MODULE = "SECURITY";

    private final DecisionAuditService auditService;
    private final SecurityFindingRepository findingRepository;

    public RemediationVerificationService(DecisionAuditService auditService,
                                          SecurityFindingRepository findingRepository) {
        this.auditService = auditService;
        this.findingRepository = findingRepository;
    }

    public RemediationVerificationResponse verify(String findingId) {
        DecisionAudit audit = auditService.findExistingJiraTicket(findingId, MODULE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Jira remediation ticket not found for security finding: " + findingId));
        if (!"RESOLVED".equalsIgnoreCase(audit.getJiraRemediationState())
            && !"RESOLVED".equalsIgnoreCase(audit.getJiraStatus())
            && !"DONE".equalsIgnoreCase(audit.getJiraStatus())
            && !"CLOSED".equalsIgnoreCase(audit.getJiraStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Remediation can only be verified after Jira is resolved.");
        }
        SecurityFinding original = audit.getOriginalFinding();
        if (original == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Original finding evidence is unavailable for verification.");
        }
        SecurityFinding current = findingRepository.findById(findingId).orElse(null);
        List<String> evidence = new ArrayList<>();
        boolean verified;
        Integer previousRisk = original.getRiskScore() > 0 ? original.getRiskScore() : null;
        Integer currentRisk = current != null && current.getRiskScore() > 0 ? current.getRiskScore() : null;
        if (current == null) {
            evidence.add("Vulnerability no longer detected");
            verified = true;
        } else {
            verified = isImproved(original, current);
            if (verified) evidence.add("Security finding is no longer active");
            else evidence.add("The underlying security finding remains active");
            if (currentRisk != null && previousRisk != null && currentRisk < previousRisk) {
                evidence.add("Risk score decreased from " + previousRisk + " to " + currentRisk);
            }
        }
        if (verified && current != null && current.getComplianceImpact() != null
                && !current.getComplianceImpact().equalsIgnoreCase("None")) {
            evidence.add("Current compliance evidence requires review");
        } else if (verified) {
            evidence.add("Security control compliant");
        }
        String result = verified ? "VERIFIED" : "NOT_VERIFIED";
        String reason = verified ? "Current security data shows the risk condition has improved."
                : "The Jira ticket is resolved, but the underlying security finding remains active.";
        LocalDateTime verifiedAt = LocalDateTime.now();
        audit.setVerificationTimestamp(verifiedAt);
        audit.setVerificationResult(result);
        audit.setVerificationReason(reason);
        audit.setVerificationEvidence(evidence);
        audit.setVerificationPreviousRiskScore(previousRisk);
        audit.setVerificationCurrentRiskScore(currentRisk);
        auditService.save(audit);
        return RemediationVerificationResponse.builder().findingId(findingId).jiraKey(audit.getJiraKey())
                .result(result).reason(reason).evidence(evidence).previousRiskScore(previousRisk)
                .currentRiskScore(currentRisk).verifiedAt(verifiedAt).build();
    }

    private boolean isImproved(SecurityFinding original, SecurityFinding current) {
        String status = current.getStatus() == null ? "" : current.getStatus();
        boolean noLongerActive = status.equalsIgnoreCase("Mitigated")
                || status.equalsIgnoreCase("Resolved") || status.equalsIgnoreCase("Closed");
        return noLongerActive;
    }
}