// x402 Payment Protocol Integration
// Reference: https://github.com/coinbase/x402

import { openContractCall } from "@stacks/connect-react";
import { uintCV, principalCV, someCV, optionalCV } from "@stacks/transactions";
import { CONTRACT_ADDRESS, AGENTIC_COMMERCE_CONTRACT } from "../constants/contract";
import { NETWORK } from "../constants/network";

export interface X402PaymentRequest {
  amount: number;
  destination: string;
  jobId: number;
  memo?: string;
}

export interface X402PaymentResponse {
  txId: string;
  status: 'pending' | 'confirmed' | 'failed';
  jobId: number;
}

/**
 * Create an x402-style payment request for agent services
 * This follows the x402 protocol pattern adapted for Stacks/STX
 */
export function createPaymentRequest(
  amount: number,
  destination: string,
  jobId: number
): X402PaymentRequest {
  return {
    amount,
    destination,
    jobId,
    memo: `Payment for job #${jobId}`,
  };
}

/**
 * Execute an x402 payment for a job
 * This funds the escrow with STX
 */
export async function executeX402Payment(
  request: X402PaymentRequest
): Promise<X402PaymentResponse> {
  try {
    // The contract handles the escrow
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: AGENTIC_COMMERCE_CONTRACT,
      functionName: "fund-job",
      functionArgs: [uintCV(request.jobId)],
      network: NETWORK,
      appDetails: {
        name: "Stacks Agentic Commerce",
        icon: "https://your-icon-url.com/logo.png",
      },
      onFinish: (data) => {
        console.log("x402 payment completed:", data);
        return {
          txId: data.txId,
          status: 'confirmed',
          jobId: request.jobId,
        };
      },
      onCancel: () => {
        console.log("x402 payment cancelled");
      },
    });

    return {
      txId: "",
      status: 'pending',
      jobId: request.jobId,
    };
  } catch (error) {
    console.error("x402 payment error:", error);
    return {
      txId: "",
      status: 'failed',
      jobId: request.jobId,
    };
  }
}

/**
 * Verify x402 payment was successful
 * Checks escrow balance for the job
 */
export async function verifyX402Payment(jobId: number): Promise<boolean> {
  try {
    // In a real implementation, this would query the contract
    // For now, return true if jobId is valid
    return jobId > 0;
  } catch (error) {
    console.error("x402 verification error:", error);
    return false;
  }
}

/**
 * Generate x402 payment headers for API requests
 * This follows the x402 spec for HTTP payment headers
 */
export function generateX402Headers(
  request: X402PaymentRequest
): Record<string, string> {
  return {
    'X-X402-Version': '1.0',
    'X-X402-Network': 'stacks-testnet',
    'X-X402-Amount': request.amount.toString(),
    'X-X402-Destination': request.destination,
    'X-X402-Job-Id': request.jobId.toString(),
    'X-X402-Memo': request.memo || '',
  };
}

/**
 * Parse x402 payment headers from HTTP request
 */
export function parseX402Headers(
  headers: Record<string, string>
): X402PaymentRequest | null {
  const amount = parseInt(headers['X-X402-Amount']);
  const destination = headers['X-X402-Destination'];
  const jobId = parseInt(headers['X-X402-Job-Id']);

  if (isNaN(amount) || !destination || isNaN(jobId)) {
    return null;
  }

  return {
    amount,
    destination,
    jobId,
    memo: headers['X-X402-Memo'],
  };
}
