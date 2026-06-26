# Stacks Agentic Commerce

Agent infrastructure on Stacks: Agent identity registry + job escrow with x402 payments.

## What is this?

This project implements decentralized agent infrastructure on Stacks:

- **Agent Registry**: On-chain identity for AI agents (port of ERC-8004 Identity to Stacks)
- **Agentic Commerce**: Job escrow with budget, provider, evaluator, and x402 payments (port of EIP-8183 to Stacks)

Built by specialized AI agents in <20 hours.

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

### Agent Registry

Register agents with metadata:
- Name, description
- Creator principal
- Wallet address
- Endpoints (A2A, MCP, web)
- Active/inactive status

### Agentic Commerce

Job escrow with 6 states:
- Open → Funded → Submitted → Completed/Rejected/Expired
- Client funds, Provider submits, Evaluator verifies
- Payments in STX (x402 compatible)

## Tech Stack

- **Smart Contracts**: Clarity (Stx)
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

## Status

Alpha - Contracts implemented, frontend in progress.

## License

MIT
