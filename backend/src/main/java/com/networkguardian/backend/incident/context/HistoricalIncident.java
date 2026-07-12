package com.networkguardian.backend.incident.context;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoricalIncident {

    private String incidentId;
    private String rootCause;
    private String resolution;
    private int resolvedInMinutes;
    private double resolutionConfidence;
}