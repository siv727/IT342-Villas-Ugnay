import axiosClient from '../../shared/api/axiosClient';

/**
 * Payment API — PayMongo Checkout Session integration
 *
 * POST /api/payments/create                               — create checkout session
 * GET  /api/payments/{sessionId}/confirm                  — verify payment after redirect
 * GET  /api/payments/sample-request/{sampleRequestId}     — get payment for a request
 */

export interface CreatePaymentPayload {
  sampleRequestId: number | string;
  paymentMethod: 'GCASH' | 'CARD' | 'BANK_TRANSFER';
}

export interface PaymentIntentResponse {
  paymentId: string;
  sessionId: string;
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

/** Create a PayMongo checkout session */
export const createPaymentIntent = async (
  payload: CreatePaymentPayload,
): Promise<PaymentIntentResponse> => {
  const res = await axiosClient.post('/api/payments/create', payload);
  if (res.data?.success && res.data.data) return res.data.data;
  return res.data;
};

/** Confirm/verify payment status after redirect */
export const confirmPayment = async (
  sessionId: string,
): Promise<PaymentConfirmResponse> => {
  const res = await axiosClient.get(`/api/payments/${sessionId}/confirm`);
  if (res.data?.success && res.data.data) return res.data.data;
  return res.data;
};

/** Get payment details for a sample request */
export const getPaymentByRequest = async (sampleRequestId: number | string) => {
  const res = await axiosClient.get(`/api/payments/sample-request/${sampleRequestId}`);
  if (res.data?.success && res.data.data) return res.data.data;
  return res.data;
};

/** Confirm payment using request ID (used after PayMongo redirect) */
export const confirmPaymentByRequest = async (
  requestId: number | string,
): Promise<PaymentConfirmResponse> => {
  const res = await axiosClient.get(`/api/payments/confirm-by-request/${requestId}`);
  if (res.data?.success && res.data.data) return res.data.data;
  return res.data;
};

const paymentApi = { createPaymentIntent, confirmPayment, confirmPaymentByRequest, getPaymentByRequest };
export default paymentApi;
