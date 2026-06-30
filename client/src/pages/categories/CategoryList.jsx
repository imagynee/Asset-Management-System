import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categories";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import { Card, FormField, TextArea, TextInput } from "../../components/ui/Form";
import { useToast } from "../../context/ToastContext";

const emptyForm = { categoryName: "", description: "" };

export default function CategoryList() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadCategories = () => {
    setLoading(true);
    getCategories()
      .then((data) => setCategories(data.categories || []))
      .catch((error) => showToast(error.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditingId(category._id);
    setForm({
      categoryName: category.categoryName || "",
      description: category.description || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        showToast("Category updated successfully", "success");
      } else {
        await createCategory(form);
        showToast("Category created successfully", "success");
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      loadCategories();
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
      await deleteCategory(deleteTarget._id);
      showToast("Category deleted successfully", "success");
      setDeleteTarget(null);
      loadCategories();
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
            <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
            {!loading && categories.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                {categories.length} {categories.length === 1 ? 'record' : 'records'}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Organize assets into meaningful groups for easier tracking.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !categories.length ? (
        <EmptyState
          title="No categories yet"
          description="Create categories like Laptops, Monitors, or Furniture."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Assets</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className="border-t border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {category.categoryName}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {category.description || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-emerald-50 px-2 text-sm font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        {category.assetCount || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-700"
                          aria-label="Edit category"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(category)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete category"
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
        title={editingId ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Category Name" required>
            <TextInput
              value={form.categoryName}
              onChange={(e) =>
                setForm({ ...form, categoryName: e.target.value })
              }
              required
            />
          </FormField>
          <FormField label="Description">
            <TextArea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </FormField>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingId ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.categoryName}</strong>? Categories linked to
          assets cannot be deleted.
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
