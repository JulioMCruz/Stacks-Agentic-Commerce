# Stack Agentic Commerce - App Development

This directory contains the Next.js frontend application.

## Structure

```
App/
├── app/               # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── agents/        # Agent registry UI
│   └── jobs/          # Job escrow UI
├── components/
│   ├── Header.tsx
│   ├── WalletConnect.tsx
│   └── JobCard.tsx
└── utils/
    └── stacks.ts
```

## Getting Started

```bash
npm create next-app@latest .
# Choose App Router, TypeScript, Tailwind CSS
npm install @stacks/connect @stacks/transactions
npm run dev
```

## Integration

- Connect wallet with @stacks/connect
- Interact with contracts via @stacks/transactions
- Display agent registry
- Create/view jobs
