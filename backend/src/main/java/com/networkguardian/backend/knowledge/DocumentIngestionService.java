package com.networkguardian.backend.knowledge;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.networkguardian.backend.ai.EmbeddingClient;

@Service
public class DocumentIngestionService {

    private static final Logger log = LoggerFactory.getLogger(DocumentIngestionService.class);

    private final EmbeddingClient embeddingClient;
    private final KnowledgeBaseRepository repository;
    private final int chunkSize;
    private final int chunkOverlap;

    public DocumentIngestionService(
            EmbeddingClient embeddingClient,
            KnowledgeBaseRepository repository,
            @Value("${rag.knowledge.chunk-size:500}") int chunkSize,
            @Value("${rag.knowledge.chunk-overlap:50}") int chunkOverlap) {
        this.embeddingClient = embeddingClient;
        this.repository = repository;
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
    }

    public int ingest(String content, String sourceFile, String sourceType) {
        repository.deleteBySourceFile(sourceFile);

        List<String> chunks = chunk(content);
        log.info("Ingesting {} chunks from {} (type={})", chunks.size(), sourceFile, sourceType);

        for (int i = 0; i < chunks.size(); i++) {
            String text = chunks.get(i);
            repository.save(KnowledgeChunk.builder()
                    .id(UUID.randomUUID().toString())
                    .sourceFile(sourceFile)
                    .sourceType(sourceType)
                    .chunkIndex(i)
                    .content(text)
                    .embedding(embeddingClient.embed(text))
                    .ingestedAt(LocalDateTime.now())
                    .build());
        }

        log.info("Ingestion complete for {}: {} chunks stored", sourceFile, chunks.size());
        return chunks.size();
    }

    private List<String> chunk(String text) {
        List<String> chunks = new ArrayList<>();
        String[] words = text.split("\\s+");
        int i = 0;
        while (i < words.length) {
            int end = Math.min(i + chunkSize, words.length);
            chunks.add(String.join(" ", Arrays.copyOfRange(words, i, end)));
            i += chunkSize - chunkOverlap;
        }
        return chunks;
    }
}
