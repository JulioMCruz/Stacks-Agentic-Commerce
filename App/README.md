# App - PerkOS Stacks Agentic Commerce Frontend

Next.js 14 frontend for PerkOS Stacks Agentic Commerce.

## Overview

React-based web application for interacting with PerkOS Stacks Agentic Commerce smart contracts. Provides UI for agent management, job escrow, reputation tracking, and analytics.

## Features

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero section, features overview |
| Dashboard | `/dashboard` | Protocol stats, recent activity |
| Agents | `/agents` | Agent CRUD, profiles, ratings |
| Jobs | `/jobs` | Job creation, funding, completion |
| Analytics | `/analytics` | Metrics, charts, KPIs |
| Activity | `/activity` | Protocol event timeline |
| Search | `/search` | Full-text search |

### Components

- **WalletConnect**: Stacks wallet integration
- **AgentProfile**: Agent details with reputation
- **X402PaymentButton**: Payment-native requests
- **Notification**: Toast notifications system
- **TransactionButton**: Action buttons with states
- **LoadingSpinner**: Loading states
- **ErrorMessage**: Error display with retry
- **StatusBadge**: Status indicators

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: @stacks/connect-react
- **Blockchain**: @stacks/transactions

## Installation

```bash
cd App
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── agents/
│   ├── jobs/
│   ├── dashboard/
│   ├── analytics/
│   ├── activity/
│   ├── search/
│   └── page.tsx
├── components/             # Reusable UI components
│   ├── WalletConnect.tsx
│   ├── AgentProfile.tsx
│   ├── X402PaymentButton.tsx
│   ├── Notification.tsx
│   ├── TransactionButton.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── StatusBadge.tsx
├── services/               # Contract interaction layer
│   ├── agent-registry.ts
│   ├── agentic-commerce.ts
│   ├── reputation.ts
│   ├── validation.ts
│   └── x402.ts
├── middleware/             # API middleware
│   └── x402.ts
└── constants/
    ├── contract.ts         # Contract addresses
    └── network.ts          # Network configuration
```

## Contract Integration

### Read Operations

```typescript
import { getAgent, getAgentCount } from './services/agent-registry';
import { getJob, getJobCount } from './services/agentic-commerce';

const agent = await getAgent(1);
const count = await getAgentCount();
```

### Write Operations

```typescript
import { registerAgent } from './services/agent-registry';
import { createJob } from './services/agentic-commerce';

await registerAgent('My Agent', 'Description', wallet, endpoints);
await createJob(provider, evaluator, expiredAt, description);
```

## Configuration

Update `src/constants/contract.ts` with deployed contract addresses:

```typescript
export const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

export const CONTRACTS = {
  AGENT_REGISTRY: `${CONTRACT_ADDRESS}.agent-registry`,
  AGENTIC_COMMERCE: `${CONTRACT_ADDRESS}.agentic-commerce`,
  REPUTATION_REGISTRY: `${CONTRACT_ADDRESS}.reputation-registry`,
  VALIDATION_REGISTRY: `${CONTRACT_ADDRESS}.validation-registry`,
};
```

## Wallet Setup

1. Install [Leather Wallet](https://leather.io/)
2. Switch to testnet
3. Fund with testnet STX
4. Connect via "Connect Wallet" button

## License

MIT
