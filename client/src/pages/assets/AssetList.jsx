import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Search, Filter } from 'lucide-react';
import { getAssets } from '../../api/assets';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import AssetForm from './AssetForm';
import { Card } from '../../components/ui/Form';
import { useToast } from '../../context/ToastContext';

export default function AssetList() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const page = searchParams.get('page') || '1';

  const loadAssets = () => {
    setLoading(true);
    getAssets({
      search,
      status: status || undefined,
      category: category || undefined,
      page,
      limit: 10,
    })
      .then(setData)
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssets();
  }, [search, status, category, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage inventory, track assignments, and monitor asset lifecycle.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search by name, ID, model, serial..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={status}
                onChange={(e) => updateParam('status', e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="">All Status</option>
                {(data?.status || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">All Categories</option>
              {(data?.categories || []).map((item) => (
                <option key={item._id} value={item._id}>
                  {item.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : !data?.assets?.length ? (
        <EmptyState
          title="No assets found"
          description="Try adjusting your filters or add a new asset to get started."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Asset ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Model</th>
                  <th className="px-5 py-3">Serial</th>
                  <th className="px-5 py-3">Assigned To</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.assets.map((asset) => (
                  <tr key={asset._id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-3 font-medium text-brand-700">{asset.assetId}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{asset.assetName}</td>
                    <td className="px-5 py-3">{asset.categoryName || '—'}</td>
                    <td className="px-5 py-3">{asset.model || '—'}</td>
                    <td className="px-5 py-3">{asset.serialNumber || '—'}</td>
                    <td className="px-5 py-3">
                      {asset.assignedTo ? (
                        <span>
                          {asset.assignedTo.name}
                          <span className="block text-xs text-slate-400">
                            {asset.assignedTo.empId}
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/assets/${asset._id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-brand-700 hover:bg-brand-50"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
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

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Asset" size="lg">
        <AssetForm
          categories={data?.categories || []}
          vendors={data?.vendors || []}
          departments={data?.departments || []}
          onSuccess={() => {
            setShowForm(false);
            showToast('Asset created successfully', 'success');
            loadAssets();
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

    </div>
  );
}
