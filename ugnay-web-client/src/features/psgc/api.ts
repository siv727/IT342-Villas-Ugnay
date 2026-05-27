import axiosClient from '../../shared/api/axiosClient';

export interface PsgcLocation {
  code: string;
  name: string;
}

/** Fetch all 17 regions */
export const getRegions = async (): Promise<PsgcLocation[]> => {
  const res = await axiosClient.get('/api/psgc/regions');
  return res.data.map((r: Record<string, string>) => ({
    code: r.code,
    name: r.name,
  }));
};

/** Fetch provinces for a region */
export const getProvinces = async (regionCode: string): Promise<PsgcLocation[]> => {
  const res = await axiosClient.get(`/api/psgc/regions/${regionCode}/provinces`);
  return res.data.map((p: Record<string, string>) => ({
    code: p.code,
    name: p.name,
  }));
};

/** Fetch cities/municipalities for a province */
export const getCities = async (provinceCode: string): Promise<PsgcLocation[]> => {
  const res = await axiosClient.get(`/api/psgc/provinces/${provinceCode}/cities-municipalities`);
  return res.data.map((c: Record<string, string>) => ({
    code: c.code,
    name: c.name,
  }));
};

/** Fetch barangays for a city/municipality */
export const getBarangays = async (cityCode: string): Promise<PsgcLocation[]> => {
  const res = await axiosClient.get(`/api/psgc/cities-municipalities/${cityCode}/barangays`);
  return res.data.map((b: Record<string, string>) => ({
    code: b.code,
    name: b.name,
  }));
};

const psgcApi = { getRegions, getProvinces, getCities, getBarangays };
export default psgcApi;
