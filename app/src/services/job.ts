import { Cl } from '@stacks/transactions';
import { AgenticCommerceContract } from '../constants/contract';

export function createJob(
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
    contractAddress: AgenticCommerceContract.address,
    contractName: AgenticCommerceContract.name,
    functionName: 'create-job',
    functionArgs: args,
  };
}

export function setBudget(jobId: number, amount: number) {
  const args = [Cl.uint(jobId), Cl.uint(amount)];
  
  return {
    contractAddress: AgenticCommerceContract.address,
    contractName: AgenticCommerceContract.name,
    functionName: 'set-budget',
    functionArgs: args,
  };
}

export function fundJob(jobId: number) {
  const args = [Cl.uint(jobId)];
  
  return {
    contractAddress: AgenticCommerceContract.address,
    contractName: AgenticCommerceContract.name,
    functionName: 'fund-job',
    functionArgs: args,
  };
}

export function submitWork(jobId: number, deliverable: string) {
  const args = [Cl.uint(jobId), Cl.buffer(deliverable)];
  
  return {
    contractAddress: AgenticCommerceContract.address,
    contractName: AgenticCommerceContract.name,
    functionName: 'submit-work',
    functionArgs: args,
  };
}

export function completeJob(jobId: number) {
  const args = [Cl.uint(jobId)];
  
  return {
    contractAddress: AgenticCommerceContract.address,
    contractName: AgenticCommerceContract.name,
    functionName: 'complete-job',
    functionArgs: args,
  };
}

export function rejectJob(jobId: number) {
  const args = [Cl.uint(jobId)];
  
  return {
    contractAddress: AgenticCommerceContract.address,
    contractName: AgenticCommerceContract.name,
    functionName: 'reject-job',
    functionArgs: args,
  };
}

export function getJob(jobId: number) {
  const args = [Cl.uint(jobId)];
  
  return {
    contractAddress: AgenticCommerceContract.address,
    contractName: AgenticCommerceContract.name,
    functionName: 'get-job',
    functionArgs: args,
  };
}
