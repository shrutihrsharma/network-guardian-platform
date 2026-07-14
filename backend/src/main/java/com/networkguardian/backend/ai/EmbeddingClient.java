package com.networkguardian.backend.ai;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class EmbeddingClient {

    // Groq doesn't support embeddings — use OpenAI-compatible endpoint via a free provider.
    // Defaults to a local nomic-embed model via Ollama if no override is set.
    private static final String DEFAULT_EMBEDDING_URL = "http://localhost:11434/v1";
    private static final String DEFAULT_EMBEDDING_MODEL = "nomic-embed-text";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String model;
    private final String apiKey;

    public EmbeddingClient(
            @Value("${rag.embedding.base-url:" + DEFAULT_EMBEDDING_URL + "}") String baseUrl,
            @Value("${rag.embedding.model:" + DEFAULT_EMBEDDING_MODEL + "}") String model,
            @Value("${rag.embedding.api-key:ollama}") String apiKey,
            ObjectMapper objectMapper) {
        this.model = model;
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public List<Double> embed(String text) {
        Map<String, Object> body = Map.of("model", model, "input", text);

        String raw = restClient.post()
                .uri("/embeddings")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        return parseEmbedding(raw);
    }

    @SuppressWarnings("null")
    private List<Double> parseEmbedding(String raw) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode vector = root.path("data").get(0).path("embedding");
            return objectMapper.readerForListOf(Double.class).readValue(vector);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse embedding response: " + raw, e);
        }
    }
}
