import axiosClient from '../../shared/api/axiosClient';

/**
 * Save/Follow Business API — aligned with SDD §5.2
 *
 * POST   /api/connections              — vendor saves a manufacturer
 * GET    /api/connections              — list saved manufacturers
 * DELETE /api/connections/{id}         — unsave
 */

/** Save/follow a manufacturer */
export const saveManufacturer = (manufacturerId: number | string) => {
  return axiosClient.post('/api/connections', { manufacturerId });
};

/** List saved/followed manufacturers */
export const getConnections = () => {
  return axiosClient.get('/api/connections');
};

/** Remove a saved manufacturer */
export const removeConnection = (connectionId: number | string) => {
  return axiosClient.delete(`/api/connections/${connectionId}`);
};

const connectionApi = { saveManufacturer, getConnections, removeConnection };
export default connectionApi;
