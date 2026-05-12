import { useEffect, useState } from 'react';
import { dataApi } from '../api/client';
import type { NodeStatus, StorageInfo, VmInfo } from '../types/models';

interface DashboardData {
  nodes: NodeStatus[];
  vms: VmInfo[];
  lxcs: VmInfo[];
  storage: StorageInfo[];
}

interface UseDashboardData {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboardData(): UseDashboardData {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [nodes, vms, lxcs, storage] = await Promise.all([
        dataApi.getNodes(),
        dataApi.getVms(),
        dataApi.getLxcs(),
        dataApi.getStorage(),
      ]);
      setData({ nodes, vms, lxcs, storage });
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { data, isLoading, error, refresh: fetchAll };
}