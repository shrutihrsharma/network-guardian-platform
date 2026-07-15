package com.networkguardian.backend.compliance.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.networkguardian.backend.compliance.dto.ComplianceBreakdownItem;
import com.networkguardian.backend.compliance.dto.ComplianceDashboardResponse;
import com.networkguardian.backend.compliance.dto.ComplianceHeatmapCell;
import com.networkguardian.backend.compliance.dto.ComplianceKriFailureItem;
import com.networkguardian.backend.compliance.dto.ComplianceRecalculationResponse;
import com.networkguardian.backend.compliance.dto.ComplianceSummaryCards;
import com.networkguardian.backend.compliance.dto.ComplianceSummaryResponse;
import com.networkguardian.backend.compliance.dto.DeviceComplianceResponse;
import com.networkguardian.backend.compliance.dto.IncidentCompliancePoint;
import com.networkguardian.backend.compliance.dto.LifecycleCompliancePoint;
import com.networkguardian.backend.compliance.model.ComplianceKri;
import com.networkguardian.backend.compliance.model.DeviceCompliance;
import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.lifecycle.context.LifecycleContextBuilder;
import com.networkguardian.backend.lifecycle.model.SoftwareLifecycle;
import com.networkguardian.backend.repository.ComplianceKriRepository;
import com.networkguardian.backend.repository.DeviceComplianceRepository;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.IncidentRepository;
import com.networkguardian.backend.repository.SoftwareLifecycleRepository;

@Service
@SuppressWarnings("null")
public class ComplianceService {

    private final DeviceRepository deviceRepository;
    private final IncidentRepository incidentRepository;
    private final SoftwareLifecycleRepository softwareLifecycleRepository;
    private final ComplianceKriRepository complianceKriRepository;
    private final DeviceComplianceRepository deviceComplianceRepository;
    private final ComplianceCalculationEngine complianceCalculationEngine;
    private final LifecycleContextBuilder lifecycleContextBuilder;

    public ComplianceService(
            DeviceRepository deviceRepository,
            IncidentRepository incidentRepository,
            SoftwareLifecycleRepository softwareLifecycleRepository,
            ComplianceKriRepository complianceKriRepository,
            DeviceComplianceRepository deviceComplianceRepository,
            ComplianceCalculationEngine complianceCalculationEngine,
            LifecycleContextBuilder lifecycleContextBuilder) {
        this.deviceRepository = deviceRepository;
        this.incidentRepository = incidentRepository;
        this.softwareLifecycleRepository = softwareLifecycleRepository;
        this.complianceKriRepository = complianceKriRepository;
        this.deviceComplianceRepository = deviceComplianceRepository;
        this.complianceCalculationEngine = complianceCalculationEngine;
        this.lifecycleContextBuilder = lifecycleContextBuilder;
    }

    public List<ComplianceKri> getKris() {
        return complianceKriRepository.findAllByOrderByCategoryAscNameAsc();
    }

    public Optional<DeviceComplianceResponse> getDeviceCompliance(String deviceId) {
        ensureComplianceData();

        Map<String, Device> deviceById = deviceRepository.findAll().stream()
                .collect(Collectors.toMap(Device::getId, Function.identity()));

        Map<String, SoftwareLifecycle> lifecycleById = softwareLifecycleRepository.findAll().stream()
                .collect(Collectors.toMap(SoftwareLifecycle::getId, Function.identity()));

        Map<String, Long> incidentCountByDevice = incidentRepository.findAll().stream()
                .collect(Collectors.groupingBy(Incident::getDeviceId, Collectors.counting()));

        return deviceComplianceRepository.findById(deviceId)
                .map(compliance -> toDeviceResponse(
                        compliance,
                        deviceById.get(deviceId),
                        resolveLifecycle(deviceById.get(deviceId), lifecycleById),
                        incidentCountByDevice.getOrDefault(deviceId, 0L)));
    }

