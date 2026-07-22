package com.networkguardian.backend.security.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.networkguardian.backend.repository.SecurityFindingRepository;
import com.networkguardian.backend.security.dto.SecurityFindingResponse;
import com.networkguardian.backend.security.model.SecurityFinding;

@Service
@SuppressWarnings("null")
public class SecurityFindingService {

    private final SecurityFindingRepository securityFindingRepository;

    public SecurityFindingService(SecurityFindingRepository securityFindingRepository) {
        this.securityFindingRepository = securityFindingRepository;
    }

    public List<SecurityFindingResponse> getFindings(
            String vendor,
            String region,
            String severity,
            String category,
            String businessService,
            String status) {

        return securityFindingRepository.findAll().stream()
                .filter(f -> matches(f.getVendor(), vendor))
                .filter(f -> matches(f.getRegion(), region))
                .filter(f -> matches(f.getSeverity(), severity))
                .filter(f -> matches(f.getCategory(), category))
                .filter(f -> matches(f.getBusinessService(), businessService))
                .filter(f -> matches(f.getStatus(), status))
                .sorted(Comparator.comparing(SecurityFinding::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    public Optional<SecurityFindingResponse> getFindingById(String id) {
        return securityFindingRepository.findById(id).map(this::toResponse);
    }

    private boolean matches(String actual, String filter) {
        if (filter == null || filter.isBlank()) {
            return true;
        }
        return normalize(actual).equals(normalize(filter));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private SecurityFindingResponse toResponse(SecurityFinding finding) {
        return SecurityFindingResponse.builder()
                .id(finding.getId())
                .deviceId(finding.getDeviceId())
                .deviceName(finding.getDeviceName())
                .vendor(finding.getVendor())
                .region(finding.getRegion())
                .businessService(finding.getBusinessService())
                .severity(finding.getSeverity())
                .category(finding.getCategory())
                .title(finding.getTitle())
                .description(finding.getDescription())
                .complianceImpact(finding.getComplianceImpact())
                .status(finding.getStatus())
                .riskScore(finding.getRiskScore())
                .affectedAssets(finding.getAffectedAssets())
                .createdAt(OffsetDateTime.of(finding.getCreatedAt(), ZoneOffset.UTC).toString())
                .build();
    }
}
