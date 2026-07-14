import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/layout/Logo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { api, isApiError } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import {
  categoryLabel,
  cropLabel,
  crops,
  productCategories,
  regions,
} from '@/data/mockData';
import { cn } from '@/lib/cn';
import type { RegionId } from '@/types';

type SignupRole = 'farmer' | 'supplier';

const roleIds: SignupRole[] = ['farmer', 'supplier'];
const STEPS = ['role', 'location', 'focus', 'account'] as const;

interface FormState {
  name: string;
  role: SignupRole;
  region: string;
  interests: string[];
  phone: string;
  email: string;
  pin: string;
  confirmPin: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  name: '',
  role: 'farmer',
  region: '',
  interests: [],
  phone: '',
  email: '',
  pin: '',
  confirmPin: '',
};

// Returns i18n keys; translated at render so messages follow the active language.
const validateStep = (step: number, form: FormState): FieldErrors => {
  const errors: FieldErrors = {};
  if (step === 0 && form.name.trim().length < 2) errors.name = 'signup.errName';
  if (step === 1 && !form.region) errors.region = 'signup.errRegion';
  if (step === 2 && form.interests.length === 0)
    errors.interests = 'signup.errInterests';
  if (step === 3) {
    const digits = form.phone.replace(/\D/g, '');
    if (!/^0\d{10}$/.test(digits)) errors.phone = 'signup.errPhone';
    const email = form.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'signup.errEmail';
    if (!/^\d{6}$/.test(form.pin)) errors.pin = 'signup.errPin';
    if (form.confirmPin !== form.pin) errors.confirmPin = 'signup.errConfirm';
  }
  return errors;
};

