package com.networkguardian.backend.ai;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.ResponseHandler;
import com.networkguardian.backend.common.dto.AIResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component("vertexAiClient")
public class VertexAIClient implements AIClient {
    
    private final String projectId;
    private final String location;
    private final String modelName;
    private final String provider;

    public VertexAIClient(
            @Value("${ai.provider}") String provider,
            @Value("${gcp.project-id}") String projectId,
            @Value("${gcp.location}") String location,
            @Value("${ai.model}") String modelName) {
        this.provider = provider;
        this.projectId = projectId;
        this.location = location;
        this.modelName = modelName;
    }

    @Override
    public AIResponse generate(String prompt) {
        long start = System.currentTimeMillis();
        String extractedContent;
        
        try (VertexAI vertexAI = new VertexAI(projectId, location)) {
            GenerativeModel model = new GenerativeModel(modelName, vertexAI);
            GenerateContentResponse response = model.generateContent(prompt);
            extractedContent = ResponseHandler.getText(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate content from Vertex AI", e);
        }
        
        long end = System.currentTimeMillis();
        
        return AIResponse.builder()
                .provider(provider())
                .model(modelName)
                .content(extractedContent)
                .responseTimeMs(end - start)
                .build();
    }

    @Override
    public String provider() {
        return provider;
    }
}
