package com.networkguardian.backend.ai;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networkguardian.backend.common.dto.AIResponse;

@Component("openRouterClient")
@SuppressWarnings("null")
public class OpenRouterClient implements AIClient {

    private static final Duration TIMEOUT = Duration.ofSeconds(30);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final double temperature;
    private final String provider;

    public OpenRouterClient(
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
                .baseUrl(Objects.requireNonNull(baseUrl, "ai.base-url must not be null"))
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

        Map<String, Object> message = Map.of(
                "role", "user",
                "content", prompt
        );

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(message),
                "temperature", temperature
        );

        long start = System.currentTimeMillis();

        String rawResponse = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "http://localhost")
                .header("X-Title", "Network Guardian Platform")
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        long end = System.currentTimeMillis();

        String content = extractContent(rawResponse);

        return AIResponse.builder()
                .provider(provider())
                .model(model)
                .content(content)
                .responseTimeMs(end - start)
                .build();
    }

    @Override
    public String provider() {
        return provider;
    }

    private String extractContent(String rawResponse) {
        String safeRawResponse = Objects.requireNonNull(rawResponse, "OpenRouter returned null response body");
        try {
            JsonNode root = objectMapper.readTree(safeRawResponse);
            JsonNode choices = root.path("choices");

            if (!choices.isArray() || choices.isEmpty()) {
                throw new RuntimeException("OpenRouter response contained no choices: " + safeRawResponse);
            }

            return choices.get(0).path("message").path("content").asText();

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse OpenRouter response: " + safeRawResponse, e);
        }
    }
}