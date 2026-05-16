import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { VmInfo } from '../types/models';
import { formatPercent } from '../lib/format';
import { actionApi } from '../api/client';

interface Props {
  vm: VmInfo;
}

type ActionState = 'idle' | 'starting' | 'stopping' | 'restarting';

export function VmCard({ vm }: Props) {
  const memoryPercent = vm.memoryMax > 0 ? vm.memoryUsed / vm.memoryMax : 0;
  const isRunning = vm.status === 'running';
  const isVm = vm.type === 'qemu';

  const [actionState, setActionState] = useState<ActionState>('idle');
  const [actionError, setActionError] = useState<string | null>(null);
  const navigate = useNavigate();

  const runAction = async (state: ActionState, call: () => Promise<unknown>) => {
    setActionState(state);
    setActionError(null);
    try {
      await call();
    } catch {
      setActionError('Action failed');
    } finally {
      setActionState('idle');
    }
  };

  const handleStart = () =>
    runAction('starting', () =>
      isVm ? actionApi.startVm(vm.node, vm.vmId) : actionApi.startLxc(vm.node, vm.vmId),
    );

  const handleStop = () =>
    runAction('stopping', () =>
      isVm ? actionApi.stopVm(vm.node, vm.vmId) : actionApi.stopLxc(vm.node, vm.vmId),
    );

  const handleRestart = () =>
    runAction('restarting', () =>
      isVm ? actionApi.restartVm(vm.node, vm.vmId) : actionApi.restartLxc(vm.node, vm.vmId),
    );

  const handleTerminal = () => {
    if (vm.ipAddress) {
      navigate(`/terminal/${vm.ipAddress}`);
    }
  };

  const busy = actionState !== 'idle';
  const terminalDisabled = !vm.ipAddress || !isRunning;
  const terminalTitle = !vm.ipAddress
    ? 'No IP configured for this VM'
    : !isRunning
      ? 'VM must be running'
      : 'Open terminal';

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
          {isVm ? 'VM' : 'LXC'} {vm.vmId}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
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

      <div className="flex gap-2 pt-3 border-t border-zinc-800">
        <button
          onClick={handleStart}
          disabled={busy || isRunning}
          className="flex-1 text-xs py-1.5 rounded bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {actionState === 'starting' ? '...' : 'Start'}
        </button>
        <button
          onClick={handleStop}
          disabled={busy || !isRunning}
          className="flex-1 text-xs py-1.5 rounded bg-red-900/40 text-red-300 hover:bg-red-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {actionState === 'stopping' ? '...' : 'Stop'}
        </button>
        <button
          onClick={handleRestart}
          disabled={busy || !isRunning}
          className="flex-1 text-xs py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {actionState === 'restarting' ? '...' : 'Restart'}
        </button>
        <button
          onClick={handleTerminal}
          disabled={terminalDisabled}
          title={terminalTitle}
          className="flex-1 text-xs py-1.5 rounded bg-sky-900/40 text-sky-300 hover:bg-sky-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Terminal
        </button>
      </div>

      {actionError && (
        <div className="mt-2 text-xs text-red-400">{actionError}</div>
      )}
    </div>
  );
}