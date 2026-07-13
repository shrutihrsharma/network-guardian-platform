package com.networkguardian.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.incident.model.HistoricalIncident;

public interface HistoricalIncidentRepository extends MongoRepository<HistoricalIncident, String> {

    List<HistoricalIncident> findByIncidentId(String incidentId);
}
