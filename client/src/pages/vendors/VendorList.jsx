import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../../api/vendors";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import { Card, FormField, TextArea, TextInput } from "../../components/ui/Form";
import { useToast } from "../../context/ToastContext";

const emptyForm = {
  vendorName: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
};

export default function VendorList() {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadVendors = () => {
    setLoading(true);
    getVendors()
      .then((data) => setVendors(data.vendors || []))
      .catch((error) => showToast(error.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (vendor) => {
    setEditingId(vendor._id);
    setForm({
      vendorName: vendor.vendorName || "",
      contactPerson: vendor.contactPerson || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateVendor(editingId, form);
        showToast("Vendor updated successfully", "success");
      } else {
        await createVendor(form);
        showToast("Vendor created successfully", "success");
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      loadVendors();
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
      await deleteVendor(deleteTarget._id);
      showToast("Vendor deleted successfully", "success");
      setDeleteTarget(null);
      loadVendors();
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
            {!loading && vendors.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-600/20">
                {vendors.length} {vendors.length === 1 ? 'record' : 'records'}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage suppliers and vendor contact information.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !vendors.length ? (
        <EmptyState
          title="No vendors yet"
          description="Add vendors to link them with your assets."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Assets</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr
                    key={vendor._id}
                    className="border-t border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">
                        {vendor.vendorName}
                      </p>
                      {vendor.address && (
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {vendor.address}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {vendor.contactPerson || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {vendor.email || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {vendor.phone || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-sky-50 px-2 text-sm font-bold text-sky-700 ring-1 ring-inset ring-sky-600/20">
                        {vendor.assetCount || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(vendor)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-700"
                          aria-label="Edit vendor"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(vendor)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete vendor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "Edit Vendor" : "Add Vendor"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Vendor Name" required>
            <TextInput
              value={form.vendorName}
              onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Contact Person">
            <TextInput
              value={form.contactPerson}
              onChange={(e) =>
                setForm({ ...form, contactPerson: e.target.value })
              }
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email">
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField label="Phone">
              <TextInput
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Address">
            <TextArea
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </FormField>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingId ? "Update Vendor" : "Create Vendor"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Vendor"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.vendorName}</strong>? Vendors linked to assets
          cannot be deleted.
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
