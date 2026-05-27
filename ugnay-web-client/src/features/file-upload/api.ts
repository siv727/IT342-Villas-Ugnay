import axiosClient from '../../shared/api/axiosClient';

/**
 * File Upload API — Supabase Storage integration
 *
 * POST /api/files/upload   — multipart/form-data { file, context }
 * GET  /api/files/{id}     — get file metadata
 */

export type FileContext = 'PRODUCT_IMAGE' | 'DTI_CERT' | 'DELIVERY_PROOF' | 'BUSINESS_PERMIT';

export interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
}

/** Upload a file to Supabase Storage via backend */
export const uploadFile = async (
  file: File,
  context: FileContext,
): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context', context);
  const res = await axiosClient.post('/api/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (res.data?.success && res.data.data?.file) return res.data.data.file;
  return res.data;
};

/** Get file metadata */
export const getFile = async (id: string): Promise<UploadedFile | null> => {
  try {
    const res = await axiosClient.get(`/api/files/${id}`);
    if (res.data?.success && res.data.data) return res.data.data;
    return res.data;
  } catch {
    return null;
  }
};

const fileApi = { uploadFile, getFile };
export default fileApi;
