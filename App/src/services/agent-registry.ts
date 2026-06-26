import { callReadOnlyFunction, contractPrincipalCV, uintCV, stringAsciiCV, boolCV, principalCV, listCV, tupleCV, OptionalCV, SomeCV, standardPrincipalCV, responseErrorCV, responseOkCV } from "@stacks/transactions";
import { NETWORK } from "../constants/network";
import { CONTRACT_ADDRESS, AGENT_REGISTRY_CONTRACT } from "../constants/contract";

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
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: "agent-registry",
      functionName: "get-agent",
      functionArgs: [uintCV(agentId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    if (result.type === 'ok' && result.value?.type === 'tuple') {
      const data = result.value.data;
      return {
        id: agentId,
        name: data.name?.value || '',
        description: data.description?.value || '',
        creator: data.creator?.value || '',
        wallet: data.wallet?.value || '',
        active: data.active?.value || false,
        endpoints: data.endpoints?.value?.map((ep: any) => ({
          name: ep.data.name?.value || '',
          url: ep.data.url?.value || '',
        })) || [],
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting agent:", error);
    return null;
  }
}

export async function getAgentCount(): Promise<number> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: "agent-registry",
      functionName: "get-agent-count",
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    if (result.type === 'ok' && result.value?.type === 'uint') {
      return Number(result.value.value);
    }
    return 0;
  } catch (error) {
    console.error("Error getting agent count:", error);
    return 0;
  }
}
