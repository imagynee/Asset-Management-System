import api from './axios';

export const getAssets = (params) => api.get('/api/assets', { params }).then((r) => r.data);

export const getAssetById = (id) => api.get(`/api/assets/${id}`).then((r) => r.data);

export const createAsset = (formData) =>
  api.post('/api/assets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const updateAsset = (id, formData) =>
  api.put(`/api/assets/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const deleteAsset = (id) => api.delete(`/api/assets/${id}`).then((r) => r.data);

export const disposeAsset = (id) =>
  api.put(`/api/assets/${id}`, null, { params: { status: 'dispose' } }).then((r) => r.data);

const buildAssetActionFormData = (assetId, values = {}) => {
  const formData = new FormData();
  formData.append('assetId', assetId);

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  return formData;
};

const multipartConfig = {
  headers: { 'Content-Type': 'multipart/form-data' },
};

export const returnAsset = (assetId, values) =>
  api.patch('/api/assets/return', buildAssetActionFormData(assetId, values), multipartConfig).then((r) => r.data);

export const startMaintenance = (assetId, values) =>
  api.patch('/api/assets/maintenance/start', buildAssetActionFormData(assetId, values), multipartConfig).then((r) => r.data);

export const completeMaintenance = (assetId, values) =>
  api.patch('/api/assets/maintenance/complete', buildAssetActionFormData(assetId, values), multipartConfig).then((r) => r.data);

export const getMaintenanceHistory = () =>
  api.get('/api/assets/maintenance').then((r) => r.data);

export const getAssetQrUrl = (assetId) =>
  `${import.meta.env.VITE_API_URL || ''}/api/assets/qr/${assetId}`;

export const downloadAssetQr = async (assetId) => {
  const response = await api.get(`/api/assets/qr/${assetId}`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${assetId}-qr.png`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadAssetInvoice = async (invoicePath, assetId) => {
  const response = await api.get(invoicePath, { responseType: 'blob' });
  const extension = invoicePath.split('.').pop();
  const fileName = `${assetId}-invoice${extension ? `.${extension}` : ''}`;
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getUploadUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL || ''}${path}`;
};
