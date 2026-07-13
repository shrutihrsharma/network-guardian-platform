package com.networkguardian.backend.incident.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentSummaryResponse {

    private String id;
    private String severity;
    private String device;
    private String businessService;
    private String vendor;
    private String status;
    private String createdAt;
}
