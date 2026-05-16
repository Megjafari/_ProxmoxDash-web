import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HubConnectionBuilder, type HubConnection, LogLevel } from '@microsoft/signalr';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { tokenStorage } from '../api/client';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5022';
const HUB_URL = `${API_BASE}/hubs/terminal`;

interface TerminalConnectionRequest {
  host: string;
  port: number;
  columns: number;
  rows: number;
}

export function TerminalPage() {
  const { host } = useParams<{ host: string }>();
  const navigate = useNavigate();
  const terminalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!host || !terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: 13,
      theme: {
        background: '#09090b',
        foreground: '#e4e4e7',
        cursor: '#e4e4e7',
        black: '#27272a',
        brightBlack: '#52525b',
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => tokenStorage.getAccess() ?? '',
      })
      .configureLogging(LogLevel.Information)
      .build();

    connection.on('Output', (data: string) => {
      console.log('Got output from server:', JSON.stringify(data));
      term.write(data);
    });

    let inputDisposable: { dispose: () => void } | null = null;
    let resizeDisposable: { dispose: () => void } | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let mounted = true;

    const start = async () => {
      try {
        await connection.start();
        if (!mounted) {
          await connection.stop();
          return;
        }

        const request: TerminalConnectionRequest = {
          host,
          port: 22,
          columns: term.cols,
          rows: term.rows,
        };

        await connection.invoke<string>('Connect', request);
        if (!mounted) {
          await connection.stop();
          return;
        }
        setStatus('connected');

        // Send keystrokes to backend
        inputDisposable = term.onData((data) => {
          console.log('Sending input:', JSON.stringify(data));
          void connection.invoke('Input', data);
        });

        // Tell backend when terminal is resized
        resizeDisposable = term.onResize(({ cols, rows }) => {
          void connection.invoke('Resize', cols, rows);
        });

        // Refit when window resizes
        resizeObserver = new ResizeObserver(() => {
          try {
            fitAddon.fit();
          } catch {
            // ignore — fires before terminal is ready sometimes
          }
        });
        if (terminalRef.current) {
          resizeObserver.observe(terminalRef.current);
        }

        // Nudge the shell to render its first prompt (fire-and-forget)
        void connection.invoke('Input', '\r');
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setStatus('error');
        setErrorMessage(message);
        term.write(`\r\n\x1b[31mConnection failed: ${message}\x1b[0m\r\n`);
      }
    };

    void start();

    connection.onclose(() => {
      if (!mounted) return;
      setStatus('disconnected');
      term.write('\r\n\x1b[33m[Connection closed]\x1b[0m\r\n');
    });

    return () => {
      mounted = false;
      inputDisposable?.dispose();
      resizeDisposable?.dispose();
      resizeObserver?.disconnect();
      void connection.stop();
      term.dispose();
    };
  }, [host]);

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <header className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            ← Back
          </button>
          <span className="text-zinc-700">/</span>
          <span className="font-mono text-sm">{host}</span>
        </div>
        <StatusBadge status={status} />
      </header>

      <main className="flex-1 p-4 overflow-hidden min-h-0">
        <div
          ref={terminalRef}
          className="w-full h-full bg-zinc-950 rounded border border-zinc-900 p-2 overflow-hidden"
        />
      </main>

      {errorMessage && (
        <div className="border-t border-red-900/40 bg-red-950/40 text-red-300 text-xs px-6 py-2">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'connecting' | 'connected' | 'error' | 'disconnected' }) {
  const config = {
    connecting: { label: 'Connecting...', dot: 'bg-amber-500', text: 'text-amber-300' },
    connected: { label: 'Connected', dot: 'bg-emerald-500', text: 'text-emerald-300' },
    error: { label: 'Error', dot: 'bg-red-500', text: 'text-red-300' },
    disconnected: { label: 'Disconnected', dot: 'bg-zinc-500', text: 'text-zinc-400' },
  }[status];

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className={config.text}>{config.label}</span>
    </div>
  );
}