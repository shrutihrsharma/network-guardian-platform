package com.networkguardian.backend.ai;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.networkguardian.backend.rag.model.KnowledgeDocument;

@Component
public class EnterpriseKnowledgeSectionBuilder {

    public String appendBeforeFinalInstructions(String prompt, List<KnowledgeDocument> documents) {
        if (prompt == null || prompt.isBlank() || documents == null || documents.isEmpty()) {
            return prompt;
        }

        String section = buildSection(documents);
        int insertAt = findFinalInstructionIndex(prompt);
        if (insertAt < 0) {
            return prompt + "\n\n" + section;
        }

        return prompt.substring(0, insertAt).trim()
                + "\n\n"
                + section
                + "\n\n"
                + prompt.substring(insertAt).stripLeading();
    }

    private String buildSection(List<KnowledgeDocument> documents) {
        String documentBlocks = documents.stream()
                .map(this::formatDocument)
                .collect(Collectors.joining("\n\n"));

        return """
                ====================
                Enterprise Knowledge
                ====================
                %s
                """.formatted(documentBlocks);
    }

    private String formatDocument(KnowledgeDocument document) {
        return """
                --- Document ---
                Title: %s
                Category: %s
                Source: %s
                Content: %s
                """.formatted(
                valueOrDefault(document.getTitle()),
                valueOrDefault(document.getCategory()),
                valueOrDefault(document.getSource()),
                valueOrDefault(document.getContent()));
    }

    private int findFinalInstructionIndex(String prompt) {
        for (String marker : List.of("\nTASK\n", "\nTASK\r\n", "\nTASK", "Respond ONLY with a valid JSON object")) {
            int idx = prompt.indexOf(marker);
            if (idx >= 0) {
                return idx;
            }
        }
        return -1;
    }

    private String valueOrDefault(String value) {
        return Objects.toString(value, "N/A");
    }
}