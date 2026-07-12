package com.networkguardian.backend.ai;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import com.networkguardian.backend.incident.context.HistoricalIncident;
import com.networkguardian.backend.incident.context.IncidentContext;
import com.networkguardian.backend.incident.context.Runbook;
import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;

@Component
public class PromptBuilder {

    private static final String PROMPT_TEMPLATE_PATH = "prompts/incident.md";

    public String build(IncidentContext context) {

        String template = loadTemplate();

        return template
                .replace("{{device}}", formatDevice(context.getDevice()))
                .replace("{{incident}}", formatIncident(context.getIncident()))
                .replace("{{runbook}}", formatRunbook(context.getRunbook()))
                .replace("{{history}}", formatHistory(context.getHistoricalIncidents()));
    }

    private String loadTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource(PROMPT_TEMPLATE_PATH);
            try (InputStream inputStream = resource.getInputStream()) {
                return StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to load prompt template: " + PROMPT_TEMPLATE_PATH, e);
        }
    }

    private String formatDevice(Device device) {
        return """
                Hostname: %s
                Vendor: %s
                Model: %s
                Location: %s
                Business Service: %s
                OS Version: %s
                Lifecycle Status: %s
                """.formatted(
                device.getHostname(),
                device.getVendor(),
                device.getModel(),
                device.getLocation(),
                device.getBusinessService(),
                device.getOsVersion(),
                device.getLifecycleStatus()
        );
    }

    private String formatIncident(Incident incident) {
        return """
                Incident ID: %s
                Device ID: %s
                Severity: %s
                Status: %s
                Symptoms: %s
                """.formatted(
                incident.getId(),
                incident.getDeviceId(),
                incident.getSeverity(),
                incident.getStatus(),
                String.join(", ", incident.getSymptoms())
        );
    }

    private String formatRunbook(Runbook runbook) {
        String steps = runbook.getSteps().stream()
                .map(step -> "- " + step)
                .collect(Collectors.joining("\n"));

        return """
                Runbook ID: %s
                Title: %s
                Owner: %s
                Version: %s
                Steps:
                %s
                """.formatted(
                runbook.getRunbookId(),
                runbook.getTitle(),
                runbook.getOwner(),
                runbook.getVersion(),
                steps
        );
    }

    private String formatHistory(List<HistoricalIncident> historicalIncidents) {
        return historicalIncidents.stream()
                .map(h -> "- %s | Root Cause: %s | Resolution: %s | Resolved In: %d min | Confidence: .1%f"
                        .formatted(
                                h.getIncidentId(),
                                h.getRootCause(),
                                h.getResolution(),
                                h.getResolvedInMinutes(),
                                h.getResolutionConfidence()
                        ))
                .collect(Collectors.joining("\n"));
    }
}