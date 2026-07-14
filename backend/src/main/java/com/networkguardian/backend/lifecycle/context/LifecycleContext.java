package com.networkguardian.backend.lifecycle.context;

import java.time.LocalDateTime;
import java.util.List;

import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.lifecycle.model.SoftwareLifecycle;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LifecycleContext {

    private Device device;
    private SoftwareLifecycle lifecycle;
    private String currentStage;
    private long daysUntilUnsupported;
    private long daysUntilDisinvest;
    private List<Incident> relatedIncidents;
    private LocalDateTime decisionTimestamp;
}
