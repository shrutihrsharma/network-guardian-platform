package com.networkguardian.backend.rag.repository;

import java.util.List;

import com.networkguardian.backend.rag.dto.KnowledgeQuery;
import com.networkguardian.backend.rag.model.KnowledgeDocument;

public interface KnowledgeRepositoryCustom {
    List<KnowledgeDocument> search(KnowledgeQuery query);
}