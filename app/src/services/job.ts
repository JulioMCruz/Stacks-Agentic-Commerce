import { Cl, uintCV } from '@stacks/transactions';
import { AgenticCommerceContract } from '../constants/contract';

const { address: contractAddress, name: contractName } = AgenticCommerceContract;

export async function createJob(
  client: string,
  evaluator: string,
  expiredAt: number,
  description: string
) {
  const args = [
    Cl.principal(client),
    Cl.principal(evaluator),
    Cl.uint(expiredAt),
    Cl.stringAscii(description),
  ];
  
  return {
    contractAddress,
    contractName,
    functionName: 'create-job',
    functionArgs: args,
  };
}

export async function setBudget(jobId: number, amount: number) {
  const args = [Cl.uint(jobId), Cl.uint(amount)];
  
  return {
    contractAddress,
    contractName,
    functionName: 'set-budget',
    functionArgs: args,
  };
}

export async function fundJob(jobId: number) {
  const args = [Cl.uint(jobId)];
  
  return {
    contractAddress,
    contractName,
    functionName: 'fund-job',
    functionArgs: args,
  };
}

export async function submitWork(jobId: number, deliverable: string) {
  const args = [Cl.uint(jobId), Cl.buffer(deliverable)];
  
  return {
    contractAddress,
    contractName,
    functionName: 'submit-work',
    functionArgs: args,
  };
}

export async function completeJob(jobId: number) {
  const args = [Cl.uint(jobId)];
  
  return {
    contractAddress,
    contractName,
    functionName: 'complete-job',
    functionArgs: args,
  };
}

export async function rejectJob(jobId: number) {
  const args = [Cl.uint(jobId)];
  
  return {
    contractAddress,
    contractName,
    functionName: 'reject-job',
    functionArgs: args,
  };
}

export async function getJob(jobId: number) {
  const args = [Cl.uint(jobId)];
  
  return {
    contractAddress,
    contractName,
    functionName: 'get-job',
    functionArgs: args,
  };
}
