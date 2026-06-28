import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PackagePlus, History, Pencil, Trash2, Download } from 'lucide-react';
import {
  getEmployeeById,
  getEmployeeHistory,
  assignAssets,
  deleteEmployee,
  downloadEmployeeIdProof,
} from '../../api/employees';
import { getAssets, getUploadUrl } from '../../api/assets';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import EmployeeForm from './EmployeeForm';
import { Card, CardHeader } from '../../components/ui/Form';
import { formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [employeeData, setEmployeeData] = useState(null);
  const [history, setHistory] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [idProofDownloading, setIdProofDownloading] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getEmployeeById(id),
      getEmployeeHistory(id),
      getAssets({ status: 'Available', limit: 100 }),
    ])
      .then(([employee, historyData, assetsData]) => {
        setEmployeeData(employee);
        setHistory(historyData.history || []);
        setAvailableAssets(assetsData.assets || []);
      })
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const toggleAsset = (assetId) => {
    setSelectedAssets((current) =>
      current.includes(assetId)
        ? current.filter((item) => item !== assetId)
        : [...current, assetId]
    );
  };

  const handleAssign = async () => {
    if (!selectedAssets.length) {
      showToast('Select at least one asset', 'error');
      return;
    }

    setAssignLoading(true);
    try {
      await assignAssets(id, selectedAssets);
      showToast('Assets assigned successfully', 'success');
      setShowAssign(false);
      setSelectedAssets([]);
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteEmployee(id);
      showToast('Employee deleted successfully', 'success');
      navigate('/employees');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleIdProofDownload = async () => {
    if (!employeeData?.employee?.idProofDoc) return;

    setIdProofDownloading(true);
    try {
      await downloadEmployeeIdProof(
        employeeData.employee.idProofDoc,
        employeeData.employee.empId || employeeData.employee._id
      );
      showToast('ID proof downloaded', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIdProofDownloading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!employeeData?.employee) {
    return (
      <div className="text-center">
        <p className="text-slate-500">Employee not found</p>
        <Link to="/employees" className="mt-4 inline-block text-brand-700">
          Back to employees
        </Link>
      </div>
    );
  }

  const { employee, assetDetails } = employeeData;

  const editValues = {
    name: employee.name || '',
    empId: employee.empId || '',
    email: employee.email || '',
    designation: employee.designation || '',
    department: employee.department || '',
    phone: employee.phone || '',
    dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : '',
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to="/employees"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to employees
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{employee.empId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowAssign(true)}>
            <PackagePlus className="h-4 w-4" />
            Assign Assets
          </Button>
          <Button variant="secondary" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4" />
            View History
          </Button>
          <Button variant="secondary" onClick={() => setShowEdit(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader title="Profile" />
            <div className="p-5">
              {employee.profilePic ? (
                <img
                  src={getUploadUrl(employee.profilePic)}
                  alt={employee.name}
                  className="mx-auto mb-4 h-28 w-28 rounded-full object-cover ring-4 ring-brand-50"
                />
              ) : (
                <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">
                  {employee.name?.charAt(0)}
                </div>
              )}
              <div className="space-y-3 text-sm">
                <InfoRow label="Email" value={employee.email} />
                <InfoRow label="Phone" value={employee.phone} />
                <InfoRow label="Department" value={employee.department} />
                <InfoRow label="Designation" value={employee.designation} />
                <InfoRow label="Joined" value={formatDate(employee.dateOfJoining)} />
              </div>
            </div>
          </Card>

          {employee.idProofDoc && (
            <Card>
              <CardHeader title="ID Proof" subtitle="View or download proof document" />
              <div className="flex flex-col gap-3 p-5">
                <a
                  href={getUploadUrl(employee.idProofDoc)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
                >
                  View ID Proof
                </a>
                <Button
                  variant="secondary"
                  loading={idProofDownloading}
                  onClick={handleIdProofDownload}
                >
                  <Download className="h-4 w-4" />
                  Download ID Proof
                </Button>
              </div>
            </Card>
          )}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Assigned Assets"
            subtitle={`${assetDetails?.length || 0} assets currently assigned`}
          />
          <div className="overflow-x-auto">
            {!assetDetails?.length ? (
              <p className="p-5 text-sm text-slate-500">No assets assigned yet.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Asset ID</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Serial</th>
                    <th className="px-5 py-3">Assigned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assetDetails.map((asset) => (
                    <tr key={asset.assetId} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-medium text-brand-700">{asset.assetId}</td>
                      <td className="px-5 py-3">{asset.assetName}</td>
                      <td className="px-5 py-3">{asset.categoryName || '—'}</td>
                      <td className="px-5 py-3">{asset.serialNumber || '—'}</td>
                      <td className="px-5 py-3">{formatDate(asset.assignedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Assets" size="lg">
        {!availableAssets.length ? (
          <p className="text-sm text-slate-500">No available assets to assign.</p>
        ) : (
          <div className="space-y-3">
            {availableAssets.map((asset) => (
              <label
                key={asset._id}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                  selectedAssets.includes(asset._id)
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAssets.includes(asset._id)}
                  onChange={() => toggleAsset(asset._id)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-700"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{asset.assetName}</p>
                  <p className="text-xs text-slate-500">
                    {asset.assetId} · {asset.categoryName || 'Uncategorized'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={() => setShowAssign(false)}>
            Cancel
          </Button>
          <Button loading={assignLoading} onClick={handleAssign}>
            Assign Selected
          </Button>
        </div>
      </Modal>

      <Modal open={showHistory} onClose={() => setShowHistory(false)} title="Asset History" size="lg">
        {!history.length ? (
          <p className="text-sm text-slate-500">No asset history found.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.assetName}</p>
                  <p className="text-xs text-slate-500">{item.assetId}</p>
                  {item.remarks && (
                    <p className="mt-1 text-xs text-slate-400">{item.remarks}</p>
                  )}
                </div>
                <div className="text-right">
                  <StatusBadge status={item.action?.replace(/_/g, ' ')} />
                  <p className="mt-1 text-xs text-slate-400">{formatDate(item.actionDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Employee" size="lg">
        <EmployeeForm
          employeeId={id}
          initialValues={editValues}
          onSuccess={() => {
            setShowEdit(false);
            showToast('Employee updated successfully', 'success');
            loadData();
          }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Employee" size="sm">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{employee.name}</strong>? Employees with assigned
          or maintenance assets cannot be deleted.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>
            Delete Employee
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value || '—'}</span>
    </div>
  );
}
