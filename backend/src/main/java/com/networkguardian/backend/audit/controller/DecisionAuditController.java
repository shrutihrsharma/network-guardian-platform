package com.networkguardian.backend.audit.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.networkguardian.backend.audit.service.DecisionAuditService;
import com.networkguardian.backend.common.dto.DecisionAudit;

@RestController
@RequestMapping("/api/decision-engines")
public class DecisionAuditController {

    private final DecisionAuditService decisionAuditService;

    public DecisionAuditController(DecisionAuditService decisionAuditService) {
        this.decisionAuditService = decisionAuditService;
    }

    @GetMapping("/history")
    public ResponseEntity<List<DecisionAudit>> findAll() {
        return ResponseEntity.ok(decisionAuditService.findAll());
    }

    @GetMapping("/history/{decisionId}")
    public ResponseEntity<DecisionAudit> findByDecisionId(@PathVariable String decisionId) {
        Optional<DecisionAudit> audit = decisionAuditService.findByDecisionId(decisionId);
        return audit
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}