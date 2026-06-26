import { AgenticCommerceContract } from '../constants/contract';
import { createJob, setBudget, fundJob, submitWork, completeJob, rejectJob, getJob } from '../services/job';

describe('Agentic Commerce Service', () => {
  it('should create createJob transaction', async () => {
    const result = await createJob('ST123', 'ST456', 1000, 'Test job');
    expect(result.contractName).toBe(AgenticCommerceContract.name);
    expect(result.functionName).toBe('create-job');
  });

  it('should create setBudget transaction', async () => {
    const result = await setBudget(1, 1000);
    expect(result.functionName).toBe('set-budget');
  });

  it('should create fundJob transaction', async () => {
    const result = await fundJob(1);
    expect(result.functionName).toBe('fund-job');
  });

  it('should create submitWork transaction', async () => {
    const result = await submitWork(1, 'test deliverable');
    expect(result.functionName).toBe('submit-work');
  });

  it('should create completeJob transaction', async () => {
    const result = await completeJob(1);
    expect(result.functionName).toBe('complete-job');
  });

  it('should create rejectJob transaction', async () => {
    const result = await rejectJob(1);
    expect(result.functionName).toBe('reject-job');
  });

  it('should create getJob transaction', async () => {
    const result = await getJob(1);
    expect(result.functionName).toBe('get-job');
  });
});
