# Stacks Agentic Commerce - Deployment Guide

## Prerequisites

- Node.js 18+
- Clarinet installed

## Installation

```bash
npm install -g clarinet
```

## Validate Contracts

```bash
cd contracts
clarinet check
```

## Run Tests

```bash
clarinet test
```

## Deploy to Testnet

1. Update `Clarinet.toml` with testnet configuration
2. Run:
```bash
clarinet deploy --network testnet
```

## Deploy to Mainnet

1. Complete security audit
2. Update `Clarinet.toml` with mainnet configuration
3. Run:
```bash
clarinet deploy --network mainnet
```

## Update Frontend

After deployment, update contract addresses in:
- `app/src/constants/contract.ts`
