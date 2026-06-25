export function FormField({ label, required, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </label>
  );
}

export function TextInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-950/40 ${className}`}
      {...props}
    />
  );
}

export function SelectInput({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-950/40 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextArea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-950/40 ${className}`}
      {...props}
    />
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <TextInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="max-w-sm"
    />
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm transition-colors duration-205 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
