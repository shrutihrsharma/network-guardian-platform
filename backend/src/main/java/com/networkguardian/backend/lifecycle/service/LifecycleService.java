package com.networkguardian.backend.lifecycle.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.lifecycle.context.LifecycleContextBuilder;
import com.networkguardian.backend.lifecycle.dto.DeviceLifecycleSummary;
import com.networkguardian.backend.lifecycle.dto.LifecycleDashboardResponse;
import com.networkguardian.backend.lifecycle.dto.VendorSummary;
import com.networkguardian.backend.lifecycle.model.SoftwareLifecycle;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.SoftwareLifecycleRepository;

@Service
@SuppressWarnings("null")
public class LifecycleService {

    private final DeviceRepository deviceRepository;
    private final SoftwareLifecycleRepository softwareLifecycleRepository;
    private final LifecycleContextBuilder contextBuilder;

    public LifecycleService(
            DeviceRepository deviceRepository,
            SoftwareLifecycleRepository softwareLifecycleRepository,
            LifecycleContextBuilder contextBuilder) {
        this.deviceRepository = deviceRepository;
        this.softwareLifecycleRepository = softwareLifecycleRepository;
        this.contextBuilder = contextBuilder;
    }

    public List<DeviceLifecycleSummary> getAll() {
        Map<String, SoftwareLifecycle> lifecycleById = softwareLifecycleRepository.findAll()
                .stream()
                .collect(Collectors.toMap(SoftwareLifecycle::getId, lc -> lc));

        return deviceRepository.findAll().stream()
                .filter(d -> d.getLifecycleId() != null && !d.getLifecycleId().isBlank())
                .map(device -> {
                    SoftwareLifecycle lc = lifecycleById.get(device.getLifecycleId());
                    return lc != null ? buildSummary(device, lc) : null;
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingLong(DeviceLifecycleSummary::getDaysUntilUnsupported))
                .collect(Collectors.toList());
    }

    public Optional<DeviceLifecycleSummary> getForDevice(String deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Device not found: " + deviceId));

        if (device.getLifecycleId() == null || device.getLifecycleId().isBlank()) {
            return Optional.empty();
        }

        return softwareLifecycleRepository.findById(device.getLifecycleId())
                .map(lc -> buildSummary(device, lc));
    }

    public List<String> getVendors() {
        return softwareLifecycleRepository.findAll().stream()
                .map(SoftwareLifecycle::getVendor)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<SoftwareLifecycle> getTimeline() {
        return softwareLifecycleRepository.findAll().stream()
                .sorted(Comparator.comparing(SoftwareLifecycle::getVendor)
                        .thenComparing(SoftwareLifecycle::getOsVersion))
                .collect(Collectors.toList());
    }

    public LifecycleDashboardResponse getDashboard() {
        List<DeviceLifecycleSummary> all = getAll();

        long total           = all.size();
        long unsupported     = count(all, "Unsupported");
        long disinvest       = count(all, "Disinvest");
        long maintain        = count(all, "Maintain");
        long invest          = count(all, "Invest");
        long engineeringTest = count(all, "Engineering Testing");
        long upcoming90      = all.stream()
                .filter(s -> s.getDaysUntilUnsupported() >= 0 && s.getDaysUntilUnsupported() <= 90)
                .count();

        double avgRisk = computeAverageRisk(all);

        Map<String, List<DeviceLifecycleSummary>> byVendor = all.stream()
                .collect(Collectors.groupingBy(DeviceLifecycleSummary::getVendor));

        List<VendorSummary> vendorSummaries = byVendor.entrySet().stream()
                .map(e -> VendorSummary.builder()
                        .vendor(e.getKey())
                        .unsupported(count(e.getValue(), "Unsupported"))
                        .disinvest(count(e.getValue(), "Disinvest"))
                        .maintain(count(e.getValue(), "Maintain"))
                        .invest(count(e.getValue(), "Invest"))
                        .engineeringTesting(count(e.getValue(), "Engineering Testing"))
                        .build())
                .sorted(Comparator.comparing(VendorSummary::getVendor))
                .collect(Collectors.toList());

        List<DeviceLifecycleSummary> critical = all.stream()
                .filter(s -> "Unsupported".equals(s.getLifecycleStage())
                        || "Disinvest".equals(s.getLifecycleStage())
                        || s.getDaysUntilUnsupported() <= 180)
                .sorted(Comparator.comparingLong(DeviceLifecycleSummary::getDaysUntilUnsupported))
                .limit(15)
                .collect(Collectors.toList());

        return LifecycleDashboardResponse.builder()
                .totalDevices(total)
                .unsupportedDevices(unsupported)
                .disinvestDevices(disinvest)
                .maintainDevices(maintain)
                .investDevices(invest)
                .engineeringTestingDevices(engineeringTest)
                .upcomingEol90Days(upcoming90)
                .averageUpgradeRisk(avgRisk)
                .vendorSummary(vendorSummaries)
                .criticalDevices(critical)
                .build();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    DeviceLifecycleSummary buildSummary(Device device, SoftwareLifecycle lc) {
        String stage = contextBuilder.computeCurrentStage(lc);
        long days = ChronoUnit.DAYS.between(LocalDate.now(), LocalDate.parse(lc.getUnsupportedDate()));

        return DeviceLifecycleSummary.builder()
                .deviceId(device.getId())
                .hostname(device.getHostname())
                .vendor(device.getVendor())
                .family(lc.getDeviceFamily())
                .model(device.getModel())
                .region(deriveRegion(device.getHostname()))
                .businessService(device.getBusinessService())
                .criticality(deriveCriticality(device.getBusinessService()))
                .osVersion(device.getOsVersion())
                .recommendedVersion(lc.getRecommendedVersion())
                .lifecycleStage(stage)
                .daysUntilUnsupported(days)
                .engineeringTestingDate(lc.getEngineeringTestingDate())
                .investDate(lc.getInvestDate())
                .maintainDate(lc.getMaintainDate())
                .disinvestDate(lc.getDisinvestDate())
                .unsupportedDate(lc.getUnsupportedDate())
                .notes(lc.getNotes())
                .build();
    }

    private long count(List<DeviceLifecycleSummary> list, String stage) {
        return list.stream().filter(s -> stage.equals(s.getLifecycleStage())).count();
    }

    private double computeAverageRisk(List<DeviceLifecycleSummary> all) {
        if (all.isEmpty()) return 0;
        return all.stream()
                .mapToDouble(s -> switch (s.getLifecycleStage()) {
                    case "Unsupported"         -> 100;
                    case "Disinvest"           -> 72;
                    case "Maintain"            -> 35;
                    case "Invest"              -> 12;
                    default                    -> 5;
                })
                .average()
                .orElse(0);
    }

    private String deriveRegion(String hostname) {
        if (hostname == null) return "EMEA";
        String h = hostname.toUpperCase(Locale.ROOT);
        if (h.contains("-LON-") || h.contains("-FRA-") || h.contains("-DUB-")) return "EMEA";
        if (h.contains("-SIN-") || h.contains("-TOK-") || h.contains("-SYD-")
                || h.contains("-HKG-") || h.contains("-MUM-"))               return "APAC";
        return "AMER";
    }

    private String deriveCriticality(String businessService) {
        if (businessService == null) return "Tier 3";
        return switch (businessService) {
            case "SEPA Payments", "SWIFT", "Card Processing", "Trading"       -> "Tier 1";
            case "Identity Platform", "Retail Banking", "Mobile Banking"      -> "Tier 2";
            default                                                            -> "Tier 3";
        };
    }
}
