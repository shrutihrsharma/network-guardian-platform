package com.networkguardian.backend.security.jira;

public interface JiraClient {

    boolean isValidAccountId(String accountId);

    JiraIssue createIssue(String projectKey, String summary, String description,
                          String priority, String assigneeAccountId);

    JiraIssueStatus getIssueStatus(String issueKey);

    record JiraIssue(String key, String url) {
    }

    record JiraIssueStatus(String key, String status, String assignee, java.time.LocalDateTime lastUpdated) {
    }
}
