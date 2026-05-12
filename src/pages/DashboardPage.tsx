import { useAuth } from '../auth/useAuth';

export function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">ProxmoxDash</h1>
        <button
          onClick={() => logout()}
          className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="p-6">
        <p className="text-zinc-500">Dashboard coming soon.</p>
      </main>
    </div>
  );
}