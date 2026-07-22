package com.networkguardian.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.security.model.SecurityFinding;

public interface SecurityFindingRepository extends MongoRepository<SecurityFinding, String> {
}
