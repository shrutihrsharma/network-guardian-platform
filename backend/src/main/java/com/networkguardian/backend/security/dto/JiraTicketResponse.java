package com.networkguardian.backend.security.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JiraTicketResponse {
    private String jiraKey;
    private String jiraUrl;
    private String status;
    private String assignee;
    private String assigneeName;
    private LocalDateTime createdAt;
}
