package com.networkguardian.backend.auth.controller;

import com.networkguardian.backend.auth.dto.GoogleAuthRequest;
import com.networkguardian.backend.auth.dto.GoogleAuthResponse;
import com.networkguardian.backend.auth.service.GoogleTokenVerifierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final GoogleTokenVerifierService googleTokenVerifierService;

    /**
     * Verifies a Google ID token sent from the frontend after Google Sign-In.
     * Returns the verified user profile if the token is valid.
     */
    @PostMapping("/google")
    public ResponseEntity<GoogleAuthResponse> authenticateWithGoogle(@RequestBody GoogleAuthRequest request) {
        log.info("Received Google auth request");

        if (request.getIdToken() == null || request.getIdToken().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        GoogleAuthResponse response = googleTokenVerifierService.verify(request.getIdToken());

        if (response == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Validates the current token and returns user info.
     * Used by the frontend to check if the stored token is still valid.
     */
    @PostMapping("/me")
    public ResponseEntity<GoogleAuthResponse> getCurrentUser(@RequestBody GoogleAuthRequest request) {
        if (request.getIdToken() == null || request.getIdToken().isBlank()) {
            return ResponseEntity.status(401).build();
        }

        GoogleAuthResponse response = googleTokenVerifierService.verify(request.getIdToken());

        if (response == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(response);
    }
}
