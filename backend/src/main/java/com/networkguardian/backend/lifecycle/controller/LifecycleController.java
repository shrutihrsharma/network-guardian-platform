package com.networkguardian.backend.lifecycle.controller;

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
import com.networkguardian.backend.lifecycle.dto.DeviceLifecycleSummary;
import com.networkguardian.backend.lifecycle.dto.LifecycleDashboardResponse;
import com.networkguardian.backend.lifecycle.model.SoftwareLifecycle;
import com.networkguardian.backend.lifecycle.service.LifecycleDecisionService;
import com.networkguardian.backend.lifecycle.service.LifecycleService;

@RestController
@RequestMapping("/api/lifecycle")
public class LifecycleController {

    private final LifecycleService lifecycleService;
    private final LifecycleDecisionService lifecycleDecisionService;

    public LifecycleController(
            LifecycleService lifecycleService,
            LifecycleDecisionService lifecycleDecisionService) {
        this.lifecycleService = lifecycleService;
        this.lifecycleDecisionService = lifecycleDecisionService;
    }

    /** Full device lifecycle list — supports frontend filters via client-side filtering. */
    @GetMapping
    public ResponseEntity<List<DeviceLifecycleSummary>> getAll() {
        return ResponseEntity.ok(lifecycleService.getAll());
    }

    /** Distinct vendor names. */
    @GetMapping("/vendors")
    public ResponseEntity<List<String>> getVendors() {
        return ResponseEntity.ok(lifecycleService.getVendors());
    }

    /** Lifecycle summary for a specific device. */
    @GetMapping("/device/{id}")
    public ResponseEntity<DeviceLifecycleSummary> getForDevice(@PathVariable String id) {
        return lifecycleService.getForDevice(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** All software lifecycle timeline entries (per OS version). */
    @GetMapping("/timeline")
    public ResponseEntity<List<SoftwareLifecycle>> getTimeline() {
        return ResponseEntity.ok(lifecycleService.getTimeline());
    }

    /** Aggregated dashboard statistics. */
    @GetMapping("/dashboard")
    public ResponseEntity<LifecycleDashboardResponse> getDashboard() {
        return ResponseEntity.ok(lifecycleService.getDashboard());
    }

    /**
     * Trigger the Lifecycle AI Decision Engine for a device.
     * Body: { "deviceId": "DEV-001" }
     */
    @PostMapping("/decision")
    public ResponseEntity<DecisionResponse> executeDecision(@RequestBody DecisionRequest request) {
        return ResponseEntity.ok(lifecycleDecisionService.execute(request));
    }
}
