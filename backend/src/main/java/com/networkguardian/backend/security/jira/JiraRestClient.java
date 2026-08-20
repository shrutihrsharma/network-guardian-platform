package com.networkguardian.backend.security.jira;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.databind.JsonNode;

@Component
@SuppressWarnings("null")
public class JiraRestClient implements JiraClient {

    private static final Duration TIMEOUT = Duration.ofSeconds(20);

    private final RestClient restClient;
    private final String baseUrl;
    private final String userEmail;
    private final String apiToken;

    public JiraRestClient(
            RestClient.Builder restClientBuilder,
            @Value("${jira.base-url:}") String baseUrl,
            @Value("${jira.user-email:}") String userEmail,
            @Value("${jira.api-token:}") String apiToken) {
        this.baseUrl = baseUrl;
        this.userEmail = userEmail;
        this.apiToken = apiToken;
        this.restClient = restClientBuilder
                .baseUrl(baseUrl == null ? "" : baseUrl)
                .requestFactory(buildRequestFactory())
                .build();
    }

    @Override
    public boolean isValidAccountId(String accountId) {
        if (accountId == null || accountId.isBlank()) {
            return false;
        }
        try {
            restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/rest/api/3/user")
                            .queryParam("accountId", accountId).build())
                    .headers(headers -> addAuth(headers))
                    .retrieve()
                    .onStatus(status -> status.value() == 401 || status.value() == 403,
                            (request, response) -> { throw new JiraClientException("Jira authentication failed"); })
                    .toBodilessEntity();
            return true;
        } catch (JiraClientException exception) {
            throw exception;
        } catch (RestClientException exception) {
            if (exception.getMessage() != null && exception.getMessage().contains("404")) {
                return false;
            }
            throw new JiraClientException("Jira user validation failed", exception);
        }
    }

    @Override
    public JiraIssue createIssue(String projectKey, String summary, String description,
                                 String priority, String assigneeAccountId) {
        Map<String, Object> fields = new HashMap<>();
        fields.put("project", Map.of("key", projectKey));
        fields.put("summary", summary);
        fields.put("description", descriptionDocument(description));
        fields.put("issuetype", Map.of("name", "Task"));
        fields.put("priority", Map.of("name", priority));
        if (assigneeAccountId != null && !assigneeAccountId.isBlank()) {
            fields.put("assignee", Map.of("accountId", assigneeAccountId));
        }

        try {
            JsonNode response = restClient.post()
                    .uri("/rest/api/3/issue")
                    .headers(headers -> addAuth(headers))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("fields", fields))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, responseError) -> {
                        throw new JiraClientException("Jira issue creation failed with status " + responseError.getStatusCode());
                    })
                    .body(JsonNode.class);
            String key = response == null ? null : response.path("key").asText(null);
            if (key == null || key.isBlank()) {
                throw new JiraClientException("Jira returned no issue key");
            }
            return new JiraIssue(key, baseUrl.replaceAll("/$", "") + "/browse/" + key);
        } catch (JiraClientException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new JiraClientException("Jira is unavailable", exception);
        }
    }

    @Override
    public JiraIssueStatus getIssueStatus(String issueKey) {
        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/rest/api/3/issue/{key}")
                            .queryParam("fields", "status,assignee,updated").build(issueKey))
                    .headers(headers -> addAuth(headers))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, responseError) -> {
                        throw new JiraClientException("Jira issue status lookup failed with status "
                                + responseError.getStatusCode());
                    })
                    .body(JsonNode.class);
            String status = response == null ? null : response.path("fields").path("status").path("name").asText(null);
            if (status == null || status.isBlank()) {
                throw new JiraClientException("Jira returned no issue status");
            }
            String accountId = response.path("fields").path("assignee").path("accountId").asText(null);
            String updated = response.path("fields").path("updated").asText(null);
            LocalDateTime lastUpdated = updated == null || updated.isBlank()
                    ? null : OffsetDateTime.parse(updated).withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime();
            return new JiraIssueStatus(issueKey, status, accountId, lastUpdated);
        } catch (JiraClientException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new JiraClientException("Jira is unavailable", exception);
        }
    }

    private Map<String, Object> descriptionDocument(String description) {
        return Map.of(
                "type", "doc",
                "version", 1,
                "content", java.util.List.of(Map.of(
                        "type", "paragraph",
                        "content", java.util.List.of(Map.of("type", "text", "text", description)))));
    }

    private void addAuth(org.springframework.http.HttpHeaders headers) {
        String credentials = userEmail + ":" + apiToken;
        headers.setBasicAuth(Base64.getEncoder().encodeToString(credentials.getBytes()));
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
    }

    private JdkClientHttpRequestFactory buildRequestFactory() {
        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(TIMEOUT).build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(TIMEOUT);
        return factory;
    }

    public static class JiraClientException extends RuntimeException {
        public JiraClientException(String message) { super(message); }
        public JiraClientException(String message, Throwable cause) { super(message, cause); }
    }
}
