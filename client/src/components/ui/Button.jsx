const variants = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
 secondaryDanger: 'bg-white text-red-600 ring-1 ring-red-300 hover:bg-red-50 hover:text-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </button>
  );
}
