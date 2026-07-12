package com.networkguardian.backend.incident.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Device {

    private String id;
    private String hostname;
    private String vendor;
    private String model;
    private String location;
    private String businessService;
    private String osVersion;
    private String lifecycleStatus;
}