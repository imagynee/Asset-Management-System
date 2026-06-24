import api from './axios';

const downloadBlob = (response, defaultName) => {
  const disposition = response.headers['content-disposition'];
  const match = disposition?.match(/filename="(.+)"/);
  const fileName = match?.[1] || defaultName;

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportAllAssets = () =>
  api.get('/api/reports/assets/all', { responseType: 'blob' }).then((r) => {
    downloadBlob(r, 'all-assets-report.xlsx');
  });

export const exportAssetReport = (reportType) =>
  api.get(`/api/reports/assets/${reportType}`, { responseType: 'blob' }).then((r) => {
    downloadBlob(r, `${reportType}-assets-report.xlsx`);
  });

export const exportAllEmployees = () =>
  api.get('/api/reports/employees/all', { responseType: 'blob' }).then((r) => {
    downloadBlob(r, 'all-employees-report.xlsx');
  });
