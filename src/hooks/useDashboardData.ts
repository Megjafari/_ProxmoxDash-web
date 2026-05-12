import { useCallback, useEffect, useState } from 'react';
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

async function fetchDashboard(): Promise<DashboardData> {
  const [nodes, vms, lxcs, storage] = await Promise.all([
    dataApi.getNodes(),
    dataApi.getVms(),
    dataApi.getLxcs(),
    dataApi.getStorage(),
  ]);
  return { nodes, vms, lxcs, storage };
}

export function useDashboardData(): UseDashboardData {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchDashboard()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load dashboard data.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await fetchDashboard();
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load dashboard data.');
    }
  }, []);

  return { data, isLoading, error, refresh };
}