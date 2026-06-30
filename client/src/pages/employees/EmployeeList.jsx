import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Search, Pencil, Trash2 } from 'lucide-react';
import { getEmployees, deleteEmployee } from '../../api/employees';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import EmployeeForm from './EmployeeForm';
import { Card } from '../../components/ui/Form';
import { useToast } from '../../context/ToastContext';

export default function EmployeeList() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const search = searchParams.get('search') || '';
  const page = searchParams.get('page') || '1';

  const loadEmployees = () => {
    setLoading(true);
    getEmployees({ search, page, limit: 10 })
      .then(setData)
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployees();
  }, [search, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const openCreate = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const openEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    setActionLoading(true);
    try {
      await deleteEmployee(deleteTarget._id);
      showToast('Employee deleted successfully', 'success');
      setDeleteTarget(null);
      loadEmployees();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const editValues = editingEmployee
    ? {
        name: editingEmployee.name || '',
        empId: editingEmployee.empId || '',
        email: editingEmployee.email || '',
        designation: editingEmployee.designation || '',
        department: editingEmployee.department || '',
        phone: editingEmployee.phone || '',
        dateOfJoining: editingEmployee.dateOfJoining
          ? editingEmployee.dateOfJoining.split('T')[0]
          : '',
      }
    : null;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage staff records and track asset assignments.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Search by name, ID, email, department..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : !data?.employees?.length ? (
        <EmptyState
          title="No employees found"
          description="Add your first employee to start assigning assets."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Employee ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Designation</th>
                  <th className="px-5 py-3">Assets</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.employees.map((employee) => (
                  <tr key={employee._id || employee.empId} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-3 font-medium text-brand-700">{employee.empId}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{employee.name}</td>
                    <td className="px-5 py-3">{employee.email}</td>
                    <td className="px-5 py-3">{employee.department || '—'}</td>
                    <td className="px-5 py-3">{employee.designation || '—'}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-emerald-50 px-2 text-sm font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        {employee.assetCount || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3">{employee.phone || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {employee._id && (
                          <>
                            <Link
                              to={`/employees/${employee._id}`}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-brand-700 hover:bg-brand-50"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pagination && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <p className="text-sm text-slate-500">
                Page {data.pagination.page} of {data.pagination.totalPages} · {data.totalCount} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={data.pagination.page <= 1}
                  onClick={() => updateParam('page', String(data.pagination.page - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={data.pagination.page >= data.pagination.totalPages}
                  onClick={() => updateParam('page', String(data.pagination.page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        size="lg"
      >
        <EmployeeForm
          employeeId={editingEmployee?._id}
          initialValues={editValues}
          onSuccess={() => {
            setShowForm(false);
            setEditingEmployee(null);
            showToast(
              editingEmployee ? 'Employee updated successfully' : 'Employee created successfully',
              'success'
            );
            loadEmployees();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingEmployee(null);
          }}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Employee" size="sm">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? Employees with
          assigned or maintenance assets cannot be deleted.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={actionLoading} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
