package com.networkguardian.backend.incident.model;

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
@Document(collection = "runbooks")
public class Runbook {

    @Id
    private String runbookId;
    private String title;
    private String owner;
    private String version;
    private List<String> steps;
}
