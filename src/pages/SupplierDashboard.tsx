import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui/PageHeading';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { StatTile } from '@/components/ui/StatTile';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { CountUp } from '@/components/motion/CountUp';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { useAsync } from '@/hooks/useAsync';
import { api, isApiError } from '@/services/api';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import {
  categoryLabel,
  cropLabel,
  crops,
  productCategories,
  regionLabel,
  regions,
} from '@/data/reference';
import { productName, unitLabel } from '@/i18n/catalog';
import { formatNaira } from '@/lib/cn';
import type { Product, ProductInput, SupplierInquiry } from '@/types';

const emptyForm = (): ProductInput => ({
  name: '',
  category: 'seed',
  cropType: 'maize',
  description: '',
  price: 0,
  unit: 'per kg',
  region: 'oyo',
  inStock: true,
});

const Listings = ({
  listings,
  onChanged,
}: {
  listings: Product[];
  onChanged: () => void;
}) => {
  const { t } = useTranslation('dashboard');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const set = (patch: Partial<ProductInput>) => setForm((f) => ({ ...f, ...patch }));

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      cropType: p.cropType,
      description: p.description,
      price: p.price,
      unit: p.unit,
      region: p.region,
      inStock: p.inStock,
    });
    setError(null);
    setFormOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editingId) await api.updateProduct(editingId, form);
      else await api.createProduct(form);
      setFormOpen(false);
      setEditingId(null);
      onChanged();
    } catch (e) {
      setError(isApiError(e) ? e.message : t('supplier.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await api.deleteProduct(id);
      setConfirmId(null);
      onChanged();
    } catch (e) {
      setError(isApiError(e) ? e.message : t('supplier.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = productCategories.map((c) => ({
    value: c.id,
    label: categoryLabel(c.id),
  }));
  const cropOptions = crops.map((c) => ({ value: c.id, label: cropLabel(c.id) }));
  const regionOptions = regions.map((r) => ({ value: r.id, label: regionLabel(r.id) }));

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{t('supplier.listingsTitle')}</CardTitle>
        {!formOpen && (
          <Button variant="outline" size="sm" onClick={openAdd}>
            <Icon name="plus" className="h-4 w-4" />
            {t('supplier.addListing')}
          </Button>
        )}
      </CardHeader>
      <CardBody>
        {error && (
          <p
            role="alert"
            className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
          >
            {error}
          </p>
        )}

        {formOpen && (
          <div className="mb-4 grid gap-3 rounded-lg border-2 border-dashed border-earth-200 p-3 sm:grid-cols-2">
            <Input
              label={t('supplier.fieldName')}
              placeholder={t('supplier.fieldNamePlaceholder')}
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
            />
            <Select
              label={t('supplier.fieldCategory')}
              options={categoryOptions}
              value={form.category}
              onChange={(e) =>
                set({ category: e.target.value as ProductInput['category'] })
              }
            />
            <Select
              label={t('supplier.fieldCrop')}
              options={cropOptions}
              value={form.cropType}
              onChange={(e) => set({ cropType: e.target.value })}
            />
            <Select
              label={t('supplier.fieldRegion')}
              options={regionOptions}
              value={form.region}
              onChange={(e) => set({ region: e.target.value as ProductInput['region'] })}
            />
            <Input
              type="number"
              label={t('supplier.fieldPrice')}
              value={form.price}
              onChange={(e) => set({ price: Number(e.target.value) })}
            />
            <Input
              label={t('supplier.fieldUnit')}
              value={form.unit}
              onChange={(e) => set({ unit: e.target.value })}
            />
            <Input
              label={t('supplier.fieldDescription')}
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              className="sm:col-span-2"
            />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => set({ inStock: e.target.checked })}
                className="h-4 w-4 rounded border-earth-300"
              />
              {t('supplier.fieldInStock')}
            </label>
            <div className="flex items-end justify-end gap-2 sm:col-span-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={() => {
                  setFormOpen(false);
                  setEditingId(null);
                  setError(null);
                }}
              >
                {t('supplier.cancel')}
              </Button>
              <Button
                size="sm"
                disabled={saving || !form.name.trim() || !form.unit.trim()}
                onClick={submit}
              >
                {t('supplier.saveListing')}
              </Button>
            </div>
          </div>
        )}

        {listings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-earth-300 bg-earth-50 p-4 text-sm text-slate-600">
            {t('supplier.noListings')}
          </p>
        ) : (
          <ul className="divide-y divide-earth-100">
            {listings.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {productName(p)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge tone="earth">{categoryLabel(p.category)}</Badge>
                    <Badge tone={p.inStock ? 'success' : 'neutral'}>
                      {p.inStock
                        ? t('supplier.inStock')
                        : t('supplier.outOfStock')}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-right font-bold text-slate-900">
                    {formatNaira(p.price)}
                    <span className="block text-xs font-medium text-slate-500">
                      /{unitLabel(p.unit)}
                    </span>
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      aria-label={t('supplier.editListing')}
                      className="focus-ring rounded-lg p-2 text-slate-500 hover:bg-earth-50 hover:text-slate-800"
                    >
                      <Icon name="edit" className="h-4 w-4" />
                    </button>
                    {confirmId === p.id ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={saving}
                        onClick={() => remove(p.id)}
                        className="text-red-700"
                      >
                        {t('supplier.confirmDeleteYes')}
                      </Button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(p.id)}
                        aria-label={t('supplier.deleteListing')}
                        className="focus-ring rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};

const Inquiries = ({ inquiries }: { inquiries: SupplierInquiry[] }) => {
  const { t } = useTranslation('dashboard');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('supplier.inquiriesTitle')}</CardTitle>
      </CardHeader>
      <CardBody>
        {inquiries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-earth-300 bg-earth-50 p-4 text-sm text-slate-600">
            {t('supplier.noInquiries')}
          </p>
        ) : (
          <ul className="space-y-3">
            {inquiries.map((q) => (
              <li key={q.id} className="rounded-lg border border-earth-200 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="font-semibold text-slate-900">{q.buyerName}</p>
                  <span className="text-xs text-slate-400">{q.date}</span>
                </div>
                <p className="text-xs font-medium text-brand-800">
                  {productName({ id: q.productId, name: q.productName })}
                </p>
                <p className="mt-1 text-sm text-slate-600">{q.message}</p>
                <a
                  href={`tel:${q.phone.replace(/\s/g, '')}`}
                  className="focus-ring mt-2 inline-flex min-h-tap items-center gap-1 rounded-lg text-sm font-semibold text-brand-800 hover:underline"
                >
                  <Icon name="phone" className="h-4 w-4" />
                  {t('supplier.call')}
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};

export const SupplierDashboard = () => {
  const { t } = useTranslation('dashboard');
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name.split(' ')[0] ?? '';

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        api.getProducts({ pageSize: 100 }),
        api.getSupplierInquiries(),
        user ? api.getSupplierProfile(user.name) : Promise.resolve(null),
      ]),
    [user?.name],
  );

  const profile = data?.[2] ?? null;
  // Prod owns products by supplier auth id. In the mock backend the seed
  // products are owned by supplier-profile ids that don't equal the logged-in
  // user id, so fall back to matching by name there (dead branch in prod).
  const listings =
    data?.[0].items.filter(
      (p) =>
        p.supplierId === user?.id ||
        (env.useMockApi && p.supplierName === user?.name),
    ) ?? [];
  const listingIds = new Set(listings.map((p) => p.id));
  const inquiries = (data?.[1] ?? []).filter((q) => listingIds.has(q.productId));
  const activeCount = listings.filter((p) => p.inStock).length;

  return (
    <div>
      <PageHeading
        title={t('supplier.welcome', { name: firstName })}
        subtitle={t('supplier.subtitle')}
      />

      {loading && (
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {error && !loading && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              icon="marketplace"
              label={t('supplier.activeListings')}
              value={<CountUp end={activeCount} />}
              hint={t('supplier.activeListingsHint', { count: listings.length })}
            />
            <StatTile
              icon="send"
              label={t('supplier.inquiries')}
              value={<CountUp end={inquiries.length} />}
              hint={t('supplier.inquiriesHint')}
            />
            <StatTile
              icon="verified"
              label={t('supplier.rating')}
              value={profile ? profile.rating.toFixed(1) : '—'}
              hint={
                profile
                  ? t('supplier.reviews', { count: profile.reviewCount })
                  : t('supplier.noRating')
              }
            />
          </div>

          <div className="mt-6">
            <QuickLinks />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Listings listings={listings} onChanged={reload} />
            <Inquiries inquiries={inquiries} />
          </div>
        </>
      )}
    </div>
  );
};

export default SupplierDashboard;
