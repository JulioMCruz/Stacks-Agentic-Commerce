'use client';

import { useEffect, useState } from "react";
import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";
import { Wallet } from "lucide-react";

const shorten = (a: string) => `${a.slice(0, 5)}…${a.slice(-4)}`;

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);

  function refresh() {
    setAddress(getLocalStorage()?.addresses?.stx?.[0]?.address ?? null);
  }
  useEffect(() => {
    if (isConnected()) refresh();
  }, []);

  async function onConnect() {
    try {
      await connect();
      refresh();
    } catch (e) {
      console.error("Wallet connection error:", e);
    }
  }
  function onDisconnect() {
    disconnect();
    setAddress(null);
  }

  if (address) {
    return (
      <button
        onClick={onDisconnect}
        className="group inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.03] px-3 py-2 text-sm transition hover:border-white/25"
        title="Disconnect"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="font-mono text-xs text-mist-100">{shorten(address)}</span>
      </button>
    );
  }
  return (
    <button onClick={onConnect} className="btn-primary">
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">Connect Wallet</span>
      <span className="sm:hidden">Connect</span>
    </button>
  );
}
