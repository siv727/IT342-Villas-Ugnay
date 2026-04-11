import axiosClient from './axiosClient';

type ProductQuery = {
  manufacturerId?: number | string;
  q?: string;
  page?: number;
  limit?: number;
};

export const getProducts = (query?: ProductQuery) => {
  return axiosClient.get('/api/products', { params: query });
};

export const getProduct = (id: number | string) => {
  return axiosClient.get(`/api/products/${id}`);
};

export const createProduct = (payload: unknown) => {
  return axiosClient.post('/api/products', payload);
};

export const updateProduct = (id: number | string, payload: unknown) => {
  return axiosClient.put(`/api/products/${id}`, payload);
};

export const deleteProduct = (id: number | string) => {
  return axiosClient.delete(`/api/products/${id}`);
};

const productApi = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
export default productApi;
