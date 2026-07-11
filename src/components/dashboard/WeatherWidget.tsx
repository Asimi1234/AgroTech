import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';
import type { DailyForecast, RegionId } from '@/types';

const conditionIcon: Record<DailyForecast['condition'], IconName> = {
  sunny: 'sun',
  'partly-cloudy': 'cloud',
  cloudy: 'cloud',
  rain: 'rain',
  storm: 'rain',
};

const conditionKey: Record<DailyForecast['condition'], string> = {
  sunny: 'sunny',
  'partly-cloudy': 'partlyCloudy',
  cloudy: 'cloudy',
  rain: 'rain',
  storm: 'storm',
};

export const WeatherWidget = ({ region }: { region: RegionId }) => {
  const { t } = useTranslation('dashboard');
  const { data, loading, error, reload } = useAsync(
    () => api.getWeather(region),
    [region],
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{t('weather.title')}</CardTitle>
        {data && (
          <span className="text-xs font-medium text-slate-500">
            {data.regionLabel} {t('weather.state')}
          </span>
        )}
      </CardHeader>
      <CardBody>
        {loading && <Skeleton className="h-40 w-full" />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {data && !loading && (
          <>
            <div className="flex items-center justify-between rounded-lg bg-brand-50 p-4">
              <div className="flex items-center gap-3">
                <Icon
                  name={conditionIcon[data.condition]}
                  className="h-10 w-10 text-brand-700"
                />
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {data.currentTempC}°C
                  </p>
                  <p className="text-sm font-medium text-slate-600">
                    {t(`weather.conditions.${conditionKey[data.condition]}`)}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p className="font-semibold text-slate-800">
                  {t('weather.humidity', { value: data.humidityPercent })}
                </p>
                <p>{t('weather.updated', { time: data.updatedAt.split(' ')[1] })}</p>
              </div>
            </div>

            <ul className="mt-4 grid grid-cols-5 gap-1 text-center">
              {data.daily.map((day) => (
                <li key={day.day} className="rounded-lg py-2">
                  <p className="text-xs font-semibold text-slate-600">
                    {day.day}
                  </p>
                  <Icon
                    name={conditionIcon[day.condition]}
                    className="mx-auto my-1 h-5 w-5 text-brand-600"
                  />
                  <p className="text-sm font-bold text-slate-900">
                    {day.tempHighC}°
                  </p>
                  <p className="text-xs text-slate-500">{day.tempLowC}°</p>
                  <p className="mt-1 text-xs font-medium text-sky-700">
                    {day.rainfallMm}mm
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardBody>
    </Card>
  );
};
