# Stacks Agentic Commerce

Agent infrastructure on Stacks: Agent identity registry + job escrow with x402 payments.

## Overview

This project implements decentralized agent infrastructure on Stacks:

- **Agent Registry**: On-chain identity for AI agents (ERC-8004 equivalent for Stacks)
- **Agentic Commerce**: Job escrow with x402-style STX payments (ERC-8183 equivalent for Stacks)
- **Upgradability**: Registry/implementation pattern for future enhancements

## Features

### Agent Registry
- Register agents with name, description, wallet, endpoints
- Update agent metadata (name, description, wallet)
- Deactivate agents
- Query agents by ID
- Protocol caller access control

### Agentic Commerce
- Create jobs with evaluator, provider, description, expiration
- Set budget in STX
- Fund jobs with STX escrow
- Assign providers
- Submit work deliverables
- Complete jobs (release escrow to provider)
- Reject jobs (refund escrow to client)
- Expire jobs (auto-refund if funded)

## Architecture

```
Stacks-Agentic-Commerce/
├── App/                    # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── agents/     # Agent registry UI
│   │   │   ├── jobs/       # Job escrow UI
│   │   │   └── page.tsx     # Home page
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── TransactionButton.tsx
│   │   ├── services/
│   │   │   ├── agent-registry.ts
│   │   │   └── agentic-commerce.ts
│   │   └── constants/
│   │       ├── contract.ts
│   │       └── network.ts
├── contracts/              # Clarity smart contracts
│   ├── agent-registry.clar
│   └── agentic-commerce.clar
├── tests/
│   ├── agent-registry.test.ts
│   ├── agentic-commerce.test.ts
│   └── contract/             # Unit tests
│       ├── agent-registry.test.ts
│       └── agentic-commerce.test.ts
├── docs/
│   ├── DEPLOY_TESTNET.md
│   ├── ARCHITECTURE.md
│   └── ...
└── settings/
    ├── Devnet.toml
    ├── Testnet.toml
    └── Mainnet.toml
```

## Smart Contracts

### Agent Registry (`agent-registry.clar`)

```clarity
;; Register new agent
(define-public (register-agent
  (name (string-ascii 64))
  (description (string-ascii 256))
  (wallet principal)
  (endpoints (list 10 {name: (string-ascii 32), url: (string-ascii 128)}))
))

;; Get agent by ID
(define-read-only (get-agent (agent-id uint)))

;; Update agent metadata
(define-public (update-agent
  (agent-id uint)
  (new-name (optional (string-ascii 64)))
  (new-description (optional (string-ascii 256)))
  (new-wallet (optional principal))
))

;; Deactivate agent
(define-public (deactivate-agent (agent-id uint)))
```

### Agentic Commerce (`agentic-commerce.clar`)

```clarity
;; Create job
(define-public (create-job
  (provider (optional principal))
  (evaluator principal)
  (expired-at uint)
  (description (string-ascii 512))
))

;; Set budget
(define-public (set-budget (job-id uint) (amount uint)))

;; Fund job (STX transfer to escrow)
(define-public (fund-job (job-id uint)))

;; Assign provider
(define-public (assign-provider (job-id uint) (provider principal)))

;; Submit work
(define-public (submit-work (job-id uint) (deliverable (buff 64))))

;; Complete job (release escrow)
(define-public (complete-job (job-id uint)))

;; Reject job (refund client)
(define-public (reject-job (job-id uint)))

;; Expire job (auto-refund if funded)
(define-public (expire-job (job-id uint)))
```

## Job Lifecycle

```
Open → Funded → Submitted → Completed
                    ↓
                Rejected
                    ↓
                Expired
```

| Status | Actions Allowed |
|--------|----------------|
| Open | set-budget, fund-job, expire-job |
| Funded | assign-provider, submit-work, expire-job |
| Submitted | complete-job, reject-job |
| Completed | (final) |
| Rejected | (final) |
| Expired | (final) |

## Tech Stack

- **Smart Contracts**: Clarity on Stacks
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Wallet Integration**: @stacks/connect-react, @stacks/transactions
- **Testing**: Vitest, Clarinet
- **Network**: Stacks Testnet (nakamoto-testnet)

## Getting Started

### Prerequisites

- Node.js 18+
- Clarinet CLI
- A Stacks wallet (Hiro/Leather recommended)

### Installation

```bash
# Clone repo
git clone https://github.com/JulioMCruz/Stacks-Agentic-Commerce.git
cd Stacks-Agentic-Commerce

# Install dependencies
cd App && npm install

# Run contract validation
cd .. && clarinet check
```

### Development

```bash
# Run frontend locally
cd App && npm run dev

# Run contract tests
clarinet test
```

### Testnet Deployment

1. Configure `settings/Testnet.toml` with your mnemonic
2. Request testnet STX from [Hiro Faucet](https://platform.hiro.so/faucet)
3. Deploy contracts:
   ```bash
   clarinet deployments apply --testnet
   ```
4. Update frontend contract addresses in `App/src/constants/contract.ts`

## Testing

### Contract Tests

```bash
# Run all tests
clarinet test

# Run specific test file
clarinet test tests/agent-registry.test.ts
```

### Frontend Tests

```bash
cd App
npm test
```

## Contract Addresses

### Testnet
- `agent-registry`: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.agent-registry`
- `agentic-commerce`: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.agentic-commerce`

*(Replace with actual deployed addresses)*

## Upgradability

The contracts use the registry/implementation pattern:

1. **Registry contract**: Stores state (agents, jobs) and access control
2. **Implementation contract**: Business logic that can be upgraded
3. **Owner**: Can call `upgrade-implementation(new-impl)` to point to new logic

This allows fixing bugs and adding features without losing state.

## Security

- Owner-only upgrade function
- Protocol caller access control
- Status validation on state transitions
- Principal validation (client/provider/evaluator)
- Escrow balance tracking
- Refund on rejection/expiration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `clarinet check && clarinet test`
5. Submit a pull request

## Project Status

See [STATUS.md](STATUS.md) for detailed project status.

## License

MIT
