package com.networkguardian.backend.incident.context;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Component;

import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;

@Component
public class IncidentContextBuilder {

    public IncidentContext build(String incidentId) {

        Device device = Device.builder()
                .id("RTR-FRA-001")
                .hostname("RTR-FRA-001")
                .vendor("Cisco")
                .model("ASR1001-X")
                .location("Frankfurt")
                .businessService("SEPA Payments")
                .osVersion("IOS XE 17.2")
                .lifecycleStatus("EOS in 4 months")
                .build();

        Incident incident = Incident.builder()
                .id(incidentId)
                .deviceId(device.getId())
                .severity("Critical")
                .status("OPEN")
                .symptoms(List.of(
                        "CPU 98%",
                        "Packet Loss",
                        "BGP Flapping",
                        "Certificate expires in 2 days"
                ))
                .createdAt(LocalDateTime.now())
                .build();

        Runbook runbook = Runbook.builder()
                .runbookId("RB-CERT-001")
                .title("Certificate Renewal and Routing Recovery")
                .owner("Network Operations")
                .version("1.0")
                .steps(List.of(
                        "Renew Certificate",
                        "Restart Routing Process",
                        "Verify Connectivity"
                ))
                .build();

        List<HistoricalIncident> historicalIncidents = List.of(
                HistoricalIncident.builder()
                        .incidentId("INC-0891")
                        .rootCause("Expired SSL Certificate")
                        .resolution("Certificate renewed and routing process restarted")
                        .resolvedInMinutes(32)
                        .resolutionConfidence(96.0)
                        .build(),
                HistoricalIncident.builder()
                        .incidentId("INC-0754")
                        .rootCause("Expired SSL Certificate")
                        .resolution("Certificate renewed and routing process restarted")
                        .resolvedInMinutes(28)
                        .resolutionConfidence(93.0)
                        .build(),
                HistoricalIncident.builder()
                        .incidentId("INC-0612")
                        .rootCause("Expired SSL Certificate")
                        .resolution("Certificate renewed and routing process restarted")
                        .resolvedInMinutes(35)
                        .resolutionConfidence(91.0)
                        .build()
        );

        return IncidentContext.builder()
                .device(device)
                .incident(incident)
                .runbook(runbook)
                .historicalIncidents(historicalIncidents)
                .businessService(device.getBusinessService())
                .lifecycleStatus(device.getLifecycleStatus())
                .decisionTimestamp(LocalDateTime.now())
                .build();
    }
}