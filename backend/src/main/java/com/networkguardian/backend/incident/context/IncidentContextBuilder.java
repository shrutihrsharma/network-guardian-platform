package com.networkguardian.backend.incident.context;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.HistoricalIncident;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.incident.model.Runbook;
import com.networkguardian.backend.incident.rag.IncidentRAGService;
import com.networkguardian.backend.knowledge.KnowledgeRAGService;
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
    private final IncidentRAGService ragService;
    private final KnowledgeRAGService knowledgeRAGService;

    public IncidentContextBuilder(
            IncidentRepository incidentRepository,
            DeviceRepository deviceRepository,
            RunbookRepository runbookRepository,
            HistoricalIncidentRepository historicalIncidentRepository,
            IncidentRAGService ragService,
            KnowledgeRAGService knowledgeRAGService) {
        this.incidentRepository = incidentRepository;
        this.deviceRepository = deviceRepository;
        this.runbookRepository = runbookRepository;
        this.historicalIncidentRepository = historicalIncidentRepository;
        this.ragService = ragService;
        this.knowledgeRAGService = knowledgeRAGService;
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
        log.info("RAG: retrieving similar historical incidents for symptoms {}", incident.getSymptoms());
        List<HistoricalIncident> historicalIncidents = ragService.findSimilar(incident.getSymptoms());
        log.info("RAG: retrieved {} similar historical incidents", historicalIncidents.size());

        String knowledgeQuery = String.join(", ", incident.getSymptoms());
        var knowledgeChunks = knowledgeRAGService.findRelevant(knowledgeQuery);
        log.info("Knowledge RAG: retrieved {} chunks", knowledgeChunks.size());

        return IncidentContext.builder()
                .device(device)
                .incident(incident)
                .runbook(runbook)
                .historicalIncidents(historicalIncidents)
                .knowledgeChunks(knowledgeChunks)
                .businessService(device.getBusinessService())
                .lifecycleStatus(device.getLifecycleStatus())
                .decisionTimestamp(LocalDateTime.now())
                .build();
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