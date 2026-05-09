import axiosClient from './axiosClient';

/**
 * Product Catalog API — aligned with SDD §5.2
 *
 * SDD Response shape:
 *   List:   { success, data: { items: [...], pagination: { page, size, total } }, error, timestamp }
 *   Single: { success, data: { id, manufacturerId, name, ... }, error, timestamp }
 *
 * GET  /api/products?manufacturerId={id}&page=1&size=20&category={name}
 * GET  /api/products/{id}
 * GET  /api/products/search?q={query}
 * POST /api/products           — manufacturer only
 * PUT  /api/products/{id}      — manufacturer only
 * DELETE /api/products/{id}    — manufacturer only
 */

type ProductQuery = {
  manufacturerId?: number | string;
  category?: string;
  q?: string;
  page?: number;
  size?: number;
};

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrls?: string[];
  category?: string;
  stock?: number;
}

export const getProducts = (query?: ProductQuery) => {
  return axiosClient.get('/api/products', { params: query });
};

/** Returns products for the authenticated manufacturer (no manufacturerId needed) */
export const getMyProducts = (query?: Omit<ProductQuery, 'manufacturerId'>) => {
  return axiosClient.get('/api/products/mine', { params: query });
};

export const getProduct = (id: number | string) => {
  return axiosClient.get(`/api/products/${id}`);
};

export const searchProducts = (q: string) => {
  return axiosClient.get('/api/products/search', { params: { q } });
};

export const createProduct = (payload: ProductPayload) => {
  return axiosClient.post('/api/products', payload);
};

export const updateProduct = (id: number | string, payload: Partial<ProductPayload>) => {
  return axiosClient.put(`/api/products/${id}`, payload);
};

export const deleteProduct = (id: number | string) => {
  return axiosClient.delete(`/api/products/${id}`);
};

const productApi = { getProducts, getMyProducts, getProduct, searchProducts, createProduct, updateProduct, deleteProduct };
export default productApi;
