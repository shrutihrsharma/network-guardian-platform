package com.networkguardian.backend.security.prompt;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.networkguardian.backend.common.dto.DecisionResponse;
import com.networkguardian.backend.security.context.RemediationPlanContext;
import com.networkguardian.backend.security.model.SecurityFinding;

@Component
public class RemediationPlanPromptBuilder {

    public String build(RemediationPlanContext context) {
        SecurityFinding finding = context.getFinding();
        return """
                You are an enterprise Security Posture remediation planner.

                CURRENT FINDING
                Finding ID: %s
                Title: %s
                Device: %s
                Vendor: %s
                Region: %s
                Business Service: %s
                Category: %s
                Severity: %s
                Compliance Impact: %s
                Description: %s
                Risk Score: %d
                Status: %s
                Affected Assets: %d

                HISTORICAL EVIDENCE
                Findings:
                %s
                Prior decisions:
                %s

                EXISTING AI ANALYSIS
                %s

                TASK
                Create a concrete, structured remediation plan. Identify likely root cause, business impact,
                ordered remediation steps, estimated effort, risk if unresolved, and confidence. Recommend an owner
                only when the historical evidence explicitly supports that user or team. Do not invent users, teams,
                historical incidents, resolution times, or ownership information. If owner evidence is insufficient,
                recommendedOwner must be null and ownerReason must be exactly
                "Insufficient historical evidence to recommend an owner".

                Return JSON only using this schema:
                {
                  "findingId": "",
                  "title": "",
                  "summary": "",
                  "severity": "",
                  "businessImpact": "",
                  "rootCause": "",
                  "remediationSteps": [""],
                  "recommendedOwner": {"userId": "", "name": "", "team": "", "reason": "", "confidence": 0},
                  "ownerReason": "",
                  "estimatedEffort": "",
                  "riskIfNotResolved": "",
                  "confidence": 0
                }
                """.formatted(
                value(finding.getId()), value(finding.getTitle()), value(finding.getDeviceName()),
                value(finding.getVendor()), value(finding.getRegion()), value(finding.getBusinessService()),
                value(finding.getCategory()), value(finding.getSeverity()), value(finding.getComplianceImpact()),
                value(finding.getDescription()), finding.getRiskScore(), value(finding.getStatus()),
                finding.getAffectedAssets(), formatFindings(context.getHistoricalFindings()),
                formatDecisions(context.getHistoricalDecisions()), formatAnalysis(context.getExistingAnalysis()));
    }

    private String formatFindings(List<SecurityFinding> findings) {
        if (findings == null || findings.isEmpty()) return "No relevant historical findings found.";
        return findings.stream().map(f -> "- %s | %s | %s | %s | %s | status=%s"
                .formatted(value(f.getId()), value(f.getTitle()), value(f.getCategory()),
                        value(f.getBusinessService()), value(f.getVendor()), value(f.getStatus())))
                .collect(Collectors.joining("\n"));
    }

    private String formatDecisions(List<DecisionResponse> decisions) {
        if (decisions == null || decisions.isEmpty()) return "No relevant historical decisions found.";
        return decisions.stream().map(d -> "- recommendation=%s | rootCause=%s | confidence=%s"
                .formatted(value(d.getRecommendation()), value(d.getRootCause()), d.getConfidence()))
                .collect(Collectors.joining("\n"));
    }

    private String formatAnalysis(DecisionResponse analysis) {
        if (analysis == null) return "No existing AI analysis available.";
        return "Summary: %s\nRoot cause: %s\nRecommendation: %s\nBusiness impact: %s"
                .formatted(value(analysis.getSummary()), value(analysis.getRootCause()),
                        value(analysis.getRecommendation()), value(analysis.getBusinessImpact()));
    }

    private String value(String value) {
        return Objects.toString(value, "N/A");
    }
}
