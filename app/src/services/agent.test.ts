import { AgentRegistryContract } from '../constants/contract';
import { registerAgent, getAgent, agentCount } from '../services/agent';

describe('Agent Registry Service', () => {
  it('should create registerAgent transaction', async () => {
    const result = await registerAgent('TestAgent', 'Test description', 'ST123', []);
    expect(result.contractName).toBe(AgentRegistryContract.name);
    expect(result.functionName).toBe('register-agent');
  });

  it('should create getAgent transaction', async () => {
    const result = await getAgent(1);
    expect(result.functionName).toBe('get-agent');
  });

  it('should create agentCount transaction', async () => {
    const result = await agentCount();
    expect(result.functionName).toBe('agent-count');
  });
});
