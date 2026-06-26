# Deployment Guide - Testnet

## Prerequisites

1. **Clarinet CLI** installed (v3.21.0+)
2. **Testnet STX** in your wallet
3. **Mnemonic** configured in `settings/Testnet.toml`

## Step-by-Step Deployment

### 1. Configure Wallet

Edit `settings/Testnet.toml`:

```toml
[network]
name = "testnet"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "your twelve word mnemonic phrase here for testnet wallet"
```

### 2. Get Testnet STX

Request testnet STX from the faucet:

1. Go to https://platform.hiro.so/faucet
2. Connect your wallet (make sure it's on testnet)
3. Request testnet STX
4. Wait for confirmation

Or use the Hiro Explorer Sandbox:

1. Go to https://explorer.hiro.so/sandbox/deploy?chain=testnet
2. Connect wallet
3. Click "Request STX"

### 3. Validate Contracts

```bash
clarinet check
```

Expected output:
```
Checking contracts/agent-registry.clar...
Checking contracts/agentic-commerce.clar...
✔️  Contracts checked successfully
```

### 4. Generate Deployment Plan

```bash
clarinet deployments generate --testnet
```

This creates `deployments/default.testnet-plan.yaml`.

### 5. Deploy to Testnet

```bash
clarinet deployments apply --testnet
```

Confirm when prompted. The deployment will:

1. Deploy `agent-registry.clar`
2. Deploy `agentic-commerce.clar`
3. Return transaction IDs

### 6. Verify Deployment

Check deployed contracts:

```bash
# Using Hiro Explorer
https://explorer.hiro.so/address/<YOUR_ADDRESS>?chain=testnet

# Or using curl
curl https://api.testnet.hiro.so/v2/contracts/<YOUR_ADDRESS>.agent-registry
```

### 7. Update Frontend

After deployment, update contract addresses in `App/src/constants/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
export const AGENT_REGISTRY_CONTRACT = "agent-registry";
export const AGENTIC_COMMERCE_CONTRACT = "agentic-commerce";
```

## Troubleshooting

### ContractAlreadyExists Error

If you get "ContractAlreadyExists", the contract is already deployed. You can either:

1. Use the existing deployment
2. Deploy with a different wallet
3. Use a new contract name

### Insufficient Balance

Ensure you have enough testnet STX:

```bash
curl https://api.testnet.hiro.so/v2/accounts/<YOUR_ADDRESS>?proof=0
```

### Transaction Failed

Check transaction status:

```bash
curl https://api.testnet.hiro.so/extended/v1/tx/<TXID>
```

## Cost Estimation

| Contract | Estimated Cost |
|----------|---------------|
| agent-registry | ~0.05 STX |
| agentic-commerce | ~0.11 STX |
| **Total** | **~0.16 STX** |

## Next Steps

After deployment:

1. Update frontend with deployed addresses
2. Test contract interactions via frontend
3. Document actual transaction IDs
4. Submit to Builder Rewards
