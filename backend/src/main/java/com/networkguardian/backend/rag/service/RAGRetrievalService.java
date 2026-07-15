package com.networkguardian.backend.rag.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.networkguardian.backend.rag.dto.KnowledgeQuery;
import com.networkguardian.backend.rag.model.KnowledgeDocument;
import com.networkguardian.backend.rag.provider.RAGProvider;

@Service
public class RAGRetrievalService {

    private static final int DEFAULT_MAX_RESULTS = 10;
    private static final int MAX_RESULTS_CAP = 50;

    private final List<RAGProvider> providers;

    public RAGRetrievalService(List<RAGProvider> providers) {
        this.providers = providers;
    }

    public List<KnowledgeDocument> retrieve(KnowledgeQuery query) {
        KnowledgeQuery effectiveQuery = query != null ? query : KnowledgeQuery.builder().build();

        Map<String, KnowledgeDocument> merged = providers.stream()
                .filter(Objects::nonNull)
                .flatMap(provider -> provider.retrieve(effectiveQuery).stream())
                .collect(LinkedHashMap::new,
                        (map, document) -> map.merge(documentKey(document), document, this::preferDocument),
                        Map::putAll);

        return merged.values().stream()
                .sorted(Comparator
                        .comparingDouble((KnowledgeDocument document) -> relevanceScore(effectiveQuery, document)).reversed()
                        .thenComparing(KnowledgeDocument::getConfidenceScore,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(KnowledgeDocument::getLastUpdated,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(KnowledgeDocument::getTitle,
                                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .limit(resolveMaximumResults(effectiveQuery))
                .toList();
    }

    private KnowledgeDocument preferDocument(KnowledgeDocument left, KnowledgeDocument right) {
        Comparator<KnowledgeDocument> comparator = Comparator
                .comparing(KnowledgeDocument::getConfidenceScore, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(KnowledgeDocument::getLastUpdated, Comparator.nullsLast(Comparator.naturalOrder()));
        return comparator.compare(left, right) >= 0 ? left : right;
    }

    private String documentKey(KnowledgeDocument document) {
        if (document == null) {
            return "unknown";
        }
        if (StringUtils.hasText(document.getId())) {
            return document.getId();
        }
        return normalize(document.getTitle()) + "|" + normalize(document.getSource()) + "|"
                + normalize(document.getReferenceUrl());
    }

    private double relevanceScore(KnowledgeQuery query, KnowledgeDocument document) {
        double score = document.getConfidenceScore() != null ? document.getConfidenceScore() * 10 : 0;

        if (matchesExact(query.getVendor(), document.getVendor())) {
            score += 40;
        }
        if (matchesExact(query.getDeviceType(), document.getDeviceType())) {
            score += 35;
        }
        if (matchesExact(query.getCategory(), document.getCategory())) {
            score += 20;
        }
        if (query.getTags() != null && document.getTags() != null) {
            score += query.getTags().stream()
                    .filter(StringUtils::hasText)
                    .filter(tag -> document.getTags().stream().anyMatch(docTag -> matchesExact(tag, docTag)))
                    .count() * 8;
        }
        if (query.getKeywords() != null) {
            for (String keyword : query.getKeywords()) {
                if (!StringUtils.hasText(keyword)) {
                    continue;
                }
                score += keywordScore(keyword, document);
            }
        }

        return score;
    }

    private double keywordScore(String keyword, KnowledgeDocument document) {
        double score = 0;
        if (containsIgnoreCase(document.getTitle(), keyword)) {
            score += 15;
        }
        if (containsIgnoreCase(document.getContent(), keyword)) {
            score += 10;
        }
        if (containsIgnoreCase(document.getVendor(), keyword)) {
            score += 8;
        }
        if (containsIgnoreCase(document.getDeviceType(), keyword)) {
            score += 8;
        }
        if (document.getTags() != null && document.getTags().stream().anyMatch(tag -> containsIgnoreCase(tag, keyword))) {
            score += 6;
        }
        return score;
    }

    private int resolveMaximumResults(KnowledgeQuery query) {
        if (query.getMaximumResults() == null || query.getMaximumResults() < 1) {
            return DEFAULT_MAX_RESULTS;
        }
        return Math.min(query.getMaximumResults(), MAX_RESULTS_CAP);
    }

    private boolean matchesExact(String left, String right) {
        return StringUtils.hasText(left) && StringUtils.hasText(right)
                && left.trim().equalsIgnoreCase(right.trim());
    }

    private boolean containsIgnoreCase(String text, String keyword) {
        return StringUtils.hasText(text) && StringUtils.hasText(keyword)
                && text.toLowerCase(Locale.ROOT).contains(keyword.trim().toLowerCase(Locale.ROOT));
    }

    private String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim().toLowerCase(Locale.ROOT) : "";
    }
}