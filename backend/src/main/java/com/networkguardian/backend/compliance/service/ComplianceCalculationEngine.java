package com.networkguardian.backend.compliance.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.networkguardian.backend.compliance.model.ComplianceKri;
import com.networkguardian.backend.compliance.model.DeviceCompliance;
import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.lifecycle.context.LifecycleContextBuilder;
import com.networkguardian.backend.lifecycle.model.SoftwareLifecycle;

@Service
public class ComplianceCalculationEngine {

    private static final Map<String, Integer> SEVERITY_WEIGHTS = Map.of(
            "CRITICAL", 5,
            "HIGH", 3,
            "MEDIUM", 2,
            "LOW", 1);

    private final LifecycleContextBuilder lifecycleContextBuilder;

    public ComplianceCalculationEngine(LifecycleContextBuilder lifecycleContextBuilder) {
        this.lifecycleContextBuilder = lifecycleContextBuilder;
    }

    public DeviceCompliance calculate(
            Device device,
            SoftwareLifecycle lifecycle,
            List<Incident> incidents,
            List<ComplianceKri> activeKris) {

        DeviceSnapshot snapshot = buildSnapshot(device, lifecycle, incidents);

        List<String> passed = new ArrayList<>();
        List<String> failed = new ArrayList<>();

        int totalWeight = 0;
        int earnedWeight = 0;
        int failedCritical = 0;

        for (ComplianceKri kri : activeKris) {
            int weight = weightFor(kri.getSeverity());
            totalWeight += weight;

            boolean pass = evaluateKri(kri.getId(), kri.getThreshold(), snapshot);
            if (pass) {
                passed.add(kri.getName());
                earnedWeight += weight;
            } else {
                failed.add(kri.getName());
                if ("CRITICAL".equalsIgnoreCase(kri.getSeverity())) {
                    failedCritical++;
                }
            }
        }

        double overall = totalWeight == 0 ? 100.0 : roundOneDecimal((earnedWeight * 100.0) / totalWeight);

        return DeviceCompliance.builder()
                .deviceId(device.getId())
                .overallCompliance(overall)
                .riskLevel(deriveRiskLevel(overall, failedCritical, failed.size()))
                .passedKRIs(passed)
                .failedKRIs(failed)
                .lastCalculated(LocalDateTime.now())
                .build();
    }

    private DeviceSnapshot buildSnapshot(Device device, SoftwareLifecycle lifecycle, List<Incident> incidents) {
        String lifecycleStage = lifecycle != null ? lifecycleContextBuilder.computeCurrentStage(lifecycle) : "Invest";
        long daysUntilUnsupported = lifecycle != null && lifecycle.getUnsupportedDate() != null
                ? ChronoUnit.DAYS.between(LocalDate.now(), LocalDate.parse(lifecycle.getUnsupportedDate()))
                : 3650;

        long totalIncidents = incidents.size();
        long criticalIncidents = incidents.stream()
                .filter(i -> "Critical".equalsIgnoreCase(i.getSeverity()))
                .count();
        long highOrCriticalIncidents = incidents.stream()
                .filter(i -> "Critical".equalsIgnoreCase(i.getSeverity()) || "High".equalsIgnoreCase(i.getSeverity()))
                .count();
        long unresolvedIncidents = incidents.stream()
                .filter(i -> i.getStatus() != null && !"RESOLVED".equalsIgnoreCase(i.getStatus()))
                .count();
        long openCriticalIncidents = incidents.stream()
                .filter(i -> "Critical".equalsIgnoreCase(i.getSeverity()))
                .filter(i -> i.getStatus() != null && !"RESOLVED".equalsIgnoreCase(i.getStatus()))
                .count();

        long certificateIncidents = incidents.stream()
                .filter(i -> hasKeyword(i, "certificate") || hasKeyword(i, "ssl") || hasKeyword(i, "tls"))
                .count();
        long driftIncidents = incidents.stream()
                .filter(i -> hasKeyword(i, "drift") || hasKeyword(i, "baseline") || hasKeyword(i, "configuration"))
                .count();
        long firewallIncidents = incidents.stream()
                .filter(i -> hasKeyword(i, "firewall") || hasKeyword(i, "policy") || hasKeyword(i, "blocked"))
                .count();

        return new DeviceSnapshot(
                lifecycleStage,
                daysUntilUnsupported,
                deriveDeviceType(device.getHostname()),
                isTier1Service(device.getBusinessService()),
                totalIncidents,
                criticalIncidents,
                highOrCriticalIncidents,
                unresolvedIncidents,
                openCriticalIncidents,
                certificateIncidents,
                driftIncidents,
                firewallIncidents);
    }

