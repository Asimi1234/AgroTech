import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui/PageHeading';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StatTile } from '@/components/ui/StatTile';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { CountUp } from '@/components/motion/CountUp';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { categoryLabel } from '@/data/mockData';
import { productName, unitLabel } from '@/i18n/catalog';
import { formatNaira } from '@/lib/cn';
import type { Product, SupplierInquiry } from '@/types';

const Listings = ({ listings }: { listings: Product[] }) => {
  const { t } = useTranslation('dashboard');
  const [showNote, setShowNote] = useState(false);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{t('supplier.listingsTitle')}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowNote((v) => !v)}>
          <Icon name="plus" className="h-4 w-4" />
          {t('supplier.addListing')}
        </Button>
      </CardHeader>
      <CardBody>
        {showNote && (
          <p className="mb-3 rounded-lg border border-dashed border-earth-300 bg-earth-50 px-3 py-2 text-sm text-slate-600">
            {t('supplier.addListingNote')}
          </p>
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
                <p className="shrink-0 text-right font-bold text-slate-900">
                  {formatNaira(p.price)}
                  <span className="block text-xs font-medium text-slate-500">
                    /{unitLabel(p.unit)}
                  </span>
                </p>
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
  const listings =
    data?.[0].items.filter((p) => p.supplierName === user?.name) ?? [];
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
            <Listings listings={listings} />
            <Inquiries inquiries={inquiries} />
          </div>
        </>
      )}
    </div>
  );
};

export default SupplierDashboard;
