import { useEffect, useState, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Sector,
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

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

/* Status-specific semantic colors for the pie chart */
const STATUS_COLORS = {
  Assigned:    '#3b82f6', // blue
  Available:   '#10b981', // emerald
  Maintenance: '#f59e0b', // amber
  Disposed:    '#ef4444', // red
};

/* ---------- Custom Tooltip for Status Pie ---------- */
function StatusTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const color = STATUS_COLORS[name] || CHART_COLORS[0];
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '8px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        minWidth: 148,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {name}
        </span>
      </div>
      <p style={{ color: '#0f172a', fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginLeft: 5 }}>
          assets
        </span>
      </p>
    </div>
  );
}

/* ---------- Active slice — expands outward with a soft glow ring ---------- */
function ActiveSlice(props) {
  const {
    cx, cy, innerRadius, outerRadius,
    startAngle, endAngle, fill,
  } = props;
  return (
    <g>
      {/* Glow ring */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        fillOpacity={0.18}
      />
      {/* Main slice — slightly expanded */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
}

/* Palette anchored to the brand teal — cool, harmonious, dashboard-friendly */
const CATEGORY_BAR_COLORS = [
  '#0f766e', // Brand teal (primary)
  '#0d9488', // Teal-500
  '#0891b2', // Cyan-600
  '#0ea5e9', // Sky-500
  '#2563eb', // Blue-600
  '#6366f1', // Indigo-500
  '#14b8a6', // Teal-400
  '#38bdf8', // Sky-300
  '#34d399', // Emerald-400
  '#059669', // Emerald-600
  '#0284c7', // Sky-600
  '#4f46e5', // Indigo-600
];

/* ---------- Custom Tooltip for Category Chart ---------- */
function CategoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, _color } = payload[0].payload;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '8px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        minWidth: 140,
      }}
    >
      <p style={{ color: '#64748b', fontSize: 11, margin: 0, fontWeight: 500 }}>{name}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 3,
            background: _color || '#6366f1',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#0f172a', fontSize: 14, fontWeight: 700 }}>
          {value} {value === 1 ? 'asset' : 'assets'}
        </span>
      </div>
    </div>
  );
}

/* ---------- Custom rounded-right horizontal bar ---------- */
function HBar(props) {
  const { x, y, width, height, _color } = props;
  if (!width || width <= 0) return null;
  const r = Math.min(5, height / 2);
  return (
    <rect
      x={x}
      y={y + 1}
      width={width}
      height={Math.max(height - 2, 2)}
      rx={r}
      ry={r}
      fill={_color || '#6366f1'}
      fillOpacity={0.82}
    />
  );
}

/* ---------- Inline end-of-bar value label ---------- */
function HBarValueLabel({ x, y, width, height, value }) {
  if (!value) return null;
  return (
    <text
      x={x + width + 6}
      y={y + height / 2 + 1}
      dominantBaseline="middle"
      fontSize={11}
      fontWeight={600}
      fill="#64748b"
    >
      {value}
    </text>
  );
}


export default function Dashboard() {
  const [activeStatusIdx, setActiveStatusIdx] = useState(null);
  const onPieEnter = useCallback((_, index) => setActiveStatusIdx(index), []);
  const onPieLeave = useCallback(() => setActiveStatusIdx(null), []);
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

  /* Sort descending so the largest category is on top */
  const categoryData = Object.entries(dashboard?.assetsByCategory || {})
    .map(([name, value], idx) => ({
      name,
      value,
      _color: CATEGORY_BAR_COLORS[idx % CATEGORY_BAR_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  const totalCategoryAssets = categoryData.reduce((sum, d) => sum + d.value, 0);

  /* Dynamic chart height: 38px per row, min 240, max 520 */
  const categoryChartHeight = Math.min(
    Math.max(categoryData.length * 38 + 20, 240),
    520
  );

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
        {/* ═══════════════ UPGRADED: Assets by Status ═══════════════ */}
        <Card className="xl:col-span-1">
          <CardHeader title="Assets by Status" subtitle="Current distribution" />
          {statusData.length ? (
            <div className="flex flex-col px-4 pb-5 pt-1">
              {/* Donut chart with center label */}
              <div style={{ position: 'relative', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={86}
                      paddingAngle={3}
                      activeIndex={activeStatusIdx}
                      activeShape={<ActiveSlice />}
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                      animationBegin={0}
                      animationDuration={900}
                    >
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name] || '#6366f1'}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<StatusTooltip />}
                      wrapperStyle={{ outline: 'none' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center label — total count */}
                
              </div>

              {/* Legend */}
              <div
                className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3"
              >
                {statusData.map((item, idx) => {
                  const color = STATUS_COLORS[item.name] || CHART_COLORS[idx % CHART_COLORS.length];
                  const isActive = activeStatusIdx === idx;
                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
                      style={{
                        background: isActive ? `${color}12` : 'transparent',
                        cursor: 'default',
                      }}
                      onMouseEnter={() => setActiveStatusIdx(idx)}
                      onMouseLeave={() => setActiveStatusIdx(null)}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: color,
                          display: 'inline-block',
                          flexShrink: 0,
                          boxShadow: isActive ? `0 0 0 3px ${color}30` : 'none',
                          transition: 'box-shadow 0.15s',
                        }}
                      />
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                        <span style={{ fontWeight: 700, color: '#0f172a', marginLeft: 6 }}>
                          {item.value}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-60 items-center justify-center text-sm text-slate-400">
              No asset data yet
            </div>
          )}
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

          <div className="px-5 pb-5 pt-3">
            {categoryData.length ? (
              <div style={{ height: categoryChartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ top: 4, right: 48, left: 0, bottom: 4 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#e2e8f0"
                      strokeOpacity={0.7}
                    />
                    {/* Y-axis: category names */}
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={110}
                      tick={({ x, y, payload }) => (
                        <text
                          x={x - 4}
                          y={y}
                          textAnchor="end"
                          dominantBaseline="middle"
                          fontSize={12}
                          fontWeight={500}
                          fill="#475569"
                        >
                          {payload.value.length > 14
                            ? payload.value.slice(0, 13) + '…'
                            : payload.value}
                        </text>
                      )}
                      axisLine={false}
                      tickLine={false}
                    />
                    {/* X-axis: asset count */}
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                      dy={4}
                    />
                    <Tooltip
                      content={<CategoryTooltip />}
                      cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                    />
                    <Bar
                      dataKey="value"
                      shape={<HBar />}
                      animationDuration={900}
                      animationEasing="ease-out"
                      label={<HBarValueLabel />}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry._color} fillOpacity={0.82} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
