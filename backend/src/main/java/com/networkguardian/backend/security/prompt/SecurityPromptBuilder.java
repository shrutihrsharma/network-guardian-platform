package com.networkguardian.backend.security.prompt;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import com.networkguardian.backend.security.context.SecurityFindingContext;
import com.networkguardian.backend.security.model.SecurityFinding;

@Component
public class SecurityPromptBuilder {

    private static final String TEMPLATE_PATH = "prompts/security_posture.md";

    public String build(SecurityFindingContext context) {
        SecurityFinding finding = context.getFinding();
        String template = loadTemplate();

        return template
                .replace("{{findingId}}", Objects.toString(finding.getId(), "N/A"))
                .replace("{{device}}", Objects.toString(finding.getDeviceName(), "N/A"))
                .replace("{{vendor}}", Objects.toString(finding.getVendor(), "N/A"))
                .replace("{{region}}", Objects.toString(finding.getRegion(), "N/A"))
                .replace("{{businessService}}", Objects.toString(finding.getBusinessService(), "N/A"))
                .replace("{{category}}", Objects.toString(finding.getCategory(), "N/A"))
                .replace("{{severity}}", Objects.toString(finding.getSeverity(), "N/A"))
                .replace("{{complianceImpact}}", Objects.toString(finding.getComplianceImpact(), "N/A"))
                .replace("{{description}}", Objects.toString(finding.getDescription(), "N/A"))
                .replace("{{riskScore}}", String.valueOf(finding.getRiskScore()))
                .replace("{{status}}", Objects.toString(finding.getStatus(), "N/A"))
                .replace("{{affectedAssets}}", String.valueOf(finding.getAffectedAssets()))
                .replace("{{createdAt}}", Objects.toString(finding.getCreatedAt(), "N/A"))
                .replace("{{decisionTimestamp}}", Objects.toString(context.getDecisionTimestamp(), "N/A"));
    }

    private String loadTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
            try (InputStream is = resource.getInputStream()) {
                return StreamUtils.copyToString(is, Objects.requireNonNull(StandardCharsets.UTF_8));
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to load security prompt template: " + TEMPLATE_PATH, e);
        }
    }
}
