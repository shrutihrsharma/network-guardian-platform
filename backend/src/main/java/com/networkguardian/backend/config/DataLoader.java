package com.networkguardian.backend.config;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.networkguardian.backend.incident.model.Device;
import com.networkguardian.backend.incident.model.HistoricalIncident;
import com.networkguardian.backend.incident.model.Incident;
import com.networkguardian.backend.incident.model.Runbook;
import com.networkguardian.backend.lifecycle.model.SoftwareLifecycle;
import com.networkguardian.backend.incident.rag.IncidentRAGService;
import com.networkguardian.backend.repository.DecisionAuditRepository;
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.HistoricalIncidentRepository;
import com.networkguardian.backend.repository.IncidentRepository;
import com.networkguardian.backend.repository.RunbookRepository;
import com.networkguardian.backend.repository.SoftwareLifecycleRepository;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@SuppressWarnings("null")
public class DataLoader {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final IncidentRepository incidentRepository;
    private final DeviceRepository deviceRepository;
    private final RunbookRepository runbookRepository;
    private final HistoricalIncidentRepository historicalIncidentRepository;
    private final SoftwareLifecycleRepository softwareLifecycleRepository;
    private final DecisionAuditRepository decisionAuditRepository;
    private final IncidentRAGService incidentRAGService;
    private final Random random = new Random(42);

