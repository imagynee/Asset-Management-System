import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
