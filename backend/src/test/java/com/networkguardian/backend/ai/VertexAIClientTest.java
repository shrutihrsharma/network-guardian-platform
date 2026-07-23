package com.networkguardian.backend.ai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.networkguardian.backend.common.dto.AIResponse;

@SpringBootTest
public class VertexAIClientTest {

    @Autowired
    private VertexAIClient vertexAiClient;

    @Test
    public void testGenerate() {
        System.out.println("Testing Vertex AI integration...");
        AIResponse response = vertexAiClient.generate("Say 'Hello Vertex AI'");
        System.out.println("Response: " + response.getContent());
    }
}
