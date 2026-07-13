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
import com.networkguardian.backend.repository.DeviceRepository;
import com.networkguardian.backend.repository.HistoricalIncidentRepository;
import com.networkguardian.backend.repository.IncidentRepository;
import com.networkguardian.backend.repository.RunbookRepository;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@SuppressWarnings("null")
public class DataLoader {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final IncidentRepository incidentRepository;
    private final DeviceRepository deviceRepository;
    private final RunbookRepository runbookRepository;
    private final HistoricalIncidentRepository historicalIncidentRepository;
    private final Random random = new Random();

    public DataLoader(
            IncidentRepository incidentRepository,
            DeviceRepository deviceRepository,
            RunbookRepository runbookRepository,
            HistoricalIncidentRepository historicalIncidentRepository) {
        this.incidentRepository = incidentRepository;
        this.deviceRepository = deviceRepository;
        this.runbookRepository = runbookRepository;
        this.historicalIncidentRepository = historicalIncidentRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadData() {
        log.info("Checking if data seeding is required...");

        List<Device> devices = deviceRepository.findAll();
        if (devices.isEmpty()) {
            log.info("Seeding devices collection...");
            devices = generateDevices();
            deviceRepository.saveAll(devices);
            log.info("✓ Seeded {} devices", devices.size());
        }

        List<Runbook> runbooks = runbookRepository.findAll();
        if (runbooks.isEmpty()) {
            log.info("Seeding runbooks collection...");
            runbooks = generateRunbooks();
            runbookRepository.saveAll(runbooks);
            log.info("✓ Seeded {} runbooks", runbooks.size());
        }

        List<Incident> incidents = incidentRepository.findAll();
        if (incidents.isEmpty()) {
            log.info("Seeding incidents collection...");
            incidents = generateIncidents(devices);
            incidentRepository.saveAll(incidents);
            log.info("✓ Seeded {} incidents", incidents.size());
        }

        if (historicalIncidentRepository.findAll().isEmpty()) {
            log.info("Seeding historical_incidents collection...");
            List<HistoricalIncident> historicalIncidents = generateHistoricalIncidents(incidents);
            historicalIncidentRepository.saveAll(historicalIncidents);
            log.info("✓ Seeded {} historical incidents", historicalIncidents.size());
        }

        log.info("Data seeding completed successfully!");
    }

    private List<Device> generateDevices() {
        List<Device> devices = new ArrayList<>();
        String[] regions = { "FRA", "LON", "NYC", "SIN", "TOK", "SYD", "DUB", "MUM", "HKG", "LAX" };
        String[] vendors = { "Cisco", "Juniper", "Palo Alto", "F5", "Arista" };
        String[] types = { "RTR", "FW", "SW", "APP", "CORE", "EDGE", "LB", "WAF" };
        String[] services = {
            "SEPA Payments", "SWIFT", "Card Processing", "Trading", "Identity Platform",
            "Retail Banking", "Mobile Banking", "Corporate Banking", "Investment Banking", "Treasury"
        };
        String[] statuses = { "Active", "Monitoring", "Critical", "Maintenance" };
        String[] osVersions = { "IOS XE 17.6", "Junos 21.2", "PAN-OS 10.1", "Linux 5.15", "vEOS 4.26" };

        int id = 1;
        for (int i = 0; i < 20; i++) {
            String region = regions[i % regions.length];
            String type = types[i % types.length];
            String vendor = vendors[i % vendors.length];
            
            Device device = Device.builder()
                    .id("DEV-" + String.format("%04d", id++))
                    .hostname(type + "-" + region + "-" + String.format("%03d", (i / regions.length) + 1))
                    .vendor(vendor)
                    .model(generateModel(vendor))
                    .location(getLocationFromRegion(region))
                    .businessService(services[i % services.length])
                    .osVersion(osVersions[i % osVersions.length])
                    .lifecycleStatus(statuses[i % statuses.length])
                    .build();
            devices.add(device);
        }

        return devices;
    }

    private List<Runbook> generateRunbooks() {
        List<Runbook> runbooks = new ArrayList<>();

        runbooks.add(Runbook.builder()
                .runbookId("RB-CERT-001")
                .title("Certificate Renewal & Deployment")
                .owner("Infrastructure Team")
                .version("2.1")
                .steps(List.of(
                    "1. Verify certificate expiration date",
                    "2. Generate CSR and submit to CA",
                    "3. Download certificate chain",
                    "4. Backup current certificate",
                    "5. Import new certificate",
                    "6. Restart TLS services",
                    "7. Validate certificate chain",
                    "8. Update monitoring alerts",
                    "9. Document change",
                    "10. Notify compliance team"
                ))
                .build());

        runbooks.add(Runbook.builder()
                .runbookId("RB-ROUTING-001")
                .title("BGP Routing Recovery")
                .owner("Network Operations")
                .version("3.0")
                .steps(List.of(
                    "1. Check BGP session status",
                    "2. Verify route announcements",
                    "3. Review peering configuration",
                    "4. Check AS path filtering",
                    "5. Verify interface health",
                    "6. Clear BGP sessions if needed",
                    "7. Monitor route convergence",
                    "8. Validate traffic flow",
                    "9. Check prefix lists",
                    "10. Update CMDB"
                ))
                .build());

        runbooks.add(Runbook.builder()
                .runbookId("RB-MEMORY-001")
                .title("Memory Leak Containment & Recovery")
                .owner("Application Support")
                .version("1.5")
                .steps(List.of(
                    "1. Monitor memory utilization",
                    "2. Identify memory-consuming processes",
                    "3. Generate memory dump",
                    "4. Analyze heap dump for leaks",
                    "5. Prepare graceful restart",
                    "6. Trigger controlled reboot",
                    "7. Verify service availability",
                    "8. Monitor for leak recurrence",
                    "9. Create incident ticket",
                    "10. Escalate to development team"
                ))
                .build());

        runbooks.add(Runbook.builder()
                .runbookId("RB-FIREWALL-001")
                .title("Firewall Rule Drift Resolution")
                .owner("Security Operations")
                .version("2.3")
                .steps(List.of(
                    "1. Export current firewall rules",
                    "2. Compare with baseline config",
                    "3. Identify unauthorized changes",
                    "4. Review change tickets",
                    "5. Isolate affected devices",
                    "6. Restore baseline rules",
                    "7. Test connectivity for critical services",
                    "8. Update documentation",
                    "9. Notify change advisory board",
                    "10. Schedule rule audit"
                ))
                .build());

        runbooks.add(Runbook.builder()
                .runbookId("RB-INTERFACE-001")
                .title("Network Interface Error Recovery")
                .owner("Network Team")
                .version("1.8")
                .steps(List.of(
                    "1. Check interface physical status",
                    "2. Review error counters",
                    "3. Check duplex mismatch",
                    "4. Verify cable integrity",
                    "5. Check for frame errors",
                    "6. Clear interface counters",
                    "7. Disable/enable interface",
                    "8. Monitor for error recurrence",
                    "9. Validate traffic throughput",
                    "10. Update network diagram"
                ))
                .build());

        runbooks.add(Runbook.builder()
                .runbookId("RB-LATENCY-001")
                .title("Application Latency Investigation")
                .owner("Application Engineering")
                .version("1.2")
                .steps(List.of(
                    "1. Collect baseline latency metrics",
                    "2. Identify affected services",
                    "3. Check database performance",
                    "4. Review API response times",
                    "5. Analyze network path",
                    "6. Check for packet loss",
                    "7. Review application logs",
                    "8. Check resource utilization",
                    "9. Implement optimization",
                    "10. Verify latency improvement"
                ))
                .build());

        runbooks.add(Runbook.builder()
                .runbookId("RB-LOAD-001")
                .title("Load Balancer Failover Management")
                .owner("Infrastructure")
                .version("2.0")
                .steps(List.of(
                    "1. Monitor pool member health",
                    "2. Check connection count",
                    "3. Verify session persistence",
                    "4. Review connection limits",
                    "5. Check backend service status",
                    "6. Test failover trigger",
                    "7. Validate traffic distribution",
                    "8. Monitor for stickiness",
                    "9. Update health check rules",
                    "10. Document failover event"
                ))
                .build());

        runbooks.add(Runbook.builder()
                .runbookId("RB-POWER-001")
                .title("Power Supply Failure & Redundancy")
                .owner("Data Center Operations")
                .version("1.6")
                .steps(List.of(
                    "1. Verify UPS status",
                    "2. Check battery health",
                    "3. Identify failed PSU",
                    "4. Schedule replacement window",
                    "5. Notify hardware vendor",
                    "6. Prepare spare components",
                    "7. Execute hot swap procedure",
                    "8. Verify dual PSU operation",
                    "9. Test failover scenario",
                    "10. Update asset inventory"
                ))
                .build());

        return runbooks;
    }

    private List<Incident> generateIncidents(List<Device> devices) {
        List<Incident> incidents = new ArrayList<>();
        String[] severities = { "Critical", "High", "Medium" };
        String[] statuses = { "OPEN", "ACKNOWLEDGED", "INVESTIGATING", "MITIGATING", "RESOLVED" };
        List<List<String>> symptomSets = List.of(
            List.of("CPU Utilization > 95%", "Memory approaching limit", "High interrupt rate"),
            List.of("BGP session flapping", "Route instability", "Packet loss detected"),
            List.of("Memory leak identified", "High GC pause time", "Heap pressure increasing"),
            List.of("SSL certificate expiring in 7 days", "TLS handshake failures", "Chain validation errors"),
            List.of("Interface error counter increasing", "Packet drops detected", "Duplex mismatch possible"),
            List.of("Application latency spike detected", "API response time > 2s", "Database query slowdown"),
            List.of("Firewall rule drift detected", "Unauthorized traffic blocked", "Policy modification detected"),
            List.of("Load balancer failover triggered", "Connection timeout", "Session persistence issue"),
            List.of("Network bandwidth > 90%", "Sustained throughput spike", "Link saturation warning"),
            List.of("Power supply failure detected", "UPS on battery backup", "Redundancy compromised")
        );

        int id = 1;
        for (int i = 0; i < 20; i++) {
            Device device = devices.get(i % devices.size());
            LocalDateTime createdAt = LocalDateTime.now().minusHours(random.nextInt(72));
            
            Incident incident = Incident.builder()
                    .id("INC-" + String.format("%04d", 1000 + id++))
                    .deviceId(device.getId())
                    .runbookId(getRunbookForSymptom(i))
                    .severity(severities[i % severities.length])
                    .status(statuses[i % statuses.length])
                    .symptoms(symptomSets.get(i % symptomSets.size()))
                    .createdAt(createdAt)
                    .build();
            incidents.add(incident);
        }

        return incidents;
    }

    private List<HistoricalIncident> generateHistoricalIncidents(List<Incident> incidents) {
        List<HistoricalIncident> historical = new ArrayList<>();
        String[] rootCauses = {
            "Certificate expiration", "BGP configuration error", "Memory leak in application",
            "Firewall rule misconfiguration", "Interface transceiver fault", "Database performance degradation",
            "Unscheduled hardware reboot", "Load balancer connection limit reached", "Network loop detected",
            "Power supply partial failure", "SFP module failure", "Driver incompatibility",
            "Configuration drift", "Insufficient disk space", "NTP synchronization failure"
        };

        for (int i = 0; i < 50; i++) {
            Incident incident = incidents.get(i % incidents.size());
            String rootCause = rootCauses[i % rootCauses.length];
            
            HistoricalIncident hist = HistoricalIncident.builder()
                    .id(UUID.randomUUID().toString())
                    .incidentId(incident.getId())
                    .rootCause(rootCause)
                    .resolution("Executed remediation runbook. Applied fix and verified service restoration.")
                    .resolvedInMinutes(15 + random.nextInt(180))
                    .resolutionConfidence(0.75 + (random.nextDouble() * 0.25))
                    .build();
            historical.add(hist);
        }

        return historical;
    }

    private String generateModel(String vendor) {
        return switch (vendor) {
            case "Cisco" -> new String[]{"Catalyst 9500", "ASR 9000", "ISR 4400"}[random.nextInt(3)];
            case "Juniper" -> new String[]{"MX480", "SRX5400", "EX4400"}[random.nextInt(3)];
            case "Palo Alto" -> new String[]{"PA-7050", "PA-3260", "PA-220"}[random.nextInt(3)];
            case "F5" -> new String[]{"BIG-IP 5250s", "BIG-IP 7250", "BIG-IP 2000s"}[random.nextInt(3)];
            case "Arista" -> new String[]{"DCS-7280SE-68", "DCS-7050SX-64", "DCS-7170-64C"}[random.nextInt(3)];
            default -> "Unknown";
        };
    }

    private String getLocationFromRegion(String region) {
        return switch (region) {
            case "FRA" -> "Frankfurt, Germany";
            case "LON" -> "London, UK";
            case "NYC" -> "New York, USA";
            case "SIN" -> "Singapore";
            case "TOK" -> "Tokyo, Japan";
            case "SYD" -> "Sydney, Australia";
            case "DUB" -> "Dublin, Ireland";
            case "MUM" -> "Mumbai, India";
            case "HKG" -> "Hong Kong";
            case "LAX" -> "Los Angeles, USA";
            default -> "Unknown";
        };
    }

    private String getRunbookForSymptom(int index) {
        String[] runbookIds = {
            "RB-CERT-001", "RB-ROUTING-001", "RB-MEMORY-001", "RB-FIREWALL-001",
            "RB-INTERFACE-001", "RB-LATENCY-001", "RB-LOAD-001", "RB-POWER-001"
        };
        return runbookIds[index % runbookIds.length];
    }
}
