import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, History, Calendar, Eye } from 'lucide-react';
import { getMaintenanceHistory, getAssets } from '../../api/assets';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { Card, CardHeader } from '../../components/ui/Form';
import { formatActivityStatus, formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const tabs = [
  { id: 'assets', label: 'Under Maintenance', icon: Wrench },
  { id: 'history', label: 'Maintenance History', icon: History },
];

export default function Maintenance() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('assets');
  const [historyData, setHistoryData] = useState(null);
  const [assetsData, setAssetsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHistory = () =>
    getMaintenanceHistory()
      .then(setHistoryData)
      .catch((error) => showToast(error.message, 'error'));

  const loadUnderMaintenance = () =>
    getAssets({ status: 'Maintenance', limit: 100 })
      .then(setAssetsData)
      .catch((error) => showToast(error.message, 'error'));

  useEffect(() => {
    setLoading(true);
    Promise.all([loadHistory(), loadUnderMaintenance()]).finally(() => setLoading(false));
  }, [showToast]);

  const history = historyData?.maintenanceHistory || [];
  const underMaintenance = assetsData?.assets || [];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track maintenance events and assets currently under repair.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === id
                ? 'border-b-2 border-brand-700 text-brand-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'history' ? (
        !history.length ? (
          <EmptyState
            title="No maintenance history"
            description="Maintenance start and completion events will appear here."
          />
        ) : (
          <Card>
            <CardHeader
              title="Maintenance History"
              subtitle={`${historyData.count} event${historyData.count === 1 ? '' : 's'} recorded`}
            />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Asset</th>
                    <th className="px-5 py-3">Department</th>
                    
                    <th className="px-5 py-3">Vendor</th>
                    <th className="px-5 py-3">Event</th>
                    <th className="px-5 py-3">Remarks</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
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
                        {typeof item.maintenanceVendor === 'object'
                          ? item.maintenanceVendor?.vendorName
                          : (item.maintenanceVendor || '—')}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={formatActivityStatus(item.status)} />
                      </td>
                      <td className="px-5 py-3 text-slate-500">{item.remarks || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 bg-slate-100/90 border border-slate-200 px-2.5 py-0.5 rounded-lg shrink-0 w-fit">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{formatDate(item.actionDate)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : !underMaintenance.length ? (
        <EmptyState
          title="No assets under maintenance"
          description="Assets marked for maintenance will appear here."
        />
      ) : (
        <Card>
          <CardHeader
            title="Under Maintenance Assets"
            subtitle={`${assetsData.totalCount ?? underMaintenance.length} asset${
              (assetsData.totalCount ?? underMaintenance.length) === 1 ? '' : 's'
            } currently in maintenance`}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Asset</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Remarks</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {underMaintenance.map((asset) => {
                  const mEvent = history.find(
                    (h) => h._id === asset._id && h.status === 'maintenance_started'
                  );
                  return (
                    <tr key={asset._id} className="border-t border-slate-100 hover:bg-slate-50/80">
                      <td className="px-5 py-3">
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 text-[14px] leading-snug">
                            {asset.assetName}
                          </span>
                          <span className="mt-1 inline-block rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500 w-fit">
                            {asset.assetId}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">{asset.department?.deptName || '—'}</td>
                      <td className="px-5 py-3">
                        {typeof mEvent?.maintenanceVendor === 'object'
                          ? mEvent?.maintenanceVendor?.vendorName
                          : (mEvent?.maintenanceVendor || '—')}
                      </td>
                      <td className="px-5 py-3">
                        {mEvent?.actionDate ? (
                          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 bg-slate-100/90 border border-slate-200 px-2.5 py-0.5 rounded-lg shrink-0 w-fit">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            <span>{formatDate(mEvent.actionDate)}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500 max-w-[200px] truncate">
                        {mEvent?.remarks || '—'}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
