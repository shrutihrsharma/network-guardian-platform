package com.networkguardian.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.compliance.model.DeviceCompliance;

public interface DeviceComplianceRepository extends MongoRepository<DeviceCompliance, String> {
    List<DeviceCompliance> findAllByOrderByOverallComplianceDesc();
}
