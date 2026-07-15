package com.networkguardian.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.compliance.model.ComplianceKri;

public interface ComplianceKriRepository extends MongoRepository<ComplianceKri, String> {
    List<ComplianceKri> findByEnabledTrueAndApprovedTrue();
    List<ComplianceKri> findAllByOrderByCategoryAscNameAsc();
}
