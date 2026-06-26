# Stacks Agentic Commerce - x402 Payment Integration

## x402 Protocol Implementation

x402 is the machine-to-machine payment protocol. This project uses x402 for agent payments in STX.

## Supported Tokens

- **STX** (native, primary)
- **sBTC** (via SIP-010)
- **USDCx** (via SIP-010)

## x402 API Endpoints

- **STX**: `https://x402-api.aibtc.dev/v1/stx`
- **sBTC**: `https://x402-api.aibtc.dev/v1/sbtc`
- **USDCx**: `https://x402-api.aibtc.dev/v1/usdcx`

## Payment Flow

1. Job is created with budget in STX
2. Client funds the job via x402
3. Provider submits work
4. Evaluator verifies and releases payment
5. Payment transferred via x402

## Implementation

```typescript
// x402 API call for STX payment
const response = await fetch('https://x402-api.aibtc.dev/v1/stx', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    recipient: walletAddress,
    amount: amountInStx,
    job_id: jobId,
  }),
});
```

## x402 Headers

- `X-402-Amount`: Amount in micro-STX
- `X-402-Recipient`: Recipient address
- `X-402-Request-ID`: Unique request ID

## Error Handling

- `402 Payment Required`: Payment needed
- `403 Forbidden`: Not authorized
- `500 Internal Server Error`: API error

## Testing

1. Deploy contracts to testnet
2. Create test job with x402 funding
3. Verify payment via x402 API
4. Test complete/reject flow
