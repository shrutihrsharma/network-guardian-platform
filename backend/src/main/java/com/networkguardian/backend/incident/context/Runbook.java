package com.networkguardian.backend.incident.context;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Runbook {

    private String runbookId;
    private String title;
    private String owner;
    private String version;
    private List<String> steps;
}