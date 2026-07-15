package com.networkguardian.backend.rag.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import com.networkguardian.backend.rag.model.KnowledgeDocument;
import com.networkguardian.backend.rag.repository.KnowledgeRepository;

@Service
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class KnowledgeSeedService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeSeedService.class);

    private final KnowledgeRepository knowledgeRepository;

    public KnowledgeSeedService(KnowledgeRepository knowledgeRepository) {
        this.knowledgeRepository = knowledgeRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedKnowledgeDocuments() {
        if (knowledgeRepository.count() > 0) {
            return;
        }

        List<KnowledgeDocument> documents = buildSeedDocuments();
        knowledgeRepository.saveAll(documents);
        log.info("Seeded {} knowledge documents for RAG retrieval", documents.size());
    }

    private List<KnowledgeDocument> buildSeedDocuments() {
        List<KnowledgeDocument> documents = new ArrayList<>();
        documents.addAll(vendorDocumentation());
        documents.addAll(runbooks());
        documents.addAll(knowledgeArticles());
        documents.addAll(compliancePolicies());
        documents.addAll(historicalRcas());
        documents.addAll(securityAdvisories());
        return documents;
    }

    private List<KnowledgeDocument> vendorDocumentation() {
        return List.of(
                doc("KNOW-VDOC-001", "Cisco IOS XE lifecycle guidance for campus switching", "Vendor Documentation",
                        "Vendor Portal", "Cisco", "Catalyst 9300",
                        List.of("ios-xe", "lifecycle", "upgrade", "campus"),
                        "Cisco recommends standardizing campus Catalyst 9300 estates on long-lived IOS XE releases and avoiding deferred trains more than one quarter after PSIRT publication. Before upgrading, confirm ROMMON compatibility, image signing validation, and post-upgrade DNA Center assurance baselines.",
                        "https://vendor.example/cisco/ios-xe/lifecycle/catalyst-9300", "2026-05-12", 0.98),
                doc("KNOW-VDOC-002", "Cisco Catalyst 9300 in-service upgrade prerequisites", "Vendor Documentation",
                        "Vendor Portal", "Cisco", "Catalyst 9300",
                        List.of("ios-xe", "issu", "maintenance", "switching"),
                        "For stacked Catalyst 9300 platforms, verify install mode, flash free space, and StackWise health before attempting ISSU. The guidance notes that policy feature changes, unsupported line cards, or stale package.conf files require a full reload upgrade instead of ISSU.",
                        "https://vendor.example/cisco/issu/c9300-prereqs", "2026-04-04", 0.95),
                doc("KNOW-VDOC-003", "Juniper MX recommended upgrade path for routing cores", "Vendor Documentation",
                        "Vendor Portal", "Juniper", "MX 480",
                        List.of("junos", "routing", "upgrade", "core"),
                        "Juniper's enterprise guidance for MX 480 chassis recommends leapfrog upgrades only across validated hop versions and requires GRES and NSR health checks before each hop. Route-engine synchronization, commit confirmed usage, and RSVP state verification are mandatory before traffic restoration.",
                        "https://vendor.example/juniper/mx480/upgrade-path", "2026-03-27", 0.97),
                doc("KNOW-VDOC-004", "Juniper SRX session preservation during cluster upgrades", "Vendor Documentation",
                        "Vendor Portal", "Juniper", "SRX 5400",
                        List.of("junos", "firewall", "cluster", "upgrade"),
                        "SRX chassis clusters preserve session state only when fabric links are healthy and node priorities remain stable during the software transition. The vendor run sequence requires pre-sync of security policies, verification of flow daemon stability, and postponement of upgrades if redundancy groups already show failover churn.",
                        "https://vendor.example/juniper/srx/session-preservation", "2026-05-02", 0.96),
                doc("KNOW-VDOC-005", "Arista EOS maintenance release selection for leaf-spine fabrics", "Vendor Documentation",
                        "Vendor Portal", "Arista", "DCS-7280",
                        List.of("eos", "leaf-spine", "maintenance", "fabric"),
                        "Arista recommends maintenance trains for production fabrics when BGP EVPN, MLAG, and streaming telemetry are all enabled together. Operators should align EOS releases across paired spines, enable rollback checkpoints, and defer adoption of feature trains until counter and queue telemetry remain stable in staging for two weeks.",
                        "https://vendor.example/arista/eos/fabric-release-selection", "2026-02-18", 0.94),
                doc("KNOW-VDOC-006", "F5 BIG-IP UCS backup and boot volume validation before upgrade", "Vendor Documentation",
                        "Vendor Portal", "F5", "BIG-IP 7000",
                        List.of("big-ip", "backup", "upgrade", "load-balancer"),
                        "F5 operational guidance requires a current UCS archive, verified QKView capture, and standby boot-location validation before any BIG-IP software install. The document also highlights that SSL key stores and iRules referencing deprecated cipher groups must be validated before failover back to the active member.",
                        "https://vendor.example/f5/bigip/ucs-upgrade-guidance", "2026-05-09", 0.97),
                doc("KNOW-VDOC-007", "Palo Alto PAN-OS content release compatibility matrix", "Vendor Documentation",
                        "Vendor Portal", "Palo Alto", "PA-3200",
                        List.of("pan-os", "content-update", "compatibility", "firewall"),
                        "The PAN-OS compatibility matrix maps threat, WildFire, and Applications and Threats content packages to supported firewall code trains. Enterprises are advised to freeze content auto-install during major code transitions and to validate custom App-ID dependencies before re-enabling scheduled updates.",
                        "https://vendor.example/paloalto/panos/content-compatibility", "2026-06-01", 0.95),
                doc("KNOW-VDOC-008", "Cisco Nexus 9300 NX-OS SMU and maintenance release guidance", "Vendor Documentation",
                        "Vendor Portal", "Cisco", "Nexus 9300",
                        List.of("nx-os", "smu", "datacenter", "upgrade"),
                        "Cisco advises using maintenance releases as the default patching baseline for Nexus 9300 switches and reserving SMUs for short-lived risk acceptance windows. Operators should document the installed package set, validate vPC consistency after activation, and remove superseded SMUs once a corrective maintenance image is approved.",
                        "https://vendor.example/cisco/nxos/smu-guidance", "2026-04-22", 0.93),
                doc("KNOW-VDOC-009", "Arista 7280 BGP convergence tuning reference", "Vendor Documentation",
                        "Vendor Portal", "Arista", "DCS-7280",
                        List.of("bgp", "routing", "convergence", "eos"),
                        "The reference describes BGP convergence tuning for EOS-based data center fabrics, including graceful restart timers, BFD fast-detect, and route-map simplification for noisy peers. It notes that aggressive timers should only be applied after control-plane CPU tests confirm headroom during simultaneous peer re-establishment.",
                        "https://vendor.example/arista/eos/bgp-convergence", "2026-03-14", 0.92),
                doc("KNOW-VDOC-010", "F5 certificate chain import behavior across BIG-IP versions", "Vendor Documentation",
                        "Vendor Portal", "F5", "BIG-IP 2000",
                        List.of("certificate", "tls", "big-ip", "pki"),
                        "Different BIG-IP releases handle chained certificate imports differently when intermediates are reused across client-ssl profiles. F5 documents recommend importing the full chain in dependency order, validating SAN coverage, and testing OCSP stapling after reloading tmm on the standby unit first.",
                        "https://vendor.example/f5/bigip/certificate-chain-behavior", "2026-05-19", 0.94));
    }

    private List<KnowledgeDocument> runbooks() {
        return List.of(
                doc("KNOW-RUN-001", "Certificate renewal and deployment runbook", "Runbook",
                        "NOC Runbook Library", "Multi-Vendor", "Load Balancer / Firewall",
                        List.of("certificate", "renewal", "change", "tls"),
                        "Confirm expiry window, generate CSR, validate subject alternative names, import the full signed chain to standby infrastructure, fail traffic, repeat on active nodes, and verify external trust. Roll back immediately if certificate chain order breaks mutual TLS, outbound proxy inspection, or device API authentication.",
                        "https://kb.internal/runbooks/certificate-renewal", "2026-06-10", 0.99),
                doc("KNOW-RUN-002", "BGP troubleshooting and service restoration runbook", "Runbook",
                        "NOC Runbook Library", "Multi-Vendor", "Core Router",
                        List.of("bgp", "routing", "outage", "recovery"),
                        "Start with peer state, interface health, and recent config changes, then compare advertised and received prefixes against approved baselines. If flap dampening or route-policy rejects are identified, restore last known good policy, clear the impacted session softly, and confirm business service path recovery before closing the incident bridge.",
                        "https://kb.internal/runbooks/bgp-restoration", "2026-04-30", 0.98),
                doc("KNOW-RUN-003", "Firewall upgrade procedure for clustered security gateways", "Runbook",
                        "NOC Runbook Library", "Multi-Vendor", "Firewall",
                        List.of("firewall", "upgrade", "cluster", "change"),
                        "Validate HA synchronization, suspend scheduled dynamic updates, snapshot policy configuration, and upgrade the passive member first. After failover and health checks, upgrade the former active node, confirm session preservation metrics, and re-enable dynamic content only after log ingestion and policy enforcement are normal.",
                        "https://kb.internal/runbooks/firewall-cluster-upgrade", "2026-05-15", 0.97),
                doc("KNOW-RUN-004", "Core switch rollback runbook after failed maintenance", "Runbook",
                        "NOC Runbook Library", "Cisco", "Nexus 9300",
                        List.of("rollback", "switching", "maintenance", "nx-os"),
                        "If post-maintenance checks fail, hold forwarding changes, compare boot variables against the approved image set, and revert using the preserved checkpoint or install rollback file. After rollback, verify vPC role stability, spanning-tree root placement, and northbound telemetry before declaring service restored.",
                        "https://kb.internal/runbooks/core-switch-rollback", "2026-03-22", 0.95),
                doc("KNOW-RUN-005", "Emergency ACL deployment for volumetric DDoS mitigation", "Runbook",
                        "NOC Runbook Library", "Multi-Vendor", "Edge Router",
                        List.of("ddos", "acl", "edge", "mitigation"),
                        "Apply temporary ACLs only from the approved emergency object set and bind them to the ingress edge closest to the attack source. The runbook requires pre-change capture of top talkers, 15-minute review intervals, and removal of the block once upstream scrubbing or rate-limiting takes over.",
                        "https://kb.internal/runbooks/ddos-acl-deployment", "2026-02-20", 0.93),
                doc("KNOW-RUN-006", "VPN tunnel failover validation checklist", "Runbook",
                        "NOC Runbook Library", "Palo Alto", "PA-7000",
                        List.of("vpn", "failover", "validation", "pan-os"),
                        "Before a maintenance window, capture active tunnel counters, monitor IKE and IPSec renegotiation, and verify route redistribution on both primary and secondary gateways. A failover is accepted only when application owners confirm transaction success and there are no asymmetric return paths through legacy peers.",
                        "https://kb.internal/runbooks/vpn-failover-validation", "2026-05-28", 0.94),
                doc("KNOW-RUN-007", "Load balancer pool member drain and return-to-service procedure", "Runbook",
                        "NOC Runbook Library", "F5", "BIG-IP 5000",
                        List.of("load-balancer", "pool", "drain", "application"),
                        "Set the pool member to disabled while allowing existing sessions to complete, confirm session counts trend to zero, then hand off to server operations for maintenance. When reintroducing the node, validate monitor status, SSL offload behavior, and persistence consistency before restoring the pool ratio.",
                        "https://kb.internal/runbooks/pool-member-drain", "2026-04-12", 0.96),
                doc("KNOW-RUN-008", "Vendor TAC handoff data collection checklist", "Runbook",
                        "NOC Runbook Library", "Multi-Vendor", "Any",
                        List.of("tac", "support", "diagnostics", "escalation"),
                        "Collect running configuration diffs, platform health output, logs covering the failure window, packet captures when possible, and a precise timeline of operator actions. The handoff is incomplete unless impact scope, software version, and any workaround already attempted are attached to the escalation record.",
                        "https://kb.internal/runbooks/tac-handoff-checklist", "2026-03-06", 0.92),
                doc("KNOW-RUN-009", "Network configuration backup and restore procedure", "Runbook",
                        "NOC Runbook Library", "Multi-Vendor", "Any",
                        List.of("backup", "restore", "configuration", "operations"),
                        "Back up startup and running configurations to the approved repository, validate checksum integrity, and store a human-readable diff with the related change record. Restoration must be tested in a lab or passive node first, with explicit verification of secrets handling and external system connectivity after restore.",
                        "https://kb.internal/runbooks/config-backup-restore", "2026-01-29", 0.95),
                doc("KNOW-RUN-010", "PSIRT emergency patching execution runbook", "Runbook",
                        "NOC Runbook Library", "Multi-Vendor", "Any",
                        List.of("psirt", "patching", "security", "emergency-change"),
                        "Classify exposure, confirm affected assets, obtain emergency CAB approval, and prioritize internet-facing or privileged-management devices first. The runbook requires documented compensating controls for any deferred patch and a 24-hour post-change review of log anomalies, performance regressions, and control-plane health.",
                        "https://kb.internal/runbooks/psirt-emergency-patching", "2026-06-13", 0.98));
    }

    private List<KnowledgeDocument> knowledgeArticles() {
        return List.of(
                doc("KNOW-KA-001", "How to interpret unsupported software policy during operations", "Knowledge Article",
                        "Internal Knowledge Base", "Multi-Vendor", "Any",
                        List.of("policy", "unsupported", "operations", "risk"),
                        "Operational teams may keep unsupported software online only under a time-bound exception approved by security and service owners. The article explains how to document compensating controls, define a removal date, and escalate when the unsupported platform underpins a tier-one business service.",
                        "https://kb.internal/articles/unsupported-software-operations", "2026-02-11", 0.91),
                doc("KNOW-KA-002", "Troubleshooting high CPU on route processors", "Knowledge Article",
                        "Internal Knowledge Base", "Cisco", "ASR 9000",
                        List.of("cpu", "routing", "troubleshooting", "control-plane"),
                        "High route-processor CPU should be separated into forwarding, routing protocol, management, or punt-path causes before remediation begins. Common triggers include excessive SNMP walks, route churn from unstable peers, and malformed traffic that forces slow-path handling.",
                        "https://kb.internal/articles/high-cpu-route-processors", "2026-03-31", 0.93),
                doc("KNOW-KA-003", "Spanning tree root drift triage in campus networks", "Knowledge Article",
                        "Internal Knowledge Base", "Cisco", "Catalyst 9300",
                        List.of("stp", "campus", "switching", "triage"),
                        "Unexpected root changes often correlate with access-switch replacements, template drift, or disabled root guard on uplinks. Confirm root bridge ID, review the last successful automation run, and compare bridge priority values against the campus baseline before making manual changes.",
                        "https://kb.internal/articles/stp-root-drift", "2026-04-08", 0.9),
                doc("KNOW-KA-004", "OSPF adjacency flaps caused by MTU mismatch", "Knowledge Article",
                        "Internal Knowledge Base", "Juniper", "MX 480",
                        List.of("ospf", "mtu", "adjacency", "routing"),
                        "Intermittent OSPF adjacency loss with otherwise healthy interfaces commonly points to hidden MTU mismatch after intermediate encapsulation changes. The article outlines validation of interface family MTU, MPLS overhead, and peer-side changes introduced by transport teams.",
                        "https://kb.internal/articles/ospf-mtu-mismatch", "2026-01-17", 0.92),
                doc("KNOW-KA-005", "PKI trust chain validation on F5 and Cisco infrastructure", "Knowledge Article",
                        "Internal Knowledge Base", "Multi-Vendor", "Load Balancer / Switch",
                        List.of("pki", "certificate", "trust-chain", "validation"),
                        "When replacing intermediate or issuing CAs, validate both inbound client trust and outbound device trust to APIs, proxies, and telemetry collectors. The article includes common failures such as imported keys without full chain order, stale trustpoint references, and CRL reachability problems.",
                        "https://kb.internal/articles/pki-trust-validation", "2026-05-07", 0.95),
                doc("KNOW-KA-006", "Junos commit script failure after template rollout", "Knowledge Article",
                        "Internal Knowledge Base", "Juniper", "EX 4400",
                        List.of("junos", "commit", "automation", "switching"),
                        "Commit failures after template rollout often occur when an op script or commit script expects interfaces not present on the target hardware profile. Validate the rendered candidate configuration, script version, and group inheritance order before retrying a commit confirmed.",
                        "https://kb.internal/articles/junos-commit-script-failure", "2026-03-03", 0.89),
                doc("KNOW-KA-007", "Correlating logs for intermittent packet loss", "Knowledge Article",
                        "Internal Knowledge Base", "Multi-Vendor", "Any",
                        List.of("packet-loss", "logs", "correlation", "troubleshooting"),
                        "Intermittent loss rarely becomes obvious in one telemetry stream, so correlate interface errors, queue drops, routing changes, and synthetic transaction failures on the same timeline. The article recommends aligning all clocks first, then comparing loss periods to control-plane churn and server maintenance records.",
                        "https://kb.internal/articles/intermittent-packet-loss-correlation", "2026-02-26", 0.9),
                doc("KNOW-KA-008", "AAA outage response using local fallback accounts", "Knowledge Article",
                        "Internal Knowledge Base", "Multi-Vendor", "Any",
                        List.of("aaa", "authentication", "fallback", "operations"),
                        "Use local fallback accounts only after confirming centralized AAA degradation and opening an incident with the identity platform team. Every use must be logged, dual-controlled where possible, and followed by password rotation plus confirmation that TACACS or RADIUS accounting is restored.",
                        "https://kb.internal/articles/aaa-local-fallback", "2026-06-02", 0.94),
                doc("KNOW-KA-009", "NTP drift impact on certificate validation and automation", "Knowledge Article",
                        "Internal Knowledge Base", "Multi-Vendor", "Any",
                        List.of("ntp", "certificate", "automation", "time-sync"),
                        "Time drift beyond a few minutes can invalidate TLS handshakes, break API token validation, and create false outage signals in certificate monitors. The article describes diagnosing stratum instability, upstream reachability issues, and asymmetric firewall policies affecting UDP/123.",
                        "https://kb.internal/articles/ntp-drift-certificates", "2026-04-27", 0.93),
                doc("KNOW-KA-010", "SNMPv3 polling failures after platform upgrade", "Knowledge Article",
                        "Internal Knowledge Base", "Arista", "DCS-7050",
                        List.of("snmpv3", "monitoring", "upgrade", "telemetry"),
                        "SNMPv3 collection often fails after upgrades when engine IDs change, auth or privacy algorithms are deprecated, or ACLs for collector subnets are reset. The recommended triage order is device logs, collector logs, user and group mapping, then packet capture on the management VRF.",
                        "https://kb.internal/articles/snmpv3-after-upgrade", "2026-03-19", 0.9));
    }

    private List<KnowledgeDocument> compliancePolicies() {
        return List.of(
                doc("KNOW-POL-001", "Unsupported software management policy", "Compliance Policy",
                        "Policy Repository", "Multi-Vendor", "Any",
                        List.of("policy", "unsupported", "lifecycle", "governance"),
                        "Production network assets must remain on vendor-supported software unless a documented exception is approved by cyber risk, operations leadership, and the relevant service owner. Exceptions require compensating controls, monthly review, and a target remediation date not exceeding two release cycles.",
                        "https://policies.internal/network/unsupported-software", "2026-01-10", 0.99),
                doc("KNOW-POL-002", "Network configuration baseline standard", "Compliance Policy",
                        "Policy Repository", "Multi-Vendor", "Any",
                        List.of("baseline", "configuration", "hardening", "standard"),
                        "Every managed network device must comply with the approved baseline covering management plane security, AAA, NTP, logging, banner content, and backup configuration targets. Deviations are permitted only through controlled waivers and must be revalidated after every major software upgrade.",
                        "https://policies.internal/network/config-baseline", "2026-02-05", 0.98),
                doc("KNOW-POL-003", "Certificate validity monitoring and renewal standard", "Compliance Policy",
                        "Policy Repository", "Multi-Vendor", "Any",
                        List.of("certificate", "monitoring", "renewal", "standard"),
                        "Certificates used on network appliances, load balancers, proxies, and device APIs must be monitored centrally with warning thresholds at 90, 45, and 14 days before expiry. Renewal evidence must include chain validation, owner acknowledgement, and post-change service verification.",
                        "https://policies.internal/network/certificate-validity", "2026-03-01", 0.99),
                doc("KNOW-POL-004", "Emergency change evidence retention policy", "Compliance Policy",
                        "Policy Repository", "Multi-Vendor", "Any",
                        List.of("emergency-change", "audit", "evidence", "policy"),
                        "Emergency changes require retained evidence of impact, approval route, commands executed, and post-change validation for a minimum of thirteen months. Screenshots alone are insufficient; machine-readable logs and configuration diffs must be preserved where available.",
                        "https://policies.internal/network/emergency-change-evidence", "2026-01-28", 0.96),
                doc("KNOW-POL-005", "Firewall rule recertification policy", "Compliance Policy",
                        "Policy Repository", "Palo Alto", "PA-7000",
                        List.of("firewall", "recertification", "access", "governance"),
                        "Internet-facing and privileged firewall rules must be recertified quarterly by the application owner and security architect. Any rule without attestation, documented owner, or business justification must be disabled pending review unless it supports an active incident response action.",
                        "https://policies.internal/network/firewall-recertification", "2026-04-02", 0.97),
                doc("KNOW-POL-006", "Cryptographic standard for network device management", "Compliance Policy",
                        "Policy Repository", "Multi-Vendor", "Any",
                        List.of("crypto", "ssh", "tls", "management-plane"),
                        "Administrative access to network devices must use approved cipher suites, minimum key lengths, and protocol versions aligned to enterprise cryptographic policy. TLS 1.0, TLS 1.1, weak MAC algorithms, and SHA-1 signed management certificates are prohibited unless an exception is active and compensating controls are enforced.",
                        "https://policies.internal/network/crypto-standard", "2026-05-25", 0.98),
                doc("KNOW-POL-007", "Vendor PSIRT remediation service level policy", "Compliance Policy",
                        "Policy Repository", "Multi-Vendor", "Any",
                        List.of("psirt", "sla", "vulnerability", "remediation"),
                        "Critical vendor advisories affecting internet-facing or privileged-management assets must be remediated or isolated within seven calendar days. High-severity advisories have a thirty-day target unless exploitability, asset exposure, or regulatory obligations require accelerated treatment.",
                        "https://policies.internal/network/psirt-remediation-sla", "2026-06-05", 0.99),
                doc("KNOW-POL-008", "Administrative access separation of duties standard", "Compliance Policy",
                        "Policy Repository", "Multi-Vendor", "Any",
                        List.of("access", "segregation", "admin", "standard"),
                        "The engineer requesting a privileged network change must not be the sole approver or validator for the same change in production. For emergency incidents, retrospective review and evidence attestation must occur within one business day.",
                        "https://policies.internal/network/separation-of-duties", "2026-02-14", 0.95),
                doc("KNOW-POL-009", "Remote administrative access MFA standard", "Compliance Policy",
                        "Policy Repository", "Multi-Vendor", "Any",
                        List.of("mfa", "remote-access", "admin", "security"),
                        "All remote administrative sessions into production network environments must traverse an MFA-enforced bastion or equivalent privileged access workflow. Break-glass paths must be tightly logged, time-limited, and subject to monthly review.",
                        "https://policies.internal/network/remote-admin-mfa", "2026-03-18", 0.97),
                doc("KNOW-POL-010", "Backup and restore validation policy for network infrastructure", "Compliance Policy",
                        "Policy Repository", "Multi-Vendor", "Any",
                        List.of("backup", "restore", "resilience", "policy"),
                        "Configuration backups are mandatory, but compliance is achieved only when restores are validated periodically on representative hardware or virtualized equivalents. Validation records must show secret handling, software version alignment, and successful recovery of management connectivity and logging.",
                        "https://policies.internal/network/backup-restore-validation", "2026-01-22", 0.96));
    }

    private List<KnowledgeDocument> historicalRcas() {
        return List.of(
                doc("KNOW-RCA-001", "Historical RCA: certificate expiry on external load balancer", "Historical RCA",
                        "Post-Incident Review", "F5", "BIG-IP 5000",
                        List.of("rca", "certificate", "expiry", "customer-impact"),
                        "A customer-facing certificate expired after ownership moved between teams without alert subscription updates. Root cause was a stale inventory record and missing dual acknowledgement during renewal handoff; corrective actions added CMDB attestation, central monitoring, and a mandatory post-renewal dashboard review.",
                        "https://kb.internal/rca/certificate-expiry-bigip", "2025-12-11", 0.97),
                doc("KNOW-RCA-002", "Historical RCA: routing failure after unauthorized route policy change", "Historical RCA",
                        "Post-Incident Review", "Juniper", "MX 480",
                        List.of("rca", "routing", "bgp", "change-failure"),
                        "A route policy update intended for one transit peer was applied to a shared policy group and suppressed critical prefixes toward two regions. The outage persisted because rollback validation focused on session state instead of prefix acceptance; the fix introduced policy unit tests and peer-specific deployment guards.",
                        "https://kb.internal/rca/routing-policy-failure", "2026-01-05", 0.96),
                doc("KNOW-RCA-003", "Historical RCA: firewall cluster split-brain during maintenance", "Historical RCA",
                        "Post-Incident Review", "Palo Alto", "PA-3200",
                        List.of("rca", "firewall", "ha", "split-brain"),
                        "A maintenance failover triggered split-brain because HA heartbeat links traversed a partially upgraded aggregation layer with inconsistent QoS marking. Corrective action moved heartbeat links to dedicated paths, added pre-change HA path validation, and blocked maintenance when HA latency exceeds the standard threshold.",
                        "https://kb.internal/rca/firewall-split-brain", "2025-11-22", 0.95),
                doc("KNOW-RCA-004", "Historical RCA: core switch memory leak after deferred software train adoption", "Historical RCA",
                        "Post-Incident Review", "Cisco", "Nexus 9300",
                        List.of("rca", "memory", "switching", "software-defect"),
                        "A deferred software train carried a memory leak in telemetry services that exhausted control-plane resources after twelve days of uptime. The platform remained online but routing adjacency churn increased; remediation standardized maintenance trains and added soak-period monitoring to release acceptance.",
                        "https://kb.internal/rca/nexus-memory-leak", "2026-02-09", 0.94),
                doc("KNOW-RCA-005", "Historical RCA: route leak from overly broad export community", "Historical RCA",
                        "Post-Incident Review", "Arista", "DCS-7280",
                        List.of("rca", "route-leak", "bgp", "fabric"),
                        "A broad export community attached by automation caused internal service prefixes to leak into a partner VRF. The issue bypassed change review because generated config diffs were truncated in the approval tool, so the remediation added full diff visibility and route-policy linting before deployment.",
                        "https://kb.internal/rca/route-leak-export-community", "2026-03-13", 0.93),
                doc("KNOW-RCA-006", "Historical RCA: SSL handshake failures after intermediate CA replacement", "Historical RCA",
                        "Post-Incident Review", "F5", "BIG-IP 7000",
                        List.of("rca", "ssl", "certificate", "application-impact"),
                        "Application traffic failed because the new intermediate CA was imported without the legacy chain still required by older clients. The fix introduced chain compatibility testing, client population review, and a staged deployment pattern that validates both modern and legacy handshake paths.",
                        "https://kb.internal/rca/ssl-handshake-intermediate-ca", "2026-04-04", 0.96),
                doc("KNOW-RCA-007", "Historical RCA: delayed PSIRT patch due to inaccurate asset ownership", "Historical RCA",
                        "Post-Incident Review", "Multi-Vendor", "Any",
                        List.of("rca", "psirt", "ownership", "governance"),
                        "A critical PSIRT patch missed its remediation window because the exposed assets were owned by a decommissioned support queue in the inventory system. Corrective actions tied patch obligations to active service owners, added exception aging reports, and required inventory validation during CAB review.",
                        "https://kb.internal/rca/psirt-patch-delay", "2026-02-25", 0.95),
                doc("KNOW-RCA-008", "Historical RCA: MPLS edge flapping from optic degradation", "Historical RCA",
                        "Post-Incident Review", "Cisco", "ASR 9000",
                        List.of("rca", "mpls", "optic", "flapping"),
                        "Repeated edge instability was initially treated as a routing defect, but deeper review showed CRC spikes and optical power drift on one carrier-facing interface. The incident exposed a monitoring gap for transceiver thresholds and led to optical telemetry alerting with ticket auto-assignment to transport support.",
                        "https://kb.internal/rca/mpls-edge-optic-degradation", "2025-10-30", 0.92),
                doc("KNOW-RCA-009", "Historical RCA: NTP drift causing API authentication failures", "Historical RCA",
                        "Post-Incident Review", "Multi-Vendor", "Any",
                        List.of("rca", "ntp", "authentication", "automation"),
                        "Automation failed across several platforms when management VRFs lost NTP reachability after an ACL hardening change. API tokens appeared invalid because clocks drifted beyond acceptable skew, so the fix included explicit NTP allow-lists, synthetic time checks, and pre-change validation for management-plane dependencies.",
                        "https://kb.internal/rca/ntp-drift-auth-failure", "2026-01-30", 0.94),
                doc("KNOW-RCA-010", "Historical RCA: rollback failure because startup variables were not preserved", "Historical RCA",
                        "Post-Incident Review", "Cisco", "Catalyst 9300",
                        List.of("rca", "rollback", "boot-variable", "upgrade"),
                        "An attempted software rollback failed because the previous boot variable and package manifest were not preserved before maintenance. Recovery required console intervention on multiple stack members, leading to a new checklist item for boot-state capture and automatic artifact preservation in pre-change jobs.",
                        "https://kb.internal/rca/rollback-boot-variable", "2026-03-21", 0.93));
    }

    private List<KnowledgeDocument> securityAdvisories() {
        return List.of(
                doc("KNOW-SEC-001", "Critical PSIRT advisory: Cisco web UI privilege escalation", "Security Advisory",
                        "Security Advisory Feed", "Cisco", "Catalyst 9300",
                        List.of("psirt", "privilege-escalation", "web-ui", "critical"),
                        "A privilege escalation vulnerability in the management web UI affects internet-reachable or internally exposed Catalyst deployments when HTTP management remains enabled. Disable the web UI where possible, restrict management exposure, and patch to the fixed IOS XE release during the emergency remediation window.",
                        "https://security.example/advisories/cisco-webui-privesc", "2026-06-12", 0.99),
                doc("KNOW-SEC-002", "Juniper J-Web authentication bypass advisory", "Security Advisory",
                        "Security Advisory Feed", "Juniper", "SRX 5400",
                        List.of("security", "j-web", "auth-bypass", "critical"),
                        "Affected SRX systems expose a J-Web authentication bypass condition when management services are reachable from untrusted networks. Immediate guidance is to disable J-Web if unused, enforce management source restrictions, and prioritize upgrade to the fixed Junos release.",
                        "https://security.example/advisories/juniper-jweb-auth-bypass", "2026-05-30", 0.98),
                doc("KNOW-SEC-003", "Arista EOS OpenSSL remediation advisory", "Security Advisory",
                        "Security Advisory Feed", "Arista", "DCS-7050",
                        List.of("security", "openssl", "tls", "patching"),
                        "Arista published a corrective advisory for an OpenSSL issue that can affect management-plane TLS sessions under specific handshake patterns. Operators should apply the maintenance release, verify eAPI automation against the new build, and confirm no custom TLS profiles rely on deprecated protocol settings.",
                        "https://security.example/advisories/arista-openssl-update", "2026-04-15", 0.95),
                doc("KNOW-SEC-004", "F5 TMUI remote code execution emergency advisory", "Security Advisory",
                        "Security Advisory Feed", "F5", "BIG-IP 7000",
                        List.of("security", "tmui", "rce", "critical"),
                        "A TMUI remote code execution issue affects BIG-IP management interfaces exposed to untrusted networks. Recommended actions are to remove public exposure, restrict access via management ACLs or bastions, capture UCS and QKView, and patch using the emergency change runbook.",
                        "https://security.example/advisories/f5-tmui-rce", "2026-06-08", 0.99),
                doc("KNOW-SEC-005", "Palo Alto GlobalProtect gateway vulnerability advisory", "Security Advisory",
                        "Security Advisory Feed", "Palo Alto", "PA-7000",
                        List.of("security", "globalprotect", "gateway", "vpn"),
                        "The advisory describes a vulnerability in GlobalProtect gateway processing that may allow unauthenticated abuse under certain configurations. Enterprises should patch exposed gateways first, review internet-facing access logs, and validate MFA and portal policy behavior after the upgrade.",
                        "https://security.example/advisories/paloalto-globalprotect", "2026-05-26", 0.97),
                doc("KNOW-SEC-006", "SSH cipher deprecation advisory for network device administration", "Security Advisory",
                        "Security Advisory Feed", "Multi-Vendor", "Any",
                        List.of("security", "ssh", "cipher", "hardening"),
                        "Legacy SSH ciphers and key exchange algorithms used by older automation clients are being withdrawn from the enterprise standard. Remove deprecated algorithms from device templates, update automation libraries, and test break-glass access paths before enforcing the new crypto baseline globally.",
                        "https://security.example/advisories/ssh-cipher-deprecation", "2026-02-07", 0.93),
                doc("KNOW-SEC-007", "Exposure advisory: default SNMP communities discovered on inherited infrastructure", "Security Advisory",
                        "Security Advisory Feed", "Multi-Vendor", "Any",
                        List.of("security", "snmp", "default-credentials", "monitoring"),
                        "A targeted audit found inherited edge and distribution devices still responding to default or weak SNMP community strings. Immediate actions include disabling SNMPv2 where possible, rotating communities, limiting collector source addresses, and accelerating SNMPv3 migration.",
                        "https://security.example/advisories/default-snmp-communities", "2026-01-14", 0.94),
                doc("KNOW-SEC-008", "TACACS shared secret rotation advisory", "Security Advisory",
                        "Security Advisory Feed", "Multi-Vendor", "Any",
                        List.of("security", "tacacs", "secret-rotation", "aaa"),
                        "Following exposure of a legacy credential archive, all TACACS shared secrets on production network devices must be rotated and validated against the primary and secondary AAA servers. Rotation should be staged, logged, and tested with fallback access ready before production rollout.",
                        "https://security.example/advisories/tacacs-secret-rotation", "2026-03-10", 0.95),
                doc("KNOW-SEC-009", "TLS 1.0 management plane decommission advisory", "Security Advisory",
                        "Security Advisory Feed", "Multi-Vendor", "Any",
                        List.of("security", "tls", "management-plane", "decommission"),
                        "TLS 1.0 and 1.1 remain enabled on a subset of management portals and API endpoints tied to older network platforms. Disable these protocols as part of the management-plane hardening program and validate monitoring, automation, and certificate compatibility against TLS 1.2 or later.",
                        "https://security.example/advisories/tls10-decommission", "2026-04-24", 0.94),
                doc("KNOW-SEC-010", "Certificate authority compromise response advisory", "Security Advisory",
                        "Security Advisory Feed", "Multi-Vendor", "Any",
                        List.of("security", "certificate", "ca-compromise", "response"),
                        "If a trusted issuing certificate authority is suspected to be compromised, identify dependent device and application certificates, revoke or replace exposed chains, and update trust stores in a controlled sequence. The advisory emphasizes inventory completeness, outage-risk assessment for mutual TLS consumers, and executive escalation when customer-facing services are involved.",
                        "https://security.example/advisories/ca-compromise-response", "2026-06-14", 0.98));
    }

    private KnowledgeDocument doc(String id, String title, String category, String source, String vendor,
                                  String deviceType, List<String> tags, String content,
                                  String referenceUrl, String lastUpdated, double confidenceScore) {
        return KnowledgeDocument.builder()
                .id(id)
                .title(title)
                .category(category)
                .source(source)
                .vendor(vendor)
                .deviceType(deviceType)
                .tags(tags)
                .content(content)
                .referenceUrl(referenceUrl)
                .lastUpdated(LocalDate.parse(lastUpdated))
                .confidenceScore(confidenceScore)
                .build();
    }
}