import type { VmInfo } from '../types/models';
import { formatPercent } from '../lib/format';

interface Props {
  vm: VmInfo;
}

export function VmCard({ vm }: Props) {
  const memoryPercent = vm.memoryMax > 0 ? vm.memoryUsed / vm.memoryMax : 0;
  const isRunning = vm.status === 'running';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isRunning ? 'bg-emerald-500' : 'bg-zinc-600'
            }`}
          />
          <h3 className="font-medium truncate">{vm.name}</h3>
        </div>
        <span className="text-xs text-zinc-500 font-mono shrink-0 ml-2">
          {vm.type === 'qemu' ? 'VM' : 'LXC'} {vm.vmId}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-zinc-500 text-xs uppercase tracking-wide mb-0.5">CPU</div>
          <div className="font-mono text-zinc-200">
            {isRunning ? formatPercent(vm.cpuUsage) : '—'}
          </div>
        </div>
        <div>
          <div className="text-zinc-500 text-xs uppercase tracking-wide mb-0.5">Memory</div>
          <div className="font-mono text-zinc-200">
            {isRunning ? formatPercent(memoryPercent) : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}