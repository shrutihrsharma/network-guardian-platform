package com.networkguardian.backend.compliance.context;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.networkguardian.backend.repository.HistoricalIncidentRepository;
import com.networkguardian.backend.repository.RunbookRepository;

@Component
public class DefaultComplianceKnowledgeProvider implements ComplianceKnowledgeProvider {

    private final RunbookRepository runbookRepository;
    private final HistoricalIncidentRepository historicalIncidentRepository;

    public DefaultComplianceKnowledgeProvider(
            RunbookRepository runbookRepository,
            HistoricalIncidentRepository historicalIncidentRepository) {
        this.runbookRepository = runbookRepository;
        this.historicalIncidentRepository = historicalIncidentRepository;
    }

    @Override
    public ComplianceKnowledge provide(ComplianceKnowledgeRequest request) {
        List<String> runbookDerivedArticles = runbookRepository.findAll().stream()
                .sorted(Comparator.comparing(r -> Objects.toString(r.getTitle(), "")))
                .limit(8)
                .map(r -> "%s (%s)".formatted(r.getTitle(), r.getOwner()))
                .toList();

        String vendor = request != null && request.getVendor() != null ? request.getVendor() : "Network";

        List<String> vendorBestPractices = List.of(
                "%s: keep software on supported LTS releases".formatted(vendor),
                "%s: enforce baseline configuration review before change windows".formatted(vendor),
                "%s: validate certificate chains 90 days before expiry".formatted(vendor),
                "%s: maintain incident response runbook coverage for Tier-1 services".formatted(vendor));

        List<String> policies = List.of(
                "All Tier-1 services require no open critical incidents.",
                "Unsupported and disinvest software requires remediation planning.",
                "Configuration drift must be remediated in the next maintenance window.",
                "Patch and certificate posture must be reviewed weekly.");

        List<String> historicalRca = historicalIncidentRepository.findAll().stream()
                .filter(item -> item.getRootCause() != null)
                .collect(Collectors.groupingBy(item -> item.getRootCause().toLowerCase(Locale.ROOT), Collectors.counting()))
                .entrySet().stream()
                .sorted((left, right) -> Long.compare(right.getValue(), left.getValue()))
                .limit(8)
                .map(entry -> "%s (%d occurrences)".formatted(entry.getKey(), entry.getValue()))
                .toList();

        return ComplianceKnowledge.builder()
                .knowledgeArticles(runbookDerivedArticles)
                .vendorBestPractices(vendorBestPractices)
                .compliancePolicies(policies)
                .historicalRca(historicalRca)
                .build();
    }
}
