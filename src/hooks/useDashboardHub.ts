import { useEffect } from 'react';
import { HubConnectionBuilder, type HubConnection, LogLevel } from '@microsoft/signalr';
import { tokenStorage } from '../api/client';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5022';
const HUB_URL = `${API_BASE}/hubs/dashboard`;

interface UseDashboardHubOptions {
  onNodesUpdated?: () => void;
  onVmsUpdated?: () => void;
  onLxcsUpdated?: () => void;
  onStorageUpdated?: () => void;
}

export function useDashboardHub(options: UseDashboardHubOptions) {
  useEffect(() => {
    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => tokenStorage.getAccess() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    if (options.onNodesUpdated) {
      connection.on('NodesUpdated', options.onNodesUpdated);
    }
    if (options.onVmsUpdated) {
      connection.on('VmsUpdated', options.onVmsUpdated);
    }
    if (options.onLxcsUpdated) {
      connection.on('LxcsUpdated', options.onLxcsUpdated);
    }
    if (options.onStorageUpdated) {
      connection.on('StorageUpdated', options.onStorageUpdated);
    }

    connection
      .start()
      .then(() => console.log('SignalR connected to dashboard hub'))
      .catch((err) => console.error('SignalR connection failed:', err));

    return () => {
      void connection.stop();
    };
  }, [
    options.onNodesUpdated,
    options.onVmsUpdated,
    options.onLxcsUpdated,
    options.onStorageUpdated,
  ]);
}