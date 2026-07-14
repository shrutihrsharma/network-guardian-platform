package com.networkguardian.backend.incident.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.networkguardian.backend.ai.AIDecisionModule;
import com.networkguardian.backend.common.dto.DecisionRequest;
import com.networkguardian.backend.common.dto.DecisionResponse;

@RestController
@RequestMapping("/api/decision-engines")
public class DecisionController {

    private final Map<String, AIDecisionModule> modules;

    public DecisionController(List<AIDecisionModule> moduleList) {
        this.modules = moduleList.stream()
                .collect(Collectors.toMap(
                        m -> m.moduleName().toUpperCase(),
                        m -> m));
    }

    @PostMapping("/execute")
    public ResponseEntity<DecisionResponse> execute(@RequestBody DecisionRequest request) {
        String key = request.getEngine() != null ? request.getEngine().toUpperCase() : "";
        AIDecisionModule module = modules.get(key);
        if (module == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(module.execute(request));
    }
}
