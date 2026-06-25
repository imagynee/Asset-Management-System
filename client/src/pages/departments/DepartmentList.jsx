import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../api/departments";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import { Card, FormField, TextArea, TextInput } from "../../components/ui/Form";
import { useToast } from "../../context/ToastContext";

const emptyForm = { deptName: "", deptIncharge: "", additionalNote: "" };

export default function DepartmentList() {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadDepartments = () => {
    setLoading(true);
    getDepartments()
      .then((data) => setDepartments(data.departments || []))
      .catch((error) => showToast(error.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (department) => {
    setEditingId(department._id);
    setForm({
      deptName: department.deptName || "",
      deptIncharge: department.deptIncharge || "",
      additionalNote: department.additionalNote || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateDepartment(editingId, form);
        showToast("Department updated successfully", "success");
      } else {
        await createDepartment(form);
        showToast("Department created successfully", "success");
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      loadDepartments();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteDepartment(deleteTarget._id);
      showToast("Department deleted successfully", "success");
      setDeleteTarget(null);
      loadDepartments();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage organizational departments for asset assignment.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !departments.length ? (
        <EmptyState
          title="No departments yet"
          description="Create departments like IT, HR, or Finance to organize assets."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Header */}
          <div className="flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50">
            <div className="flex-1">Department</div>
            <div className="flex-1">In-charge</div>
            <div className="flex-1">Description</div>
            <div className="w-16 text-center">Assets</div>
            <div className="w-24 text-center">Actions</div>
          </div>

          {/* Rows */}
          {departments.map((department, index) => (
            <div
              key={department._id}
              className={`flex items-center px-4 py-4 ${
                index !== departments.length - 1
                  ? "border-b border-slate-200"
                  : ""
              }`}
            >
              <div className="flex-1 font-medium text-slate-900">
                {department.deptName}
              </div>

              <div className="flex-1 text-sm text-slate-600">
                {department.deptIncharge || "-"}
              </div>

              <div className="flex-1 text-sm text-slate-600">
                {department.additionalNote || "-"}
              </div>

              <div className="w-16 flex justify-center">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-violet-50 px-2 text-sm font-bold text-violet-700">
                  {department.assetCount || 0}
                </span>
              </div>

              <div className="w-24 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(department)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-700"
                  aria-label="Edit department"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(department)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete department"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "Edit Department" : "Add Department"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Department Name" required>
            <TextInput
              value={form.deptName}
              onChange={(e) => setForm({ ...form, deptName: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Department In-charge">
            <TextInput
              value={form.deptIncharge}
              onChange={(e) =>
                setForm({ ...form, deptIncharge: e.target.value })
              }
            />
          </FormField>
          <FormField label="Additional Notes">
            <TextArea
              rows={3}
              value={form.additionalNote}
              onChange={(e) =>
                setForm({ ...form, additionalNote: e.target.value })
              }
            />
          </FormField>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingId ? "Update Department" : "Create Department"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Department"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.deptName}</strong>? This cannot be undone if
          the department has no linked assets.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={submitting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
