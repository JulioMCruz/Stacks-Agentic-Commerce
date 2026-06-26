import { x402API, PaymentRequest, PaymentResponse } from '../utils/x402';

export function fundJobWithSTX(jobId: number, amount: number, walletAddress: string): Promise<PaymentResponse> {
  const payment: PaymentRequest = {
    jobId: jobId,
    recipient: walletAddress,
    amount: amount,
    token: 'stx',
  };
  
  return x402API.payment(payment);
}

export function checkJobPayment(jobId: number): Promise<boolean> {
  return x402API.checkPayment(jobId).then(r => r.paid);
}

export function releasePayment(jobId: number, amount: number, providerAddress: string): Promise<PaymentResponse> {
  const payment: PaymentRequest = {
    jobId: jobId,
    recipient: providerAddress,
    amount: amount,
    token: 'stx',
  };
  
  return x402API.payment(payment);
}
