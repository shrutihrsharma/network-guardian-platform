package com.networkguardian.backend.compliance.model;

import java.time.LocalDateTime;
import java.util.List;

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
@Document(collection = "device_compliance")
public class DeviceCompliance {

    @Id
    private String deviceId;
    private double overallCompliance;
    private String riskLevel;
    private List<String> passedKRIs;
    private List<String> failedKRIs;
    private LocalDateTime lastCalculated;
}
