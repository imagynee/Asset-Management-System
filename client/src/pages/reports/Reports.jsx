import { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Eye,
  Users,
  Package,
  Loader2,
  AlertCircle,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { getCategories } from '../../api/categories';
import { previewReport, downloadReport } from '../../api/reports';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Form';
import { useToast } from '../../context/ToastContext';

/* ─── constants ──────────────────────────────────────────── */

const RECORD_TYPES = [
  {
    id: 'assets',
    label: 'Assets',
    sub: 'Inventory & assignment details',
    icon: Package,
  },
  {
    id: 'employees',
    label: 'Employees',
    sub: 'Directory & contact info',
    icon: Users,
  },
];

const ASSET_STATUSES = [
  { id: 'all',         label: 'All Statuses'  },
  { id: 'assigned',   label: 'Assigned'       },
  { id: 'available',  label: 'Available'      },
  { id: 'maintenance',label: 'Maintenance'    },
  { id: 'disposed',   label: 'Disposed'       },
];


/* ─── sub-components ─────────────────────────────────────── */

function FilterLabel({ children }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
      {children}
    </p>
  );
}

function StyledSelect({ value, onChange, disabled, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-9 text-sm text-slate-800 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:opacity-50 cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function PreviewTable({ headers, rows, total }) {
  const displayed = rows.slice(0, 10);
  const hasMore = total > 10;

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
        <AlertCircle className="h-8 w-8 text-slate-300" />
        <p className="text-sm">No records match the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-2 min-h-0">
      {headers.length > 4 && (
        <p className="text-[1em
        ] text-slate-400 shrink-0">
          ⇔&nbsp;Scroll right to see all columns
        </p>
      )}
      <div className="overflow-auto rounded-xl border border-slate-200 flex-1 min-h-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 sticky top-0 z-10 border-b border-slate-200">
            <tr>
              {headers.map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/60">
                {headers.map((h) => (
                  <td key={h} className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                    {row[h] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <p className="text-right text-[1em] text-slate-400 font-regular shrink-0 mt-0.5">
          Download to see all
        </p>
      )}
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────── */

export default function Reports() {
  const { showToast } = useToast();

  const [recordType, setRecordType] = useState('assets');
  const [status,     setStatus]     = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [preview,    setPreview]    = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [downloading,setDownloading]= useState(false);

  useEffect(() => {
    setCatLoading(true);
    getCategories()
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  const handleTypeSelect = (t) => {
    setRecordType(t); setStatus('all'); setCategoryId('all'); setPreview(null);
  };
  const handleReset = () => {
    setRecordType('assets'); setStatus('all'); setCategoryId('all'); setPreview(null);
  };

  const buildParams = () => {
    const p = { type: recordType };
    if (recordType === 'assets') {
      p.status = status;
      if (categoryId !== 'all') p.categoryId = categoryId;
    }
    return p;
  };

  const handlePreview = async () => {
    setPreviewing(true); setPreview(null);
    try   { setPreview(await previewReport(buildParams())); }
    catch (err) { showToast(err.message, 'error'); }
    finally     { setPreviewing(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try   { await downloadReport(buildParams()); showToast('Report downloaded successfully', 'success'); }
    catch (err) { showToast(err.message, 'error'); }
    finally     { setDownloading(false); }
  };

  const summaryLabel = () => {
    if (recordType === 'employees') return 'All Employees';
    const s   = ASSET_STATUSES.find((x) => x.id === status)?.label || 'All Statuses';
    const cat = categories.find((c) => c._id === categoryId);
    return cat ? `${s} · ${cat.categoryName}` : s;
  };

  return (
    <div className="animate-fade-in space-y-5">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Filter, preview, and export Excel reports for assets or employees.
        </p>
      </div>

      {/* Main grid: filter left | preview right */}
      <div className="grid gap-5 lg:grid-cols-[320px_1fr] items-stretch overflow-hidden">

        {/* ════════ LEFT — filter card ════════ */}
        <Card className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">Report Filters</span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">

            {/* 1 — Record type */}
            <div>
              <FilterLabel>Record Type</FilterLabel>
              <div className="grid grid-cols-2 gap-2">
                {RECORD_TYPES.map(({ id, label, sub, icon: Icon }) => {
                  const active   = recordType === id;
                  const isAssets = id === 'assets';
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleTypeSelect(id)}
                      className={[
                        'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all',
                        active && isAssets
                          ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                          : '',
                        active && !isAssets
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                          : '',
                        !active
                          ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                          : '',
                      ].join(' ')}
                    >
                      <span className={[
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        active && isAssets  ? 'bg-brand-700' : '',
                        active && !isAssets ? 'bg-blue-600'  : '',
                        !active             ? 'bg-slate-100'  : '',
                      ].join(' ')}>
                        <Icon
                          className="h-4 w-4"
                          style={{ color: active ? '#fff' : '#94a3b8' }}
                        />
                      </span>
                      <div>
                        <p className={[
                          'text-sm font-semibold leading-tight',
                          active && isAssets  ? 'text-brand-700' : '',
                          active && !isAssets ? 'text-blue-700'  : '',
                          !active             ? 'text-slate-700'  : '',
                        ].join(' ')}>
                          {label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">{sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2 — Asset-only filters */}
            {recordType === 'assets' && (
              <>
                <div>
                  <FilterLabel>Status</FilterLabel>
                  <StyledSelect
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPreview(null); }}
                  >
                    {ASSET_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </StyledSelect>
                </div>

                <div>
                  <FilterLabel>Category</FilterLabel>
                  <StyledSelect
                    value={categoryId}
                    onChange={(e) => { setCategoryId(e.target.value); setPreview(null); }}
                    disabled={catLoading}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                    ))}
                  </StyledSelect>
                </div>
              </>
            )}

            {/* 3 — Summary */}
            <div className="flex items-center gap-2 rounded-xl bg-brand-50 border border-brand-100 px-3.5 py-2.5">
              <FileSpreadsheet className="h-4 w-4 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-600">
                  Selected
                </p>
                <p className="truncate text-xs font-semibold text-slate-700">{summaryLabel()}</p>
              </div>
            </div>

            {/* 4 — Actions: Preview + Download side by side */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" loading={previewing} onClick={handlePreview}>
                {!previewing && <Eye className="h-4 w-4" />}
                Preview
              </Button>
              <Button loading={downloading} onClick={handleDownload}>
                {!downloading && <Download className="h-4 w-4" />}
                Download
              </Button>
            </div>

          </div>
        </Card>

        {/* ════════ RIGHT — preview card ════════ */}
        <Card className="min-w-0 overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-1em font-semibold text-slate-800">Preview</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {preview
                  ? `${preview.total} record${preview.total !== 1 ? 's' : ''} matched`
                  : 'Set your filters and click Preview'}
              </p>
            </div>
          </div>

          <div className={`p-5 flex-1 flex flex-col min-h-0 ${!preview || previewing ? 'justify-center min-h-[320px]' : ''}`}>
            {previewing ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-400 flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <p className="text-sm">Loading preview…</p>
              </div>
            ) : !preview ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-300 flex-1">
                <FileSpreadsheet className="h-12 w-12" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-400">No preview yet</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Set your filters, then click&nbsp;
                    <button
                      type="button"
                      onClick={handlePreview}
                      className="font-semibold text-brand-600 hover:underline"
                    >
                      Preview
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <PreviewTable
                headers={preview.headers}
                rows={preview.rows}
                total={preview.total}
              />
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}
