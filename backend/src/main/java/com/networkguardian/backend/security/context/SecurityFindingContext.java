package com.networkguardian.backend.security.context;

import java.time.LocalDateTime;

import com.networkguardian.backend.security.model.SecurityFinding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityFindingContext {

    private SecurityFinding finding;
    private LocalDateTime decisionTimestamp;
}
