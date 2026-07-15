package com.networkguardian.backend.rag.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.networkguardian.backend.rag.dto.KnowledgeQuery;
import com.networkguardian.backend.rag.model.KnowledgeDocument;
import com.networkguardian.backend.rag.provider.RAGProvider;

class RAGRetrievalServiceTest {

    @Test
    void retrievesDocumentsByMetadataAndRanksBestMatchFirst() {
        KnowledgeDocument bestMatch = document(
                "doc-1", "Cisco BGP recovery runbook", "Runbook", "Cisco", "ASR 9000",
                List.of("bgp", "routing"),
                "Step-by-step BGP recovery guidance for Cisco ASR 9000 core routers.",
                LocalDate.of(2026, 6, 1), 0.97);
        KnowledgeDocument weakerMatch = document(
                "doc-2", "Generic routing note", "Knowledge Article", "Cisco", "Catalyst 9300",
                List.of("routing"),
                "General routing troubleshooting note.",
                LocalDate.of(2026, 1, 1), 0.82);

        RAGProvider provider = query -> List.of(bestMatch, weakerMatch);
        RAGRetrievalService service = new RAGRetrievalService(List.of(provider));

        List<KnowledgeDocument> results = service.retrieve(KnowledgeQuery.builder()
                .vendor("Cisco")
                .deviceType("ASR 9000")
                .category("Runbook")
                .keywords(List.of("bgp"))
                .maximumResults(5)
                .build());

        assertThat(results).extracting(KnowledgeDocument::getId)
                .containsExactly("doc-1", "doc-2");
    }

    @Test
    void removesDuplicateDocumentsAcrossProviders() {
        KnowledgeDocument older = document(
                "shared-doc", "Certificate renewal", "Runbook", "F5", "BIG-IP 5000",
                List.of("certificate"),
                "Older guidance.",
                LocalDate.of(2026, 1, 10), 0.85);
        KnowledgeDocument newer = document(
                "shared-doc", "Certificate renewal", "Runbook", "F5", "BIG-IP 5000",
                List.of("certificate"),
                "Newer guidance.",
                LocalDate.of(2026, 6, 10), 0.95);

        RAGProvider firstProvider = query -> List.of(older);
        RAGProvider secondProvider = query -> List.of(newer);
        RAGRetrievalService service = new RAGRetrievalService(List.of(firstProvider, secondProvider));

        List<KnowledgeDocument> results = service.retrieve(KnowledgeQuery.builder()
                .keywords(List.of("certificate"))
                .maximumResults(5)
                .build());

        assertThat(results).hasSize(1);
        assertThat(results.getFirst().getContent()).isEqualTo("Newer guidance.");
    }

    private KnowledgeDocument document(String id, String title, String category, String vendor,
                                       String deviceType, List<String> tags, String content,
                                       LocalDate lastUpdated, double confidenceScore) {
        return KnowledgeDocument.builder()
                .id(id)
                .title(title)
                .category(category)
                .source("test")
                .vendor(vendor)
                .deviceType(deviceType)
                .tags(tags)
                .content(content)
                .referenceUrl("https://example.test/" + id)
                .lastUpdated(lastUpdated)
                .confidenceScore(confidenceScore)
                .build();
    }
}