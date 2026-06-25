import { Menu } from 'lucide-react';

export default function Header({ onMenuClick, title }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 backdrop-blur lg:px-8 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-700 dark:text-brand-400">
            Admin Portal
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        </div>
      </div>
    </header>
  );
}
