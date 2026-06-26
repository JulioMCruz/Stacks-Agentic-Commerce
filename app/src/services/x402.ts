import { x402API, PaymentRequest, PaymentResponse } from './x402';

export async function fundJobWithSTX(jobId: number, amount: number, walletAddress: string): Promise<PaymentResponse> {
  const payment: PaymentRequest = {
    jobId: jobId,
    recipient: walletAddress,
    amount: amount,
    token: 'stx',
  };
  
  return await x402API.payment(payment);
}

export async function checkJobPayment(jobId: number): Promise<boolean> {
  const response = await x402API.checkPayment(jobId);
  return response.paid;
}

export async function releasePayment(jobId: number, amount: number, providerAddress: string): Promise<PaymentResponse> {
  const payment: PaymentRequest = {
    jobId: jobId,
    recipient: providerAddress,
    amount: amount,
    token: 'stx',
  };
  
  return await x402API.payment(payment);
}
