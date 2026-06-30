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
  Search,
  User,
  Calendar,
  MessageSquare,
  Building2,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  UserCheck,
  PackageX,
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
import { Card, CardHeader, FormField, SelectInput, TextArea, TextInput } from '../../components/ui/Form';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const getTodayInputValue = () => new Date().toISOString().split('T')[0];

const actionConfig = {
  return: {
    title: 'Return Asset',
    submitLabel: 'Return Asset',
    successMessage: 'Asset returned successfully',
  },
  maintenance: {
    title: 'Start Maintenance',
    submitLabel: 'Start Maintenance',
    successMessage: 'Maintenance started successfully',
  },
  complete: {
    title: 'Complete Maintenance',
    submitLabel: 'Complete Maintenance',
    successMessage: 'Maintenance completed successfully',
  },
};

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
  const [actionModal, setActionModal] = useState(null);
  const [actionForm, setActionForm] = useState({
    remarks: '',
    actionDate: getTodayInputValue(),
    vendor: '',
  });
  const [qrDownloading, setQrDownloading] = useState(false);
  const [invoiceDownloading, setInvoiceDownloading] = useState(false);
  const [empSearch, setEmpSearch] = useState('');
  const [showAllEmployees, setShowAllEmployees] = useState(false);

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

  const openActionModal = (action) => {
    const assetVendorId = meta?.vendors?.find(
      (vendor) => vendor.vendorName === data?.asset?.vendor?.vendorName
    )?._id;

    setActionForm({
      remarks: '',
      actionDate: getTodayInputValue(),
      vendor: action === 'maintenance' ? assetVendorId || '' : '',
    });
    setActionModal(action);
  };

  const handleAction = async () => {
    if (!actionModal) return;

    setActionLoading(true);
    try {
      if (actionModal === 'return') await returnAsset(data.asset._id, actionForm);
      if (actionModal === 'maintenance') await startMaintenance(data.asset._id, actionForm);
      if (actionModal === 'complete') await completeMaintenance(data.asset._id, actionForm);
      showToast(actionConfig[actionModal].successMessage, 'success');
      setActionModal(null);
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
      setEmpSearch('');
      setShowAllEmployees(false);
      loadAsset();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDispose = async () => {
    if (data.asset.assignedTo || data.asset.status !== 'Available') {
      showToast('Only unassigned available assets can be disposed. Return the asset before disposing it.', 'error');
      return;
    }

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
  const canDispose = !asset.assignedTo && status === 'Available';

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
              <Button variant="secondary" onClick={() => openActionModal('return')}>
                <RotateCcw className="h-4 w-4" />
                Return
              </Button>
              <Button variant="secondary" onClick={() => openActionModal('maintenance')}>
                <Wrench className="h-4 w-4" />
                Start Maintenance
              </Button>
            </>
          )}
          {status === 'Maintenance' && (
            <Button onClick={() => openActionModal('complete')}>
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
        <AssignmentHistoryCard items={assignedHistory} />
        <MaintenanceHistoryCard items={maintenanceHistory} />
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

      <Modal
        open={showAssign}
        onClose={() => { setShowAssign(false); setEmpSearch(''); setShowAllEmployees(false); }}
        title="Assign Asset"
        size="md"
      >
        {!employees.length ? (
          <p className="text-sm text-slate-500">No employees available to assign.</p>
        ) : (() => {
          const PAGE = 6;
          const q = empSearch.toLowerCase();
          const filtered = employees.filter((e) =>
            e.name?.toLowerCase().includes(q) ||
            e.empId?.toLowerCase().includes(q) ||
            (e.department || '').toLowerCase().includes(q)
          );
          const visible = showAllEmployees ? filtered : filtered.slice(0, PAGE);
          const hasMore = filtered.length > PAGE;

          return (
            <div className="space-y-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employee by name, ID or department..."
                  value={empSearch}
                  onChange={(e) => { setEmpSearch(e.target.value); setShowAllEmployees(false); }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </div>

              {/* Count line */}
              <p className="text-xs text-slate-400">
                {filtered.length} employee{filtered.length !== 1 ? 's' : ''} found
              </p>

              {/* Employee list */}
              {filtered.length === 0 ? (
                <div className="flex h-95 items-center justify-center text-sm text-slate-400">
                  No employees match your search.
                </div>
              ) : (
                <div className="h-95 overflow-y-auto pr-1 space-y-2">
                  {visible.map((employee) => {
                    const isSelected = selectedEmployeeId === employee._id;
                    return (
                      <button
                        key={employee._id}
                        type="button"
                        onClick={() => setSelectedEmployeeId(isSelected ? '' : employee._id)}
                        className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border p-3.5 text-left transition ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          checked={isSelected}
                          readOnly
                          className="h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{employee.name}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {employee.empId} · {employee.department || 'No Department'}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  {/* View more / less button */}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => setShowAllEmployees((v) => !v)}
                      className="w-full rounded-xl border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 hover:border-brand-400 hover:text-brand-600 transition-colors"
                    >
                      {showAllEmployees
                        ? 'Show less'
                        : `View ${filtered.length - PAGE} more employee${filtered.length - PAGE !== 1 ? 's' : ''}`}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })()}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-400">
            {selectedEmployeeId
              ? `Selected: ${employees.find((e) => e._id === selectedEmployeeId)?.name || ''}`
              : 'No employee selected'}
          </span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setShowAssign(false); setEmpSearch(''); setShowAllEmployees(false); }}>
              Cancel
            </Button>
            <Button loading={assignLoading} onClick={handleAssign}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(actionModal)}
        onClose={() => setActionModal(null)}
        title={actionModal ? actionConfig[actionModal].title : 'Asset Action'}
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Action Date" required>
            <TextInput
              type="date"
              value={actionForm.actionDate}
              onChange={(event) =>
                setActionForm((current) => ({ ...current, actionDate: event.target.value }))
              }
            />
          </FormField>

          {actionModal === 'maintenance' && (
            <FormField label="Maintenance Vendor">
              <SelectInput
                value={actionForm.vendor}
                onChange={(event) =>
                  setActionForm((current) => ({ ...current, vendor: event.target.value }))
                }
              >
                <option value="">Select vendor</option>
                {(meta?.vendors || []).map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.vendorName}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          )}

          <FormField label="Remarks">
            <TextArea
              rows={4}
              value={actionForm.remarks}
              onChange={(event) =>
                setActionForm((current) => ({ ...current, remarks: event.target.value }))
              }
              placeholder="Add notes for this action"
            />
          </FormField>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={() => setActionModal(null)}>
            Cancel
          </Button>
          <Button loading={actionLoading} onClick={handleAction}>
            {actionModal ? actionConfig[actionModal].submitLabel : 'Submit'}
          </Button>
        </div>
      </Modal>

      <Modal open={showDispose} onClose={() => setShowDispose(false)} title="Dispose Asset" size="sm">
        {canDispose ? (
          <p className="text-sm text-slate-600">
            Are you sure you want to dispose <strong>{asset.assetName}</strong>? This will mark the
            asset as disposed.
          </p>
        ) : (
          <p className="text-sm text-red-600">
            Only unassigned available assets can be disposed. Return this asset before disposing it.
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDispose(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={disposeLoading} disabled={!canDispose} onClick={handleDispose}>
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

function AssignmentHistoryCard({ items }) {
  return (
    <Card>
      <CardHeader title="Assignment History" subtitle={`${items?.length || 0} total assignments/returns`} />
      <div className="p-5">
        {!items?.length ? (
          <p className="text-sm text-slate-500 py-4 text-center">No assignment history recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const isAssigned = item.status?.toLowerCase() === 'assigned';
              const iconBg = isAssigned ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200';
              const BulletIcon = isAssigned ? UserCheck : RotateCcw;
              return (
                <div key={index} className="flex gap-4 items-center bg-slate-50 border border-slate-100 rounded-xl p-3 hover:bg-slate-100/50 transition-colors">
                  {/* Icon */}
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${iconBg}`}>
                    <BulletIcon className="h-3.5 w-3.5" />
                  </span>

                  {/* Content column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {item.employee?.name || 'Unknown Employee'}
                        </span>
                        {item.employee?.empId && (
                          <span className="mt-0.5 inline-block rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 w-fit">
                            {item.employee.empId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={item.status} />
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shrink-0">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(item.actionDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remarks bubble with faded border */}
                    {item.remarks && (
                      <div className="flex items-start gap-2 rounded-lg bg-white border border-slate-100/50 p-2 text-xs text-slate-600 mt-2">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="italic">"{item.remarks}"</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

function MaintenanceHistoryCard({ items }) {
  return (
    <Card>
      <CardHeader title="Maintenance History" subtitle={`${items?.length || 0} maintenance records`} />
      <div className="p-5">
        {!items?.length ? (
          <p className="text-sm text-slate-500 py-4 text-center">No maintenance history recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const isCompleted = item.status?.toLowerCase().includes('complete') || item.status?.toLowerCase().includes('finish');
              const iconBg = isCompleted ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-amber-100 text-amber-600 border-amber-200';
              return (
                <div key={index} className="flex gap-4 items-center bg-slate-50 border border-slate-100 rounded-xl p-3 hover:bg-slate-100/50 transition-colors">
                  {/* Icon */}
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${iconBg}`}>
                    <Wrench className="h-3.5 w-3.5" />
                  </span>

                  {/* Content column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 text-sm">
                          Vendor:{' '}
                          {item.vendor?.vendorName ? (
                            <span className="text-slate-900 font-semibold">{item.vendor.vendorName}</span>
                          ) : (
                            <span className="text-slate-400 font-normal italic">Unknown</span>
                          )}
                        </span>
                        {item.vendor?.phone && (
                          <a href={`tel:${item.vendor.phone}`} className="mt-0.5 flex items-center gap-1 text-xs text-slate-450 hover:text-brand-600 w-fit">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{item.vendor.phone}</span>
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={item.status} />
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shrink-0">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(item.actionDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remarks bubble with faded border */}
                    {item.remarks && (
                      <div className="flex items-start gap-2 rounded-lg bg-white border border-slate-100/50 p-2 text-xs text-slate-600 mt-2">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="italic">"{item.remarks}"</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
