import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Package,
  UserCheck,
  PackageCheck,
  Wrench,
  AlertTriangle,
  Clock,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDashboard, getWarrantyAlerts } from '../api/dashboard';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardHeader } from '../components/ui/Form';
import { useToast } from '../context/ToastContext';
import { formatActivityStatus, formatDate } from '../utils/helpers';

const CHART_COLORS = ['#0f766e', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2'];

export default function Dashboard() {
  const { showToast } = useToast();

  const accent = localStorage.getItem('accentColor') || 'teal';
  const primaryBrandColor = accent === 'blue' ? '#3b82f6' : '#0f766e';
  const chartColors = accent === 'blue'
    ? ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
    : ['#0f766e', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2'];
  const [dashboard, setDashboard] = useState(null);
  const [warranty, setWarranty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getWarrantyAlerts()])
      .then(([dashboardData, warrantyData]) => {
        setDashboard(dashboardData);
        setWarranty(warrantyData);
      })
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  const categoryData = Object.entries(dashboard?.assetsByCategory || {}).map(
    ([name, value]) => ({ name, value })
  );

  const statusData = [
    { name: 'Assigned', value: dashboard?.stats?.assignedAssets || 0 },
    { name: 'Available', value: dashboard?.stats?.availableAssets || 0 },
    { name: 'Maintenance', value: dashboard?.stats?.underMaintenance || 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your organization&apos;s asset inventory and health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Assets"
          value={dashboard?.stats?.totalAssets ?? 0}
          icon={Package}
          accent="brand"
        />
        <StatCard
          title="Assigned"
          value={dashboard?.stats?.assignedAssets ?? 0}
          icon={UserCheck}
          accent="blue"
          subtitle={`${dashboard?.assetStatusPercentages?.assigned ?? 0}% of total`}
        />
        <StatCard
          title="Available"
          value={dashboard?.stats?.availableAssets ?? 0}
          icon={PackageCheck}
          accent="emerald"
          subtitle={`${dashboard?.assetStatusPercentages?.available ?? 0}% of total`}
        />
        <StatCard
          title="Under Maintenance"
          value={dashboard?.stats?.underMaintenance ?? 0}
          icon={Wrench}
          accent="amber"
          subtitle={`${dashboard?.assetStatusPercentages?.underMaintenance ?? 0}% of total`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader title="Assets by Status" subtitle="Current distribution" />
          <div className="h-72 p-4">
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No asset data yet
              </div>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Assets by Category" subtitle="Inventory breakdown" />
          <div className="h-72 p-4">
            {categoryData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={primaryBrandColor} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No categories found
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Recent Assets" subtitle="Latest additions to inventory" />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Asset ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.recentAssets || []).map((asset) => (
                  <tr key={asset.assetId} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-brand-700">
                      <Link to={`/assets?search=${asset.assetId}`}>{asset.assetId}</Link>
                    </td>
                    <td className="px-5 py-3">{asset.assetName}</td>
                    <td className="px-5 py-3">{asset.categoryName || '—'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-5 py-3">
                      {asset.assignedTo
                        ? `${asset.assignedTo.name} (${asset.assignedTo.empId})`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Warranty Alerts"
            subtitle={`${warranty?.expiringCount ?? 0} expiring · ${warranty?.expiredCount ?? 0} expired`}
          />
          <div className="max-h-96 space-y-3 overflow-y-auto p-4">
            {(warranty?.expiringAssets || []).slice(0, 5).map((asset) => (
              <div
                key={asset._id}
                className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3"
              >
                <Clock className="mt-0.5 h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{asset.assetName}</p>
                  <p className="text-xs text-slate-500">{asset.assetId}</p>
                  <p className="mt-1 text-xs font-medium text-amber-700">
                    Expires in {asset.daysLeft} days
                  </p>
                </div>
              </div>
            ))}

            {(warranty?.expiredAssets || []).slice(0, 3).map((asset) => (
              <div
                key={asset._id}
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{asset.assetName}</p>
                  <p className="text-xs text-slate-500">{asset.assetId}</p>
                  <p className="mt-1 text-xs font-medium text-red-700">
                    Expired {asset.expiredDays} days ago
                  </p>
                </div>
              </div>
            ))}

            {!warranty?.expiringAssets?.length && !warranty?.expiredAssets?.length && (
              <p className="py-8 text-center text-sm text-slate-500">No warranty alerts</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Activity" subtitle="Latest asset lifecycle events" />
        <div className="overflow-x-auto">
          {(dashboard?.recentActivity || []).length ? (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Asset</th>
                  <th className="px-5 py-3">Model</th>
                  <th className="px-5 py-3">Activity</th>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentActivity.map((activity, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      {activity.assetId ? (
                        <Link
                          to={`/assets?search=${activity.assetId}`}
                          className="font-medium text-brand-700"
                        >
                          {activity.assetName || activity.assetId}
                        </Link>
                      ) : (
                        activity.assetName || '—'
                      )}
                      {activity.assetId && (
                        <p className="text-xs text-slate-400">{activity.assetId}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">{activity.model || '—'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={formatActivityStatus(activity.status)} />
                    </td>
                    <td className="px-5 py-3">
                      {activity.assignedTo
                        ? `${activity.assignedTo.employeeName} (${activity.assignedTo.empId})`
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {formatDate(activity.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-slate-500">
              <Activity className="h-8 w-8 text-slate-300" />
              <p className="text-sm">No recent activity yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
