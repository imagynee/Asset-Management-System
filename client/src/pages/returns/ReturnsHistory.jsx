import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye } from 'lucide-react';
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
                  <th className="px-5 py-3">Asset</th>
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
                    <td className="px-5 py-3">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 text-[14px] leading-snug">
                          {item.assetName}
                        </span>
                        <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 w-fit">
                          {item.assetId}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">{item.department?.deptName || '—'}</td>
                    <td className="px-5 py-3">
                      {item.assignedTo ? (
                        <span>
                          <span className="font-semibold text-slate-800">{item.assignedTo.name}</span>
                          <span className="block text-xs text-slate-400">({item.assignedTo.empId})</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{item.remarks || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 bg-slate-100/90 border border-slate-200 px-2.5 py-0.5 rounded-lg shrink-0 w-fit">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{formatDate(item.actionDate)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {item._id && (
                        <Link
                          to={`/assets/${item._id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-brand-700 hover:bg-brand-50"
                        >
                          <Eye className="h-4 w-4" />
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
