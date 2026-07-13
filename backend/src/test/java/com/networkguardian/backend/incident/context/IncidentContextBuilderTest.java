package com.networkguardian.backend.incident.context;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.HistoricalIncident;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.incident.model.Runbook;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.HistoricalIncidentRepository;
import com.networkguardian.backend.repository.IncidentRepository;
import com.networkguardian.backend.repository.RunbookRepository;

class IncidentContextBuilderTest {

    @Test
    void buildUsesRepositoriesToPopulateContext() {
        IncidentRepository incidentRepository = mock(IncidentRepository.class);
        DeviceRepository deviceRepository = mock(DeviceRepository.class);
        RunbookRepository runbookRepository = mock(RunbookRepository.class);
        HistoricalIncidentRepository historicalIncidentRepository = mock(HistoricalIncidentRepository.class);

        when(incidentRepository.findById("INC-1001")).thenReturn(Optional.of(Incident.builder()
                .id("INC-1001")
                .deviceId("DEV-1")
                .severity("Critical")
                .status("OPEN")
                .symptoms(List.of("CPU 98%"))
                .runbookId("RB-1")
                .createdAt(LocalDateTime.now())
                .build()));

        when(deviceRepository.findById("DEV-1")).thenReturn(Optional.of(Device.builder()
                .id("DEV-1")
                .hostname("RTR-01")
                .vendor("Cisco")
                .model("ASR1001-X")
                .location("Frankfurt")
                .businessService("SEPA Payments")
                .osVersion("IOS XE")
                .lifecycleStatus("Supported")
                .build()));

        when(runbookRepository.findById("RB-1")).thenReturn(Optional.of(Runbook.builder()
                .runbookId("RB-1")
                .title("Routing Recovery")
                .owner("Ops")
                .version("1.0")
                .steps(List.of("Check route flaps"))
                .build()));

        when(historicalIncidentRepository.findByIncidentId("INC-1001")).thenReturn(List.of(HistoricalIncident.builder()
                .id("HIS-1")
                .incidentId("INC-1001")
                .rootCause("Route flap")
                .resolution("Restarted process")
                .resolvedInMinutes(28)
                .resolutionConfidence(94.5)
                .build()));

        IncidentContextBuilder builder = new IncidentContextBuilder(
                incidentRepository,
                deviceRepository,
                runbookRepository,
                historicalIncidentRepository
        );

        IncidentContext context = builder.build("INC-1001");

        assertThat(context.getIncident().getId()).isEqualTo("INC-1001");
        assertThat(context.getDevice().getBusinessService()).isEqualTo("SEPA Payments");
        assertThat(context.getRunbook().getTitle()).isEqualTo("Routing Recovery");
        assertThat(context.getHistoricalIncidents()).hasSize(1);
    }
}
