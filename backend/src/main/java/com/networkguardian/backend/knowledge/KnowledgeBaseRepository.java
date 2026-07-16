package com.networkguardian.backend.knowledge;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface KnowledgeBaseRepository extends MongoRepository<KnowledgeChunk, String> {

    List<KnowledgeChunk> findBySourceFile(String sourceFile);

    void deleteBySourceFile(String sourceFile);
}
