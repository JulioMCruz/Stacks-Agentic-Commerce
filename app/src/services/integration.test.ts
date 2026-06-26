import { agentCount } from './agent';
import { fundJobWithSTX, checkJobPayment } from './x402';
import { getAgentRegistryContract } from './contract';

describe('Functional Integration', () => {
  it('should get agent count from contract', async () => {
    const result = await agentCount();
    expect(result.contractName).toBe('agent-registry');
  });

  it('should fund job with STX payment', async () => {
    const result = await fundJobWithSTX(1, 1000, 'ST123');
    expect(result).toHaveProperty('success');
  });

  it('should check job payment status', async () => {
    const result = await checkJobPayment(1);
    expect(typeof result).toBe('boolean');
  });

  it('should get agent registry contract config', async () => {
    const result = await getAgentRegistryContract();
    expect(result.functions.agentCount).toBe('agent-count');
  });
});
