import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';

interface QuickLink {
  to: string;
  labelKey: string;
  descKey: string;
  icon: IconName;
}

const links: QuickLink[] = [
  {
    to: '/marketplace',
    labelKey: 'quicklinks.marketplace',
    descKey: 'quicklinks.marketplaceDesc',
    icon: 'marketplace',
  },
  {
    to: '/groups',
    labelKey: 'quicklinks.groups',
    descKey: 'quicklinks.groupsDesc',
    icon: 'groups',
  },
];

export const QuickLinks = () => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {links.map((link) => (
        <Link key={link.to} to={link.to} className="focus-ring rounded-xl">
          <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white">
              <Icon name={link.icon} className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-bold text-slate-900">
                {t(link.labelKey)}
                <Icon name="chevron-right" className="h-4 w-4 text-brand-700" />
              </span>
              <span className="block text-sm text-slate-600">
                {t(link.descKey)}
              </span>
            </span>
          </Card>
        </Link>
      ))}
    </div>
  );
};
