export interface IncidentSummary {
  id: string;
  severity: string;
  device: string;
  businessService: string;
  vendor: string;
  status: string;
  createdAt: string;
  location?: string;
  symptoms?: string[];
}
