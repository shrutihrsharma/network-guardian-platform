package com.networkguardian.backend.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionEvidenceItem {

    private String title;
    private String category;
    private String source;
    private String summary;
    private String referenceUrl;
}