import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Tags,
  FileSpreadsheet,
  Boxes,
  LogOut,
  Building2,
  RotateCcw,
  Wrench,
} from 'lucide-react';
import Button from '../ui/Button';

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
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
        <div className="rounded-xl bg-brand-700 p-2 text-white">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">AssetFlow</p>
          <p className="text-xs text-slate-500">Management System</p>
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
                  ? 'bg-brand-50 text-brand-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-slate-100 p-4">
        <div className="rounded-xl bg-gradient-to-br from-brand-700 to-brand-800 p-4 text-white">
          <p className="text-sm font-semibold">Track every asset</p>
          <p className="mt-1 text-xs text-brand-100">
            Monitor inventory, assignments, and maintenance in one place.
          </p>
        </div>
        <Button variant="secondary" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
