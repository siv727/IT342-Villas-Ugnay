import axiosClient from './axiosClient';

type SampleRequestQuery = {
  manufacturerId?: number | string;
  vendorId?: number | string;
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export const createSampleRequest = (payload: unknown) => {
  return axiosClient.post('/api/sample-requests', payload);
};

export const getSampleRequests = (query?: SampleRequestQuery) => {
  return axiosClient.get('/api/sample-requests', { params: query });
};

export const getSampleRequest = (id: number | string) => {
  return axiosClient.get(`/api/sample-requests/${id}`);
};

export const approveSampleRequest = (id: number | string) => {
  return axiosClient.post(`/api/sample-requests/${id}/approve`);
};

export const rejectSampleRequest = (id: number | string, reason?: string) => {
  return axiosClient.post(`/api/sample-requests/${id}/reject`, { reason });
};

export const cancelSampleRequest = (id: number | string) => {
  return axiosClient.post(`/api/sample-requests/${id}/cancel`);
};

export const updateSampleRequestStatus = (id: number | string, status: string) => {
  return axiosClient.put(`/api/sample-requests/${id}/status`, { status });
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
