'use client';

import { useState } from 'react';
import { X402PaymentRequest, executeX402Payment, createPaymentRequest } from '../../services/x402';

interface X402PaymentButtonProps {
  jobId: number;
  amount: number;
  destination: string;
  onSuccess?: (result: { txId: string; jobId: number }) => void;
  onError?: (error: Error) => void;
}

export default function X402PaymentButton({
  jobId,
  amount,
  destination,
  onSuccess,
  onError,
}: X402PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'confirmed' | 'failed'>('idle');

  async function handlePayment() {
    setLoading(true);
    setStatus('processing');

    try {
      const request = createPaymentRequest(amount, destination, jobId);
      const result = await executeX402Payment(request);

      if (result.status === 'confirmed') {
        setStatus('confirmed');
        onSuccess?.({ txId: result.txId, jobId: result.jobId });
      } else {
        setStatus('failed');
        onError?.(new Error('Payment failed or was cancelled'));
      }
    } catch (error) {
      setStatus('failed');
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }

  const statusConfig = {
    idle: { text: `Pay ${amount} STX`, color: 'bg-blue-600 hover:bg-blue-700' },
    processing: { text: 'Processing...', color: 'bg-yellow-600 cursor-wait' },
    confirmed: { text: 'Paid ✓', color: 'bg-green-600' },
    failed: { text: 'Retry Payment', color: 'bg-red-600 hover:bg-red-700' },
  };

  const config = statusConfig[status];

  return (
    <button
      onClick={handlePayment}
      disabled={loading || status === 'confirmed'}
      className={`${config.color} text-white px-4 py-2 rounded transition-colors disabled:opacity-50`}
    >
      {config.text}
    </button>
  );
}
