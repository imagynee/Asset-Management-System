import api from './axios';

export const getEmployees = (params) =>
  api.get('/api/employees', { params }).then((r) => r.data);

export const getEmployeeById = (id) => api.get(`/api/employees/${id}`).then((r) => r.data);

export const getEmployeeHistory = (id) =>
  api.get(`/api/employees/${id}/history`).then((r) => r.data);

export const createEmployee = (formData) =>
  api.post('/api/employees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const assignAssets = (employeeId, assetIds) =>
  api.patch('/api/employees/assign', { employeeId, assetIds }).then((r) => r.data);

export const updateEmployee = (id, formData) =>
  api.patch(`/api/employees/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`).then((r) => r.data);

export const downloadEmployeeIdProof = async (idProofPath, employeeId) => {
  const response = await api.get(idProofPath, { responseType: 'blob' });
  const extension = idProofPath.split('.').pop();
  const fileName = `${employeeId}-id-proof${extension ? `.${extension}` : ''}`;
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
