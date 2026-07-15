package com.networkguardian.backend.common.service;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.networkguardian.backend.common.dto.DecisionEvidenceItem;
import com.networkguardian.backend.rag.model.KnowledgeDocument;

@Component
public class DecisionEvidenceMapper {

    public List<DecisionEvidenceItem> fromKnowledge(List<KnowledgeDocument> documents) {
        if (documents == null || documents.isEmpty()) {
            return List.of();
        }

        return documents.stream()
                .map(document -> DecisionEvidenceItem.builder()
                        .title(orDefault(document.getTitle(), "Enterprise Knowledge"))
                        .category(orDefault(document.getCategory(), "Knowledge"))
                        .source(orDefault(document.getSource(), "Internal Source"))
                        .summary(summarize(document.getContent()))
                        .referenceUrl(document.getReferenceUrl())
                        .build())
                .toList();
    }

    public List<DecisionEvidenceItem> fromTextEvidence(String category, String source, List<String> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }

        return items.stream()
                .filter(StringUtils::hasText)
                .map(item -> DecisionEvidenceItem.builder()
                        .title(item)
                        .category(orDefault(category, "Operational Context"))
                        .source(orDefault(source, "System"))
                        .summary(item)
                        .build())
                .toList();
    }

    private String summarize(String content) {
        if (!StringUtils.hasText(content)) {
            return "No summary available.";
        }

        String normalized = content.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= 180) {
            return normalized;
        }
        return normalized.substring(0, 177) + "...";
    }

    private String orDefault(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }
}