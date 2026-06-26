import { STACKS_MAINNET, STACKS_TESTNET, StacksNetwork } from "@stacks/network";

const isMainnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet";

// Network object for read-only calls (fetchCallReadOnlyFunction)
export const NETWORK: StacksNetwork = isMainnet ? STACKS_MAINNET : STACKS_TESTNET;

// Network name string for wallet requests (@stacks/connect request())
export const NETWORK_NAME: "mainnet" | "testnet" = isMainnet ? "mainnet" : "testnet";
