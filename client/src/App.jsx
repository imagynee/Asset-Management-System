import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/assets/AssetList';
import AssetDetail from './pages/assets/AssetDetail';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import VendorList from './pages/vendors/VendorList';
import CategoryList from './pages/categories/CategoryList';
import DepartmentList from './pages/departments/DepartmentList';
import ReturnsHistory from './pages/returns/ReturnsHistory';
import Maintenance from './pages/maintenance/Maintenance';
import Reports from './pages/reports/Reports';
import Settings from './pages/Settings';

export default function App() {
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const accent = localStorage.getItem('accentColor') || 'teal';
    if (accent === 'blue') {
      document.documentElement.classList.add('theme-blue');
    } else {
      document.documentElement.classList.remove('theme-blue');
    }
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="assets" element={<AssetList />} />
              <Route path="assets/:id" element={<AssetDetail />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="departments" element={<DepartmentList />} />
              <Route path="vendors" element={<VendorList />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="returns" element={<ReturnsHistory />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
        <Analytics />
      </BrowserRouter>
    </ToastProvider>
  );
}

