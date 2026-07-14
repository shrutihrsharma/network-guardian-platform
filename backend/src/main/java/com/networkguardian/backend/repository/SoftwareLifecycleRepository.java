package com.networkguardian.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.lifecycle.model.SoftwareLifecycle;

public interface SoftwareLifecycleRepository extends MongoRepository<SoftwareLifecycle, String> {
    List<SoftwareLifecycle> findByVendor(String vendor);
}
