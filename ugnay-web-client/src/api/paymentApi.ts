import axiosClient from './axiosClient';

/**
 * Payment API — aligned with SDD §5.2 (PayMongo Integration)
 *
 * POST /api/payments/create                               — create payment intent
 * GET  /api/payments/{paymentId}/confirm                  — verify payment after redirect
 * GET  /api/payments/sample-request/{sampleRequestId}     — get payment for a request
 *
 * NOTE: PayMongo API keys are not yet available.
 * All calls attempt the real API first, falling back to a simulated mock.
 */

export interface CreatePaymentPayload {
  sampleRequestId: number | string;
  paymentMethod: 'GCASH' | 'CARD' | 'BANK_TRANSFER';
}

export interface PaymentIntentResponse {
  paymentId: string;
  checkoutUrl: string;
}

export interface PaymentConfirmResponse {
  payment: {
    id: string;
    status: 'PAID' | 'PENDING' | 'FAILED';
    amount: number;
  };
  sampleRequest: {
    id: string;
    status: string;
  };
}

/** Create a PayMongo payment intent */
export const createPaymentIntent = async (
  payload: CreatePaymentPayload,
): Promise<PaymentIntentResponse> => {
  try {
    const res = await axiosClient.post('/api/payments/create', payload);
    if (res.data?.success && res.data.data) return res.data.data;
    return res.data;
  } catch {
    // Mock: simulate a payment intent response
    return {
      paymentId: `mock_pay_${Date.now()}`,
      checkoutUrl: `#mock-checkout-${payload.sampleRequestId}`,
    };
  }
};

/** Confirm/verify payment status after redirect */
export const confirmPayment = async (
  paymentId: string,
): Promise<PaymentConfirmResponse> => {
  try {
    const res = await axiosClient.get(`/api/payments/${paymentId}/confirm`);
    if (res.data?.success && res.data.data) return res.data.data;
    return res.data;
  } catch {
    // Mock: auto-confirm as PAID
    return {
      payment: { id: paymentId, status: 'PAID', amount: 0 },
      sampleRequest: { id: '', status: 'PAID' },
    };
  }
};

/** Get payment details for a sample request */
export const getPaymentByRequest = async (sampleRequestId: number | string) => {
  try {
    const res = await axiosClient.get(`/api/payments/sample-request/${sampleRequestId}`);
    if (res.data?.success && res.data.data) return res.data.data;
    return res.data;
  } catch {
    return null;
  }
};

const paymentApi = { createPaymentIntent, confirmPayment, getPaymentByRequest };
export default paymentApi;
