package com.networkguardian.backend.incident.context;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.util.StringUtils;

import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.HistoricalIncident;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.incident.model.Runbook;
import com.networkguardian.backend.rag.dto.KnowledgeQuery;
import com.networkguardian.backend.rag.model.KnowledgeDocument;
import com.networkguardian.backend.rag.service.RAGRetrievalService;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.HistoricalIncidentRepository;
import com.networkguardian.backend.repository.IncidentRepository;
import com.networkguardian.backend.repository.RunbookRepository;

@Component
@SuppressWarnings("null")
public class IncidentContextBuilder {

    private static final Logger log = LoggerFactory.getLogger(IncidentContextBuilder.class);

    private final IncidentRepository incidentRepository;
    private final DeviceRepository deviceRepository;
    private final RunbookRepository runbookRepository;
    private final HistoricalIncidentRepository historicalIncidentRepository;
    private final RAGRetrievalService ragRetrievalService;

    public IncidentContextBuilder(
            IncidentRepository incidentRepository,
            DeviceRepository deviceRepository,
            RunbookRepository runbookRepository,
            HistoricalIncidentRepository historicalIncidentRepository,
            RAGRetrievalService ragRetrievalService) {
        this.incidentRepository = incidentRepository;
        this.deviceRepository = deviceRepository;
        this.runbookRepository = runbookRepository;
        this.historicalIncidentRepository = historicalIncidentRepository;
        this.ragRetrievalService = ragRetrievalService;
    }

    public IncidentContext build(String incidentId) {
        log.info("Loading incident {}", incidentId);
        Incident incident = incidentRepository.findById(incidentId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Incident not found: " + incidentId));

        log.info("Loading associated device {}", incident.getDeviceId());
        Device device = deviceRepository.findById(incident.getDeviceId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Device not found for incident " + incidentId + ": " + incident.getDeviceId()));

        Runbook runbook = resolveRunbook(incident);
        log.info("Loading historical incidents for {}", incidentId);
        List<HistoricalIncident> historicalIncidents = historicalIncidentRepository.findByIncidentId(incidentId);
        log.info("Loading {} historical incidents", historicalIncidents.size());
        List<KnowledgeDocument> enterpriseKnowledge = retrieveKnowledge(incident, device, runbook);

        return IncidentContext.builder()
                .device(device)
                .incident(incident)
                .runbook(runbook)
                .historicalIncidents(historicalIncidents)
                .businessService(device.getBusinessService())
                .lifecycleStatus(device.getLifecycleStatus())
            .enterpriseKnowledge(enterpriseKnowledge)
                .decisionTimestamp(LocalDateTime.now())
                .build();
    }

        private List<KnowledgeDocument> retrieveKnowledge(Incident incident, Device device, Runbook runbook) {
        try {
            String deviceType = StringUtils.hasText(device.getFamily()) ? device.getFamily() : device.getModel();
            List<String> tags = List.of("incident", incident.getSeverity(), incident.getStatus(), device.getLifecycleStatus())
                .stream()
                .filter(StringUtils::hasText)
                .toList();

            List<String> symptomKeywords = incident.getSymptoms() == null ? List.<String>of() : incident.getSymptoms();
            List<String> keywords = java.util.stream.Stream.of(
                    symptomKeywords,
                    List.of(device.getOsVersion(), runbook.getTitle(), device.getBusinessService(), "incident"))
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();

            KnowledgeQuery query = KnowledgeQuery.builder()
                .vendor(device.getVendor())
                .deviceType(deviceType)
                .category("Runbook")
                .tags(tags)
                .keywords(keywords)
                .maximumResults(5)
                .build();

            List<KnowledgeDocument> documents = ragRetrievalService.retrieve(query);
            return documents != null ? documents : List.of();
        } catch (Exception ex) {
            log.warn("RAG retrieval failed for incident {}. Continuing without enterprise knowledge: {}",
                incident.getId(), ex.getMessage());
            return List.of();
        }
        }

    private Runbook resolveRunbook(Incident incident) {
        if (incident.getRunbookId() == null || incident.getRunbookId().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Runbook missing for incident: " + incident.getId());
        }

        log.info("Loading runbook {}", incident.getRunbookId());
        return runbookRepository.findById(incident.getRunbookId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Runbook not found: " + incident.getRunbookId()));
    }
}