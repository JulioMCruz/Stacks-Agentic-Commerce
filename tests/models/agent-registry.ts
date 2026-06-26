import { Clarinet, Chain, types } from 'clarinet';

export function models() {
  const model = {
    agent_registry: {
      address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      contracts: {
        agent_registry: {
          path: 'contracts/agent-registry.clar',
        },
      },
    },
    agentic_commerce: {
      address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      contracts: {
        agentic_commerce: {
          path: 'contracts/agentic-commerce.clar',
        },
      },
    },
  };
  return model;
}

export function chain(model: any) {
  const chain = new Clarinet.Chain({ model });
  return chain;
}

export function accounts(model: any) {
  const chain = new Clarinet.Chain({ model });
  return chain.accounts;
}