    public DataLoader(
            IncidentRepository incidentRepository,
            DeviceRepository deviceRepository,
            RunbookRepository runbookRepository,
            HistoricalIncidentRepository historicalIncidentRepository,
            SoftwareLifecycleRepository softwareLifecycleRepository,
            DecisionAuditRepository decisionAuditRepository,
            IncidentRAGService incidentRAGService) {
        this.incidentRepository = incidentRepository;
        this.deviceRepository = deviceRepository;
        this.runbookRepository = runbookRepository;
        this.historicalIncidentRepository = historicalIncidentRepository;
        this.softwareLifecycleRepository = softwareLifecycleRepository;
        this.decisionAuditRepository = decisionAuditRepository;
        this.incidentRAGService = incidentRAGService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadData() {
        log.info("Checking data seeding requirements...");

        boolean lifecycleEmpty = softwareLifecycleRepository.count() == 0;
        if (lifecycleEmpty) {
            log.info("Seeding software_lifecycle collection...");
            List<SoftwareLifecycle> lifecycles = generateLifecycles();
            softwareLifecycleRepository.saveAll(lifecycles);
            log.info("✓ Seeded {} lifecycle entries", lifecycles.size());
            deviceRepository.deleteAll();
        }

        List<Device> devices;
        if (deviceRepository.count() == 0) {
            log.info("Seeding devices (60 devices)...");
            List<SoftwareLifecycle> lifecycles = softwareLifecycleRepository.findAll();
            devices = generateDevices(lifecycles);
            deviceRepository.saveAll(devices);
            log.info("✓ Seeded {} devices", devices.size());
        } else {
            devices = deviceRepository.findAll();
        }

        if (runbookRepository.count() == 0) {
            log.info("Seeding runbooks...");
            runbookRepository.saveAll(generateRunbooks());
            log.info("✓ Seeded runbooks");
        }

        List<Incident> incidents;
        if (incidentRepository.count() == 0) {
            log.info("Seeding incidents...");
            incidents = generateIncidents(devices);
            incidentRepository.saveAll(incidents);
            log.info("✓ Seeded {} incidents", incidents.size());
        } else {
            incidents = incidentRepository.findAll();
        }

        if (historicalIncidentRepository.count() == 0) {
            log.info("Seeding historical_incidents...");
            historicalIncidentRepository.saveAll(generateHistoricalIncidents(incidents));
            log.info("✓ Seeded historical incidents");
        }

        log.info("Data seeding completed successfully.");

        backfillEmbeddings();
    }

    private void backfillEmbeddings() {
        List<HistoricalIncident> missing = historicalIncidentRepository.findAll().stream()
                .filter(h -> h.getEmbedding() == null || h.getEmbedding().isEmpty())
                .toList();
        if (missing.isEmpty()) return;
        log.info("RAG: backfilling embeddings for {} historical incidents...", missing.size());
        missing.forEach(h -> {
            try {
                incidentRAGService.embedAndSave(h);
            } catch (Exception e) {
                log.warn("RAG: failed to embed historical incident {}: {}", h.getId(), e.getMessage());
                log.warn("RAG: root cause", e);
            }
        });
        log.info("RAG: embedding backfill complete.");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  LIFECYCLE  (33 entries across 5 vendors)
    // ═══════════════════════════════════════════════════════════════════════════

    private List<SoftwareLifecycle> generateLifecycles() {
        List<SoftwareLifecycle> list = new ArrayList<>();

        // Cisco (8)
        list.add(lc("LIFE-CIS-001","Cisco","Catalyst 9300","IOS XE 16.12.8","2019-01-01","2019-06-01","2020-01-01","2022-01-01","2024-12-01","IOS XE 17.12.4","Legacy LTS release — vendor support ended Dec 2024."));
        list.add(lc("LIFE-CIS-002","Cisco","Catalyst 9500","IOS XE 17.1.3","2020-01-01","2020-07-01","2021-01-01","2023-01-01","2025-06-01","IOS XE 17.12.4","Short-lifecycle release, reached end of support June 2025."));
        list.add(lc("LIFE-CIS-003","Cisco","ASR 9000","IOS XE 17.3.7","2021-01-01","2021-07-01","2022-01-01","2025-01-01","2027-01-01","IOS XE 17.12.4","Disinvest phase — plan migration within 12 months."));
        list.add(lc("LIFE-CIS-004","Cisco","Catalyst 9300","IOS XE 17.6.1","2022-01-01","2022-07-01","2023-01-01","2027-01-01","2028-06-01","IOS XE 17.12.4","Stable LTS release, still in Maintain phase."));
        list.add(lc("LIFE-CIS-005","Cisco","Catalyst 9500","IOS XE 17.9.4","2022-09-01","2023-03-01","2024-01-01","2027-06-01","2029-01-01","IOS XE 17.12.4","Recommended for medium-term stability. Maintain phase."));
        list.add(lc("LIFE-CIS-006","Cisco","ASR 9000","IOS XE 17.12.4","2023-06-01","2024-01-01","2026-09-01","2028-01-01","2030-06-01","IOS XE 17.12.4","Latest recommended Cisco release. Active investment phase."));
        list.add(lc("LIFE-CIS-007","Cisco","Nexus 9300","NX-OS 10.2.3","2022-06-01","2023-01-01","2024-01-01","2027-01-01","2029-01-01","NX-OS 10.4.1","Stable datacenter OS. Maintain phase."));
        list.add(lc("LIFE-CIS-008","Cisco","Nexus 9300","NX-OS 10.4.1","2024-01-01","2024-09-01","2027-01-01","2029-06-01","2031-01-01","NX-OS 10.4.1","Recommended NX-OS release. Active invest phase."));

        // Juniper (7)
        list.add(lc("LIFE-JNP-001","Juniper","SRX 5400","Junos 19.4R3","2019-01-01","2019-07-01","2020-01-01","2022-01-01","2025-01-01","Junos 23.2R1","End of support reached January 2025. Immediate upgrade required."));
        list.add(lc("LIFE-JNP-002","Juniper","MX 480","Junos 20.4R3","2020-01-01","2020-07-01","2021-01-01","2023-06-01","2026-03-01","Junos 23.2R1","Reached Unsupported status March 2026. Security risk."));
        list.add(lc("LIFE-JNP-003","Juniper","EX 4400","Junos 21.2R3","2021-01-01","2021-07-01","2022-01-01","2025-06-01","2027-06-01","Junos 23.2R1","Disinvest phase. Upgrade window within 12 months."));
        list.add(lc("LIFE-JNP-004","Juniper","MX 480","Junos 21.4R3","2021-09-01","2022-03-01","2023-01-01","2027-01-01","2028-06-01","Junos 23.2R1","Extended LTS release. Maintain phase through 2027."));
        list.add(lc("LIFE-JNP-005","Juniper","SRX 5400","Junos 22.1R3","2022-01-01","2022-07-01","2023-06-01","2027-06-01","2029-01-01","Junos 23.2R1","Stable security gateway OS. Maintain phase."));
        list.add(lc("LIFE-JNP-006","Juniper","EX 4400","Junos 22.3R2","2022-09-01","2023-03-01","2026-09-01","2028-03-01","2030-01-01","Junos 23.2R1","Current invest release for EX 4400 platform."));
        list.add(lc("LIFE-JNP-007","Juniper","MX 480","Junos 23.2R1","2023-06-01","2024-03-01","2027-01-01","2029-01-01","2031-01-01","Junos 23.2R1","Latest recommended Juniper release. Long-term support."));

        // Arista (6)
        list.add(lc("LIFE-ARI-001","Arista","DCS-7050","EOS 4.24.2F","2019-01-01","2019-07-01","2020-01-01","2022-01-01","2024-06-01","EOS 4.30.1F","Unsupported since June 2024. Replace immediately."));
        list.add(lc("LIFE-ARI-002","Arista","DCS-7170","EOS 4.25.6F","2020-06-01","2021-01-01","2022-01-01","2025-06-01","2027-06-01","EOS 4.30.1F","Disinvest phase. Platform upgrade recommended within 6 months."));
        list.add(lc("LIFE-ARI-003","Arista","DCS-7280","EOS 4.26.2F","2021-01-01","2021-07-01","2022-06-01","2025-09-01","2027-09-01","EOS 4.30.1F","Disinvest phase commenced September 2025. Upgrade planned."));
        list.add(lc("LIFE-ARI-004","Arista","DCS-7050","EOS 4.28.3M","2022-06-01","2023-01-01","2024-01-01","2027-06-01","2029-01-01","EOS 4.30.1F","Standard LTS release. Active Maintain phase."));
        list.add(lc("LIFE-ARI-005","Arista","DCS-7280","EOS 4.30.1F","2023-09-01","2024-03-01","2026-09-01","2028-09-01","2030-09-01","EOS 4.30.1F","Recommended release for DCS-7280. Active invest phase."));
        list.add(lc("LIFE-ARI-006","Arista","DCS-7170","EOS 4.32.0F","2025-06-01","2026-09-01","2028-01-01","2030-01-01","2032-01-01","EOS 4.32.0F","Next-generation release in Engineering Testing. Not for production."));

        // F5 (6)
        list.add(lc("LIFE-F5-001","F5","BIG-IP 2000","BIG-IP 14.1.5","2018-01-01","2018-07-01","2019-01-01","2022-01-01","2025-03-01","BIG-IP 17.1.1","Unsupported since March 2025. Immediate upgrade required."));
        list.add(lc("LIFE-F5-002","F5","BIG-IP 5000","BIG-IP 15.1.9","2020-01-01","2020-07-01","2021-01-01","2025-09-01","2027-09-01","BIG-IP 17.1.1","Disinvest phase. Upgrade path to 17.x required."));
        list.add(lc("LIFE-F5-003","F5","BIG-IP 7000","BIG-IP 16.1.4","2021-06-01","2022-01-01","2023-06-01","2027-06-01","2029-06-01","BIG-IP 17.1.1","Stable release in Maintain phase. Good headroom."));
        list.add(lc("LIFE-F5-004","F5","BIG-IP 5000","BIG-IP 16.1.5","2022-01-01","2022-07-01","2024-01-01","2028-01-01","2030-01-01","BIG-IP 17.1.1","Maintain phase. Extended support available."));
        list.add(lc("LIFE-F5-005","F5","BIG-IP 7000","BIG-IP 17.1.0","2022-09-01","2023-06-01","2026-09-01","2028-09-01","2030-09-01","BIG-IP 17.1.1","Current invest release for BIG-IP 7000 series."));
        list.add(lc("LIFE-F5-006","F5","BIG-IP 2000","BIG-IP 17.1.1","2023-06-01","2024-03-01","2027-01-01","2029-01-01","2031-01-01","BIG-IP 17.1.1","Recommended F5 release. Active invest phase."));

        // Palo Alto (6)
        list.add(lc("LIFE-PAN-001","Palo Alto","PA-220","PAN-OS 9.0.17","2019-01-01","2019-07-01","2020-01-01","2022-01-01","2025-03-01","PAN-OS 11.0.3","Unsupported since March 2025. Security posture risk."));
        list.add(lc("LIFE-PAN-002","Palo Alto","PA-3200","PAN-OS 9.1.16","2020-01-01","2020-07-01","2021-01-01","2025-09-01","2027-09-01","PAN-OS 11.0.3","Disinvest phase. Migrate to PAN-OS 11.x."));
        list.add(lc("LIFE-PAN-003","Palo Alto","PA-7000","PAN-OS 10.1.11","2021-06-01","2022-01-01","2023-03-01","2027-03-01","2029-03-01","PAN-OS 11.0.3","Long-term Maintain release. Stable for enterprise."));
        list.add(lc("LIFE-PAN-004","Palo Alto","PA-3200","PAN-OS 10.2.7","2022-06-01","2023-01-01","2026-09-01","2028-09-01","2030-09-01","PAN-OS 11.0.3","Current invest release for PA-3200. Feature-rich."));
        list.add(lc("LIFE-PAN-005","Palo Alto","PA-7000","PAN-OS 11.0.3","2023-03-01","2024-01-01","2027-01-01","2029-01-01","2031-01-01","PAN-OS 11.0.3","Recommended release. AI-powered threat prevention."));
        list.add(lc("LIFE-PAN-006","Palo Alto","PA-220","PAN-OS 11.1.0","2025-06-01","2027-01-01","2028-06-01","2030-06-01","2032-06-01","PAN-OS 11.1.0","Next-generation release in Engineering Testing phase."));

        return list;
    }

    private SoftwareLifecycle lc(String id, String vendor, String family, String os,
                                  String eng, String invest, String maintain,
                                  String disinvest, String unsupported,
                                  String recommended, String notes) {
        return SoftwareLifecycle.builder()
                .id(id).vendor(vendor).deviceFamily(family).osVersion(os)
                .engineeringTestingDate(eng).investDate(invest)
                .maintainDate(maintain).disinvestDate(disinvest).unsupportedDate(unsupported)
                .recommendedVersion(recommended).notes(notes).build();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  DEVICES  (60 — 12 per vendor)
    // ═══════════════════════════════════════════════════════════════════════════

    private List<Device> generateDevices(List<SoftwareLifecycle> lifecycles) {
        java.util.Map<String, SoftwareLifecycle> byId = lifecycles.stream()
                .collect(java.util.stream.Collectors.toMap(SoftwareLifecycle::getId, l -> l));

        List<Device> devices = new ArrayList<>();

        // Cisco
        devices.add(dev("DEV-0001","RTR-FRA-001","Cisco","ASR 9000",  byId.get("LIFE-CIS-006"),"Frankfurt, Germany","SEPA Payments"));
        devices.add(dev("DEV-0002","SW-LON-001", "Cisco","Catalyst 9300",byId.get("LIFE-CIS-004"),"London, UK","SWIFT"));
        devices.add(dev("DEV-0003","FW-NYC-001", "Cisco","Catalyst 9500",byId.get("LIFE-CIS-005"),"New York, USA","Card Processing"));
        devices.add(dev("DEV-0004","CORE-SIN-001","Cisco","Nexus 9300", byId.get("LIFE-CIS-008"),"Singapore","Trading"));
        devices.add(dev("DEV-0005","EDGE-TOK-001","Cisco","Catalyst 9300",byId.get("LIFE-CIS-001"),"Tokyo, Japan","Identity Platform"));
        devices.add(dev("DEV-0006","RTR-SYD-001","Cisco","Catalyst 9500",byId.get("LIFE-CIS-002"),"Sydney, Australia","Retail Banking"));
        devices.add(dev("DEV-0007","SW-DUB-001", "Cisco","ASR 9000",  byId.get("LIFE-CIS-003"),"Dublin, Ireland","Mobile Banking"));
        devices.add(dev("DEV-0008","LB-MUM-001", "Cisco","Nexus 9300", byId.get("LIFE-CIS-007"),"Mumbai, India","Corporate Banking"));
        devices.add(dev("DEV-0009","APP-HKG-001","Cisco","Catalyst 9300",byId.get("LIFE-CIS-006"),"Hong Kong","Investment Banking"));
        devices.add(dev("DEV-0010","RTR-LAX-001","Cisco","Catalyst 9500",byId.get("LIFE-CIS-005"),"Los Angeles, USA","Treasury"));
        devices.add(dev("DEV-0011","FW-FRA-002", "Cisco","ASR 9000",  byId.get("LIFE-CIS-004"),"Frankfurt, Germany","SEPA Payments"));
        devices.add(dev("DEV-0012","CORE-LON-002","Cisco","Nexus 9300",byId.get("LIFE-CIS-008"),"London, UK","SWIFT"));

        // Juniper
        devices.add(dev("DEV-0013","RTR-NYC-002","Juniper","MX 480",   byId.get("LIFE-JNP-006"),"New York, USA","Card Processing"));
        devices.add(dev("DEV-0014","SW-SIN-002", "Juniper","EX 4400",  byId.get("LIFE-JNP-003"),"Singapore","Trading"));
        devices.add(dev("DEV-0015","FW-TOK-001", "Juniper","SRX 5400", byId.get("LIFE-JNP-005"),"Tokyo, Japan","Identity Platform"));
        devices.add(dev("DEV-0016","CORE-SYD-001","Juniper","MX 480",  byId.get("LIFE-JNP-007"),"Sydney, Australia","Retail Banking"));
        devices.add(dev("DEV-0017","EDGE-DUB-001","Juniper","EX 4400", byId.get("LIFE-JNP-004"),"Dublin, Ireland","Mobile Banking"));
        devices.add(dev("DEV-0018","RTR-MUM-001","Juniper","SRX 5400", byId.get("LIFE-JNP-001"),"Mumbai, India","Corporate Banking"));
        devices.add(dev("DEV-0019","SW-HKG-001", "Juniper","MX 480",   byId.get("LIFE-JNP-002"),"Hong Kong","Investment Banking"));
        devices.add(dev("DEV-0020","LB-LAX-001", "Juniper","EX 4400",  byId.get("LIFE-JNP-006"),"Los Angeles, USA","Treasury"));
        devices.add(dev("DEV-0021","APP-FRA-002","Juniper","SRX 5400", byId.get("LIFE-JNP-005"),"Frankfurt, Germany","SEPA Payments"));
        devices.add(dev("DEV-0022","RTR-LON-003","Juniper","MX 480",   byId.get("LIFE-JNP-007"),"London, UK","SWIFT"));
        devices.add(dev("DEV-0023","FW-NYC-002", "Juniper","SRX 5400", byId.get("LIFE-JNP-004"),"New York, USA","Card Processing"));
        devices.add(dev("DEV-0024","CORE-SIN-002","Juniper","EX 4400", byId.get("LIFE-JNP-006"),"Singapore","Trading"));

        // Arista
        devices.add(dev("DEV-0025","SW-TOK-002", "Arista","DCS-7280",  byId.get("LIFE-ARI-005"),"Tokyo, Japan","Identity Platform"));
        devices.add(dev("DEV-0026","CORE-SYD-002","Arista","DCS-7050", byId.get("LIFE-ARI-004"),"Sydney, Australia","Retail Banking"));
        devices.add(dev("DEV-0027","EDGE-DUB-002","Arista","DCS-7170", byId.get("LIFE-ARI-002"),"Dublin, Ireland","Mobile Banking"));
        devices.add(dev("DEV-0028","RTR-MUM-002","Arista","DCS-7280",  byId.get("LIFE-ARI-003"),"Mumbai, India","Corporate Banking"));
        devices.add(dev("DEV-0029","SW-HKG-002", "Arista","DCS-7050",  byId.get("LIFE-ARI-001"),"Hong Kong","Investment Banking"));
        devices.add(dev("DEV-0030","LB-LAX-002", "Arista","DCS-7170",  byId.get("LIFE-ARI-006"),"Los Angeles, USA","Treasury"));
        devices.add(dev("DEV-0031","APP-FRA-003","Arista","DCS-7280",  byId.get("LIFE-ARI-005"),"Frankfurt, Germany","SEPA Payments"));
        devices.add(dev("DEV-0032","RTR-LON-004","Arista","DCS-7050",  byId.get("LIFE-ARI-004"),"London, UK","SWIFT"));
        devices.add(dev("DEV-0033","FW-NYC-003", "Arista","DCS-7170",  byId.get("LIFE-ARI-003"),"New York, USA","Card Processing"));
        devices.add(dev("DEV-0034","CORE-SIN-003","Arista","DCS-7280", byId.get("LIFE-ARI-005"),"Singapore","Trading"));
        devices.add(dev("DEV-0035","EDGE-TOK-002","Arista","DCS-7050", byId.get("LIFE-ARI-004"),"Tokyo, Japan","Identity Platform"));
        devices.add(dev("DEV-0036","SW-SYD-001", "Arista","DCS-7170",  byId.get("LIFE-ARI-002"),"Sydney, Australia","Retail Banking"));

        // F5
        devices.add(dev("DEV-0037","LB-DUB-001","F5","BIG-IP 7000",   byId.get("LIFE-F5-005"),"Dublin, Ireland","Mobile Banking"));
        devices.add(dev("DEV-0038","LB-MUM-002","F5","BIG-IP 5000",   byId.get("LIFE-F5-004"),"Mumbai, India","Corporate Banking"));
        devices.add(dev("DEV-0039","LB-HKG-001","F5","BIG-IP 2000",   byId.get("LIFE-F5-006"),"Hong Kong","Investment Banking"));
        devices.add(dev("DEV-0040","LB-LAX-003","F5","BIG-IP 7000",   byId.get("LIFE-F5-003"),"Los Angeles, USA","Treasury"));
        devices.add(dev("DEV-0041","LB-FRA-003","F5","BIG-IP 5000",   byId.get("LIFE-F5-002"),"Frankfurt, Germany","SEPA Payments"));
        devices.add(dev("DEV-0042","LB-LON-002","F5","BIG-IP 2000",   byId.get("LIFE-F5-001"),"London, UK","SWIFT"));
        devices.add(dev("DEV-0043","LB-NYC-001","F5","BIG-IP 7000",   byId.get("LIFE-F5-005"),"New York, USA","Card Processing"));
        devices.add(dev("DEV-0044","LB-SIN-001","F5","BIG-IP 5000",   byId.get("LIFE-F5-004"),"Singapore","Trading"));
        devices.add(dev("DEV-0045","LB-TOK-001","F5","BIG-IP 2000",   byId.get("LIFE-F5-006"),"Tokyo, Japan","Identity Platform"));
        devices.add(dev("DEV-0046","LB-SYD-001","F5","BIG-IP 7000",   byId.get("LIFE-F5-003"),"Sydney, Australia","Retail Banking"));
        devices.add(dev("DEV-0047","LB-DUB-002","F5","BIG-IP 5000",   byId.get("LIFE-F5-002"),"Dublin, Ireland","Mobile Banking"));
        devices.add(dev("DEV-0048","LB-MUM-003","F5","BIG-IP 2000",   byId.get("LIFE-F5-006"),"Mumbai, India","Corporate Banking"));

        // Palo Alto
        devices.add(dev("DEV-0049","FW-HKG-002","Palo Alto","PA-7000",  byId.get("LIFE-PAN-005"),"Hong Kong","Investment Banking"));
        devices.add(dev("DEV-0050","FW-LAX-001","Palo Alto","PA-3200",  byId.get("LIFE-PAN-004"),"Los Angeles, USA","Treasury"));
        devices.add(dev("DEV-0051","FW-FRA-004","Palo Alto","PA-220",   byId.get("LIFE-PAN-006"),"Frankfurt, Germany","SEPA Payments"));
        devices.add(dev("DEV-0052","FW-LON-003","Palo Alto","PA-7000",  byId.get("LIFE-PAN-003"),"London, UK","SWIFT"));
        devices.add(dev("DEV-0053","FW-NYC-004","Palo Alto","PA-3200",  byId.get("LIFE-PAN-002"),"New York, USA","Card Processing"));
        devices.add(dev("DEV-0054","FW-SIN-002","Palo Alto","PA-220",   byId.get("LIFE-PAN-001"),"Singapore","Trading"));
        devices.add(dev("DEV-0055","FW-TOK-002","Palo Alto","PA-7000",  byId.get("LIFE-PAN-005"),"Tokyo, Japan","Identity Platform"));
        devices.add(dev("DEV-0056","FW-SYD-001","Palo Alto","PA-3200",  byId.get("LIFE-PAN-004"),"Sydney, Australia","Retail Banking"));
        devices.add(dev("DEV-0057","FW-DUB-002","Palo Alto","PA-220",   byId.get("LIFE-PAN-003"),"Dublin, Ireland","Mobile Banking"));
        devices.add(dev("DEV-0058","FW-MUM-002","Palo Alto","PA-7000",  byId.get("LIFE-PAN-005"),"Mumbai, India","Corporate Banking"));
        devices.add(dev("DEV-0059","FW-HKG-003","Palo Alto","PA-3200",  byId.get("LIFE-PAN-002"),"Hong Kong","Investment Banking"));
        devices.add(dev("DEV-0060","WAF-LAX-001","Palo Alto","PA-220",  byId.get("LIFE-PAN-001"),"Los Angeles, USA","Treasury"));

        return devices;
    }

    private Device dev(String id, String hostname, String vendor, String model,
                       SoftwareLifecycle lc, String location, String service) {
        return Device.builder()
                .id(id).hostname(hostname).vendor(vendor).model(model)
                .family(lc != null ? lc.getDeviceFamily() : model)
                .location(location).businessService(service)
                .osVersion(lc != null ? lc.getOsVersion() : "Unknown")
                .lifecycleStatus(deriveLifecycleStatus(lc))
                .lifecycleId(lc != null ? lc.getId() : null)
                .build();
    }

    private String deriveLifecycleStatus(SoftwareLifecycle lc) {
        if (lc == null) return "Active";
        try {
            java.time.LocalDate today = java.time.LocalDate.now();
            if (!today.isBefore(java.time.LocalDate.parse(lc.getUnsupportedDate()))) return "Critical";
            if (!today.isBefore(java.time.LocalDate.parse(lc.getDisinvestDate())))   return "Monitoring";
            if (today.isBefore(java.time.LocalDate.parse(lc.getInvestDate())))       return "Maintenance";
            return "Active";
        } catch (Exception e) {
            return "Active";
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  RUNBOOKS
    // ═══════════════════════════════════════════════════════════════════════════

    private List<Runbook> generateRunbooks() {
        return List.of(
            Runbook.builder().runbookId("RB-CERT-001").title("Certificate Renewal & Deployment")
                .owner("Infrastructure Team").version("2.1").steps(List.of(
                    "1. Verify certificate expiration date","2. Generate CSR and submit to CA",
                    "3. Download certificate chain","4. Backup current certificate",
                    "5. Import new certificate","6. Restart TLS services",
                    "7. Validate certificate chain","8. Update monitoring alerts",
                    "9. Document change","10. Notify compliance team")).build(),
            Runbook.builder().runbookId("RB-ROUTING-001").title("BGP Routing Recovery")
                .owner("Network Operations").version("3.0").steps(List.of(
                    "1. Check BGP session status","2. Verify route announcements",
                    "3. Review peering configuration","4. Check AS path filtering",
                    "5. Verify interface health","6. Clear BGP sessions if needed",
                    "7. Monitor route convergence","8. Validate traffic flow",
                    "9. Check prefix lists","10. Update CMDB")).build(),
            Runbook.builder().runbookId("RB-MEMORY-001").title("Memory Leak Containment & Recovery")
                .owner("Application Support").version("1.5").steps(List.of(
                    "1. Monitor memory utilisation","2. Identify memory-consuming processes",
                    "3. Generate memory dump","4. Analyse heap for leaks",
                    "5. Prepare graceful restart","6. Trigger controlled reboot",
                    "7. Verify service availability","8. Monitor for leak recurrence",
                    "9. Create incident ticket","10. Escalate to development team")).build(),
            Runbook.builder().runbookId("RB-FIREWALL-001").title("Firewall Rule Drift Resolution")
                .owner("Security Operations").version("2.3").steps(List.of(
                    "1. Export current firewall rules","2. Compare with baseline config",
                    "3. Identify unauthorized changes","4. Review change tickets",
                    "5. Isolate affected devices","6. Restore baseline rules",
                    "7. Test connectivity for critical services","8. Update documentation",
                    "9. Notify change advisory board","10. Schedule rule audit")).build(),
            Runbook.builder().runbookId("RB-INTERFACE-001").title("Network Interface Error Recovery")
                .owner("Network Team").version("1.8").steps(List.of(
                    "1. Check interface physical status","2. Review error counters",
                    "3. Check duplex mismatch","4. Verify cable integrity",
                    "5. Check for frame errors","6. Clear interface counters",
                    "7. Disable/enable interface","8. Monitor for error recurrence",
                    "9. Validate traffic throughput","10. Update network diagram")).build(),
            Runbook.builder().runbookId("RB-LATENCY-001").title("Application Latency Investigation")
                .owner("Application Engineering").version("1.2").steps(List.of(
                    "1. Collect baseline latency metrics","2. Identify affected services",
                    "3. Check database performance","4. Review API response times",
                    "5. Analyse network path","6. Check for packet loss",
                    "7. Review application logs","8. Check resource utilisation",
                    "9. Implement optimisation","10. Verify latency improvement")).build(),
            Runbook.builder().runbookId("RB-LOAD-001").title("Load Balancer Failover Management")
                .owner("Infrastructure").version("2.0").steps(List.of(
                    "1. Monitor pool member health","2. Check connection count",
                    "3. Verify session persistence","4. Review connection limits",
                    "5. Check backend service status","6. Test failover trigger",
                    "7. Validate traffic distribution","8. Monitor for stickiness",
                    "9. Update health check rules","10. Document failover event")).build(),
            Runbook.builder().runbookId("RB-POWER-001").title("Power Supply Failure & Redundancy")
                .owner("Data Centre Operations").version("1.6").steps(List.of(
                    "1. Verify UPS status","2. Check battery health",
                    "3. Identify failed PSU","4. Schedule replacement window",
                    "5. Notify hardware vendor","6. Prepare spare components",
                    "7. Execute hot swap procedure","8. Verify dual PSU operation",
                    "9. Test failover scenario","10. Update asset inventory")).build()
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  INCIDENTS
    // ═══════════════════════════════════════════════════════════════════════════

    private List<Incident> generateIncidents(List<Device> devices) {
        List<Incident> incidents = new ArrayList<>();
        String[] severities = {"Critical","High","Medium"};
        String[] statuses = {"OPEN","ACKNOWLEDGED","INVESTIGATING","MITIGATING","RESOLVED"};
        List<List<String>> symptomSets = List.of(
            List.of("CPU Utilisation > 95%","Memory approaching limit","High interrupt rate"),
            List.of("BGP session flapping","Route instability","Packet loss detected"),
            List.of("Memory leak identified","High GC pause time","Heap pressure increasing"),
            List.of("SSL certificate expiring in 7 days","TLS handshake failures","Chain validation errors"),
            List.of("Interface error counter increasing","Packet drops detected","Duplex mismatch possible"),
            List.of("Application latency spike detected","API response time > 2s","Database query slowdown"),
            List.of("Firewall rule drift detected","Unauthorised traffic blocked","Policy modification detected"),
            List.of("Load balancer failover triggered","Connection timeout","Session persistence issue"),
            List.of("Network bandwidth > 90%","Sustained throughput spike","Link saturation warning"),
            List.of("Power supply failure detected","UPS on battery backup","Redundancy compromised")
        );
        String[] runbookIds = {"RB-CERT-001","RB-ROUTING-001","RB-MEMORY-001","RB-FIREWALL-001",
            "RB-INTERFACE-001","RB-LATENCY-001","RB-LOAD-001","RB-POWER-001","RB-ROUTING-001","RB-MEMORY-001"};

        int id = 1;
        for (int i = 0; i < 40; i++) {
            Device device = devices.get(i % devices.size());
            incidents.add(Incident.builder()
                .id("INC-" + String.format("%04d", 1000 + id++))
                .deviceId(device.getId())
                .runbookId(runbookIds[i % runbookIds.length])
                .severity(severities[i % severities.length])
                .status(statuses[i % statuses.length])
                .symptoms(symptomSets.get(i % symptomSets.size()))
                .createdAt(LocalDateTime.now().minusHours(random.nextInt(168)))
                .build());
        }
        return incidents;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  HISTORICAL INCIDENTS
    // ═══════════════════════════════════════════════════════════════════════════

    private List<HistoricalIncident> generateHistoricalIncidents(List<Incident> incidents) {
        List<HistoricalIncident> hist = new ArrayList<>();
        String[] causes = {
            "Certificate expiration","BGP configuration error","Memory leak in application",
            "Firewall rule misconfiguration","Interface transceiver fault","Database performance degradation",
            "Unscheduled hardware reboot","Load balancer connection limit reached","Network loop detected",
            "Power supply partial failure","SFP module failure","Driver incompatibility",
            "Configuration drift","Insufficient disk space","NTP synchronisation failure"
        };
        for (int i = 0; i < 80; i++) {
            Incident inc = incidents.get(i % incidents.size());
            hist.add(HistoricalIncident.builder()
                .id(UUID.randomUUID().toString())
                .incidentId(inc.getId())
                .rootCause(causes[i % causes.length])
                .resolution("Executed remediation runbook. Applied fix and verified service restoration.")
                .resolvedInMinutes(15 + random.nextInt(180))
                .resolutionConfidence(0.75 + (random.nextDouble() * 0.25))
                .build());
        }
        return hist;
    }
}
