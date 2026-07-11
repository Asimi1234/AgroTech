import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/authStore';
import { regionLabel } from '@/data/mockData';
import { cn } from '@/lib/cn';

export const ProfileMenu = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex min-h-tap items-center gap-2 rounded-lg px-2 py-1 hover:bg-brand-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
          {user.avatarInitials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight text-slate-900">
            {user.name}
          </span>
          <span className="block text-xs leading-tight text-slate-500">
            {t(`profile.${user.role}`)}
          </span>
        </span>
        <Icon name="chevron-down" className="h-4 w-4 text-slate-500" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-earth-200 bg-white p-2 shadow-lg"
        >
          <div className="border-b border-earth-100 px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{t(`profile.${user.role}`)}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Icon name="phone" className="h-3.5 w-3.5" />
              {user.phone}
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Icon name="location" className="h-3.5 w-3.5" />
              {regionLabel(user.region)} {t('profile.state')}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className={cn(
              'focus-ring mt-1 flex w-full min-h-tap items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-red-700 hover:bg-red-50',
            )}
          >
            <Icon name="logout" className="h-4 w-4" />
            {t('profile.signOut')}
          </button>
        </div>
      )}
    </div>
  );
};
