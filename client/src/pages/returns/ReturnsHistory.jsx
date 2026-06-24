import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReturnHistory } from '../../api/returns';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Card, CardHeader } from '../../components/ui/Form';
import { formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

export default function ReturnsHistory() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReturnHistory()
      .then(setData)
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const returns = data?.returnedAssets || [];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Returns History</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all assets that have been returned to inventory.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !returns.length ? (
        <EmptyState
          title="No returns recorded"
          description="Returned assets will appear here once employees return assigned items."
        />
      ) : (
        <Card>
          <CardHeader
            title="Returned Assets"
            subtitle={`${data.count} return${data.count === 1 ? '' : 's'} recorded`}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Asset ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Returned By</th>
                  <th className="px-5 py-3">Remarks</th>
                  <th className="px-5 py-3">Return Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((item) => (
                  <tr key={item.historyId} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-3 font-medium text-brand-700">{item.assetId}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{item.assetName}</td>
                    <td className="px-5 py-3">{item.categoryName || '—'}</td>
                    <td className="px-5 py-3">{item.department?.deptName || '—'}</td>
                    <td className="px-5 py-3">
                      {item.assignedTo ? (
                        <span>
                          {item.assignedTo.name}
                          <span className="block text-xs text-slate-400">{item.assignedTo.empId}</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{item.remarks || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(item.actionDate)}</td>
                    <td className="px-5 py-3 text-right">
                      {item._id && (
                        <Link
                          to={`/assets/${item._id}`}
                          className="text-brand-700 hover:underline"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
