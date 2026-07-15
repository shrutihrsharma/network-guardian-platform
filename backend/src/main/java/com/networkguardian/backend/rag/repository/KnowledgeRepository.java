package com.networkguardian.backend.rag.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.networkguardian.backend.rag.model.KnowledgeDocument;

public interface KnowledgeRepository extends MongoRepository<KnowledgeDocument, String>, KnowledgeRepositoryCustom {
}