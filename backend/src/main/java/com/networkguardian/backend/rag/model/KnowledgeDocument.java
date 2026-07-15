package com.networkguardian.backend.rag.model;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "knowledge_documents")
public class KnowledgeDocument {

    @Id
    private String id;

    private String title;
    private String category;
    private String source;
    private String vendor;
    private String deviceType;
    private List<String> tags;
    private String content;
    private String referenceUrl;
    private LocalDate lastUpdated;
    private Double confidenceScore;
}