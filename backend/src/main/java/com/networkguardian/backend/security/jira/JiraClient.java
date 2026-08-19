package com.networkguardian.backend.security.jira;

public interface JiraClient {

    boolean isValidAccountId(String accountId);

    JiraIssue createIssue(String projectKey, String summary, String description,
                          String priority, String assigneeAccountId);

    record JiraIssue(String key, String url) {
    }
}
