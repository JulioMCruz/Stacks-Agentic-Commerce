# Deploy to Testnet

## Prerequisites

1. Install Clarinet: https://docs.stacks.co/clarinet
2. Have a wallet with testnet STX (get from faucet: https://explorer.hiro.so/faucet?chain=testnet)
3. Configure your mnemonic in `settings/Testnet.toml`

## Steps

### 1. Update Testnet.toml with your mnemonic

Edit `settings/Testnet.toml`:

```toml
[network]
name = "testnet"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "YOUR_TESTNET_WALLET_MNEMONIC_HERE"
```

### 2. Generate deployment plan

```bash
clarinet deployments generate --testnet --manual-cost
```

### 3. Deploy

```bash
clarinet deployments apply --testnet
```

## Current Deployment Status

- [x] Contracts validated with `clarinet check`
- [x] Deployment plan generated
- [ ] Deployed to testnet (pending wallet configuration)

## Contract Addresses (after deploy)

After deployment, update these values:

```typescript
// App/src/constants/contract.ts
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_ADDRESS";
export const AGENT_REGISTRY_CONTRACT = `${CONTRACT_ADDRESS}.agent-registry`;
export const AGENTIC_COMMERCE_CONTRACT = `${CONTRACT_ADDRESS}.agentic-commerce`;
```
