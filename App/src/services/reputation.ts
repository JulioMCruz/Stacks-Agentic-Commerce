import { openContractCall } from "@stacks/connect-react";
import { principalCV, uintCV, stringAsciiCV, bufferCVFromString } from "@stacks/transactions";
import { CONTRACT_ADDRESS } from "../constants/contract";
import { NETWORK } from "../constants/network";

const REPUTATION_CONTRACT = "reputation-registry";

export interface Reputation {
  totalScore: number;
  ratingCount: number;
  averageScore: number;
  completedJobs: number;
  disputedJobs: number;
}

export interface Rating {
  score: number;
  jobId: number;
  comment: string;
}

export async function getReputation(agentAddress: string): Promise<Reputation | null> {
  try {
    // This would call the contract in production
    // For now, return mock data
    return {
      totalScore: 0,
      ratingCount: 0,
      averageScore: 0,
      completedJobs: 0,
      disputedJobs: 0,
    };
  } catch (error) {
    console.error("Error getting reputation:", error);
    return null;
  }
}

export async function rateAgent(
  agentAddress: string,
  score: number,
  jobId: number,
  comment: string
): Promise<void> {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: REPUTATION_CONTRACT,
    functionName: "rate-agent",
    functionArgs: [
      principalCV(agentAddress),
      uintCV(score),
      uintCV(jobId),
      stringAsciiCV(comment),
    ],
    network: NETWORK,
    appDetails: {
      name: "Stacks Agentic Commerce",
      icon: "https://your-icon-url.com/logo.png",
    },
    onFinish: (data) => {
      console.log("Agent rated:", data);
    },
    onCancel: () => {
      console.log("Rating cancelled");
    },
  });
}

export async function hasRated(agentAddress: string, raterAddress: string): Promise<boolean> {
  try {
    // This would call the contract in production
    return false;
  } catch (error) {
    console.error("Error checking rating:", error);
    return false;
  }
}
