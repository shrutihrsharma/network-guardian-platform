package com.networkguardian.backend.lifecycle.context;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.util.StringUtils;

import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.lifecycle.model.SoftwareLifecycle;
import com.networkguardian.backend.rag.dto.KnowledgeQuery;
import com.networkguardian.backend.rag.model.KnowledgeDocument;
import com.networkguardian.backend.rag.service.RAGRetrievalService;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.IncidentRepository;
import com.networkguardian.backend.repository.SoftwareLifecycleRepository;

@Component
@SuppressWarnings("null")
public class LifecycleContextBuilder {

    private static final Logger log = LoggerFactory.getLogger(LifecycleContextBuilder.class);

    private final DeviceRepository deviceRepository;
    private final SoftwareLifecycleRepository softwareLifecycleRepository;
    private final IncidentRepository incidentRepository;
    private final RAGRetrievalService ragRetrievalService;

    public LifecycleContextBuilder(
            DeviceRepository deviceRepository,
            SoftwareLifecycleRepository softwareLifecycleRepository,
            IncidentRepository incidentRepository,
            RAGRetrievalService ragRetrievalService) {
        this.deviceRepository = deviceRepository;
        this.softwareLifecycleRepository = softwareLifecycleRepository;
        this.incidentRepository = incidentRepository;
        this.ragRetrievalService = ragRetrievalService;
    }

    public LifecycleContext build(String deviceId) {
        log.info("Building lifecycle context for device {}", deviceId);

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Device not found: " + deviceId));

        if (device.getLifecycleId() == null || device.getLifecycleId().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "No lifecycle entry linked to device: " + deviceId);
        }

        SoftwareLifecycle lifecycle = softwareLifecycleRepository
                .findById(device.getLifecycleId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Lifecycle entry not found: " + device.getLifecycleId()));

        String currentStage = computeCurrentStage(lifecycle);
        long daysUntilUnsupported = computeDaysUntil(lifecycle.getUnsupportedDate());
        long daysUntilDisinvest = computeDaysUntil(lifecycle.getDisinvestDate());

        log.info("Device {} running {} | stage={} | daysUntilUnsupported={}",
                deviceId, device.getOsVersion(), currentStage, daysUntilUnsupported);

        List<Incident> relatedIncidents = incidentRepository.findByDeviceId(deviceId);
        log.info("Found {} related incidents for device {}", relatedIncidents.size(), deviceId);
        List<KnowledgeDocument> enterpriseKnowledge = retrieveKnowledge(device, lifecycle, currentStage);

        return LifecycleContext.builder()
                .device(device)
                .lifecycle(lifecycle)
                .currentStage(currentStage)
                .daysUntilUnsupported(daysUntilUnsupported)
                .daysUntilDisinvest(daysUntilDisinvest)
                .relatedIncidents(relatedIncidents)
            .enterpriseKnowledge(enterpriseKnowledge)
                .decisionTimestamp(LocalDateTime.now())
                .build();
    }

        private List<KnowledgeDocument> retrieveKnowledge(Device device, SoftwareLifecycle lifecycle, String currentStage) {
        try {
            String category = switch (currentStage) {
            case "Unsupported", "Disinvest" -> "Compliance Policy";
            default -> "Vendor Documentation";
            };

            List<String> tags = List.of("lifecycle", currentStage, device.getLifecycleStatus())
                .stream()
                .filter(StringUtils::hasText)
                .toList();

            List<String> keywords = List.of(
                    device.getOsVersion(),
                    lifecycle.getOsVersion(),
                    lifecycle.getRecommendedVersion(),
                    currentStage,
                    "upgrade",
                    "lifecycle")
                .stream()
                .filter(Objects::nonNull)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();

            KnowledgeQuery query = KnowledgeQuery.builder()
                .vendor(device.getVendor())
                .deviceType(device.getFamily())
                .category(category)
                .tags(tags)
                .keywords(keywords)
                .maximumResults(5)
                .build();

            List<KnowledgeDocument> documents = ragRetrievalService.retrieve(query);
            return documents != null ? documents : List.of();
        } catch (Exception ex) {
            log.warn("RAG retrieval failed for lifecycle device {}. Continuing without enterprise knowledge: {}",
                device.getId(), ex.getMessage());
            return List.of();
        }
        }

    public String computeCurrentStage(SoftwareLifecycle lifecycle) {
        LocalDate today = LocalDate.now();
        if (!today.isBefore(LocalDate.parse(lifecycle.getUnsupportedDate()))) return "Unsupported";
        if (!today.isBefore(LocalDate.parse(lifecycle.getDisinvestDate())))   return "Disinvest";
        if (!today.isBefore(LocalDate.parse(lifecycle.getMaintainDate())))    return "Maintain";
        if (!today.isBefore(LocalDate.parse(lifecycle.getInvestDate())))      return "Invest";
        return "Engineering Testing";
    }

    private long computeDaysUntil(String isoDate) {
        return ChronoUnit.DAYS.between(LocalDate.now(), LocalDate.parse(isoDate));
    }
}
