import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';
import { cropLabel } from '@/data/mockData';
import { advisoryDetail, advisoryTitle, advisoryWindow } from '@/i18n/catalog';
import type { Advisory } from '@/types';

const severityTone: Record<Advisory['severity'], 'brand' | 'warning' | 'danger'> = {
  info: 'brand',
  action: 'warning',
  warning: 'danger',
};

export const AdvisoriesCard = () => {
  const { t } = useTranslation('dashboard');
  const { data, loading, error, reload } = useAsync(
    () => api.getAdvisories(),
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('advisories.title')}</CardTitle>
        <p className="mt-0.5 text-sm text-slate-500">{t('advisories.subtitle')}</p>
      </CardHeader>
      <CardBody>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {data && !loading && (
          <ul className="space-y-3">
            {data.map((advisory) => (
              <li
                key={advisory.id}
                className="rounded-lg border border-earth-200 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {advisoryTitle(advisory)}
                  </h3>
                  <Badge tone={severityTone[advisory.severity]}>
                    {t(`advisories.severity.${advisory.severity}`)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {advisoryDetail(advisory)}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {cropLabel(advisory.cropType)} · {advisoryWindow(advisory)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};
