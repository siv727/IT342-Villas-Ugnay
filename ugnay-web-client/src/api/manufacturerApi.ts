import axiosClient from './axiosClient';

type ManufacturerFilters = {
  region?: string;
  province?: string;
  city?: string;
  category?: string;
  q?: string; // search query
};

export const getManufacturers = (filters?: ManufacturerFilters) => {
  return axiosClient.get('/api/manufacturers', { params: filters });
};

export const getManufacturer = (id: number | string) => {
  return axiosClient.get(`/api/manufacturers/${id}`);
};

const manufacturerApi = { getManufacturers, getManufacturer };
export default manufacturerApi;
