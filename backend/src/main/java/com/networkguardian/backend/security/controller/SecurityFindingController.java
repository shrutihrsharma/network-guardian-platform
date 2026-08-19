package com.networkguardian.backend.security.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.networkguardian.backend.common.dto.DecisionRequest;
import com.networkguardian.backend.common.dto.DecisionResponse;
import com.networkguardian.backend.security.dto.SecurityFindingResponse;
import com.networkguardian.backend.security.dto.RemediationPlan;
import com.networkguardian.backend.security.service.RemediationPlanService;
import com.networkguardian.backend.security.service.JiraIntegrationService;
import com.networkguardian.backend.security.dto.JiraTicketResponse;
import com.networkguardian.backend.security.service.SecurityDecisionService;
import com.networkguardian.backend.security.service.SecurityFindingService;

@RestController
@RequestMapping("/api/security/findings")
public class SecurityFindingController {

    private final SecurityFindingService securityFindingService;
    private final SecurityDecisionService securityDecisionService;
    private final RemediationPlanService remediationPlanService;
    private final JiraIntegrationService jiraIntegrationService;

    public SecurityFindingController(
            SecurityFindingService securityFindingService,
            SecurityDecisionService securityDecisionService,
            RemediationPlanService remediationPlanService,
            JiraIntegrationService jiraIntegrationService) {
        this.securityFindingService = securityFindingService;
        this.securityDecisionService = securityDecisionService;
        this.remediationPlanService = remediationPlanService;
        this.jiraIntegrationService = jiraIntegrationService;
    }

    @GetMapping
    public ResponseEntity<List<SecurityFindingResponse>> getFindings(
            @RequestParam(required = false) String vendor,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String businessService,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(securityFindingService.getFindings(
                vendor,
                region,
                severity,
                category,
                businessService,
                status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SecurityFindingResponse> getFindingById(@PathVariable String id) {
        return securityFindingService.getFindingById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<DecisionResponse> analyzeFinding(@PathVariable String id) {
        DecisionRequest request = DecisionRequest.builder()
                .engine("SECURITY")
                .findingId(id)
                .build();
        return ResponseEntity.ok(securityDecisionService.execute(request));
    }

    @PostMapping("/{id}/remediation-plan")
    public ResponseEntity<RemediationPlan> generateRemediationPlan(@PathVariable String id) {
        return ResponseEntity.ok(remediationPlanService.generate(id));
    }

    @PostMapping("/{id}/remediation-plan/jira")
    public ResponseEntity<JiraTicketResponse> createJiraTicket(@PathVariable String id) {
        return ResponseEntity.ok(jiraIntegrationService.createIssue(id));
    }
}

