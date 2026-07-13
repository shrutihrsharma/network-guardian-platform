package com.networkguardian.backend.ai;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networkguardian.backend.common.dto.AIResponse;

@Component("geminiClient")
@SuppressWarnings("null")
public class GeminiClient implements AIClient {

    private static final Duration TIMEOUT = Duration.ofSeconds(30);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final double temperature;
    private final String provider;

    public GeminiClient(
            @Value("${ai.provider}") String provider,
            @Value("${ai.base-url}") String baseUrl,
            @Value("${ai.api-key}") String apiKey,
            @Value("${ai.model}") String model,
            @Value("${ai.temperature}") double temperature,
            ObjectMapper objectMapper
    ) {
        this.provider = provider;
        this.apiKey = apiKey;
        this.model = model;
        this.temperature = temperature;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(buildRequestFactory())
                .build();
    }

    private JdkClientHttpRequestFactory buildRequestFactory() {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(TIMEOUT)
                .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(TIMEOUT);
        return requestFactory;
    }

    @Override
    public AIResponse generate(String prompt) {

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(textPart));
        Map<String, Object> generationConfig = Map.of("temperature", temperature);
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content),
                "generationConfig", generationConfig
        );

        long start = System.currentTimeMillis();

        String rawResponse = restClient.post()
                .uri("/v1beta/models/{model}:generateContent?key={apiKey}", model, apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        long end = System.currentTimeMillis();

        String extractedContent = extractContent(rawResponse);

        return AIResponse.builder()
                .provider(provider())
                .model(model)
                .content(extractedContent)
                .responseTimeMs(end - start)
                .build();
    }

    @Override
    public String provider() {
        return provider;
    }

    private String extractContent(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode candidates = root.path("candidates");

            if (!candidates.isArray() || candidates.isEmpty()) {
                throw new RuntimeException("Gemini response contained no candidates: " + rawResponse);
            }

            JsonNode parts = candidates.get(0).path("content").path("parts");

            if (!parts.isArray() || parts.isEmpty()) {
                throw new RuntimeException("Gemini response contained no content parts: " + rawResponse);
            }

            return parts.get(0).path("text").asText();

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + rawResponse, e);
        }
    }
}