import { fetchCallReadOnlyFunction, cvToValue, Cl } from "@stacks/transactions";
import { NETWORK } from "../constants/network";
import { CONTRACT_ADDRESS } from "../constants/contract";

export interface Agent {
  id: number;
  name: string;
  description: string;
  creator: string;
  wallet: string;
  active: boolean;
  endpoints: { name: string; url: string }[];
}

export async function getAgent(agentId: number): Promise<Agent | null> {
  try {
    const cv = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: "agent-registry",
      functionName: "get-agent",
      functionArgs: [Cl.uint(agentId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    // get-agent returns (ok tuple) or (err u102)
    if (cv.type !== "ok") return null;
    const t: any = cvToValue(cv).value;

    return {
      id: agentId,
      name: t.name?.value ?? "",
      description: t.description?.value ?? "",
      creator: t.creator?.value ?? "",
      wallet: t.wallet?.value ?? "",
      active: t.active?.value ?? false,
      endpoints: (t.endpoints?.value ?? []).map((ep: any) => ({
        name: ep.value?.name?.value ?? "",
        url: ep.value?.url?.value ?? "",
      })),
    };
  } catch (error) {
    console.error("Error getting agent:", error);
    return null;
  }
}

export async function getAgentCount(): Promise<number> {
  try {
    const cv = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: "agent-registry",
      functionName: "get-agent-count",
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    if (cv.type !== "ok") return 0;
    return Number(cvToValue(cv).value);
  } catch (error) {
    console.error("Error getting agent count:", error);
    return 0;
  }
}