export const SignupPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('auth');

  const [form, setForm] = useState<FormState>(() => {
    const requestedRole = searchParams.get('role');
    return requestedRole === 'supplier' || requestedRole === 'farmer'
      ? { ...initialForm, role: requestedRole }
      : initialForm;
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isLast = step === STEPS.length - 1;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  };

  // Switching role changes the focus options, so clear any prior selection.
  const chooseRole = (role: SignupRole) => {
    setForm((prev) => ({ ...prev, role, interests: [] }));
    setFormError(null);
  };

  const toggleInterest = (id: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
    setErrors((prev) => ({ ...prev, interests: undefined }));
    setFormError(null);
  };

  const back = () => {
    setFormError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const stepErrors = validateStep(step, form);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const user = await api.register({
        name: form.name,
        phone: form.phone,
        email: form.email.trim() || undefined,
        pin: form.pin,
        role: form.role,
        region: form.region as RegionId,
        interests: form.interests,
      });
      setUser(user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (isApiError(err) && err.status === 409) {
        setErrors({ phone: 'signup.errExists' });
      } else {
        setFormError('signup.errGeneric');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const regionOptions = [
    { value: '', label: t('signup.regionPlaceholder') },
    ...regions.map((r) => ({ value: r.id, label: r.label })),
  ];

  const interestOptions =
    form.role === 'supplier' ? productCategories : crops;
  const interestLabel = (id: string): string =>
    form.role === 'supplier' ? categoryLabel(id) : cropLabel(id);

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
            <p className="mt-4 max-w-xs text-brand-100">{t('signup.tagline')}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <h1 className="text-xl font-bold text-slate-900">
              {t('signup.title')}
            </h1>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>
                  {t('signup.stepLabel', {
                    current: step + 1,
                    total: STEPS.length,
                  })}
                </span>
                <span className="text-brand-800">
                  {t(`signup.steps.${STEPS[step]}`)}
                </span>
              </div>
              <div className="mt-2 flex gap-1.5" aria-hidden="true">
                {STEPS.map((s, i) => (
                  <span
                    key={s}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-colors duration-300',
                      i <= step ? 'bg-brand-600' : 'bg-earth-200',
                    )}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleNext} noValidate className="mt-5 space-y-4">
              {step === 0 && (
                <>
                  <fieldset>
                    <legend className="mb-2 text-sm font-semibold text-slate-800">
                      {t('iAmA')}
                    </legend>
                    <div className="grid grid-cols-2 gap-2">
                      {roleIds.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => chooseRole(id)}
                          aria-pressed={form.role === id}
                          className={cn(
                            'focus-ring rounded-lg border-2 p-3 text-left transition-colors',
                            form.role === id
                              ? 'border-brand-700 bg-brand-50'
                              : 'border-earth-200 hover:border-brand-300',
                          )}
                        >
                          <span className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              {t(`roles.${id}`)}
                            </span>
                            {form.role === id && (
                              <Icon
                                name="verified"
                                className="h-4 w-4 text-brand-700"
                              />
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
                    label={t('signup.fullName')}
                    autoComplete="name"
                    placeholder={
                      form.role === 'supplier'
                        ? t('signup.namePlaceholderSupplier')
                        : t('signup.namePlaceholderFarmer')
                    }
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    error={errors.name ? t(errors.name) : undefined}
                    autoFocus
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <p className="text-sm text-slate-600">
                    {t('signup.locationHelp')}
                  </p>
                  <Select
                    label={t('signup.region')}
                    options={regionOptions}
                    value={form.region}
                    onChange={(e) => update('region', e.target.value)}
                    error={errors.region ? t(errors.region) : undefined}
                  />
                </>
              )}

              {step === 2 && (
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-800">
                    {form.role === 'supplier'
                      ? t('signup.focusHeadingSupplier')
                      : t('signup.focusHeadingFarmer')}
                  </legend>
                  <p className="mb-2 mt-0.5 text-sm text-slate-500">
                    {t('signup.focusHint')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {interestOptions.map((option) => {
                      const active = form.interests.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleInterest(option.id)}
                          aria-pressed={active}
                          className={cn(
                            'focus-ring flex items-center justify-between rounded-lg border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                            active
                              ? 'border-brand-700 bg-brand-50 text-slate-900'
                              : 'border-earth-200 text-slate-700 hover:border-brand-300',
                          )}
                        >
                          {interestLabel(option.id)}
                          {active && (
                            <Icon
                              name="check"
                              className="h-4 w-4 text-brand-700"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.interests && (
                    <p className="mt-1.5 text-sm font-medium text-red-700">
                      {t(errors.interests)}
                    </p>
                  )}
                </fieldset>
              )}

              {step === 3 && (
                <>
                  <Input
                    label={t('phone')}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder={t('signup.phonePlaceholder')}
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    error={errors.phone ? t(errors.phone) : undefined}
                    autoFocus
                  />
                  <Input
                    label={t('signup.email')}
                    type="email"
                    autoComplete="email"
                    placeholder={t('signup.emailPlaceholder')}
                    hint={t('signup.emailHint')}
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    error={errors.email ? t(errors.email) : undefined}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={t('signup.createPin')}
                      type="password"
                      inputMode="numeric"
                      autoComplete="new-password"
                      placeholder={t('signup.pinPlaceholder')}
                      maxLength={6}
                      value={form.pin}
                      onChange={(e) => update('pin', e.target.value)}
                      error={errors.pin ? t(errors.pin) : undefined}
                    />
                    <Input
                      label={t('signup.confirmPin')}
                      type="password"
                      inputMode="numeric"
                      autoComplete="new-password"
                      placeholder={t('signup.confirmPinPlaceholder')}
                      maxLength={6}
                      value={form.confirmPin}
                      onChange={(e) => update('confirmPin', e.target.value)}
                      error={errors.confirmPin ? t(errors.confirmPin) : undefined}
                    />
                  </div>
                </>
              )}

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                >
                  {t(formError)}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={back}
                    disabled={submitting}
                  >
                    <Icon name="arrow-left" className="h-5 w-5" />
                    {t('signup.back')}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  fullWidth
                  disabled={submitting}
                >
                  {submitting && <Spinner className="h-5 w-5" />}
                  {isLast
                    ? submitting
                      ? t('signup.submitting')
                      : t('signup.submit')
                    : t('signup.next')}
                </Button>
              </div>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
              {t('signup.haveAccount')}{' '}
              <Link
                to="/login"
                className="focus-ring rounded font-semibold text-brand-800 hover:underline"
              >
                {t('signup.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
