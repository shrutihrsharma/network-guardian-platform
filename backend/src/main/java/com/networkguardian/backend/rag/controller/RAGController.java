package com.networkguardian.backend.rag.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.networkguardian.backend.rag.dto.KnowledgeQuery;
import com.networkguardian.backend.rag.model.KnowledgeDocument;
import com.networkguardian.backend.rag.service.RAGRetrievalService;

@RestController
@RequestMapping("/api/rag")
public class RAGController {

    private final RAGRetrievalService ragRetrievalService;

    public RAGController(RAGRetrievalService ragRetrievalService) {
        this.ragRetrievalService = ragRetrievalService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<KnowledgeDocument>> search(
            @RequestParam(required = false) String vendor,
            @RequestParam(required = false) String deviceType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) Integer maximumResults) {

        KnowledgeQuery query = KnowledgeQuery.builder()
                .vendor(vendor)
                .deviceType(deviceType)
                .category(category)
                .tags(tags)
                .keywords(splitKeywords(keyword))
                .maximumResults(maximumResults)
                .build();

        return ResponseEntity.ok(ragRetrievalService.retrieve(query));
    }

    private List<String> splitKeywords(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return List.of();
        }
        return Arrays.stream(keyword.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }
}