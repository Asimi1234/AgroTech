import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StatTile } from '@/components/ui/StatTile';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { CountUp } from '@/components/motion/CountUp';
import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { isGroupMember, useGroupStore } from '@/store/groupStore';
import { commodityLabel, unitLabel } from '@/i18n/catalog';
import { formatNaira } from '@/lib/cn';

export const DashboardStats = () => {
  const { t } = useTranslation('dashboard');
  const userName = useAuthStore((s) => s.user?.name);
  const joinOverrides = useGroupStore((s) => s.joinOverrides);
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([api.getDashboardSummary(), api.getCooperatives()]),
    [],
  );

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error ?? t('stats.error')} onRetry={reload} />;
  }

  const [summary, cooperatives] = data;
  const myGroups = cooperatives.filter((g) =>
    isGroupMember(g, userName, joinOverrides),
  ).length;

  const mover = summary.topMover;
  const up = mover.changePercent >= 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Reveal delay={0}>
        <Link to="/marketplace" className="focus-ring block h-full rounded-xl">
          <StatTile
            icon="marketplace"
            label={t('stats.listings')}
            value={<CountUp end={summary.marketListings} />}
            hint={t('stats.listingsHint')}
            className="transition-colors hover:border-brand-300 hover:bg-brand-50"
          />
        </Link>
      </Reveal>

      <Reveal delay={80}>
        <StatTile
          icon={up ? 'trend-up' : 'trend-down'}
          label={t('stats.topMover')}
          value={
            <span className={up ? 'text-green-700' : 'text-red-700'}>
              {up ? '+' : ''}
              {mover.changePercent.toFixed(1)}%
            </span>
          }
          hint={`${commodityLabel(mover.cropType, mover.label)} · ${formatNaira(
            mover.price,
          )} ${unitLabel(mover.unit)}`}
        />
      </Reveal>

      <Reveal delay={160}>
        <StatTile
          icon="alert"
          label={t('stats.advisories')}
          value={<CountUp end={summary.actionAdvisories} />}
          hint={t('stats.advisoriesHint')}
        />
      </Reveal>

      <Reveal delay={240}>
        <Link to="/groups" className="focus-ring block h-full rounded-xl">
          <StatTile
            icon="groups"
            label={t('stats.myGroups')}
            value={
              <span className="flex items-baseline gap-1.5">
                <CountUp end={myGroups} />
                <span className="text-base font-semibold text-slate-400">
                  / {summary.cooperativeCount}
                </span>
              </span>
            }
            hint={
              <span className="inline-flex items-center gap-1">
                {t('stats.myGroupsHint')}
                <Icon name="chevron-right" className="h-3.5 w-3.5" />
              </span>
            }
            className="transition-colors hover:border-brand-300 hover:bg-brand-50"
          />
        </Link>
      </Reveal>
    </div>
  );
};
