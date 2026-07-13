package com.networkguardian.backend.incident.controller;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.networkguardian.backend.incident.dto.IncidentSummaryResponse;
import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.IncidentRepository;

@RestController
@RequestMapping("/api/incidents")
@SuppressWarnings("null")
public class IncidentController {

    private final IncidentRepository incidentRepository;
    private final DeviceRepository deviceRepository;

    public IncidentController(IncidentRepository incidentRepository, DeviceRepository deviceRepository) {
        this.incidentRepository = incidentRepository;
        this.deviceRepository = deviceRepository;
    }

    @GetMapping
    public ResponseEntity<List<IncidentSummaryResponse>> getIncidents() {
        List<Incident> incidents = incidentRepository.findAll().stream()
            .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
            .toList();

        Set<String> deviceIds = incidents.stream()
            .map(Incident::getDeviceId)
            .collect(Collectors.toSet());

        Map<String, Device> deviceById = deviceRepository.findAllById(deviceIds).stream()
            .collect(Collectors.toMap(Device::getId, device -> device));

        List<IncidentSummaryResponse> summaries = incidents.stream()
                .map(incident -> {
                Device device = deviceById.get(incident.getDeviceId());
                    return IncidentSummaryResponse.builder()
                            .id(incident.getId())
                            .severity(incident.getSeverity())
                            .device(device != null ? device.getHostname() : incident.getDeviceId())
                            .businessService(device != null ? device.getBusinessService() : "Pending")
                            .vendor(device != null ? device.getVendor() : "Pending")
                            .status(incident.getStatus())
                            .createdAt(OffsetDateTime.of(incident.getCreatedAt(), ZoneOffset.UTC).toString())
                            .build();
                })
                .toList();

        return ResponseEntity.ok(summaries);
    }
}