    private boolean evaluateKri(String kriId, double threshold, DeviceSnapshot s) {
        return switch (kriId) {
            case "KRI-001" -> !"Unsupported".equals(s.lifecycleStage());
            case "KRI-002" -> !"Disinvest".equals(s.lifecycleStage());
            case "KRI-003" -> s.daysUntilUnsupported() > (long) threshold && s.certificateIncidents() == 0;
            case "KRI-004" -> s.driftIncidents() == 0 && s.unresolvedIncidents() < 2;
            case "KRI-005" -> s.daysUntilUnsupported() > (long) threshold && !isLegacyStage(s.lifecycleStage());
            case "KRI-006" -> "Invest".equals(s.lifecycleStage()) || "Maintain".equals(s.lifecycleStage());
            case "KRI-007" -> s.totalIncidents() <= (long) threshold;
            case "KRI-008" -> !("Load Balancer".equals(s.deviceType()) && s.unresolvedIncidents() > 0);
            case "KRI-009" -> !"Engineering Testing".equals(s.lifecycleStage()) && s.highOrCriticalIncidents() <= 1;
            case "KRI-010" -> !(s.tier1Service() && (isLegacyStage(s.lifecycleStage()) || s.unresolvedIncidents() > 0));
            case "KRI-011" -> !"Unsupported".equals(s.lifecycleStage());
            case "KRI-012" -> s.openCriticalIncidents() == 0;
            case "KRI-013" -> s.unresolvedIncidents() <= (long) threshold;
            case "KRI-014" -> s.firewallIncidents() == 0 || "Invest".equals(s.lifecycleStage());
            case "KRI-015" -> s.daysUntilUnsupported() > (long) threshold;
            case "KRI-016" -> (s.driftIncidents() + s.criticalIncidents()) <= (long) threshold;
            default -> true;
        };
    }

    private boolean hasKeyword(Incident incident, String keyword) {
        if (incident.getSymptoms() == null) {
            return false;
        }
        String normalizedKeyword = keyword.toLowerCase(Locale.ROOT);
        return incident.getSymptoms().stream()
                .filter(value -> value != null)
                .map(value -> value.toLowerCase(Locale.ROOT))
                .anyMatch(value -> value.contains(normalizedKeyword));
    }

    private boolean isLegacyStage(String stage) {
        return "Disinvest".equals(stage) || "Unsupported".equals(stage);
    }

    private int weightFor(String severity) {
        return SEVERITY_WEIGHTS.getOrDefault(
                severity == null ? "MEDIUM" : severity.toUpperCase(Locale.ROOT),
                2);
    }

    private String deriveRiskLevel(double score, int failedCritical, int totalFailed) {
        if (score < 55 || failedCritical >= 3) {
            return "Critical";
        }
        if (score < 70 || failedCritical >= 1 || totalFailed >= 6) {
            return "High";
        }
        if (score < 85 || totalFailed >= 4) {
            return "Medium";
        }
        return "Low";
    }

    private String deriveDeviceType(String hostname) {
        if (hostname == null || hostname.isBlank()) {
            return "Switch";
        }
        if (hostname.startsWith("RTR")) {
            return "Router";
        }
        if (hostname.startsWith("SW")) {
            return "Switch";
        }
        if (hostname.startsWith("FW") || hostname.startsWith("WAF")) {
            return "Firewall";
        }
        if (hostname.startsWith("LB") || hostname.startsWith("APP")) {
            return "Load Balancer";
        }
        if (hostname.startsWith("EDGE") || hostname.startsWith("CORE")) {
            return "Proxy";
        }
        return "Switch";
    }

    private boolean isTier1Service(String businessService) {
        if (businessService == null) {
            return false;
        }
        return switch (businessService) {
            case "SEPA Payments", "SWIFT", "Card Processing", "Trading" -> true;
            default -> false;
        };
    }

    private double roundOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private record DeviceSnapshot(
            String lifecycleStage,
            long daysUntilUnsupported,
            String deviceType,
            boolean tier1Service,
            long totalIncidents,
            long criticalIncidents,
            long highOrCriticalIncidents,
            long unresolvedIncidents,
            long openCriticalIncidents,
            long certificateIncidents,
            long driftIncidents,
            long firewallIncidents) {
    }
}
