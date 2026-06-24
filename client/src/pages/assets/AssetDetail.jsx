import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  QrCode,
  RotateCcw,
  Wrench,
  CheckCircle2,
  Pencil,
  Trash2,
  Download,
  PackagePlus,
} from 'lucide-react';
import {
  getAssetById,
  getAssets,
  deleteAsset,
  disposeAsset,
  returnAsset,
  startMaintenance,
  completeMaintenance,
  getAssetQrUrl,
  getUploadUrl,
  downloadAssetQr,
  downloadAssetInvoice,
} from '../../api/assets';
import { assignAssets, getEmployees } from '../../api/employees';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import AssetForm from './AssetForm';
import { Card, CardHeader } from '../../components/ui/Form';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [disposeLoading, setDisposeLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDispose, setShowDispose] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [qrDownloading, setQrDownloading] = useState(false);
  const [invoiceDownloading, setInvoiceDownloading] = useState(false);

  const loadAsset = () => {
    setLoading(true);
    Promise.all([getAssetById(id), getAssets({ limit: 1 }), getEmployees({ limit: 100 })])
      .then(([assetData, listData, employeeData]) => {
        setData(assetData);
        setMeta(listData);
        setEmployees(employeeData.employees || []);
      })
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAsset();
  }, [id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      if (action === 'return') await returnAsset(data.asset._id);
      if (action === 'maintenance') await startMaintenance(data.asset._id);
      if (action === 'complete') await completeMaintenance(data.asset._id);
      showToast('Action completed successfully', 'success');
      loadAsset();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteAsset(id);
      showToast('Asset deleted successfully', 'success');
      navigate('/assets');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmployeeId) {
      showToast('Select an employee', 'error');
      return;
    }

    setAssignLoading(true);
    try {
      await assignAssets(selectedEmployeeId, [data.asset._id]);
      showToast('Asset assigned successfully', 'success');
      setShowAssign(false);
      setSelectedEmployeeId('');
      loadAsset();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDispose = async () => {
    setDisposeLoading(true);
    try {
      await disposeAsset(id);
      showToast('Asset disposed successfully', 'success');
      setShowDispose(false);
      loadAsset();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setDisposeLoading(false);
    }
  };

  const handleQrDownload = async () => {
    const assetId = data?.asset?.assetId;
    if (!assetId) return;

    setQrDownloading(true);
    try {
      await downloadAssetQr(assetId);
      showToast('QR code downloaded', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setQrDownloading(false);
    }
  };

  const handleInvoiceDownload = async () => {
    if (!data?.asset?.assetInvoice) return;

    setInvoiceDownloading(true);
    try {
      await downloadAssetInvoice(data.asset.assetInvoice, data.asset.assetId);
      showToast('Invoice downloaded', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setInvoiceDownloading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data?.asset) {
    return (
      <div className="text-center">
        <p className="text-slate-500">Asset not found</p>
        <Link to="/assets" className="mt-4 inline-block text-brand-700">
          Back to assets
        </Link>
      </div>
    );
  }

  const { asset, assignedHistory, maintenanceHistory } = data;
  const status = asset.status;
  const warranty = getWarrantySummary(asset.warrantyExpiry);

  const editValues = {
    assetName: asset.assetName || '',
    category: meta?.categories?.find((c) => c.categoryName === asset.category)?._id || '',
    vendor: meta?.vendors?.find((v) => v.vendorName === asset.vendor?.vendorName)?._id || '',
    department:
      meta?.departments?.find((d) => d.deptName === asset.department?.deptName)?._id ||
      asset.department?._id ||
      '',
    model: asset.model || '',
    serialNumber: asset.serialNumber || '',
    purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
    purchaseCost: asset.purchaseCost ?? '',
    warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
    additionalNotes: asset.additionalNotes || '',
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to="/assets"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to assets
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{asset.assetName}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{asset.assetId}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {status === 'Available' && (
            <Button onClick={() => setShowAssign(true)}>
              <PackagePlus className="h-4 w-4" />
              Assign Asset
            </Button>
          )}
          {status === 'Assigned' && (
            <>
              <Button variant="secondary" loading={actionLoading} onClick={() => handleAction('return')}>
                <RotateCcw className="h-4 w-4" />
                Return
              </Button>
              <Button variant="secondary" loading={actionLoading} onClick={() => handleAction('maintenance')}>
                <Wrench className="h-4 w-4" />
                Start Maintenance
              </Button>
            </>
          )}
          {status === 'Maintenance' && (
            <Button loading={actionLoading} onClick={() => handleAction('complete')}>
              <CheckCircle2 className="h-4 w-4" />
              Complete Maintenance
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowEdit(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          {status !== 'Disposed' && (
            <Button variant="secondaryDanger" onClick={() => setShowDispose(true)}>
              <Trash2 className="h-4 w-4" />
              Dispose Asset
            </Button>
          )}
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Asset Information" />
          <div className="space-y-5 p-5">
            <WarrantyBox warranty={warranty} />

            <InfoSection title="Identity">
              <InfoItem label="Asset ID" value={asset.assetId} />
              <InfoItem label="Model" value={asset.model} />
              <InfoItem label="Serial Number" value={asset.serialNumber} />
              <InfoItem label="Category" value={asset.category} />
            </InfoSection>

            <InfoSection title="Purchase & Warranty">
              <InfoItem label="Purchase Date" value={formatDate(asset.purchaseDate)} />
              <InfoItem label="Purchase Cost" value={formatCurrency(asset.purchaseCost)} />
              <InfoItem label="Warranty Expiry" value={formatDate(asset.warrantyExpiry)} />
              <InfoItem label="Warranty Status" value={warranty.label} />
            </InfoSection>

            <InfoSection title="Ownership">
              <InfoItem label="Department" value={asset.department?.deptName} />
              <InfoItem label="Vendor" value={asset.vendor?.vendorName} />
              <InfoItem label="Vendor Phone" value={asset.vendor?.phone} />
              <InfoItem
                label="Assigned To"
                value={
                  asset.assignedTo
                    ? `${asset.assignedTo.name} (${asset.assignedTo.empId})`
                    : 'Unassigned'
                }
              />
            </InfoSection>

            {asset.additionalNotes && (
              <InfoSection title="Notes" columns="sm:grid-cols-1">
                <InfoItem label="Additional Notes" value={asset.additionalNotes} />
              </InfoSection>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          {asset.assetImage && (
            <Card>
              <CardHeader title="Asset Image" />
              <img
                src={getUploadUrl(asset.assetImage)}
                alt={asset.assetName}
                className="h-48 w-full object-cover"
              />
            </Card>
          )}

          {asset.assetInvoice && (
            <Card>
              <CardHeader title="Asset Invoice" subtitle="View or download invoice file" />
              <div className="flex flex-col gap-3 p-5">
                <a
                  href={getUploadUrl(asset.assetInvoice)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
                >
                  View Invoice
                </a>
                <Button
                  variant="secondary"
                  loading={invoiceDownloading}
                  onClick={handleInvoiceDownload}
                >
                  <Download className="h-4 w-4" />
                  Download Invoice
                </Button>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="QR Code" subtitle="Scan to identify asset" />
            <div className="flex flex-col items-center p-5">
              <img
                src={getAssetQrUrl(asset.assetId)}
                alt={`QR code for ${asset.assetId}`}
                className="h-40 w-40 rounded-xl border border-slate-100 bg-white p-2"
              />
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <QrCode className="h-4 w-4" />
                {asset.assetId}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                loading={qrDownloading}
                onClick={handleQrDownload}
              >
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HistoryCard title="Assignment History" items={assignedHistory} />
        <HistoryCard title="Maintenance History" items={maintenanceHistory} />
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Asset" size="lg">
        <AssetForm
          assetId={id}
          initialValues={editValues}
          categories={meta?.categories || []}
          vendors={meta?.vendors || []}
          departments={meta?.departments || []}
          onSuccess={() => {
            setShowEdit(false);
            showToast('Asset updated successfully', 'success');
            loadAsset();
          }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Asset" size="md">
        {!employees.length ? (
          <p className="text-sm text-slate-500">No employees available to assign.</p>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Employee</span>
              <select
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.empId})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={() => setShowAssign(false)}>
            Cancel
          </Button>
          <Button loading={assignLoading} onClick={handleAssign}>
            Assign
          </Button>
        </div>
      </Modal>

      <Modal open={showDispose} onClose={() => setShowDispose(false)} title="Dispose Asset" size="sm">
        <p className="text-sm text-slate-600">
          Are you sure you want to dispose <strong>{asset.assetName}</strong>? This will mark the
          asset as disposed and remove any current assignment.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDispose(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={disposeLoading} onClick={handleDispose}>
            Dispose Asset
          </Button>
        </div>
      </Modal>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Asset" size="sm">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{asset.assetName}</strong>? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={actionLoading} onClick={handleDelete}>
            Delete Asset
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoItem({ label, value, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50/60 p-3 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-900">{value || '—'}</div>
    </div>
  );
}

function InfoSection({ title, children, columns = 'sm:grid-cols-2' }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      <div className={`grid gap-3 ${columns}`}>{children}</div>
    </section>
  );
}

function WarrantyBox({ warranty }) {
  return (
    <div className={`rounded-xl border p-4 ${warranty.className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{warranty.heading}</p>
      <p className="mt-1 text-lg font-bold">{warranty.label}</p>
      <p className="mt-1 text-sm">{warranty.description}</p>
    </div>
  );
}

function getWarrantySummary(warrantyExpiry) {
  if (!warrantyExpiry) {
    return {
      heading: 'Warranty',
      label: 'No warranty date',
      description: 'No warranty expiry date is recorded for this asset.',
      className: 'border-slate-200 bg-slate-50 text-slate-700',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(warrantyExpiry);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const expiredDays = Math.abs(diffDays);
    return {
      heading: 'Warranty Expired',
      label: `${expiredDays} day${expiredDays === 1 ? '' : 's'} ago`,
      description: `Warranty expired on ${formatDate(warrantyExpiry)}.`,
      className: 'border-red-200 bg-red-50 text-red-700',
    };
  }

  if (diffDays <= 30) {
    return {
      heading: 'Warranty Expiring Soon',
      label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`,
      description: `Warranty expires on ${formatDate(warrantyExpiry)}.`,
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  return {
    heading: 'Warranty Active',
    label: `${diffDays} days left`,
    description: `Warranty expires on ${formatDate(warrantyExpiry)}.`,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };
}

function HistoryCard({ title, items }) {
  return (
    <Card>
      <CardHeader title={title} />
      <div className="divide-y divide-slate-100">
        {!items?.length ? (
          <p className="p-5 text-sm text-slate-500">No history recorded yet.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {item.employee?.name || 'Unknown'}
                </p>
                <p className="text-xs text-slate-500">{item.employee?.empId}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={item.status} />
                <p className="mt-1 text-xs text-slate-400">{formatDate(item.actionDate)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
