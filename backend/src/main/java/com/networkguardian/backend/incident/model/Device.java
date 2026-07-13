package com.networkguardian.backend.incident.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "devices")
public class Device {

    @Id
    private String id;
    private String hostname;
    private String vendor;
    private String model;
    private String location;
    private String businessService;
    private String osVersion;
    private String lifecycleStatus;
}