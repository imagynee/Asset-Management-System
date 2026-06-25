import { useState } from 'react';
import { Lock, Moon, Sun } from 'lucide-react';
import { changePassword } from '../api/auth';
import Button from '../components/ui/Button';
import { Card, CardHeader, FormField, TextInput, PageHeader } from '../components/ui/Form';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { showToast } = useToast();
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  const handleToggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('darkMode', String(nextMode));
    if (nextMode) {
      document.documentElement.classList.add('dark');
      showToast('Dark mode enabled', 'success');
    } else {
      document.documentElement.classList.remove('dark');
      showToast('Light mode enabled', 'success');
    }
  };

  // Accent color state
  const [accentColor, setAccentColor] = useState(
    localStorage.getItem('accentColor') || 'teal'
  );

  const handleToggleAccentColor = (color) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
    if (color === 'blue') {
      document.documentElement.classList.add('theme-blue');
    } else {
      document.documentElement.classList.remove('theme-blue');
    }
    showToast(`Accent color changed to ${color === 'blue' ? 'Blue' : 'Teal'}`, 'success');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All fields are required', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 4) {
      showToast('New password must be at least 4 characters long', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      const data = await changePassword(currentPassword, newPassword);
      if (data.success) {
        showToast('Password changed successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl animate-fade-in text-slate-900 dark:text-white">
      <PageHeader
        title="Settings"
        description="Manage your account password and application appearance settings."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Change Password Card */}
        <Card className="flex flex-col">
          <CardHeader
            title="Change Password"
            subtitle="Update your administrator credentials"
          />
          <form onSubmit={handlePasswordSubmit} className="flex-1 p-5 space-y-4">
            <FormField label="Current Password" required>
              <TextInput
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                autoComplete="current-password"
              />
            </FormField>

            <FormField label="New Password" required>
              <TextInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                autoComplete="new-password"
              />
            </FormField>

            <FormField label="Confirm New Password" required>
              <TextInput
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                autoComplete="new-password"
              />
            </FormField>

            <div className="pt-2">
              <Button
                type="submit"
                loading={passwordLoading}
                className="w-full justify-center"
              >
                <Lock className="h-4 w-4" />
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Appearance Settings Card */}
        <Card className="h-fit">
          <CardHeader
            title="Appearance"
            subtitle="Customize the look and feel of the system"
          />
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-50 dark:bg-brand-950/40 p-2 text-brand-700 dark:text-brand-400">
                  {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Switch to a darker visual theme
                  </p>
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleToggleDarkMode}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                    darkMode ? 'bg-brand-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      darkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-slate-800" />

            {/* Accent Color */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-50 dark:bg-brand-950/40 p-2 text-brand-700 dark:text-brand-400">
                  <span className="block h-5 w-5 rounded-full bg-brand-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Accent Color</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the theme accent highlight
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                {/* Teal Option */}
                <button
                  type="button"
                  onClick={() => handleToggleAccentColor('teal')}
                  className={`group relative flex h-7 w-7 items-center justify-center rounded-full border-2 transition focus:outline-none ${
                    accentColor === 'teal'
                      ? 'border-brand-500 ring-2 ring-brand-100 dark:ring-brand-950/40'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                  title="Teal theme color"
                  aria-label="Teal theme color"
                >
                  <span className="h-4 w-4 rounded-full bg-teal-500" />
                </button>

                {/* Blue Option */}
                <button
                  type="button"
                  onClick={() => handleToggleAccentColor('blue')}
                  className={`group relative flex h-7 w-7 items-center justify-center rounded-full border-2 transition focus:outline-none ${
                    accentColor === 'blue'
                      ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950/40'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                  title="Blue theme color"
                  aria-label="Blue theme color"
                >
                  <span className="h-4 w-4 rounded-full bg-blue-500" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
