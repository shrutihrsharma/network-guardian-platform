package com.networkguardian.backend.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionRequest {

    private String engine;
    private String incidentId;
    /** Used by lifecycle and other device-centric decision modules. */
    private String deviceId;
}