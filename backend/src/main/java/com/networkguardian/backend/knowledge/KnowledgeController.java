package com.networkguardian.backend.knowledge;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

    private final DocumentIngestionService ingestionService;
    private final KnowledgeBaseRepository repository;

    public KnowledgeController(DocumentIngestionService ingestionService, KnowledgeBaseRepository repository) {
        this.ingestionService = ingestionService;
        this.repository = repository;
    }

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, Object>> ingest(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sourceType") String sourceType) throws IOException {

        String content = new String(file.getBytes(), StandardCharsets.UTF_8);
        String sourceFile = file.getOriginalFilename();
        int chunks = ingestionService.ingest(content, sourceFile, sourceType);

        return ResponseEntity.ok(Map.of(
                "sourceFile", sourceFile,
                "sourceType", sourceType,
                "chunksStored", chunks
        ));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        List<Map<String, Object>> summary = repository.findAll().stream()
                .collect(Collectors.groupingBy(KnowledgeChunk::getSourceFile))
                .entrySet().stream()
                .map(e -> Map.<String, Object>of(
                        "sourceFile", e.getKey(),
                        "sourceType", e.getValue().get(0).getSourceType(),
                        "chunks", e.getValue().size(),
                        "ingestedAt", e.getValue().get(0).getIngestedAt().toString()
                ))
                .toList();
        return ResponseEntity.ok(summary);
    }

    @DeleteMapping("/{sourceFile}")
    public ResponseEntity<Void> delete(@PathVariable String sourceFile) {
        repository.deleteBySourceFile(sourceFile);
        return ResponseEntity.noContent().build();
    }
}
