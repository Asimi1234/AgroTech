import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';
import { navItemsFor } from './navConfig';

export const BottomNav = () => {
  const role = useAuthStore((s) => s.user?.role);
  const items = navItemsFor(role);
  const { t } = useTranslation('common');

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-earth-200 bg-white md:hidden"
      aria-label="Primary mobile"
    >
      <div className="mx-auto flex max-w-md">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'focus-ring flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-semibold',
                'min-h-tap',
                isActive ? 'text-brand-800' : 'text-slate-500',
              )
            }
          >
            <Icon name={item.icon} className="h-6 w-6" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
