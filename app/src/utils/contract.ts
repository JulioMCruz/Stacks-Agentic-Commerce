import { AgentRegistryContract, AgenticCommerceContract } from '../constants/contract';

export function getAgentRegistryContract() {
  return {
    address: AgentRegistryContract.address,
    name: AgentRegistryContract.name,
    functions: {
      registerAgent: 'register-agent',
      getAgent: 'get-agent',
      agentCount: 'agent-count',
      updateAgent: 'update-agent',
      deactivateAgent: 'deactivate-agent',
      upgradeImplementation: 'upgrade-implementation',
    },
  };
}

export function getAgenticCommerceContract() {
  return {
    address: AgenticCommerceContract.address,
    name: AgenticCommerceContract.name,
    functions: {
      createJob: 'create-job',
      setBudget: 'set-budget',
      fundJob: 'fund-job',
      submitWork: 'submit-work',
      completeJob: 'complete-job',
      rejectJob: 'reject-job',
      getJob: 'get-job',
      upgradeImplementation: 'upgrade-implementation',
    },
  };
}
