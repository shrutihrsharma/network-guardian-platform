package com.networkguardian.backend.device.controller;

import java.util.Comparator;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.networkguardian.backend.device.dto.DeviceResponse;
import com.networkguardian.backend.incident.dto.IncidentSummaryResponse;
import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.IncidentRepository;

@RestController
@RequestMapping("/api/devices")
@SuppressWarnings("null")
public class DeviceController {

    private final DeviceRepository deviceRepository;
    private final IncidentRepository incidentRepository;

    public DeviceController(DeviceRepository deviceRepository, IncidentRepository incidentRepository) {
        this.deviceRepository = deviceRepository;
        this.incidentRepository = incidentRepository;
    }

    @GetMapping
    public ResponseEntity<List<DeviceResponse>> getDevices() {
        List<DeviceResponse> devices = deviceRepository.findAll().stream()
            .sorted(Comparator.comparing(device -> Objects.toString(device.getHostname(), "")))
            .map(this::toResponse)
            .toList();

        return ResponseEntity.ok(devices);
    }

    @GetMapping("/{deviceId}")
    public ResponseEntity<DeviceResponse> getDevice(@PathVariable String deviceId) {
        String normalizedDeviceId = Objects.requireNonNull(deviceId);
        return deviceRepository.findById(normalizedDeviceId)
            .map(device -> ResponseEntity.ok(toResponse(device)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{deviceId}/incidents")
    public ResponseEntity<List<IncidentSummaryResponse>> getDeviceIncidents(@PathVariable String deviceId) {
        String normalizedDeviceId = Objects.requireNonNull(deviceId);

        return deviceRepository.findById(normalizedDeviceId)
            .map(device -> {
                List<IncidentSummaryResponse> incidents = incidentRepository.findByDeviceId(normalizedDeviceId).stream()
                    .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                    .map(incident -> toIncidentSummary(incident, device))
                    .toList();

                return ResponseEntity.ok(incidents);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private DeviceResponse toResponse(Device device) {
        return DeviceResponse.builder()
            .id(device.getId())
            .deviceName(toDeviceName(device.getHostname()))
            .hostname(device.getHostname())
            .vendor(device.getVendor())
            .deviceType(deriveDeviceType(device.getHostname()))
            .model(device.getModel())
            .region(deriveRegion(device.getHostname()))
            .businessService(device.getBusinessService())
            .lifecycleStatus(device.getLifecycleStatus())
            .complianceStatus(deriveComplianceStatus(device.getLifecycleStatus()))
            .predictiveRisk(derivePredictiveRisk(device.getLifecycleStatus()))
            .healthStatus(deriveHealthStatus(device.getLifecycleStatus()))
            .criticality(deriveCriticality(device.getBusinessService()))
            .osVersion(device.getOsVersion())
            .build();
    }

    private IncidentSummaryResponse toIncidentSummary(Incident incident, Device device) {
        return IncidentSummaryResponse.builder()
            .id(incident.getId())
            .severity(incident.getSeverity())
            .device(device.getHostname())
            .businessService(device.getBusinessService())
            .vendor(device.getVendor())
            .status(incident.getStatus())
            .createdAt(OffsetDateTime.of(incident.getCreatedAt(), ZoneOffset.UTC).toString())
            .build();
    }

    private String toDeviceName(String hostname) {
        return hostname.replace('-', ' ').toUpperCase(Locale.ROOT);
    }

    private String deriveDeviceType(String hostname) {
        if (hostname.startsWith("RTR")) {
            return "Router";
        }
        if (hostname.startsWith("SW")) {
            return "Switch";
        }
        if (hostname.startsWith("FW") || hostname.startsWith("WAF")) {
            return "Firewall";
        }
        if (hostname.startsWith("LB") || hostname.startsWith("APP")) {
            return "Load Balancer";
        }
        if (hostname.startsWith("EDGE") || hostname.startsWith("CORE")) {
            return "Proxy";
        }
        return "Switch";
    }

    private String deriveRegion(String hostname) {
        if (hostname.contains("-LON-") || hostname.contains("-FRA-") || hostname.contains("-DUB-")) {
            return "EMEA";
        }
        if (hostname.contains("-SIN-") || hostname.contains("-TOK-") || hostname.contains("-SYD-")
                || hostname.contains("-HKG-") || hostname.contains("-MUM-")) {
            return "APAC";
        }
        return "AMER";
    }

    private String deriveComplianceStatus(String lifecycleStatus) {
        return switch (lifecycleStatus) {
            case "Active" -> "Compliant";
            case "Monitoring" -> "Watch";
            case "Maintenance" -> "Review";
            default -> "Non-Compliant";
        };
    }

    private String derivePredictiveRisk(String lifecycleStatus) {
        return switch (lifecycleStatus) {
            case "Critical" -> "High";
            case "Maintenance" -> "Medium";
            case "Monitoring" -> "Medium";
            default -> "Low";
        };
    }

    private String deriveHealthStatus(String lifecycleStatus) {
        return switch (lifecycleStatus) {
            case "Critical" -> "Degraded";
            case "Maintenance" -> "Maintenance";
            case "Monitoring" -> "Warning";
            default -> "Healthy";
        };
    }

    private String deriveCriticality(String businessService) {
        return switch (businessService) {
            case "SEPA Payments", "SWIFT", "Card Processing", "Trading" -> "Tier 1";
            case "Identity Platform", "Retail Banking", "Mobile Banking" -> "Tier 2";
            default -> "Tier 3";
        };
    }
}
