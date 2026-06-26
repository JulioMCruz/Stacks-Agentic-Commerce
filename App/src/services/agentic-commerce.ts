import { callReadOnlyFunction, uintCV, stringAsciiCV, principalCV, optionalCV, noneCV, someCV, bufferCVFromString } from "@stacks/transactions";
import { NETWORK } from "../constants/network";
import { CONTRACT_ADDRESS, AGENTIC_COMMERCE_CONTRACT } from "../constants/contract";

export interface Job {
  id: number;
  client: string;
  provider?: string;
  evaluator: string;
  description: string;
  budget: number;
  expiredAt: number;
  status: number;
  deliverable?: string;
}

export async function getJob(jobId: number): Promise<Job | null> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: "agentic-commerce",
      functionName: "get-job",
      functionArgs: [uintCV(jobId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    if (result.type === 'ok' && result.value?.type === 'tuple') {
      const data = result.value.data;
      return {
        id: jobId,
        client: data.client?.value || '',
        provider: data.provider?.value?.value,
        evaluator: data.evaluator?.value || '',
        description: data.description?.value || '',
        budget: Number(data.budget?.value) || 0,
        expiredAt: Number(data['expired-at']?.value) || 0,
        status: Number(data.status?.value) || 0,
        deliverable: data.deliverable?.value?.value,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting job:", error);
    return null;
  }
}

export async function getJobCount(): Promise<number> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: "agentic-commerce",
      functionName: "get-job-count",
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    if (result.type === 'ok' && result.value?.type === 'uint') {
      return Number(result.value.value);
    }
    return 0;
  } catch (error) {
    console.error("Error getting job count:", error);
    return 0;
  }
}

export async function getEscrowBalance(jobId: number): Promise<number> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: "agentic-commerce",
      functionName: "get-escrow-balance",
      functionArgs: [uintCV(jobId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    if (result.type === 'ok' && result.value?.type === 'uint') {
      return Number(result.value.value);
    }
    return 0;
  } catch (error) {
    console.error("Error getting escrow balance:", error);
    return 0;
  }
}
