'use client';

import { useEffect, useState } from "react";
import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

function shorten(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);

  function refreshAddress() {
    const data = getLocalStorage();
    setAddress(data?.addresses?.stx?.[0]?.address ?? null);
  }

  useEffect(() => {
    if (isConnected()) refreshAddress();
  }, []);

  async function handleConnect() {
    try {
      await connect();
      refreshAddress();
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  }

  function handleDisconnect() {
    disconnect();
    setAddress(null);
  }

  return (
    <div className="flex items-center space-x-2">
      {address ? (
        <>
          <span className="text-sm font-mono bg-gray-700 text-white px-3 py-1 rounded">
            {shorten(address)}
          </span>
          <button
            onClick={handleDisconnect}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
