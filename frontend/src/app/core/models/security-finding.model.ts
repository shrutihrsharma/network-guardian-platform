export interface SecurityFinding {
  id: string;
  deviceId: string;
  deviceName: string;
  vendor: string;
  region: string;
  businessService: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category:
    | 'FIREWALL'
    | 'ENCRYPTION'
    | 'CERTIFICATE'
    | 'AUTHENTICATION'
    | 'IDS'
    | 'CONFIGURATION'
    | 'NETWORK_ACCESS'
    | 'LOGGING'
    | 'VULNERABILITY';
  title: string;
  description: string;
  complianceImpact: 'PCI-DSS' | 'GDPR' | 'Internal Policy' | 'None';
  status: 'Open' | 'Mitigated' | 'Accepted';
  riskScore: number;
  affectedAssets: number;
  createdAt: string;
}

export interface SecurityFindingsFilters {
  vendor: string;
  region: string;
  category: string;
  severity: string;
  businessService: string;
  search: string;
}
