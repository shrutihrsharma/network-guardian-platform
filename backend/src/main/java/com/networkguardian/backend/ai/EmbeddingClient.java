package com.networkguardian.backend.ai;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;

@Component
public class EmbeddingClient {

    private static final String DEFAULT_EMBEDDING_MODEL = "text-embedding-004";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String model;
    private final String projectId;
    private final String location;

    public EmbeddingClient(
            @Value("${gcp.project-id}") String projectId,
            @Value("${gcp.location:us-central1}") String location,
            @Value("${rag.embedding.model:" + DEFAULT_EMBEDDING_MODEL + "}") String model,
            ObjectMapper objectMapper) {
        this.projectId = projectId;
        this.location = location;
        this.model = model;
        this.objectMapper = objectMapper;
        
        String baseUrl = String.format("https://%s-aiplatform.googleapis.com", location);
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public List<Double> embed(String text) {
        try {
            // Fetch the access token using Application Default Credentials
            GoogleCredentials credentials = GoogleCredentials.getApplicationDefault()
                    .createScoped("https://www.googleapis.com/auth/cloud-platform");
            credentials.refreshIfExpired();
            String accessToken = credentials.getAccessToken().getTokenValue();

            Map<String, Object> instance = Map.of("content", text);
            Map<String, Object> body = Map.of("instances", List.of(instance));

            String uri = String.format("/v1/projects/%s/locations/%s/publishers/google/models/%s:predict", 
                    projectId, location, model);

            String raw = restClient.post()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            return parseEmbedding(raw);
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Vertex AI Embedding API", e);
        }
    }

    @SuppressWarnings("null")
    private List<Double> parseEmbedding(String raw) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode predictions = root.path("predictions");
            if (predictions.isArray() && !predictions.isEmpty()) {
                JsonNode values = predictions.get(0).path("embeddings").path("values");
                return objectMapper.readerForListOf(Double.class).readValue(values);
            }
            throw new RuntimeException("No predictions found in response");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Vertex AI embedding response: " + raw, e);
        }
    }
}
