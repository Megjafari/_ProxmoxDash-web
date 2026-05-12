import type { StorageInfo } from '../types/models';
import { formatBytes } from '../lib/format';

interface Props {
  storage: StorageInfo;
}

export function StorageCard({ storage }: Props) {
  const percent = storage.diskTotal > 0 ? storage.diskUsed / storage.diskTotal : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium truncate">{storage.storageId}</h3>
        <span className="text-xs text-zinc-500 uppercase tracking-wide">{storage.type}</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400 font-mono text-xs">
            {formatBytes(storage.diskUsed)} / {formatBytes(storage.diskTotal)}
          </span>
          <span className="text-zinc-200 font-mono text-xs">
            {(percent * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-300"
            style={{ width: `${Math.min(percent * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}