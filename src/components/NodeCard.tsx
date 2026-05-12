import type { NodeStatus } from '../types/models';
import { formatBytes, formatPercent, formatUptime } from '../lib/format';

interface Props {
  node: NodeStatus;
}

export function NodeCard({ node }: Props) {
  const memoryPercent = node.memoryUsed / node.memoryTotal;
  const isOnline = node.status === 'online';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-500' : 'bg-zinc-600'
            }`}
          />
          <h3 className="font-semibold">{node.name}</h3>
        </div>
        <span className="text-xs text-zinc-500 uppercase tracking-wide">
          {node.status}
        </span>
      </div>

      <div className="space-y-3">
        <Stat label="CPU" value={formatPercent(node.cpuUsage)} ratio={node.cpuUsage} />
        <Stat
          label="Memory"
          value={`${formatBytes(node.memoryUsed)} / ${formatBytes(node.memoryTotal)}`}
          ratio={memoryPercent}
        />
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Uptime</span>
          <span className="text-zinc-200 font-mono">{formatUptime(node.uptimeSeconds)}</span>
        </div>
      </div>
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  ratio: number;
}

function Stat({ label, value, ratio }: StatProps) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-200 font-mono">{value}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-zinc-300 transition-all"
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}