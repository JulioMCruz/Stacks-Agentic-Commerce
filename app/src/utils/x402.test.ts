import { x402API } from '../utils/x402';

describe('x402 Payment API', () => {
  it('should create payment request', async () => {
    const result = await x402API.payment({
      jobId: 1,
      recipient: 'ST123',
      amount: 1000,
      token: 'stx',
    });
    expect(result.success).toBe(true);
  });

  it('should check payment status', async () => {
    const result = await x402API.checkPayment(1);
    expect(result).toHaveProperty('paid');
  });
});
