import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import {
  exportAllAssets,
  exportAssetReport,
  exportAllEmployees,
} from '../../api/reports';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Form';
import { useToast } from '../../context/ToastContext';

const reportCards = [
  {
    title: 'All Assets',
    type: 'Asset',
    description: 'Complete inventory export with assignment details.',
    action: exportAllAssets,
    fileName: 'all-assets-report.xlsx',
  },
  {
    title: 'All Employees',
    type: 'Employee',
    description: 'Employee directory with contact and role details.',
    action: exportAllEmployees,
    fileName: 'all-employees-report.xlsx',
  },
  {
    title: 'Available Assets',
    type: 'Asset',
    description: 'Assets currently available for assignment.',
    action: () => exportAssetReport('available'),
    fileName: 'available-assets-report.xlsx',
  },
  {
    title: 'Assigned Assets',
    type: 'Asset',
    description: 'Assets currently assigned to employees.',
    action: () => exportAssetReport('assigned'),
    fileName: 'assigned-assets-report.xlsx',
  },
  {
    title: 'Maintenance Assets',
    type: 'Asset',
    description: 'Assets under maintenance or repair.',
    action: () => exportAssetReport('maintenance'),
    fileName: 'maintenance-assets-report.xlsx',
  },
  {
    title: 'Disposed Assets',
    type: 'Asset',
    description: 'Assets removed from active inventory.',
    action: () => exportAssetReport('disposed'),
    fileName: 'disposed-assets-report.xlsx',
  },
];

export default function Reports() {
  const { showToast } = useToast();
  const [loadingKey, setLoadingKey] = useState(null);

  const handleExport = async (report, index) => {
    setLoadingKey(index);
    try {
      await report.action();
      showToast(`${report.title} downloaded successfully`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Export Excel reports for assets and employees.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Report</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">File</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reportCards.map((report, index) => (
                <tr key={report.title} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <FileSpreadsheet className="h-4 w-4" />
                      </span>
                      <span className="font-semibold text-slate-900">{report.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{report.description}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{report.fileName}</td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="sm"
                      loading={loadingKey === index}
                      onClick={() => handleExport(report, index)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
