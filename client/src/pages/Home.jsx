import { Navigate, useNavigate } from 'react-router-dom';
import {
  Package,
  Users,
  Bell,
  BarChart3,
  Truck,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

const features = [
  {
    icon: Package,
    title: 'Asset Registration & Lifecycle',
    desc: 'Register and track organizational hardware and software assets from procurement to retirement.',
  },
  {
    icon: Users,
    title: 'Employee Allocation',
    desc: 'Assign assets to employees, monitor active usage, and streamline returns and handovers.',
  },
  {
    icon: Bell,
    title: 'Warranty Tracking',
    desc: 'Monitor asset warranties to prevent lapses and receive timely alerts before they expire.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    desc: 'Export structured lists of assets, employee allocations, and maintenance histories.',
  },
  {
    icon: Truck,
    title: 'Vendor Directory',
    desc: 'Keep vendor records linked directly to asset purchases and support contracts.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Log',
    desc: 'Track assets currently undergoing repair or service, keeping inventory counts accurate.',
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-200 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 transition-colors duration-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-1.5 border border-slate-100 dark:border-slate-800">
              <Logo className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Asset Management</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">System</p>
            </div>
          </div>
          <Button onClick={() => navigate('/login')} className="shadow-sm">
            Admin Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 space-y-6">
          <span className="inline-block rounded-full bg-brand-50 dark:bg-brand-950/40 px-4 py-1.5 text-xs font-semibold text-brand-800 dark:text-brand-400 ring-1 ring-brand-200 dark:ring-brand-900/20">
            Centralized Asset Tracking Platform
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Manage Your Organization&apos;s Assets
          </h1>
          <p className="mx-auto max-w-2xl text-md sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Asset Management System is a web-based portal designed to help the organization monitor asset allocations, 
            warranty records, employee assignments, and maintenance & return status through one central dashboard.
          </p>
          <div className="flex justify-center pt-2">
            <Button size="lg" onClick={() => navigate('/login')} className="shadow-md">
              Access Admin Portal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 dark:text-white">Key Features</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div 
                key={title} 
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-md">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* System Modules Section */}
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Modules</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {modules.map((module) => (
                <span
                  key={module}
                  className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {module}
                </span>
              ))}
            </div>
            <p className="mt-6 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Built with React, Node.js, Express, and MongoDB. Administrator access is required to 
              manage organizational assets, employee assignments, departments, and audit logs.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors duration-200">
        Asset Management System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
