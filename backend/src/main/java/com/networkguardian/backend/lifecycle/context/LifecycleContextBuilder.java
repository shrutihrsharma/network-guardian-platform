package com.networkguardian.backend.lifecycle.context;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.lifecycle.model.SoftwareLifecycle;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.IncidentRepository;
import com.networkguardian.backend.repository.SoftwareLifecycleRepository;

@Component
@SuppressWarnings("null")
public class LifecycleContextBuilder {

    private static final Logger log = LoggerFactory.getLogger(LifecycleContextBuilder.class);

    private final DeviceRepository deviceRepository;
    private final SoftwareLifecycleRepository softwareLifecycleRepository;
    private final IncidentRepository incidentRepository;

    public LifecycleContextBuilder(
            DeviceRepository deviceRepository,
            SoftwareLifecycleRepository softwareLifecycleRepository,
            IncidentRepository incidentRepository) {
        this.deviceRepository = deviceRepository;
        this.softwareLifecycleRepository = softwareLifecycleRepository;
        this.incidentRepository = incidentRepository;
    }

    public LifecycleContext build(String deviceId) {
        log.info("Building lifecycle context for device {}", deviceId);

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Device not found: " + deviceId));

        if (device.getLifecycleId() == null || device.getLifecycleId().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "No lifecycle entry linked to device: " + deviceId);
        }

        SoftwareLifecycle lifecycle = softwareLifecycleRepository
                .findById(device.getLifecycleId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Lifecycle entry not found: " + device.getLifecycleId()));

        String currentStage = computeCurrentStage(lifecycle);
        long daysUntilUnsupported = computeDaysUntil(lifecycle.getUnsupportedDate());
        long daysUntilDisinvest = computeDaysUntil(lifecycle.getDisinvestDate());

        log.info("Device {} running {} | stage={} | daysUntilUnsupported={}",
                deviceId, device.getOsVersion(), currentStage, daysUntilUnsupported);

        List<Incident> relatedIncidents = incidentRepository.findByDeviceId(deviceId);
        log.info("Found {} related incidents for device {}", relatedIncidents.size(), deviceId);

        return LifecycleContext.builder()
                .device(device)
                .lifecycle(lifecycle)
                .currentStage(currentStage)
                .daysUntilUnsupported(daysUntilUnsupported)
                .daysUntilDisinvest(daysUntilDisinvest)
                .relatedIncidents(relatedIncidents)
                .decisionTimestamp(LocalDateTime.now())
                .build();
    }

    public String computeCurrentStage(SoftwareLifecycle lifecycle) {
        LocalDate today = LocalDate.now();
        if (!today.isBefore(LocalDate.parse(lifecycle.getUnsupportedDate()))) return "Unsupported";
        if (!today.isBefore(LocalDate.parse(lifecycle.getDisinvestDate())))   return "Disinvest";
        if (!today.isBefore(LocalDate.parse(lifecycle.getMaintainDate())))    return "Maintain";
        if (!today.isBefore(LocalDate.parse(lifecycle.getInvestDate())))      return "Invest";
        return "Engineering Testing";
    }

    private long computeDaysUntil(String isoDate) {
        return ChronoUnit.DAYS.between(LocalDate.now(), LocalDate.parse(isoDate));
    }
}
