package com.networkguardian.backend.incident.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "historical_incidents")
public class HistoricalIncident {

    @Id
    private String id;
    private String incidentId;
    private String rootCause;
    private String resolution;
    private int resolvedInMinutes;
    private double resolutionConfidence;
}
