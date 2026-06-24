import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-4">
        <Inbox className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
