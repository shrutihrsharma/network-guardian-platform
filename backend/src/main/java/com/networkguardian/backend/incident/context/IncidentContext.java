package com.networkguardian.backend.incident.context;

import java.time.LocalDateTime;
import java.util.List;

import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentContext {

    private Device device;
    private Incident incident;
    private Runbook runbook;
    private List<HistoricalIncident> historicalIncidents;
    private String businessService;
    private String lifecycleStatus;
    private LocalDateTime decisionTimestamp;
}