package com.networkguardian.backend.rag.provider;

import java.util.List;

import org.springframework.stereotype.Component;

import com.networkguardian.backend.rag.dto.KnowledgeQuery;
import com.networkguardian.backend.rag.model.KnowledgeDocument;
import com.networkguardian.backend.rag.repository.KnowledgeRepository;

@Component
public class MongoRAGProvider implements RAGProvider {

    private final KnowledgeRepository knowledgeRepository;

    public MongoRAGProvider(KnowledgeRepository knowledgeRepository) {
        this.knowledgeRepository = knowledgeRepository;
    }

    @Override
    public List<KnowledgeDocument> retrieve(KnowledgeQuery query) {
        return knowledgeRepository.search(query);
    }
}