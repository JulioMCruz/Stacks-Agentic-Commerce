import { request } from "@stacks/connect";
import { fetchCallReadOnlyFunction, cvToValue, Cl } from "@stacks/transactions";
import { CONTRACT_ADDRESS } from "../constants/contract";
import { NETWORK, NETWORK_NAME } from "../constants/network";

const VALIDATION_CONTRACT = `${CONTRACT_ADDRESS}.validation-registry` as `${string}.${string}`;

export interface Verification {
  isVerified: boolean;
  verifiedBy: string;
  verifiedAt: number;
  proofHash: string;
  capabilities: string[];
}

export async function isVerified(agentAddress: string): Promise<boolean> {
  try {
    const cv = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: "validation-registry",
      functionName: "is-verified",
      functionArgs: [Cl.principal(agentAddress)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });
    return cvToValue(cv) === true;
  } catch (error) {
    console.error("Error checking verification:", error);
    return false;
  }
}

export async function getVerification(agentAddress: string): Promise<Verification | null> {
  try {
    const cv = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: "validation-registry",
      functionName: "get-verification",
      functionArgs: [Cl.principal(agentAddress)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });
    if (cv.type !== "ok") return null;
    const t: any = cvToValue(cv).value;
    return {
      isVerified: t["is-verified"]?.value ?? false,
      verifiedBy: t["verified-by"]?.value ?? "",
      verifiedAt: Number(t["verified-at"]?.value ?? 0),
      proofHash: t["proof-hash"]?.value ?? "",
      capabilities: (t["capabilities"]?.value ?? []).map((c: any) => c.value),
    };
  } catch (error) {
    console.error("Error getting verification:", error);
    return null;
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
