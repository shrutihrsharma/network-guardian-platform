package com.networkguardian.backend.auth.dto;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String idToken;
}
