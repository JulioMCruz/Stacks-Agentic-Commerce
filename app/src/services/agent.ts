import { Cl, uintCV } from '@stacks/transactions';
import { AgentRegistryContract } from '../constants/contract';

const { address: contractAddress, name: contractName } = AgentRegistryContract;

export function registerAgent(
  name: string,
  description: string,
  wallet: string,
  endpoints: Array<{ name: string; url: string }>
) {
  const args = [
    Cl.stringAscii(name),
    Cl.stringAscii(description),
    Cl.principal(wallet),
    Cl.list(endpoints.map(e => Cl.tuple({ name: Cl.stringAscii(e.name), url: Cl.stringAscii(e.url) }))),
  ];
  
  return {
    contractAddress,
    contractName,
    functionName: 'register-agent',
    functionArgs: args,
  };
}

export function getAgent(agentId: number) {
  const args = [Cl.uint(agentId)];
  
  return {
    contractAddress,
    contractName,
    functionName: 'get-agent',
    functionArgs: args,
  };
}

export function agentCount() {
  return {
    contractAddress,
    contractName,
    functionName: 'agent-count',
    functionArgs: [],
  };
}

export function updateAgent(
  agentId: number,
  name: string | null,
  description: string | null,
  wallet: string | null
) {
  const args = [
    Cl.uint(agentId),
    name ? Cl.some(Cl.stringAscii(name)) : Cl.none(),
    description ? Cl.some(Cl.stringAscii(description)) : Cl.none(),
    wallet ? Cl.some(Cl.principal(wallet)) : Cl.none(),
  ];
  
  return {
    contractAddress,
    contractName,
    functionName: 'update-agent',
    functionArgs: args,
  };
}

export function deactivateAgent(agentId: number) {
  const args = [Cl.uint(agentId)];
  
  return {
    contractAddress,
    contractName,
    functionName: 'deactivate-agent',
    functionArgs: args,
  };
}
