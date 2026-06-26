'use client';

import { ConnectButton } from "@stacks/connect-react";

export default function WalletConnect() {
  return (
    <div className="flex items-center space-x-2">
      <ConnectButton
        appDetails={{
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        }}
        onSignIn={(profile) => {
          console.log("Signed in:", profile);
        }}
        onSignOut={() => {
          console.log("Signed out");
        }}
      />
    </div>
  );
}
