import type { IconName } from '@/components/ui/Icon';
import type { UserRole } from '@/types';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: IconName;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard', roles: ['farmer', 'supplier', 'admin'] },
  { to: '/marketplace', labelKey: 'nav.marketplace', icon: 'marketplace', roles: ['farmer', 'supplier', 'admin'] },
  { to: '/groups', labelKey: 'nav.groups', icon: 'groups', roles: ['farmer', 'supplier', 'admin'] },
  { to: '/admin', labelKey: 'nav.admin', icon: 'admin', roles: ['admin'] },
];

export const navItemsFor = (role: UserRole | undefined): NavItem[] =>
  navItems.filter((item) => (role ? item.roles.includes(role) : false));
