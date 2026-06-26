# x402 Integration

## Overview

This project implements x402-style payment protocol for Stacks, enabling machine-to-machine payments for agent services.

## What is x402?

x402 is a payment protocol that:
- Allows services to require payment for API access
- Uses HTTP 402 Payment Required status code
- Supports various payment methods (STX in our case)

## How it works

```
Client                          Server
  |                               |
  | --- Request (no payment) ---> |
  |                               |
  | <--- 402 Payment Required -- |
  |                               |
  | --- Request + x402 headers -> |
  |                               |
  | <--- Response 200 OK --------- |
```

## Implementation

### Payment Headers

```
X-X402-Version: 1.0
X-X402-Network: stacks-testnet
X-X402-Amount: 1000
X-X402-Destination: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
X-X402-Job-Id: 1
X-X402-Memo: Payment for job #1
```

### Frontend Usage

```tsx
import { X402PaymentButton } from './components/X402PaymentButton';

<X402PaymentButton
  jobId={1}
  amount={1000}
  destination="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  onSuccess={(result) => console.log('Payment:', result)}
  onError={(error) => console.error('Payment failed:', error)}
/>
```

### API Middleware

```tsx
import { x402Middleware } from './middleware/x402';

export async function POST(req: NextRequest) {
  const paymentResult = await x402Middleware(req);
  
  if (!paymentResult.success) {
    return paymentResult.response;
  }
  
  // Process the request...
}
```

### Service Integration

```tsx
import { createPaymentRequest, executeX402Payment } from './services/x402';

const request = createPaymentRequest(
  1000,  // amount in STX
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  1      // jobId
);

const result = await executeX402Payment(request);
```

## Files

- `App/src/services/x402.ts` - Core x402 logic
- `App/src/middleware/x402.ts` - Next.js API middleware
- `App/src/components/X402PaymentButton.tsx` - Payment UI component

## Future Enhancements

- [ ] Support for multiple payment tokens
- [ ] Payment channel support for micropayments
- [ ] Automatic retry mechanism
- [ ] Payment receipt NFTs
