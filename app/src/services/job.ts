// Agentic Commerce Service
import { AgenticCommerceContract } from '../constants/contract';

const { address: contractAddress, name: contractName } = AgenticCommerceContract;

export async function createJob(client: string, evaluator: string, expiredAt: number, description: string) {
  return { contractAddress, contractName };
}

export async function setBudget(jobId: number, amount: number) {
  return { contractAddress, contractName };
}

export async function fundJob(jobId: number) {
  return { contractAddress, contractName };
}

export async function submitWork(jobId: number, deliverable: string) {
  return { contractAddress, contractName };
}

export async function completeJob(jobId: number) {
  return { contractAddress, contractName };
}

export async function rejectJob(jobId: number) {
  return { contractAddress, contractName };
}
