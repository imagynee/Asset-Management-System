import { Navigate, useNavigate } from 'react-router-dom';
import {
  Boxes,
  Package,
  Users,
  Bell,
  BarChart3,
  Truck,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Form';

const features = [
  {
    icon: Package,
    title: 'Asset Registration & Tracking',
    desc: 'Register, categorize, and track every organizational asset from purchase to retirement.',
  },
  {
    icon: Users,
    title: 'Employee Allocation',
    desc: 'Assign assets to employees, monitor usage, and manage returns seamlessly.',
  },
  {
    icon: Bell,
    title: 'Warranty Alerts',
    desc: 'Get notified before warranties expire so nothing slips through the cracks.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    desc: 'Export asset, employee, and vendor reports for audits and decision-making.',
  },
  {
    icon: Truck,
    title: 'Vendor Management',
    desc: 'Maintain vendor records linked to asset purchases and service history.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Tracking',
    desc: 'Monitor assets under repair and keep inventory status up to date.',
  },
];

const modules = [
  'Asset Management',
  'Employee Allocation',
  'Asset Returns',
  'Categories & Vendors',
  'Dashboard Analytics',
  'Report Generation',
];

export default function Home() {
  const navigate = useNavigate();

  if (localStorage.getItem('isAdminLoggedIn') === 'true') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-700 p-2 text-white">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">AssetFlow</p>
              <p className="text-xs text-slate-500">Management System</p>
            </div>
          </div>
          <Button onClick={() => navigate('/login')}>Admin Login</Button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <span className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">
          Centralized Asset Management Platform
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Manage Your Organization&apos;s Assets with Confidence
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600">
          AssetFlow is a web-based system designed to help teams track asset allocation,
          maintenance records, employee assignments, and inventory status through one
          centralized dashboard.
        </p>
        <Button size="lg" onClick={() => navigate('/login')}>
          Login as Admin
          <ArrowRight className="h-4 w-4" />
        </Button>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">Key Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-5">
              <div className="mb-3 inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">System Modules</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {modules.map((module) => (
              <span
                key={module}
                className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-600"
              >
                {module}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm leading-relaxed text-slate-500">
            Built with React and Node.js, backed by MongoDB. Admin access is required to
            manage assets, employees, vendors, and reports.
          </p>
        </Card>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Asset Management System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
