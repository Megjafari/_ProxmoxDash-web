export interface NodeStatus {
  name: string;
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  uptimeSeconds: number;
  status: string;
}

export interface VmInfo {
  vmId: number;
  name: string;
  status: string;
  cpuUsage: number;
  memoryUsed: number;
  memoryMax: number;
  cpuCount: number;
  type: string;
  node: string;
}

export interface StorageInfo {
  storageId: string;
  diskUsed: number;
  diskTotal: number;
  type: string;
  active: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}