import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Logo } from '@/components/layout/Logo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { api, isApiError } from '@/services/api';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { demoCredentials } from '@/data/mockData';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { t } = useTranslation('auth');

  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pinHelp, setPinHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await api.login({ identifier, pin });
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
              <Input
                label={t('login.identifier')}
                type="text"
                autoComplete="username"
                placeholder={t('login.identifierPlaceholder')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <div>
                <Input
                  label={t('login.pin')}
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={6}
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

            {env.enableDemo && (
              <div className="mt-4 rounded-lg border border-dashed border-earth-300 bg-earth-50 p-3">
                <p className="text-xs font-semibold text-slate-700">
                  {t('login.demoTitle')}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {demoCredentials.map((c) => (
                    <Button
                      key={c.role}
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        setIdentifier(c.phone);
                        setPin(c.pin);
                      }}
                    >
                      {t(`roles.${c.role}`)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

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
