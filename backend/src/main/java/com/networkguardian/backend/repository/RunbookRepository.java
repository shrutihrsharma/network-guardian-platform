package com.networkguardian.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.incident.model.Runbook;

public interface RunbookRepository extends MongoRepository<Runbook, String> {
}
