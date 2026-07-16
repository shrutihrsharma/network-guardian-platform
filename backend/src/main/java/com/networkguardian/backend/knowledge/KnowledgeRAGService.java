package com.networkguardian.backend.knowledge;

import java.util.List;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.stereotype.Service;

import com.networkguardian.backend.ai.EmbeddingClient;

@Service
public class KnowledgeRAGService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeRAGService.class);

    private final EmbeddingClient embeddingClient;
    private final MongoTemplate mongoTemplate;
    private final int topK;
    private final String indexName;

    public KnowledgeRAGService(
            EmbeddingClient embeddingClient,
            MongoTemplate mongoTemplate,
            @Value("${rag.knowledge.top-k:3}") int topK,
            @Value("${rag.knowledge.index-name:knowledge_vector_index}") String indexName) {
        this.embeddingClient = embeddingClient;
        this.mongoTemplate = mongoTemplate;
        this.topK = topK;
        this.indexName = indexName;
    }

    public List<KnowledgeChunk> findRelevant(String query) {
        if (mongoTemplate.getCollection("knowledge_base").countDocuments() == 0) {
            log.debug("Knowledge base is empty, skipping retrieval");
            return List.of();
        }

        List<Double> queryEmbedding = embeddingClient.embed(query);

        AggregationOperation vectorSearch = ctx -> new Document("$vectorSearch", new Document()
                .append("index", indexName)
                .append("path", "embedding")
                .append("queryVector", queryEmbedding)
                .append("numCandidates", topK * 10)
                .append("limit", topK));

        List<KnowledgeChunk> results = mongoTemplate.aggregate(
                Aggregation.newAggregation(vectorSearch),
                "knowledge_base",
                KnowledgeChunk.class
        ).getMappedResults();

        log.debug("Knowledge RAG returned {} chunks for query: {}", results.size(), query);
        return results;
    }
}
