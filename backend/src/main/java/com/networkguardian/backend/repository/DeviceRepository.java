package com.networkguardian.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.incident.model.Device;

public interface DeviceRepository extends MongoRepository<Device, String> {
}
