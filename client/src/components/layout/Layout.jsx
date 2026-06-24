import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Tags,
  FileSpreadsheet,
  X,
  Building2,
  RotateCcw,
  Wrench,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';

const mobileNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/assets', label: 'Assets', icon: Package },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/vendors', label: 'Vendors', icon: Truck },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/returns', label: 'Returns', icon: RotateCcw },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/assets': 'Assets',
  '/employees': 'Employees',
  '/departments': 'Departments',
  '/vendors': 'Vendors',
  '/categories': 'Categories',
  '/returns': 'Returns History',
  '/maintenance': 'Maintenance',
  '/reports': 'Reports',
};

function getPageTitle(pathname) {
  if (pathname.startsWith('/assets/')) return 'Asset Details';
  if (pathname.startsWith('/employees/')) return 'Employee Details';
  return pageTitles[pathname] || 'Asset Management';
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <p className="font-bold text-slate-900">AssetFlow</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 p-3">
              {mobileNav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
