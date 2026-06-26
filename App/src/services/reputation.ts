import { request } from "@stacks/connect";
import { Cl } from "@stacks/transactions";
import { CONTRACT_ADDRESS } from "../constants/contract";
import { NETWORK_NAME } from "../constants/network";

const REPUTATION_CONTRACT = `${CONTRACT_ADDRESS}.reputation-registry` as `${string}.${string}`;

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
    // TODO: wire to reputation-registry get-reputation read-only call
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
  await request("stx_callContract", {
    contract: REPUTATION_CONTRACT,
    functionName: "rate-agent",
    functionArgs: [
      Cl.principal(agentAddress),
      Cl.uint(score),
      Cl.uint(jobId),
      Cl.stringAscii(comment),
    ],
    network: NETWORK_NAME,
  });
}

export async function hasRated(agentAddress: string, raterAddress: string): Promise<boolean> {
  try {
    // TODO: wire to reputation-registry has-rated read-only call
    return false;
  } catch (error) {
    console.error("Error checking rating:", error);
    return false;
  }
}
