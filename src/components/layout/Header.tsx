import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { ProfileMenu } from './ProfileMenu';
import { navItemsFor } from './navConfig';

export const Header = () => {
  const role = useAuthStore((s) => s.user?.role);
  const items = navItemsFor(role);
  const { t } = useTranslation('common');

  return (
    <header className="sticky top-0 z-20 border-b border-earth-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <NavLink to="/dashboard" className="focus-ring rounded-lg">
          <Logo />
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'focus-ring flex min-h-tap items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-brand-100 text-brand-800'
                    : 'text-slate-600 hover:bg-brand-50 hover:text-brand-800',
                )
              }
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle className="hidden sm:inline-flex" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};
