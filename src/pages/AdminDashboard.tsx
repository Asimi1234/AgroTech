import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui/PageHeading';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { AdvisoriesManager } from '@/components/admin/AdvisoriesManager';
import { AnalyticsPanel } from '@/components/admin/AnalyticsPanel';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';
import { formatNaira } from '@/lib/cn';
import { regionLabel } from '@/data/mockData';
import { commodityLabel, unitLabel } from '@/i18n/catalog';
import type { CommodityPrice } from '@/types';

const PriceEditor = () => {
  const { t } = useTranslation('admin');
  const { data, loading, error, reload } = useAsync(
    () => api.getCommodityPrices(),
    [],
  );
  const [rows, setRows] = useState<CommodityPrice[]>([]);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const updatePrice = (cropType: string, price: number) => {
    setRows((prev) =>
      prev.map((r) => (r.cropType === cropType ? { ...r, price } : r)),
    );
    setSaved(false);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{t('prices.title')}</CardTitle>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  if (data) setRows(data);
                }}
              >
                {t('prices.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setSaved(true);
                }}
              >
                {t('prices.save')}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              {t('prices.edit')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {loading && <Skeleton className="h-40 w-full" />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && (
          <>
            {saved && (
              <p
                role="status"
                className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800"
              >
                {t('prices.saved')}
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-earth-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3 font-semibold">{t('prices.colCommodity')}</th>
                    <th className="py-2 pr-3 font-semibold">{t('prices.colUnit')}</th>
                    <th className="py-2 pr-3 font-semibold">{t('prices.colPrice')}</th>
                    <th className="py-2 font-semibold">{t('prices.colChange')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.cropType}
                      className="border-b border-earth-100 last:border-0"
                    >
                      <td className="py-3 pr-3 font-semibold text-slate-900">
                        {commodityLabel(row.cropType, row.label)}
                      </td>
                      <td className="py-3 pr-3 text-slate-500">
                        {unitLabel(row.unit)}
                      </td>
                      <td className="py-3 pr-3">
                        {editing ? (
                          <input
                            type="number"
                            value={row.price}
                            onChange={(e) =>
                              updatePrice(row.cropType, Number(e.target.value))
                            }
                            className="focus-ring w-28 rounded-lg border-2 border-earth-200 px-2 py-1"
                          />
                        ) : (
                          <span className="font-bold text-slate-900">
                            {formatNaira(row.price)}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <Badge
                          tone={row.changePercent >= 0 ? 'success' : 'danger'}
                        >
                          {row.changePercent >= 0 ? '+' : ''}
                          {row.changePercent.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

const WEATHER_REGIONS = ['oyo', 'kaduna', 'benue', 'cross-river'] as const;

const WeatherTable = () => {
  const { t } = useTranslation('admin');
  const { data, loading, error, reload } = useAsync(
    () => Promise.all(WEATHER_REGIONS.map((region) => api.getWeather(region))),
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('weather.title')}</CardTitle>
      </CardHeader>
      <CardBody>
        {loading && <Skeleton className="h-40 w-full" />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && data && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-earth-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3 font-semibold">{t('weather.colRegion')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('weather.colTemp')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('weather.colHumidity')}</th>
                  <th className="py-2 font-semibold">{t('weather.colUpdated')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((w) => (
                  <tr
                    key={w.region}
                    className="border-b border-earth-100 last:border-0"
                  >
                    <td className="py-3 pr-3 font-semibold text-slate-900">
                      {regionLabel(w.region)}
                    </td>
                    <td className="py-3 pr-3">{w.currentTempC}°C</td>
                    <td className="py-3 pr-3">{w.humidityPercent}%</td>
                    <td className="py-3 text-slate-500">{w.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

const UsersTable = () => {
  const { t } = useTranslation('admin');
  const { data, loading, error, reload } = useAsync(() => api.getUsers(), []);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{t('users.title')}</CardTitle>
        {data && (
          <span className="text-sm text-slate-500">
            {t('users.active', {
              count: data.filter((u) => u.status === 'active').length,
            })}
          </span>
        )}
      </CardHeader>
      <CardBody>
        {loading && <Skeleton className="h-56 w-full" />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && data && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-earth-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3 font-semibold">{t('users.colName')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('users.colRole')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('users.colRegion')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('users.colLastActive')}</th>
                  <th className="py-2 font-semibold">{t('users.colStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-earth-100 last:border-0"
                  >
                    <td className="py-3 pr-3 font-semibold text-slate-900">
                      {user.name}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">
                      {t(`common:profile.${user.role}`)}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">
                      {regionLabel(user.region)}
                    </td>
                    <td className="py-3 pr-3 text-slate-500">
                      {user.lastActive}
                    </td>
                    <td className="py-3">
                      <Badge
                        tone={user.status === 'active' ? 'success' : 'neutral'}
                      >
                        {user.status === 'active'
                          ? t('users.statusActive')
                          : t('users.statusInactive')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export const AdminDashboard = () => {
  const { t } = useTranslation('admin');
  return (
    <div>
      <PageHeading title={t('title')} subtitle={t('subtitle')} />
      <div className="space-y-6">
        <AnalyticsPanel />
        <div className="grid gap-6 lg:grid-cols-2">
          <PriceEditor />
          <WeatherTable />
        </div>
        <AdvisoriesManager />
        <UsersTable />
      </div>
    </div>
  );
};

export default AdminDashboard;
