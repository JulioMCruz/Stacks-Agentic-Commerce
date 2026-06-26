import { request } from "@stacks/connect";
import { Cl } from "@stacks/transactions";
import { CONTRACT_ADDRESS } from "../constants/contract";
import { NETWORK_NAME } from "../constants/network";

const VALIDATION_CONTRACT = `${CONTRACT_ADDRESS}.validation-registry` as `${string}.${string}`;

export interface Verification {
  isVerified: boolean;
  verifiedBy: string;
  verifiedAt: number;
  proofHash: string;
  capabilities: string[];
}

export async function getVerification(agentAddress: string): Promise<Verification | null> {
  try {
    // TODO: wire to validation-registry get-verification read-only call
    return null;
  } catch (error) {
    console.error("Error getting verification:", error);
    return null;
  }
}

export async function isVerified(agentAddress: string): Promise<boolean> {
  try {
    // TODO: wire to validation-registry is-verified read-only call
    return false;
  } catch (error) {
    console.error("Error checking verification:", error);
    return false;
  }
}

export async function verifyAgent(
  agentAddress: string,
  proofHash: string,
  capabilities: string[]
): Promise<void> {
  await request("stx_callContract", {
    contract: VALIDATION_CONTRACT,
    functionName: "verify-agent",
    functionArgs: [
      Cl.principal(agentAddress),
      Cl.bufferFromAscii(proofHash),
      Cl.list(capabilities.map((cap) => Cl.stringAscii(cap))),
    ],
    network: NETWORK_NAME,
  });
}
