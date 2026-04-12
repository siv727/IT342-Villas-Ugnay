import axiosClient from './axiosClient';

/**
 * Manufacturer Discovery API — aligned with SDD §5.2
 *
 * SDD Response shape:
 *   { success, data: { items: [...], pagination: { page, size, total } }, error, timestamp }
 *
 * GET /api/manufacturers?region=&province=&city=&category=&page=1&size=20
 * GET /api/manufacturers/{id}
 * GET /api/manufacturers/search?q=&region=&province=&city=
 */

type ManufacturerFilters = {
  region?: string;
  province?: string;
  city?: string;
  category?: string;
  q?: string;
  page?: number;
  size?: number;
};

/** List manufacturers with optional PSGC + category filters */
export const getManufacturers = (filters?: ManufacturerFilters) => {
  return axiosClient.get('/api/manufacturers', { params: filters });
};

/** Get single manufacturer profile */
export const getManufacturer = (id: number | string) => {
  return axiosClient.get(`/api/manufacturers/${id}`);
};

/** Search manufacturers by query + optional PSGC filters */
export const searchManufacturers = (params: {
  q: string;
  region?: string;
  province?: string;
  city?: string;
}) => {
  return axiosClient.get('/api/manufacturers/search', { params });
};

const manufacturerApi = { getManufacturers, getManufacturer, searchManufacturers };
export default manufacturerApi;
