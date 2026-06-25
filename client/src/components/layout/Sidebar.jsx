import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Tags,
  FileSpreadsheet,
  LogOut,
  Building2,
  RotateCcw,
  Wrench,
  Settings,
} from 'lucide-react';
import Button from '../ui/Button';
import Logo from '../ui/Logo';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/assets', label: 'Assets', icon: Package },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/vendors', label: 'Vendors', icon: Truck },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/returns', label: 'Returns', icon: RotateCcw },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 lg:flex transition-colors duration-200">
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-6">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-1.5 border border-slate-100 dark:border-slate-800">
          <Logo className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Asset Management</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-800 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 p-4">
        <Button variant="secondary" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
