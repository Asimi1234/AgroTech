import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/layout/Logo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { api, isApiError } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { demoCredentials } from '@/data/mockData';
import { cn } from '@/lib/cn';
import type { UserRole } from '@/types';

const roleIds: UserRole[] = ['farmer', 'supplier', 'admin'];

export const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { t } = useTranslation('auth');

  const [role, setRole] = useState<UserRole>('farmer');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pinHelp, setPinHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await api.login({ phone, pin, role });
      setUser(user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        isApiError(err) && err.status === 401
          ? t('login.errInvalid')
          : t('login.errGeneric'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    const demo = demoCredentials.find((c) => c.role === role);
    if (demo) {
      setPhone(demo.phone);
      setPin(demo.pin);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-800">
      <div className="flex justify-end px-4 pt-4">
        <LanguageToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <Link
              to="/"
              className="focus-ring rounded-xl bg-white px-4 py-3 transition-shadow hover:shadow-md"
            >
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-brand-100">{t('login.tagline')}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <h1 className="text-xl font-bold text-slate-900">{t('login.title')}</h1>
            <p className="mt-1 text-sm text-slate-600">{t('login.subtitle')}</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-slate-800">
                  {t('iAmA')}
                </legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {roleIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRole(id)}
                      aria-pressed={role === id}
                      className={cn(
                        'focus-ring rounded-lg border-2 p-3 text-left transition-colors',
                        role === id
                          ? 'border-brand-700 bg-brand-50'
                          : 'border-earth-200 hover:border-brand-300',
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {t(`roles.${id}`)}
                        </span>
                        {role === id && (
                          <Icon name="verified" className="h-4 w-4 text-brand-700" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {t(`roles.${id}Desc`)}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <Input
                label={t('phone')}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder={t('login.phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div>
                <Input
                  label={t('login.pin')}
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  placeholder={t('login.pinPlaceholder')}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setPinHelp((v) => !v)}
                  aria-expanded={pinHelp}
                  className="focus-ring mt-1.5 rounded text-sm font-semibold text-brand-800 hover:underline"
                >
                  {t('login.forgotPin')}
                </button>
                {pinHelp && (
                  <p className="mt-1 text-sm text-slate-600">
                    {t('login.forgotPinNote')}
                  </p>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                >
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" fullWidth disabled={submitting}>
                {submitting && <Spinner className="h-5 w-5" />}
                {submitting ? t('login.submitting') : t('login.submit')}
              </Button>
            </form>

            <div className="mt-4 rounded-lg border border-dashed border-earth-300 bg-earth-50 p-3">
              <p className="text-xs font-semibold text-slate-700">
                {t('login.demoTitle')}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {demoCredentials.find((c) => c.role === role)?.phone} —{' '}
                {t(`roles.${role}`)}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                type="button"
                onClick={fillDemo}
              >
                {t('login.fillDemo')}
              </Button>
            </div>

            <p className="mt-4 text-center text-sm text-slate-600">
              {t('login.newHere')}{' '}
              <Link
                to="/signup"
                className="focus-ring rounded font-semibold text-brand-800 hover:underline"
              >
                {t('login.createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
