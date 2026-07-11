import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';
import { commodityLabel, unitLabel } from '@/i18n/catalog';
import { formatNaira, cn } from '@/lib/cn';

export const CommodityPrices = () => {
  const { t } = useTranslation('dashboard');
  const { data, loading, error, reload } = useAsync(
    () => api.getCommodityPrices(),
    [],
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{t('prices.title')}</CardTitle>
        <span className="text-xs font-medium text-slate-500">{t('prices.today')}</span>
      </CardHeader>
      <CardBody>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {data && !loading && (
          <ul className="divide-y divide-earth-100">
            {data.map((price) => {
              const up = price.changePercent >= 0;
              return (
                <li
                  key={price.cropType}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {commodityLabel(price.cropType, price.label)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {unitLabel(price.unit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {formatNaira(price.price)}
                    </p>
                    <p
                      className={cn(
                        'flex items-center justify-end gap-1 text-sm font-semibold',
                        up ? 'text-green-700' : 'text-red-700',
                      )}
                    >
                      <Icon
                        name={up ? 'trend-up' : 'trend-down'}
                        className="h-4 w-4"
                      />
                      {up ? '+' : ''}
                      {price.changePercent.toFixed(1)}%
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};
