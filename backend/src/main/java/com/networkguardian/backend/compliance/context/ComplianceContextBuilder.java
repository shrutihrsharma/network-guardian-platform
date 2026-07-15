package com.networkguardian.backend.compliance.context;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.networkguardian.backend.compliance.dto.ComplianceDashboardResponse;
import com.networkguardian.backend.compliance.dto.ComplianceSummaryResponse;
import com.networkguardian.backend.compliance.dto.DeviceComplianceResponse;
import com.networkguardian.backend.compliance.model.ComplianceKri;
import com.networkguardian.backend.compliance.service.ComplianceService;
import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.repository.ComplianceKriRepository;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.IncidentRepository;
import com.networkguardian.backend.repository.SoftwareLifecycleRepository;

@Component
@SuppressWarnings("null")
public class ComplianceContextBuilder {

    private final ComplianceService complianceService;
    private final ComplianceKriRepository complianceKriRepository;
    private final DeviceRepository deviceRepository;
    private final IncidentRepository incidentRepository;
    private final SoftwareLifecycleRepository softwareLifecycleRepository;
    private final List<ComplianceKnowledgeProvider> knowledgeProviders;

    public ComplianceContextBuilder(
            ComplianceService complianceService,
            ComplianceKriRepository complianceKriRepository,
            DeviceRepository deviceRepository,
            IncidentRepository incidentRepository,
            SoftwareLifecycleRepository softwareLifecycleRepository,
            List<ComplianceKnowledgeProvider> knowledgeProviders) {
        this.complianceService = complianceService;
        this.complianceKriRepository = complianceKriRepository;
        this.deviceRepository = deviceRepository;
        this.incidentRepository = incidentRepository;
        this.softwareLifecycleRepository = softwareLifecycleRepository;
        this.knowledgeProviders = knowledgeProviders;
    }

    public ComplianceContext build(String deviceId) {
        ComplianceSummaryResponse summary = complianceService.getSummary();
        ComplianceDashboardResponse dashboard = complianceService.getDashboard();

        Optional<DeviceComplianceResponse> targetDevice = Optional.empty();
        if (deviceId != null && !deviceId.isBlank()) {
            targetDevice = complianceService.getDeviceCompliance(deviceId);
        }

        List<ComplianceKri> activeKris = complianceKriRepository.findByEnabledTrueAndApprovedTrue();

        List<DeviceComplianceResponse> criticalDevices = deviceRepository.findAll().stream()
                .map(device -> complianceService.getDeviceCompliance(device.getId()).orElse(null))
                .filter(Objects::nonNull)
                .filter(item -> "Critical".equals(item.getRiskLevel()) || "High".equals(item.getRiskLevel()))
                .sorted(Comparator.comparing(DeviceComplianceResponse::getOverallCompliance))
                .limit(12)
                .toList();

        Map<String, Device> devicesById = deviceRepository.findAll().stream()
                .collect(Collectors.toMap(Device::getId, Function.identity()));

        List<String> criticalBusinessServices = criticalDevices.stream()
                .map(item -> devicesById.get(item.getDeviceId()))
                .filter(Objects::nonNull)
                .map(Device::getBusinessService)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();

        Map<String, List<Incident>> incidentsByDevice = incidentRepository.findAll().stream()
                .collect(Collectors.groupingBy(Incident::getDeviceId));

        String lifecycleSummary = buildLifecycleSummary();
        String incidentSummary = buildIncidentSummary(incidentsByDevice);

        ComplianceKnowledge knowledge = resolveKnowledge(targetDevice.orElse(null), devicesById);

        return ComplianceContext.builder()
                .summary(summary)
                .lifecycleSummary(lifecycleSummary)
                .incidentSummary(incidentSummary)
                .topFailedKris(dashboard.getTopFailedKRIs() == null
                        ? List.of()
                        : dashboard.getTopFailedKRIs().stream()
                                .map(item -> "%s (%d failures)".formatted(item.getKriName(), item.getFailedDevices()))
                                .toList())
                .criticalDevices(criticalDevices)
                .criticalBusinessServices(criticalBusinessServices)
                .activeKris(activeKris)
                .targetDevice(targetDevice.orElse(null))
                .knowledge(knowledge)
                .decisionTimestamp(LocalDateTime.now())
                .build();
    }

    private String buildLifecycleSummary() {
        long totalEntries = softwareLifecycleRepository.count();
        long unsupported = softwareLifecycleRepository.findAll().stream()
                .filter(item -> item.getUnsupportedDate() != null)
                .count();

        return "Lifecycle entries=%d, entriesWithUnsupportedDate=%d".formatted(totalEntries, unsupported);
    }

    private String buildIncidentSummary(Map<String, List<Incident>> incidentsByDevice) {
        long totalIncidents = incidentsByDevice.values().stream().mapToLong(List::size).sum();
        long impactedDevices = incidentsByDevice.size();

        long criticalOpen = incidentsByDevice.values().stream()
                .flatMap(List::stream)
                .filter(i -> "Critical".equalsIgnoreCase(i.getSeverity()))
                .filter(i -> i.getStatus() != null && !"RESOLVED".equalsIgnoreCase(i.getStatus()))
                .count();

        return "Incidents=%d, impactedDevices=%d, openCritical=%d".formatted(totalIncidents, impactedDevices, criticalOpen);
    }

        private ComplianceKnowledge resolveKnowledge(
                        DeviceComplianceResponse targetDevice,
                        Map<String, Device> devicesById) {

                String businessService = null;
                if (targetDevice != null) {
                        Device rawDevice = devicesById.get(targetDevice.getDeviceId());
                        businessService = rawDevice != null ? rawDevice.getBusinessService() : null;
                }

        ComplianceKnowledgeRequest request = ComplianceKnowledgeRequest.builder()
                .vendor(targetDevice != null ? targetDevice.getVendor() : null)
                                .businessService(businessService)
                .deviceType(targetDevice != null ? targetDevice.getDeviceType() : null)
                .build();

        if (knowledgeProviders == null || knowledgeProviders.isEmpty()) {
            return ComplianceKnowledge.builder()
                    .knowledgeArticles(List.of())
                    .vendorBestPractices(List.of())
                    .compliancePolicies(List.of())
                    .historicalRca(List.of())
                    .build();
        }

        List<ComplianceKnowledge> contributions = knowledgeProviders.stream()
                .map(provider -> provider.provide(request))
                .filter(Objects::nonNull)
                .toList();

        return ComplianceKnowledge.builder()
                .knowledgeArticles(mergeKnowledgeList(contributions, ComplianceKnowledge::getKnowledgeArticles))
                .vendorBestPractices(mergeKnowledgeList(contributions, ComplianceKnowledge::getVendorBestPractices))
                .compliancePolicies(mergeKnowledgeList(contributions, ComplianceKnowledge::getCompliancePolicies))
                .historicalRca(mergeKnowledgeList(contributions, ComplianceKnowledge::getHistoricalRca))
                .build();
    }

    private List<String> mergeKnowledgeList(
            List<ComplianceKnowledge> contributions,
            Function<ComplianceKnowledge, List<String>> extractor) {
        return contributions.stream()
                .map(extractor)
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .toList();
    }
}
