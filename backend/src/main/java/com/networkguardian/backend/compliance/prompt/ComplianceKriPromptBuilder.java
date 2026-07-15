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

import com.networkguardian.backend.compliance.context.ComplianceContext;

@Component
public class ComplianceKriPromptBuilder {

    private static final String TEMPLATE_PATH = "prompts/compliance_kri_generator.md";

    public String build(ComplianceContext context) {
        String template = loadTemplate();

        return template
                .replace("{{summary}}", summary(context))
                .replace("{{lifecycleSummary}}", context.getLifecycleSummary())
                .replace("{{incidentSummary}}", context.getIncidentSummary())
                .replace("{{activeKris}}", formatActiveKris(context))
                .replace("{{runbooks}}", formatList(context.getKnowledge().getKnowledgeArticles()))
                .replace("{{knowledgeArticles}}", formatList(context.getKnowledge().getKnowledgeArticles()))
                .replace("{{vendorBestPractices}}", formatList(context.getKnowledge().getVendorBestPractices()))
                .replace("{{compliancePolicies}}", formatList(context.getKnowledge().getCompliancePolicies()))
                .replace("{{historicalRca}}", formatList(context.getKnowledge().getHistoricalRca()));
    }

    private String loadTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
            try (InputStream is = resource.getInputStream()) {
                return StreamUtils.copyToString(is, Objects.requireNonNull(StandardCharsets.UTF_8));
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to load compliance KRI generator prompt template: " + TEMPLATE_PATH, e);
        }
    }

    private String summary(ComplianceContext context) {
        if (context.getSummary() == null) {
            return "No compliance summary available.";
        }

        return "totalDevices=%d, compliantDevices=%d, highRiskDevices=%d, criticalRiskDevices=%d, activeKRIs=%d"
                .formatted(
                        context.getSummary().getTotalDevices(),
                        context.getSummary().getCompliantDevices(),
                        context.getSummary().getHighRiskDevices(),
                        context.getSummary().getCriticalRiskDevices(),
                        context.getSummary().getTotalActiveKRIs());
    }

    private String formatActiveKris(ComplianceContext context) {
        if (context.getActiveKris() == null || context.getActiveKris().isEmpty()) {
            return "None";
        }
        return context.getActiveKris().stream()
                .map(item -> "%s | %s | threshold=%.2f | formula=%s".formatted(
                        item.getName(), item.getSeverity(), item.getThreshold(), item.getMeasurementFormula()))
                .collect(Collectors.joining("\n- ", "- ", ""));
    }

    private String formatList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "None";
        }
        return values.stream().collect(Collectors.joining("\n- ", "- ", ""));
    }
}
