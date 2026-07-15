package com.networkguardian.backend.rag.provider;

import java.util.List;

import com.networkguardian.backend.rag.dto.KnowledgeQuery;
import com.networkguardian.backend.rag.model.KnowledgeDocument;

public interface RAGProvider {
    List<KnowledgeDocument> retrieve(KnowledgeQuery query);
}