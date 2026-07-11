import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { BarList } from '@/components/ui/BarList';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { CountUp } from '@/components/motion/CountUp';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';
import { categoryLabel, regionLabel } from '@/data/mockData';

export const AnalyticsPanel = () => {
  const { t } = useTranslation('admin');
  const { data, loading, error, reload } = useAsync(
    () => api.getPlatformAnalytics(),
    [],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error ?? t('analytics.error')} onRetry={reload} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon="user"
          label={t('analytics.totalUsers')}
          value={<CountUp end={data.totalUsers} />}
          hint={t('analytics.activeCount', { count: data.activeUsers })}
        />
        <StatTile
          icon="marketplace"
          label={t('analytics.totalListings')}
          value={<CountUp end={data.totalListings} />}
          hint={t('analytics.listingsHint')}
        />
        <StatTile
          icon="groups"
          label={t('analytics.cooperatives')}
          value={<CountUp end={data.cooperativeCount} />}
          hint={t('analytics.cooperativesHint')}
        />
        <StatTile
          icon="verified"
          label={t('analytics.members')}
          value={<CountUp end={data.cooperativeMembers} />}
          hint={t('analytics.membersHint')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.byCategory')}</CardTitle>
          </CardHeader>
          <CardBody>
            <BarList
              items={data.listingsByCategory.map((c) => ({
                label: categoryLabel(c.category),
                value: c.count,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.byRegion')}</CardTitle>
          </CardHeader>
          <CardBody>
            <BarList
              items={data.usersByRegion.map((r) => ({
                label: regionLabel(r.region),
                value: r.count,
              }))}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
