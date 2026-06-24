import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
