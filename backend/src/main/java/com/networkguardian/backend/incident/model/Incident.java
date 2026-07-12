package com.networkguardian.backend.incident.model;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Incident {

    private String id;
    private String deviceId;
    private String severity;
    private String status;
    private List<String> symptoms;
    private LocalDateTime createdAt;
}