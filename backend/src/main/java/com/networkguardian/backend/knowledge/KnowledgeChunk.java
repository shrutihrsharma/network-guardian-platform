package com.networkguardian.backend.knowledge;

import java.time.LocalDateTime;
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
@Document(collection = "knowledge_base")
public class KnowledgeChunk {

    @Id
    private String id;
    private String sourceFile;
    private String sourceType;
    private int chunkIndex;
    private String content;
    private List<Double> embedding;
    private LocalDateTime ingestedAt;
}
