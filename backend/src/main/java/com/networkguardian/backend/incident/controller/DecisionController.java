package com.networkguardian.backend.incident.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.networkguardian.backend.common.dto.DecisionRequest;
import com.networkguardian.backend.common.dto.DecisionResponse;
import com.networkguardian.backend.incident.service.IncidentDecisionService;

@RestController
@RequestMapping("/decision-engines")
public class 
DecisionController {

    private final IncidentDecisionService incidentDecisionService;

    public 
    DecisionController(IncidentDecisionService incidentDecisionService) {
        this.incidentDecisionService = incidentDecisionService;
    }

    @PostMapping("/execute")
    public ResponseEntity<DecisionResponse> execute(@RequestBody DecisionRequest request) {
        return ResponseEntity.ok(incidentDecisionService.execute(request));
    }
}