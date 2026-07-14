package com.networkguardian.backend.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorSummary {

    private String vendor;
    private long unsupported;
    private long disinvest;
    private long maintain;
    private long invest;
    private long engineeringTesting;
}
