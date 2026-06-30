export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const statusStyles = {
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Assigned: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Maintenance: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Under Maintenance': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Maintenance Started': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Maintenance Completed': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Returned: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  'Return Requested': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'Maintenance Requested': 'bg-purple-50 text-purple-700 ring-purple-600/20',
  Disposed: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const getStatusStyle = (status) =>
  statusStyles[status] || 'bg-slate-100 text-slate-700 ring-slate-600/20';

const activityLabels = {
  assigned: 'Assigned',
  returned: 'Returned',
  maintenance_started: 'Maintenance',
  maintenance_completed: 'Completed',
  disposed: 'Disposed',
};

export const formatActivityStatus = (status) =>
  activityLabels[status] || status?.replace(/_/g, ' ') || 'Unknown';

export const buildAssetFormData = (values, files = {}) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  if (files?.assetImage) {
    formData.append('assetImage', files.assetImage);
  }

  if (files?.assetInvoice) {
    formData.append('assetInvoice', files.assetInvoice);
  }

  return formData;
};

export const buildEmployeeFormData = (values, files) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  if (files?.profilePic) {
    formData.append('profilePic', files.profilePic);
  }

  if (files?.idProofDoc) {
    formData.append('idProofDoc', files.idProofDoc);
  }

  return formData;
};