    public ComplianceSummaryResponse getSummary() {
        ensureComplianceData();
        List<DeviceCompliance> all = deviceComplianceRepository.findAll();

        long total = all.size();
        long compliant = all.stream().filter(c -> c.getOverallCompliance() >= 85).count();
        long medium = all.stream().filter(c -> "Medium".equals(c.getRiskLevel())).count();
        long high = all.stream().filter(c -> "High".equals(c.getRiskLevel())).count();
        long critical = all.stream().filter(c -> "Critical".equals(c.getRiskLevel())).count();

        double average = roundOneDecimal(all.stream()
                .mapToDouble(DeviceCompliance::getOverallCompliance)
                .average()
                .orElse(0));

        LocalDateTime lastCalculated = all.stream()
                .map(DeviceCompliance::getLastCalculated)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(null);

        return ComplianceSummaryResponse.builder()
                .totalDevices(total)
                .compliantDevices(compliant)
                .mediumRiskDevices(medium)
                .highRiskDevices(high)
                .criticalRiskDevices(critical)
                .averageCompliance(average)
                .totalActiveKRIs(complianceKriRepository.findByEnabledTrueAndApprovedTrue().size())
                .lastCalculated(lastCalculated)
                .build();
    }

    public ComplianceDashboardResponse getDashboard() {
        ensureComplianceData();

        List<DeviceCompliance> allCompliance = deviceComplianceRepository.findAll();
        List<Device> allDevices = deviceRepository.findAll();

        Map<String, Device> deviceById = allDevices.stream()
                .collect(Collectors.toMap(Device::getId, Function.identity()));

        Map<String, SoftwareLifecycle> lifecycleById = softwareLifecycleRepository.findAll().stream()
                .collect(Collectors.toMap(SoftwareLifecycle::getId, Function.identity()));

        Map<String, Long> incidentCountByDevice = incidentRepository.findAll().stream()
                .collect(Collectors.groupingBy(Incident::getDeviceId, Collectors.counting()));

        ComplianceSummaryCards summaryCards = buildSummaryCards(allCompliance);

        return ComplianceDashboardResponse.builder()
                .summaryCards(summaryCards)
                .vendorCompliance(buildBreakdown(allCompliance, deviceById, Device::getVendor))
                .regionCompliance(buildBreakdown(allCompliance, deviceById, d -> deriveRegion(d.getHostname())))
                .deviceTypeCompliance(buildBreakdown(allCompliance, deviceById, d -> deriveDeviceType(d.getHostname())))
                .topFailedKRIs(buildTopFailedKris(allCompliance))
                .complianceHeatmap(buildHeatmap(allCompliance, deviceById))
                .lifecycleVsCompliance(buildLifecycleVsCompliance(allCompliance, deviceById, lifecycleById))
                .incidentVsCompliance(buildIncidentVsCompliance(allCompliance, incidentCountByDevice))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    public ComplianceRecalculationResponse recalculateAll() {
        List<ComplianceKri> activeKris = complianceKriRepository.findByEnabledTrueAndApprovedTrue();
        List<Device> devices = deviceRepository.findAll();

        Map<String, SoftwareLifecycle> lifecycleById = softwareLifecycleRepository.findAll().stream()
                .collect(Collectors.toMap(SoftwareLifecycle::getId, Function.identity()));

        Map<String, List<Incident>> incidentsByDevice = incidentRepository.findAll().stream()
                .collect(Collectors.groupingBy(Incident::getDeviceId));

        List<DeviceCompliance> recalculated = devices.stream()
                .map(device -> complianceCalculationEngine.calculate(
                        device,
                        resolveLifecycle(device, lifecycleById),
                        incidentsByDevice.getOrDefault(device.getId(), List.of()),
                        activeKris))
                .toList();

        deviceComplianceRepository.deleteAll();
        deviceComplianceRepository.saveAll(recalculated);

        double average = roundOneDecimal(recalculated.stream()
                .mapToDouble(DeviceCompliance::getOverallCompliance)
                .average()
                .orElse(0));

        return ComplianceRecalculationResponse.builder()
                .devicesProcessed(recalculated.size())
                .averageCompliance(average)
                .recalculatedAt(LocalDateTime.now())
                .build();
    }

    private void ensureComplianceData() {
        long devices = deviceRepository.count();
        if (devices == 0) {
            return;
        }
        if (deviceComplianceRepository.count() != devices) {
            recalculateAll();
        }
    }

    private ComplianceSummaryCards buildSummaryCards(List<DeviceCompliance> allCompliance) {
        long totalDevices = allCompliance.size();
        long compliantDevices = allCompliance.stream().filter(c -> c.getOverallCompliance() >= 85).count();
        long atRiskDevices = allCompliance.stream()
                .filter(c -> "High".equals(c.getRiskLevel()) || "Critical".equals(c.getRiskLevel()))
                .count();
        long criticalRiskDevices = allCompliance.stream().filter(c -> "Critical".equals(c.getRiskLevel())).count();

        double averageCompliance = roundOneDecimal(allCompliance.stream()
                .mapToDouble(DeviceCompliance::getOverallCompliance)
                .average()
                .orElse(0));

        long failedKriObservations = allCompliance.stream()
                .map(DeviceCompliance::getFailedKRIs)
                .filter(Objects::nonNull)
                .mapToLong(List::size)
                .sum();

        return ComplianceSummaryCards.builder()
                .totalDevices(totalDevices)
                .compliantDevices(compliantDevices)
                .atRiskDevices(atRiskDevices)
                .criticalRiskDevices(criticalRiskDevices)
                .averageCompliance(averageCompliance)
                .failedKriObservations(failedKriObservations)
                .build();
    }

    private List<ComplianceBreakdownItem> buildBreakdown(
            List<DeviceCompliance> compliance,
            Map<String, Device> deviceById,
            Function<Device, String> dimensionResolver) {

        Map<String, List<DeviceCompliance>> byDimension = compliance.stream()
                .collect(Collectors.groupingBy(item -> {
                    Device device = deviceById.get(item.getDeviceId());
                    if (device == null) {
                        return "Unknown";
                    }
                    String dimension = dimensionResolver.apply(device);
                    return dimension == null || dimension.isBlank() ? "Unknown" : dimension;
                }));

        return byDimension.entrySet().stream()
                .map(entry -> ComplianceBreakdownItem.builder()
                        .name(entry.getKey())
                        .deviceCount(entry.getValue().size())
                        .highRiskDevices(entry.getValue().stream()
                                .filter(c -> "High".equals(c.getRiskLevel()) || "Critical".equals(c.getRiskLevel()))
                                .count())
                        .averageCompliance(roundOneDecimal(entry.getValue().stream()
                                .mapToDouble(DeviceCompliance::getOverallCompliance)
                                .average()
                                .orElse(0)))
                        .build())
                .sorted(Comparator.comparing(ComplianceBreakdownItem::getAverageCompliance).reversed())
                .toList();
    }

    private List<ComplianceKriFailureItem> buildTopFailedKris(List<DeviceCompliance> allCompliance) {
        Map<String, ComplianceKri> kriByName = complianceKriRepository.findAll().stream()
                .collect(Collectors.toMap(ComplianceKri::getName, Function.identity(), (left, right) -> left));

        Map<String, Long> failuresByKriName = allCompliance.stream()
                .map(DeviceCompliance::getFailedKRIs)
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        return failuresByKriName.entrySet().stream()
                .map(entry -> {
                    ComplianceKri kri = kriByName.get(entry.getKey());
                    return ComplianceKriFailureItem.builder()
                            .kriId(kri != null ? kri.getId() : "UNKNOWN")
                            .kriName(entry.getKey())
                            .severity(kri != null ? kri.getSeverity() : "Medium")
                            .failedDevices(entry.getValue())
                            .build();
                })
                .sorted(Comparator.comparing(ComplianceKriFailureItem::getFailedDevices).reversed())
                .limit(10)
                .toList();
    }

    private List<ComplianceHeatmapCell> buildHeatmap(
            List<DeviceCompliance> allCompliance,
            Map<String, Device> deviceById) {

        Map<String, List<DeviceCompliance>> grouped = allCompliance.stream()
                .collect(Collectors.groupingBy(item -> {
                    Device device = deviceById.get(item.getDeviceId());
                    String region = device == null ? "Unknown" : deriveRegion(device.getHostname());
                    return region + "|" + item.getRiskLevel();
                }));

        return grouped.entrySet().stream()
                .map(entry -> {
                    String[] key = entry.getKey().split("\\|");
                    return ComplianceHeatmapCell.builder()
                            .region(key[0])
                            .riskLevel(key.length > 1 ? key[1] : "Unknown")
                            .deviceCount(entry.getValue().size())
                            .averageCompliance(roundOneDecimal(entry.getValue().stream()
                                    .mapToDouble(DeviceCompliance::getOverallCompliance)
                                    .average()
                                    .orElse(0)))
                            .build();
                })
                .sorted(Comparator.comparing(ComplianceHeatmapCell::getRegion)
                        .thenComparing(ComplianceHeatmapCell::getRiskLevel))
                .toList();
    }

    private List<LifecycleCompliancePoint> buildLifecycleVsCompliance(
            List<DeviceCompliance> allCompliance,
            Map<String, Device> deviceById,
            Map<String, SoftwareLifecycle> lifecycleById) {

        Map<String, List<DeviceCompliance>> byStage = allCompliance.stream()
                .collect(Collectors.groupingBy(item -> {
                    Device device = deviceById.get(item.getDeviceId());
                    SoftwareLifecycle lifecycle = resolveLifecycle(device, lifecycleById);
                    return lifecycle == null ? "Unknown" : lifecycleContextBuilder.computeCurrentStage(lifecycle);
                }));

        return byStage.entrySet().stream()
                .map(entry -> LifecycleCompliancePoint.builder()
                        .lifecycleStage(entry.getKey())
                        .deviceCount(entry.getValue().size())
                        .averageCompliance(roundOneDecimal(entry.getValue().stream()
                                .mapToDouble(DeviceCompliance::getOverallCompliance)
                                .average()
                                .orElse(0)))
                        .build())
                .sorted(Comparator.comparing(LifecycleCompliancePoint::getAverageCompliance).reversed())
                .toList();
    }

    private List<IncidentCompliancePoint> buildIncidentVsCompliance(
            List<DeviceCompliance> allCompliance,
            Map<String, Long> incidentCountByDevice) {

        Map<String, List<DeviceCompliance>> byBand = allCompliance.stream()
                .collect(Collectors.groupingBy(item -> toIncidentBand(
                        incidentCountByDevice.getOrDefault(item.getDeviceId(), 0L))));

        return byBand.entrySet().stream()
                .map(entry -> IncidentCompliancePoint.builder()
                        .incidentBand(entry.getKey())
                        .deviceCount(entry.getValue().size())
                        .averageCompliance(roundOneDecimal(entry.getValue().stream()
                                .mapToDouble(DeviceCompliance::getOverallCompliance)
                                .average()
                                .orElse(0)))
                        .build())
                .sorted(Comparator.comparing(IncidentCompliancePoint::getIncidentBand))
                .toList();
    }

    private DeviceComplianceResponse toDeviceResponse(
            DeviceCompliance compliance,
            Device device,
            SoftwareLifecycle lifecycle,
            long incidentCount) {

        return DeviceComplianceResponse.builder()
                .deviceId(compliance.getDeviceId())
                .hostname(device != null ? device.getHostname() : compliance.getDeviceId())
                .vendor(device != null ? device.getVendor() : "Unknown")
                .region(device != null ? deriveRegion(device.getHostname()) : "Unknown")
                .deviceType(device != null ? deriveDeviceType(device.getHostname()) : "Unknown")
                .lifecycleStage(lifecycle != null ? lifecycleContextBuilder.computeCurrentStage(lifecycle) : "Unknown")
                .incidentCount(incidentCount)
                .overallCompliance(compliance.getOverallCompliance())
                .riskLevel(compliance.getRiskLevel())
                .passedKRIs(compliance.getPassedKRIs())
                .failedKRIs(compliance.getFailedKRIs())
                .lastCalculated(compliance.getLastCalculated())
                .build();
    }

    private SoftwareLifecycle resolveLifecycle(Device device, Map<String, SoftwareLifecycle> lifecycleById) {
        if (device == null || device.getLifecycleId() == null || device.getLifecycleId().isBlank()) {
            return null;
        }
        return lifecycleById.get(device.getLifecycleId());
    }

    private String toIncidentBand(long incidentCount) {
        if (incidentCount <= 0) {
            return "0";
        }
        if (incidentCount == 1) {
            return "1";
        }
        return "2+";
    }

    private String deriveRegion(String hostname) {
        if (hostname == null) {
            return "EMEA";
        }
        String normalized = hostname.toUpperCase(Locale.ROOT);
        if (normalized.contains("-LON-") || normalized.contains("-FRA-") || normalized.contains("-DUB-")) {
            return "EMEA";
        }
        if (normalized.contains("-SIN-") || normalized.contains("-TOK-") || normalized.contains("-SYD-")
                || normalized.contains("-HKG-") || normalized.contains("-MUM-")) {
            return "APAC";
        }
        return "AMER";
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

    private double roundOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
