import axiosClient from '../../shared/api/axiosClient';

/**
 * Sample Request API — aligned with SDD §5.2
 *
 * Statuses: PENDING → APPROVED → PAID → SHIPPED → DELIVERED → COMPLETED
 *           (plus REJECTED, CANCELLED)
 *
 * POST /api/sample-requests                        — vendor creates
 * GET  /api/sample-requests                        — list (filtered by JWT role)
 * GET  /api/sample-requests/{id}                   — detail
 * PUT  /api/sample-requests/{id}/approve           — mfr approves + sets deliveryFee
 * PUT  /api/sample-requests/{id}/reject            — mfr rejects
 * PUT  /api/sample-requests/{id}/cancel            — vendor cancels
 * PUT  /api/sample-requests/{id}/status            — mfr updates status (SHIPPED/DELIVERED/COMPLETED)
 */

export interface SampleRequestItem {
  productId: number | string;
  quantity: number;
}

export interface CreateSampleRequestPayload {
  manufacturerId: number | string;
  items: SampleRequestItem[];
}

/** Vendor creates a sample request */
export const createSampleRequest = (payload: CreateSampleRequestPayload) => {
  return axiosClient.post('/api/sample-requests', payload);
};

/** List sample requests (backend filters by logged-in user's role) */
export const getSampleRequests = (params?: Record<string, unknown>) => {
  return axiosClient.get('/api/sample-requests', { params });
};

/** Get single sample request detail */
export const getSampleRequest = (id: number | string) => {
  return axiosClient.get(`/api/sample-requests/${id}`);
};

/** Manufacturer approves and sets delivery fee */
export const approveSampleRequest = (id: number | string, deliveryFee: number) => {
  return axiosClient.put(`/api/sample-requests/${id}/approve`, { deliveryFee });
};

/** Manufacturer rejects with optional reason */
export const rejectSampleRequest = (id: number | string, reason?: string) => {
  return axiosClient.put(`/api/sample-requests/${id}/reject`, { reason });
};

/** Vendor cancels a pending/approved request */
export const cancelSampleRequest = (id: number | string) => {
  return axiosClient.put(`/api/sample-requests/${id}/cancel`);
};

/** Manufacturer updates shipment status (SHIPPED, DELIVERED, COMPLETED) */
export const updateSampleRequestStatus = (
  id: number | string,
  status: string,
  trackingNumber?: string,
) => {
  return axiosClient.put(`/api/sample-requests/${id}/status`, { status, trackingNumber });
};

const sampleRequestApi = {
  createSampleRequest,
  getSampleRequests,
  getSampleRequest,
  approveSampleRequest,
  rejectSampleRequest,
  cancelSampleRequest,
  updateSampleRequestStatus,
};

export default sampleRequestApi;
