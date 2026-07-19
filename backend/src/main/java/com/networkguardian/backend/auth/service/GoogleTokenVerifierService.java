package com.networkguardian.backend.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.networkguardian.backend.auth.dto.GoogleAuthResponse;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class GoogleTokenVerifierService {

    @Value("${google.client.id}")
    private String clientId;

    private GoogleIdTokenVerifier verifier;

    /**
     * Simple in-memory cache: token hash -> verified response.
     * Avoids hitting Google's servers on every API request.
     */
    private final Map<String, CachedVerification> verificationCache = new ConcurrentHashMap<>();

    private static final long CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

    @PostConstruct
    public void init() {
        verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    /**
     * Verifies a Google ID token and extracts user information.
     * Results are cached to avoid repeated network calls to Google.
     *
     * @param idTokenString the raw ID token JWT string from the frontend
     * @return GoogleAuthResponse with user info, or null if verification fails
     */
    public GoogleAuthResponse verify(String idTokenString) {
        // Check cache first
        String cacheKey = String.valueOf(idTokenString.hashCode());
        CachedVerification cached = verificationCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.response;
        }

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                log.warn("Google ID token verification returned null — token is invalid or expired");
                verificationCache.remove(cacheKey);
                return null;
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            log.info("Google OAuth verified for user: {}", email);

            GoogleAuthResponse response = GoogleAuthResponse.builder()
                    .email(email)
                    .name(name)
                    .picture(picture)
                    .token(idTokenString)
                    .build();

            // Cache the verified result
            verificationCache.put(cacheKey, new CachedVerification(response));

            return response;

        } catch (Exception e) {
            log.error("Failed to verify Google ID token", e);
            verificationCache.remove(cacheKey);
            return null;
        }
    }

    /**
     * Simple cache entry with expiration.
     */
    private static class CachedVerification {
        final GoogleAuthResponse response;
        final long createdAt;

        CachedVerification(GoogleAuthResponse response) {
            this.response = response;
            this.createdAt = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - createdAt > CACHE_DURATION_MS;
        }
    }
}
