package com.networkguardian.backend.incident.rag;

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
import com.networkguardian.backend.incident.model.HistoricalIncident;
import com.networkguardian.backend.repository.HistoricalIncidentRepository;

@Service
public class IncidentRAGService {

    private static final Logger log = LoggerFactory.getLogger(IncidentRAGService.class);

    private final EmbeddingClient embeddingClient;
    private final HistoricalIncidentRepository repository;
    private final MongoTemplate mongoTemplate;
    private final int topK;
    private final String indexName;

    public IncidentRAGService(
            EmbeddingClient embeddingClient,
            HistoricalIncidentRepository repository,
            MongoTemplate mongoTemplate,
            @Value("${rag.incident.top-k:5}") int topK,
            @Value("${rag.incident.index-name:vector_index}") String indexName) {
        this.embeddingClient = embeddingClient;
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
        this.topK = topK;
        this.indexName = indexName;
    }

    public List<HistoricalIncident> findSimilar(List<String> symptoms) {
        String query = String.join(", ", symptoms);
        List<Double> queryEmbedding = embeddingClient.embed(query);

        AggregationOperation vectorSearch = ctx -> new Document("$vectorSearch", new Document()
                .append("index", indexName)
                .append("path", "embedding")
                .append("queryVector", queryEmbedding)
                .append("numCandidates", topK * 10)
                .append("limit", topK));

        List<HistoricalIncident> results = mongoTemplate.aggregate(
                Aggregation.newAggregation(vectorSearch),
                "historical_incidents",
                HistoricalIncident.class
        ).getMappedResults();

        log.debug("Atlas Vector Search returned {} results for query: {}", results.size(), query);
        return results;
    }

    public void embedAndSave(HistoricalIncident incident) {
        String text = incident.getRootCause() + " " + incident.getResolution();
        incident.setEmbedding(embeddingClient.embed(text));
        repository.save(incident);
    }
}
