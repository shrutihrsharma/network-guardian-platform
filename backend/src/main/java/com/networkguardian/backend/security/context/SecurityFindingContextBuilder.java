package com.networkguardian.backend.security.context;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.networkguardian.backend.repository.SecurityFindingRepository;
import com.networkguardian.backend.security.model.SecurityFinding;

@Component
public class SecurityFindingContextBuilder {

    private final SecurityFindingRepository securityFindingRepository;

    public SecurityFindingContextBuilder(SecurityFindingRepository securityFindingRepository) {
        this.securityFindingRepository = securityFindingRepository;
    }

    public SecurityFindingContext build(String findingId) {
        SecurityFinding finding = securityFindingRepository.findById(findingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Security finding not found: " + findingId));

        return SecurityFindingContext.builder()
                .finding(finding)
                .decisionTimestamp(LocalDateTime.now())
                .build();
    }
}
