import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui/PageHeading';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { AdvisoriesManager } from '@/components/admin/AdvisoriesManager';
import { AnalyticsPanel } from '@/components/admin/AnalyticsPanel';
import { useAsync } from '@/hooks/useAsync';
import { api, isApiError } from '@/services/api';
import { formatNaira } from '@/lib/cn';
import { regionLabel } from '@/data/mockData';
import { commodityLabel, unitLabel } from '@/i18n/catalog';
import type { CommodityPrice, User } from '@/types';

const PriceEditor = () => {
  const { t } = useTranslation('admin');
  const { data, loading, error, reload } = useAsync(
    () => api.getCommodityPrices(),
    [],
  );
  const [rows, setRows] = useState<CommodityPrice[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('per kg');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const updatePrice = (cropType: string, price: number) => {
    setRows((prev) =>
      prev.map((r) => (r.cropType === cropType ? { ...r, price } : r)),
    );
    setNotice(null);
  };

  const runWrite = async (write: () => Promise<unknown>, ok: string) => {
    setSaving(true);
    setFormError(null);
    try {
      await write();
      setNotice(ok);
      reload();
      return true;
    } catch (e) {
      setFormError(isApiError(e) ? e.message : t('prices.saveError'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveEdits = async () => {
    const changed = data
      ? rows.filter((r) => {
          const orig = data.find((d) => d.cropType === r.cropType);
          return orig && orig.price !== r.price;
        })
      : [];
    const ok = await runWrite(
      () => Promise.all(changed.map((r) => api.updateCommodityPrice(r.cropType, r.price))),
      t('prices.saved'),
    );
    if (ok) setEditing(false);
  };

  const addCommodity = async () => {
    const price = Number(newPrice);
    const ok = await runWrite(async () => {
      const commodity = await api.createCommodity({ label: newName, unit: newUnit });
      if (Number.isFinite(price) && price > 0) {
        await api.updateCommodityPrice(commodity.cropType, price);
      }
    }, t('prices.added'));
    if (ok) {
      setAdding(false);
      setNewName('');
      setNewUnit('per kg');
      setNewPrice('');
    }
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
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  setFormError(null);
                  if (data) setRows(data);
                }}
              >
                {t('prices.cancel')}
              </Button>
              <Button size="sm" disabled={saving} onClick={saveEdits}>
                {t('prices.save')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={() => {
                  setAdding((v) => !v);
                  setNotice(null);
                  setFormError(null);
                }}
              >
                {t('prices.add')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                {t('prices.edit')}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {loading && <Skeleton className="h-40 w-full" />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && (
          <>
            {notice && (
              <p
                role="status"
                className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800"
              >
                {notice}
              </p>
            )}
            {formError && (
              <p
                role="alert"
                className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
              >
                {formError}
              </p>
            )}
            {adding && (
              <div className="mb-4 grid gap-3 rounded-lg border-2 border-dashed border-earth-200 p-3 sm:grid-cols-4">
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-600">
                    {t('prices.addName')}
                  </span>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t('prices.addNamePlaceholder')}
                    className="focus-ring w-full rounded-lg border-2 border-earth-200 px-2 py-1"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-600">
                    {t('prices.addUnit')}
                  </span>
                  <input
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder={t('prices.addUnitPlaceholder')}
                    className="focus-ring w-full rounded-lg border-2 border-earth-200 px-2 py-1"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-600">
                    {t('prices.addPrice')}
                  </span>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="focus-ring w-full rounded-lg border-2 border-earth-200 px-2 py-1"
                  />
                </label>
                <div className="flex items-end">
                  <Button
                    size="sm"
                    disabled={saving || !newName.trim() || !newUnit.trim()}
                    onClick={addCommodity}
                  >
                    {t('prices.addSubmit')}
                  </Button>
                </div>
              </div>
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
  const [rows, setRows] = useState<User[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const toggle = async (user: User) => {
    const next = user.status === 'active' ? 'inactive' : 'active';
    setBusyId(user.id);
    try {
      const updated = await api.setUserStatus(user.id, next);
      setRows((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } finally {
      setBusyId(null);
    }
  };

  const activeCount = rows.filter((u) => u.status === 'active').length;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{t('users.title')}</CardTitle>
        {rows.length > 0 && (
          <span className="text-sm text-slate-500">
            {t('users.active', { count: activeCount })}
          </span>
        )}
      </CardHeader>
      <CardBody>
        {loading && <Skeleton className="h-56 w-full" />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-earth-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3 font-semibold">{t('users.colName')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('users.colRole')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('users.colRegion')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('users.colLastActive')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('users.colStatus')}</th>
                  <th className="py-2 font-semibold">{t('users.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((user) => {
                  const isAdmin = user.role === 'admin';
                  const active = user.status === 'active';
                  return (
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
                      <td className="py-3 pr-3">
                        <Badge tone={active ? 'success' : 'neutral'}>
                          {active
                            ? t('users.statusActive')
                            : t('users.statusInactive')}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {isAdmin ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-400"
                            title={t('users.lockedHint')}
                          >
                            <Icon name="lock" className="h-4 w-4" />
                            {t('users.locked')}
                          </span>
                        ) : (
                          <Button
                            variant={active ? 'ghost' : 'outline'}
                            size="sm"
                            disabled={busyId === user.id}
                            onClick={() => toggle(user)}
                          >
                            {active
                              ? t('users.deactivate')
                              : t('users.activate')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
