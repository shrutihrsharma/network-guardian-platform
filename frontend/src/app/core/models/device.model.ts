export interface DeviceInventoryItem {
  id: string;
  deviceName: string;
  hostname: string;
  vendor: string;
  deviceType: string;
  model: string;
  region: string;
  businessService: string;
  lifecycleStatus: string;
  complianceStatus: string;
  predictiveRisk: string;
  healthStatus: string;
  criticality: string;
  osVersion: string;
}

export interface DeviceFilters {
  vendor: string;
  deviceType: string;
  region: string;
  businessService: string;
  lifecycleStatus: string;
  healthStatus: string;
  predictiveRisk: string;
}
