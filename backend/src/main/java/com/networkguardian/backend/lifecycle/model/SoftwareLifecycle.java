package com.networkguardian.backend.lifecycle.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "software_lifecycle")
public class SoftwareLifecycle {

    @Id
    private String id;

    private String vendor;
    private String deviceFamily;
    private String osVersion;

    /** ISO date strings (yyyy-MM-dd) for each lifecycle milestone. */
    private String engineeringTestingDate;
    private String investDate;
    private String maintainDate;
    private String disinvestDate;
    private String unsupportedDate;

    private String recommendedVersion;
    private String notes;
}
