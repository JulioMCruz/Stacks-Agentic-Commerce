import { openContractCall } from "@stacks/connect-react";
import { principalCV, bufferCVFromString, listCV, stringAsciiCV } from "@stacks/transactions";
import { CONTRACT_ADDRESS } from "../constants/contract";
import { NETWORK } from "../constants/network";

const VALIDATION_CONTRACT = "validation-registry";

export interface Verification {
  isVerified: boolean;
  verifiedBy: string;
  verifiedAt: number;
  proofHash: string;
  capabilities: string[];
}

export async function getVerification(agentAddress: string): Promise<Verification | null> {
  try {
    // This would call the contract in production
    return null;
  } catch (error) {
    console.error("Error getting verification:", error);
    return null;
  }
}

export async function isVerified(agentAddress: string): Promise<boolean> {
  try {
    // This would call the contract in production
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
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: VALIDATION_CONTRACT,
    functionName: "verify-agent",
    functionArgs: [
      principalCV(agentAddress),
      bufferCVFromString(proofHash),
      listCV(capabilities.map((cap) => stringAsciiCV(cap))),
    ],
    network: NETWORK,
    appDetails: {
      name: "PerkOS Stacks Agentic Commerce",
      icon: "https://your-icon-url.com/logo.png",
    },
    onFinish: (data) => {
      console.log("Agent verified:", data);
    },
    onCancel: () => {
      console.log("Verification cancelled");
    },
  });
}
