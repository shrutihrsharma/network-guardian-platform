package com.networkguardian.backend.ai;

import com.networkguardian.backend.common.dto.AIResponse;

public interface AIClient {

    AIResponse generate(String prompt);

    String provider();
}