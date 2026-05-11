import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthTokens, LoginRequest, NodeStatus, VmInfo, StorageInfo } from '../types/models';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5022';

const ACCESS_TOKEN_KEY = 'proxmoxdash.accessToken';
const REFRESH_TOKEN_KEY = 'proxmoxdash.refreshToken';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (tokens: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const apiClient = axios.create({
  baseURL: API_BASE,
});

// Attach access token to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      tokenStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another request is already refreshing — queue this one
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (newToken) {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(original));
          } else {
            reject(error);
          }
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<AuthTokens>(`${API_BASE}/api/auth/refresh`, {
        refreshToken,
      });
      tokenStorage.set(data);
      refreshQueue.forEach((cb) => cb(data.accessToken));
      refreshQueue = [];
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      refreshQueue.forEach((cb) => cb(null));
      refreshQueue = [];
      tokenStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Auth endpoints
export const authApi = {
  login: (request: LoginRequest) =>
    axios.post<AuthTokens>(`${API_BASE}/api/auth/login`, request).then((r) => r.data),
  logout: (refreshToken: string) =>
    apiClient.post('/api/auth/logout', { refreshToken }),
};

// Data endpoints
export const dataApi = {
  getNodes: () => apiClient.get<NodeStatus[]>('/api/nodes').then((r) => r.data),
  getVms: () => apiClient.get<VmInfo[]>('/api/vms').then((r) => r.data),
  getLxcs: () => apiClient.get<VmInfo[]>('/api/lxcs').then((r) => r.data),
  getStorage: () => apiClient.get<StorageInfo[]>('/api/storage').then((r) => r.data),
};

// Action endpoints
export const actionApi = {
  startVm: (node: string, vmId: number) => apiClient.post(`/api/vms/${node}/${vmId}/start`),
  stopVm: (node: string, vmId: number) => apiClient.post(`/api/vms/${node}/${vmId}/stop`),
  restartVm: (node: string, vmId: number) => apiClient.post(`/api/vms/${node}/${vmId}/restart`),
  startLxc: (node: string, vmId: number) => apiClient.post(`/api/lxcs/${node}/${vmId}/start`),
  stopLxc: (node: string, vmId: number) => apiClient.post(`/api/lxcs/${node}/${vmId}/stop`),
  restartLxc: (node: string, vmId: number) => apiClient.post(`/api/lxcs/${node}/${vmId}/restart`),
};