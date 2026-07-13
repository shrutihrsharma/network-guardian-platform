package com.networkguardian.backend.incident.model;

import java.time.LocalDateTime;
import java.util.List;

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
@Document(collection = "incidents")
public class Incident {

    @Id
    private String id;
    private String deviceId;
    private String runbookId;
    private String severity;
    private String status;
    private List<String> symptoms;
    private LocalDateTime createdAt;
}