# Stacks Agentic Commerce

Agent infrastructure on Stacks: Agent identity registry + job escrow with x402 payments.

## What is this?

This project implements decentralized agent infrastructure on Stacks:

- **Agent Registry**: On-chain identity for AI agents with upgradability support (port of ERC-8004 Identity to Stacks)
- **Agentic Commerce**: Job escrow with budget, provider, evaluator, and x402 payments with upgradability support (port of EIP-8183 to Stacks)

Built by specialized AI agents in <20 hours.

## Upgradability

The contracts use the registry/implementation pattern:

1. **Registry contract**: stores state and access control
2. **Implementation contract**: logic that can be upgraded
3. **Owner**: only one who can call `upgrade-implementation(new-impl)`

See [STATUS.md](STATUS.md) for detailed project status.

## Architecture

```
Stacks-Agentic-Commerce/
├── App/              # Next.js App Router (frontend)
├── Contracts/        # Smart contracts (Clarity)
│   ├── agent-registry.clar
│   └── agentic-commerce.clar
├── Agent/            # Agent scripts
└── README.md
```

## Smart Contracts

### Agent Registry (Upgradable)

Patrón de upgradability: Registry (estado) + Logic (impl).

- **Registry contract**: guarda el estado (agents, owner, protocol-callers)
- **Upgrade function**: `upgrade-implementation(new-impl)` - solo owner
- **Access control**: `is-owner()`, `is-protocol-caller()`

Register agents with metadata:
- Name, description
- Creator principal
- Wallet address
- Endpoints (A2A, MCP, web)
- Active/inactive status

### Agentic Commerce (Upgradable)

Patrón de upgradabilidad: Registry (estado) + Logic (impl).

- **Registry contract**: guarda el estado (jobs, job-counter, owner, protocol-callers)
- **Upgrade function**: `upgrade-implementation(new-impl)` - solo owner
- **Access control**: `is-owner()`, `is-protocol-caller()`

Job escrow with 6 states:
- Open → Funded → Submitted → Completed/Rejected/Expired
- Client funds, Provider submits, Evaluator verifies
- Payments in STX (x402 compatible)

## Tech Stack

- **Smart Contracts**: Clarity (Stx) with upgradability pattern
- **Frontend**: Next.js (App Router)
- **Wallet**: Hiro Wallet, Leather
- **Payments**: STX via x402

## Getting Started

1. Clone the repo
2. `cd Contracts && clarinet check`
3. `cd .. && npm install`
4. `npm run dev`

## Deployment

- Testnet: Deploy contracts to Stacks Testnet
- Mainnet: Deploy contracts to Stacks Mainnet after audit

## Upgradability

Los contratos usan el patrón de registry/implementation:

1. **Registry contract**: guarda estado (agents, jobs) y control de acceso
2. **Implementation contract**: lógica que puede ser actualizada
3. **Owner**: único que puede llamar `upgrade-implementation(new-impl)`

## Status

Alpha - Contracts implemented, frontend in progress.

## Next Steps

1. Deploy to Stacks Testnet
2. Frontend integration with contracts
3. User testing
4. Mainnet deployment after audit

## Project Status

See [STATUS.md](STATUS.md) for detailed status information.

## License

MIT
