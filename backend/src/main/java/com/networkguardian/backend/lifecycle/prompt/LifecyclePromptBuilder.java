package com.networkguardian.backend.lifecycle.prompt;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.lifecycle.context.LifecycleContext;
import com.networkguardian.backend.lifecycle.model.SoftwareLifecycle;

@Component
public class LifecyclePromptBuilder {

    private static final String TEMPLATE_PATH = "prompts/lifecycle.md";

    public String build(LifecycleContext context) {
        String template = loadTemplate();

        return template
                .replace("{{device}}", formatDevice(context))
                .replace("{{lifecycle}}", formatLifecycle(context.getLifecycle()))
                .replace("{{stageAnalysis}}", formatStageAnalysis(context))
                .replace("{{incidents}}", formatIncidents(context.getRelatedIncidents()));
    }

    private String loadTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
            try (InputStream is = resource.getInputStream()) {
                return StreamUtils.copyToString(is, Objects.requireNonNull(StandardCharsets.UTF_8));
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to load lifecycle prompt template: " + TEMPLATE_PATH, e);
        }
    }

    private String formatDevice(LifecycleContext ctx) {
        var d = ctx.getDevice();
        return """
                Hostname: %s
                Vendor: %s
                Family: %s
                Model: %s
                Location: %s
                Business Service: %s
                Current OS Version: %s
                Operational Status: %s
                """.formatted(
                d.getHostname(),
                d.getVendor(),
                d.getFamily() != null ? d.getFamily() : "Unknown",
                d.getModel(),
                d.getLocation(),
                d.getBusinessService(),
                d.getOsVersion(),
                d.getLifecycleStatus());
    }

    private String formatLifecycle(SoftwareLifecycle lc) {
        return """
                Vendor: %s
                Device Family: %s
                OS Version: %s
                Recommended Version: %s
                Engineering Testing Date: %s
                Invest Date: %s
                Maintain Date: %s
                Disinvest Date: %s
                Unsupported Date: %s
                Notes: %s
                """.formatted(
                lc.getVendor(),
                lc.getDeviceFamily(),
                lc.getOsVersion(),
                lc.getRecommendedVersion(),
                lc.getEngineeringTestingDate(),
                lc.getInvestDate(),
                lc.getMaintainDate(),
                lc.getDisinvestDate(),
                lc.getUnsupportedDate(),
                lc.getNotes() != null ? lc.getNotes() : "N/A");
    }

    private String formatStageAnalysis(LifecycleContext ctx) {
        return """
                Current Stage: %s
                Days Until Unsupported: %d
                Days Until Disinvest: %d
                Decision Timestamp: %s
                """.formatted(
                ctx.getCurrentStage(),
                ctx.getDaysUntilUnsupported(),
                ctx.getDaysUntilDisinvest(),
                ctx.getDecisionTimestamp());
    }

    private String formatIncidents(List<Incident> incidents) {
        if (incidents == null || incidents.isEmpty()) {
            return "No recent incidents recorded for this device.";
        }
        return incidents.stream()
                .map(inc -> "- [%s] Severity: %s | Status: %s | Symptoms: %s".formatted(
                        inc.getId(),
                        inc.getSeverity(),
                        inc.getStatus(),
                        String.join(", ", inc.getSymptoms())))
                .collect(Collectors.joining("\n"));
    }
}
