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
  LabelList,
} from 'recharts';
import {
  Package,
  UserCheck,
  PackageCheck,
  PackageX,
  Wrench,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
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

const CATEGORY_GRADIENT_COLORS = [
  { bar: '#6366f1', glow: 'rgba(99,102,241,0.18)' },   // Indigo
  { bar: '#0ea5e9', glow: 'rgba(14,165,233,0.18)' },    // Sky
  { bar: '#8b5cf6', glow: 'rgba(139,92,246,0.18)' },    // Violet
  { bar: '#f59e0b', glow: 'rgba(245,158,11,0.18)' },    // Amber
  { bar: '#10b981', glow: 'rgba(16,185,129,0.18)' },    // Emerald
  { bar: '#ec4899', glow: 'rgba(236,72,153,0.18)' },    // Pink
  { bar: '#f97316', glow: 'rgba(249,115,22,0.18)' },    // Orange
  { bar: '#06b6d4', glow: 'rgba(6,182,212,0.18)' },     // Cyan
];

/* ---------- Custom Tooltip for Category Chart ---------- */
function CategoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  const color = payload[0].payload._color || '#6366f1';
  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: '10px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
        minWidth: 130,
      }}
    >
      <p style={{ color: '#94a3b8', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        Category
      </p>
      <p style={{ color: '#f8fafc', fontSize: 15, fontWeight: 600, margin: '4px 0 8px' }}>
        {name}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: color,
            display: 'inline-block',
            boxShadow: `0 0 6px ${color}`,
          }}
        />
        <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700 }}>
          {value} {value === 1 ? 'asset' : 'assets'}
        </span>
      </div>
    </div>
  );
}

/* ---------- Custom Bar Shape with Rounded Top + Gradient ---------- */
function GradientBar(props) {
  const { x, y, width, height, _color } = props;
  if (!height || height <= 0) return null;
  const id = `bar-grad-${x}-${y}`;
  const radius = Math.min(8, width / 2);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={_color} stopOpacity={1} />
          <stop offset="100%" stopColor={_color} stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={`url(#${id})`}
        style={{ filter: `drop-shadow(0 2px 8px ${_color}44)` }}
      />
    </g>
  );
}

/* ---------- Custom Bar Label ---------- */
function renderBarLabel({ x, y, width, value }) {
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fontSize={12}
      fontWeight={600}
      fill="#94a3b8"
    >
      {value}
    </text>
  );
}


export default function Dashboard() {
  const { showToast } = useToast();

  const accent = localStorage.getItem('accentColor') || 'teal';
  const primaryBrandColor = accent === 'blue' ? '#3b82f6' : '#0f766e';
  const chartColors = accent === 'blue'
    ? ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']
    : ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
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
    ([name, value], idx) => ({
      name,
      value,
      _color: CATEGORY_GRADIENT_COLORS[idx % CATEGORY_GRADIENT_COLORS.length].bar,
      _glow: CATEGORY_GRADIENT_COLORS[idx % CATEGORY_GRADIENT_COLORS.length].glow,
    })
  );

  const totalCategoryAssets = categoryData.reduce((sum, d) => sum + d.value, 0);

  const statusData = [
    { name: 'Assigned', value: dashboard?.stats?.assignedAssets || 0 },
    { name: 'Available', value: dashboard?.stats?.availableAssets || 0 },
    { name: 'Maintenance', value: dashboard?.stats?.underMaintenance || 0 },
    { name: 'Disposed', value: dashboard?.stats?.disposedAssets || 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your organization&apos;s asset inventory and health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Assets"
          value={dashboard?.stats?.totalAssets ?? 0}
          icon={Package}
          accent="purple"
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
          title="Maintenance"
          value={dashboard?.stats?.underMaintenance ?? 0}
          icon={Wrench}
          accent="amber"
          subtitle={`${dashboard?.assetStatusPercentages?.underMaintenance ?? 0}% of total`}
        />
        <StatCard
          title="Disposed"
          value={dashboard?.stats?.disposedAssets ?? 0}
          icon={PackageX}
          accent="red"
          subtitle={`${dashboard?.assetStatusPercentages?.disposed ?? 0}% of total`}
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

        {/* ═══════════════ UPGRADED: Assets by Category ═══════════════ */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
              >
                <Layers className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Assets by Category</h3>
                <p className="text-sm text-slate-500">Inventory breakdown</p>
              </div>
            </div>
            {totalCategoryAssets > 0 && (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  color: '#6366f1',
                }}
              >
                {totalCategoryAssets} total
              </span>
            )}
          </div>

          <div className="p-4">
            {categoryData.length ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{ top: 20, right: 12, left: -4, bottom: 4 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="#e2e8f0"
                        strokeOpacity={0.6}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        dy={6}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        dx={-4}
                      />
                      <Tooltip
                        content={<CategoryTooltip />}
                        cursor={{ fill: 'rgba(99,102,241,0.04)', radius: 8 }}
                      />
                      <Bar
                        dataKey="value"
                        shape={<GradientBar />}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      >
                        <LabelList dataKey="value" content={renderBarLabel} />
                        {categoryData.map((entry, index) => (
                          <Cell key={entry.name} _color={entry._color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend Strip */}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-sm"
                        style={{
                          background: cat._color,
                          boxShadow: `0 0 6px ${cat._glow}`,
                        }}
                      />
                      <span className="text-xs font-medium text-slate-600">
                        {cat.name}
                      </span>
                      <span className="text-xs tabular-nums text-slate-400">
                        {cat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(99,102,241,0.08)' }}
                >
                  <Layers className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">No categories found</p>
                <p className="text-xs text-slate-400">Add categories to see the breakdown here</p>
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
