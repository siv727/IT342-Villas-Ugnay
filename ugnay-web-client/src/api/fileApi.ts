import axiosClient from './axiosClient';

/**
 * File Upload API — aligned with SDD §5.2
 *
 * POST /api/files/upload   — multipart/form-data { file, context }
 * GET  /api/files/{id}     — get file metadata / download
 *
 * NOTE: File upload (Supabase Storage) is not yet configured.
 * Frontend displays file name + local preview. No actual upload occurs.
 */

export type FileContext = 'PRODUCT_IMAGE' | 'DTI_CERT' | 'DELIVERY_PROOF';

export interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
}

/** Upload a file (mocked — returns local blob URL) */
export const uploadFile = async (
  file: File,
  context: FileContext,
): Promise<UploadedFile> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context);
    const res = await axiosClient.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data?.success && res.data.data?.file) return res.data.data.file;
    return res.data;
  } catch {
    // Mock: return a local blob URL so the UI can preview
    return {
      id: `mock_file_${Date.now()}`,
      url: URL.createObjectURL(file),
      fileName: file.name,
      fileType: file.type,
    };
  }
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
