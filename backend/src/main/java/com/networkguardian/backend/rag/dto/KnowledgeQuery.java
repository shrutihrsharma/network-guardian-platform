package com.networkguardian.backend.rag.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeQuery {

    private String vendor;
    private String deviceType;
    private String category;
    private List<String> tags;
    private List<String> keywords;
    private Integer maximumResults;
}