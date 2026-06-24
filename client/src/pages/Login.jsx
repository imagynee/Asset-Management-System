import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { login } from '../api/auth';
import Button from '../components/ui/Button';
import { Card, FormField, TextInput } from '../components/ui/Form';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (localStorage.getItem('isAdminLoggedIn') === 'true') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(username, password);
      if (data.success) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        showToast('Welcome back, Admin!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Invalid username or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md p-6 sm:p-8 animate-fade-in">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex rounded-xl bg-brand-700 p-2.5 text-white">
            <Boxes className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">AssetFlow</h1>
          <p className="mt-1 text-sm text-slate-500">Admin Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Username" required>
            <TextInput
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin"
              required
              autoComplete="username"
            />
          </FormField>

          <FormField label="Password" required>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </FormField>

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </form>
      </Card>
    </div>
  );
}
