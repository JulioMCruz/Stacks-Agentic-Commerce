import { AgentRegistryContract, AgenticCommerceContract } from './contract';
import { getAgentRegistryContract, getAgenticCommerceContract } from './contract';

describe('Contract Utils', () => {
  it('should get agent registry contract info', () => {
    const contract = getAgentRegistryContract();
    expect(contract.address).toBe(AgentRegistryContract.address);
    expect(contract.name).toBe(AgentRegistryContract.name);
    expect(contract.functions.registerAgent).toBe('register-agent');
  });

  it('should get agentic commerce contract info', () => {
    const contract = getAgenticCommerceContract();
    expect(contract.address).toBe(AgenticCommerceContract.address);
    expect(contract.name).toBe(AgenticCommerceContract.name);
    expect(contract.functions.createJob).toBe('create-job');
  });
});
