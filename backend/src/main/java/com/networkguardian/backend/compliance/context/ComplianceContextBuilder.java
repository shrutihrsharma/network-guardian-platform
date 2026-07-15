package com.networkguardian.backend.compliance.context;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.networkguardian.backend.compliance.dto.ComplianceDashboardResponse;
import com.networkguardian.backend.compliance.dto.ComplianceSummaryResponse;
import com.networkguardian.backend.compliance.dto.DeviceComplianceResponse;
import com.networkguardian.backend.compliance.model.ComplianceKri;
import com.networkguardian.backend.compliance.service.ComplianceService;
import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.rag.dto.KnowledgeQuery;
import com.networkguardian.backend.rag.model.KnowledgeDocument;
import com.networkguardian.backend.rag.service.RAGRetrievalService;
import com.networkguardian.backend.repository.ComplianceKriRepository;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.IncidentRepository;
import com.networkguardian.backend.repository.SoftwareLifecycleRepository;

@Component
@SuppressWarnings("null")
public class ComplianceContextBuilder {

        private static final Logger log = LoggerFactory.getLogger(ComplianceContextBuilder.class);

    private final ComplianceService complianceService;
    private final ComplianceKriRepository complianceKriRepository;
    private final DeviceRepository deviceRepository;
    private final IncidentRepository incidentRepository;
    private final SoftwareLifecycleRepository softwareLifecycleRepository;
    private final List<ComplianceKnowledgeProvider> knowledgeProviders;
        private final RAGRetrievalService ragRetrievalService;

    public ComplianceContextBuilder(
            ComplianceService complianceService,
            ComplianceKriRepository complianceKriRepository,
            DeviceRepository deviceRepository,
            IncidentRepository incidentRepository,
            SoftwareLifecycleRepository softwareLifecycleRepository,
                        List<ComplianceKnowledgeProvider> knowledgeProviders,
                        RAGRetrievalService ragRetrievalService) {
        this.complianceService = complianceService;
        this.complianceKriRepository = complianceKriRepository;
        this.deviceRepository = deviceRepository;
        this.incidentRepository = incidentRepository;
        this.softwareLifecycleRepository = softwareLifecycleRepository;
        this.knowledgeProviders = knowledgeProviders;
                this.ragRetrievalService = ragRetrievalService;
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
        String businessService = resolveBusinessService(targetDevice.orElse(null), devicesById);

        ComplianceKnowledge knowledge = resolveKnowledge(targetDevice.orElse(null), devicesById);
        List<KnowledgeDocument> enterpriseKnowledge = retrieveKnowledge(targetDevice.orElse(null), businessService, dashboard);

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
                .enterpriseKnowledge(enterpriseKnowledge)
                .decisionTimestamp(LocalDateTime.now())
                .build();
    }

        private String resolveBusinessService(
                        DeviceComplianceResponse targetDevice,
                        Map<String, Device> devicesById) {
                if (targetDevice == null) {
                        return null;
                }
                Device rawDevice = devicesById.get(targetDevice.getDeviceId());
                return rawDevice != null ? rawDevice.getBusinessService() : null;
        }

    private List<KnowledgeDocument> retrieveKnowledge(
            DeviceComplianceResponse targetDevice,
            String businessService,
            ComplianceDashboardResponse dashboard) {
        try {
            List<String> tags = java.util.stream.Stream.of(
                            List.of("compliance"),
                            targetDevice != null && StringUtils.hasText(targetDevice.getLifecycleStage())
                                    ? List.of(targetDevice.getLifecycleStage())
                                    : List.<String>of())
                    .flatMap(List::stream)
                    .filter(StringUtils::hasText)
                    .toList();

            List<String> failedKriKeywords = dashboard.getTopFailedKRIs() == null
                    ? List.of()
                    : dashboard.getTopFailedKRIs().stream()
                            .map(item -> item.getKriName())
                            .filter(StringUtils::hasText)
                            .toList();

            List<String> keywords = java.util.stream.Stream.of(
                            failedKriKeywords,
                            List.of(
                                    businessService,
                                    targetDevice != null ? targetDevice.getLifecycleStage() : null,
                                    targetDevice != null ? targetDevice.getRiskLevel() : null,
                                    "compliance",
                                    "policy"))
                    .flatMap(List::stream)
                    .filter(Objects::nonNull)
                    .filter(StringUtils::hasText)
                    .distinct()
                    .toList();

            KnowledgeQuery query = KnowledgeQuery.builder()
                    .vendor(targetDevice != null ? targetDevice.getVendor() : null)
                    .deviceType(targetDevice != null ? targetDevice.getDeviceType() : null)
                    .category("Compliance Policy")
                    .tags(tags)
                    .keywords(keywords)
                    .maximumResults(5)
                    .build();

            List<KnowledgeDocument> documents = ragRetrievalService.retrieve(query);
            return documents != null ? documents : List.of();
        } catch (Exception ex) {
            log.warn("RAG retrieval failed for compliance context. Continuing without enterprise knowledge: {}",
                    ex.getMessage());
            return List.of();
        }
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
