import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n/languages';
import { cn } from '@/lib/cn';

export const LanguageToggle = ({ className }: { className?: string }) => {
  const { i18n } = useTranslation();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-earth-200 bg-white p-0.5',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {LANGUAGES.map(({ code, label }) => {
        const active = i18n.resolvedLanguage === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => i18n.changeLanguage(code)}
            aria-pressed={active}
            className={cn(
              'focus-ring rounded-md px-2.5 py-1 text-xs font-bold transition-colors',
              active ? 'bg-brand-700 text-white' : 'text-slate-500 hover:text-brand-800',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
