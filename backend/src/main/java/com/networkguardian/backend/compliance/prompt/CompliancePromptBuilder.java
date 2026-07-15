package com.networkguardian.backend.compliance.prompt;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import com.networkguardian.backend.ai.EnterpriseKnowledgeSectionBuilder;
import com.networkguardian.backend.compliance.context.ComplianceContext;
import com.networkguardian.backend.compliance.dto.DeviceComplianceResponse;

@Component
public class CompliancePromptBuilder {

    private static final String TEMPLATE_PATH = "prompts/compliance_decision.md";
    private final EnterpriseKnowledgeSectionBuilder enterpriseKnowledgeSectionBuilder;

    public CompliancePromptBuilder(EnterpriseKnowledgeSectionBuilder enterpriseKnowledgeSectionBuilder) {
        this.enterpriseKnowledgeSectionBuilder = enterpriseKnowledgeSectionBuilder;
    }

    public String build(ComplianceContext context) {
        String template = loadTemplate();

        String prompt = template
                .replace("{{summary}}", formatSummary(context))
                .replace("{{currentCompliance}}", formatCurrentCompliance(context))
                .replace("{{failedKris}}", formatList(context.getTopFailedKris()))
                .replace("{{lifecycleSummary}}", context.getLifecycleSummary())
                .replace("{{incidentSummary}}", context.getIncidentSummary())
                .replace("{{criticalDevices}}", formatCriticalDevices(context.getCriticalDevices()))
                .replace("{{businessServices}}", formatList(context.getCriticalBusinessServices()))
                .replace("{{knowledgeArticles}}", formatList(context.getKnowledge().getKnowledgeArticles()))
                .replace("{{vendorBestPractices}}", formatList(context.getKnowledge().getVendorBestPractices()))
                .replace("{{compliancePolicies}}", formatList(context.getKnowledge().getCompliancePolicies()))
                .replace("{{historicalRca}}", formatList(context.getKnowledge().getHistoricalRca()))
                .replace("{{activeKris}}", formatActiveKris(context))
                .replace("{{timestamp}}", Objects.toString(context.getDecisionTimestamp(), "N/A"));

            return enterpriseKnowledgeSectionBuilder
                .appendBeforeFinalInstructions(prompt, context.getEnterpriseKnowledge());
    }

    private String loadTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
            try (InputStream is = resource.getInputStream()) {
                return StreamUtils.copyToString(is, Objects.requireNonNull(StandardCharsets.UTF_8));
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to load compliance prompt template: " + TEMPLATE_PATH, e);
        }
    }

    private String formatSummary(ComplianceContext context) {
        if (context.getSummary() == null) {
            return "No summary available.";
        }

        return "totalDevices=%d, compliant=%d, highRisk=%d, criticalRisk=%d, averageCompliance=%.1f"
                .formatted(
                        context.getSummary().getTotalDevices(),
                        context.getSummary().getCompliantDevices(),
                        context.getSummary().getHighRiskDevices(),
                        context.getSummary().getCriticalRiskDevices(),
                        context.getSummary().getAverageCompliance());
    }

    private String formatCurrentCompliance(ComplianceContext context) {
        DeviceComplianceResponse target = context.getTargetDevice();
        if (target == null) {
            return "Global posture request (no target device).";
        }

        return "deviceId=%s, hostname=%s, overallCompliance=%.1f, risk=%s, failedKRIs=%s"
                .formatted(
                        target.getDeviceId(),
                        target.getHostname(),
                        target.getOverallCompliance(),
                        target.getRiskLevel(),
                        String.join(", ", target.getFailedKRIs() == null ? List.of() : target.getFailedKRIs()));
    }

    private String formatCriticalDevices(List<DeviceComplianceResponse> devices) {
        if (devices == null || devices.isEmpty()) {
            return "None";
        }
        return devices.stream()
                .map(item -> "%s (%s, compliance=%.1f)".formatted(
                        item.getHostname(), item.getRiskLevel(), item.getOverallCompliance()))
                .collect(Collectors.joining("\n- ", "- ", ""));
    }

    private String formatActiveKris(ComplianceContext context) {
        if (context.getActiveKris() == null || context.getActiveKris().isEmpty()) {
            return "None";
        }
        return context.getActiveKris().stream()
                .map(item -> "%s [%s] threshold=%.2f".formatted(item.getName(), item.getSeverity(), item.getThreshold()))
                .collect(Collectors.joining("\n- ", "- ", ""));
    }

    private String formatList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "None";
        }
        return values.stream().collect(Collectors.joining("\n- ", "- ", ""));
    }
}
