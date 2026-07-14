package com.networkguardian.backend.ai;

import com.networkguardian.backend.common.dto.DecisionRequest;
import com.networkguardian.backend.common.dto.DecisionResponse;

/**
 * Pluggable AI decision engine contract.
 * Each operational module (Incident, Lifecycle, Compliance, …) implements this
 * interface. The generic DecisionController dispatches by module name.
 */
public interface AIDecisionModule {

    /** Canonical module name used as the routing key (e.g. "INCIDENT", "LIFECYCLE"). */
    String moduleName();

    DecisionResponse execute(DecisionRequest request);
}
