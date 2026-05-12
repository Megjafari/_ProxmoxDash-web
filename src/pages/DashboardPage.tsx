import { useAuth } from '../auth/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { NodeCard } from '../components/NodeCard';
import { VmCard } from '../components/VmCard';
import { StorageCard } from '../components/StorageCard';

export function DashboardPage() {
  const { logout } = useAuth();
  const { data, isLoading, error, refresh } = useDashboardData();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 bg-zinc-950 z-10">
        <h1 className="text-xl font-semibold">ProxmoxDash</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => refresh()}
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => logout()}
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {isLoading && <div className="text-zinc-500">Loading...</div>}

        {error && (
          <div className="text-red-400 bg-red-950/40 border border-red-900/40 rounded-md px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                Nodes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.nodes.map((node) => (
                  <NodeCard key={node.name} node={node} />
                ))}
              </div>
            </section>

            {data.vms.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                  Virtual Machines ({data.vms.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.vms.map((vm) => (
                    <VmCard key={`${vm.node}-${vm.vmId}`} vm={vm} />
                  ))}
                </div>
              </section>
            )}

            {data.lxcs.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                  LXC Containers ({data.lxcs.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.lxcs.map((lxc) => (
                    <VmCard key={`${lxc.node}-${lxc.vmId}`} vm={lxc} />
                  ))}
                </div>
              </section>
            )}

            {data.storage.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                  Storage
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.storage.map((s) => (
                    <StorageCard key={s.storageId} storage={s} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}