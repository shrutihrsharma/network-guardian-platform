package com.networkguardian.backend.compliance.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.networkguardian.backend.common.dto.DecisionRequest;
import com.networkguardian.backend.common.dto.DecisionResponse;
import com.networkguardian.backend.compliance.dto.ApproveKriRequest;
import com.networkguardian.backend.compliance.dto.ComplianceDecisionRequest;
import com.networkguardian.backend.compliance.dto.ComplianceDashboardResponse;
import com.networkguardian.backend.compliance.dto.ComplianceKriGenerationResponse;
import com.networkguardian.backend.compliance.dto.ComplianceRecalculationResponse;
import com.networkguardian.backend.compliance.dto.ComplianceSummaryResponse;
import com.networkguardian.backend.compliance.dto.DeviceComplianceResponse;
import com.networkguardian.backend.compliance.model.ComplianceKri;
import com.networkguardian.backend.compliance.service.ComplianceDecisionService;
import com.networkguardian.backend.compliance.service.ComplianceService;

@RestController
@RequestMapping("/api/compliance")
public class ComplianceController {

    private final ComplianceService complianceService;
    private final ComplianceDecisionService complianceDecisionService;

    public ComplianceController(
            ComplianceService complianceService,
            ComplianceDecisionService complianceDecisionService) {
        this.complianceService = complianceService;
        this.complianceDecisionService = complianceDecisionService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ComplianceDashboardResponse> getDashboard() {
        return ResponseEntity.ok(complianceService.getDashboard());
    }

    @GetMapping("/kri")
    public ResponseEntity<List<ComplianceKri>> getKris() {
        return ResponseEntity.ok(complianceService.getKris());
    }

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<DeviceComplianceResponse> getDeviceCompliance(@PathVariable String deviceId) {
        return complianceService.getDeviceCompliance(deviceId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    public ResponseEntity<ComplianceSummaryResponse> getSummary() {
        return ResponseEntity.ok(complianceService.getSummary());
    }

    @PostMapping("/recalculate")
    public ResponseEntity<ComplianceRecalculationResponse> recalculate() {
        return ResponseEntity.ok(complianceService.recalculateAll());
    }

    @PostMapping("/generate-kri")
    public ResponseEntity<ComplianceKriGenerationResponse> generateKri(
            @RequestBody(required = false) ComplianceDecisionRequest request) {
        String deviceId = request != null ? request.getDeviceId() : null;
        return ResponseEntity.ok(complianceDecisionService.generateKriSuggestions(deviceId));
    }

    @PostMapping("/decision")
    public ResponseEntity<DecisionResponse> decision(
            @RequestBody(required = false) ComplianceDecisionRequest request) {
        DecisionRequest decisionRequest = DecisionRequest.builder()
                .engine("COMPLIANCE")
                .deviceId(request != null ? request.getDeviceId() : null)
                .build();
        return ResponseEntity.ok(complianceDecisionService.execute(decisionRequest));
    }

    @PostMapping("/approve-kri")
    public ResponseEntity<ComplianceKri> approveKri(@RequestBody ApproveKriRequest request) {
        return ResponseEntity.ok(complianceDecisionService.approveKri(request.getKriId(), request.isEnabled()));
    }
}
