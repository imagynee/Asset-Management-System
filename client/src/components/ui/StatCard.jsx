export default function StatCard({ title, value, icon: Icon, accent = 'brand', subtitle }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="relative min-h-32 rounded-2xl border border-slate-200 bg-white p-5 pb-9 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 ${accents[accent]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {subtitle && <p className="absolute bottom-5 left-5 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
