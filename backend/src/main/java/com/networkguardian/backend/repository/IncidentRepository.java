package com.networkguardian.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.incident.model.Incident;

public interface IncidentRepository extends MongoRepository<Incident, String> {
}
