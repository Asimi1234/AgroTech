import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StarRating } from '@/components/ui/StarRating';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { LazyImage } from '@/components/LazyImage';
import { PriceTrendChart } from '@/components/marketplace/PriceTrendChart';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';
import { formatNaira } from '@/lib/cn';
import { cropLabel, regionLabel } from '@/data/mockData';
import {
  longDescription,
  productDescription,
  productName,
  reviewComment,
  supplierName,
  unitLabel,
} from '@/i18n/catalog';

const InquiryButton = ({ phone }: { phone: string }) => {
  const { t } = useTranslation('product');
  const [sent, setSent] = useState(false);
  return (
    <div>
      <Button
        size="lg"
        fullWidth
        onClick={() => setSent(true)}
        disabled={sent}
      >
        <Icon name="send" className="h-5 w-5" />
        {sent ? t('inquirySent') : t('sendInquiry')}
      </Button>
      {sent && (
        <p
          role="status"
          className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800"
        >
          {t('inquiryNote', { phone })}
        </p>
      )}
    </div>
  );
};

export const ProductDetailPage = () => {
  const { t } = useTranslation('product');
  const { id = '' } = useParams();
  const { data, loading, error, reload } = useAsync(
    () => api.getProduct(id),
    [id],
  );

  return (
    <div>
      <Link
        to="/marketplace"
        className="focus-ring mb-4 inline-flex min-h-tap items-center gap-1 rounded-lg text-sm font-semibold text-brand-800 hover:underline"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        {t('back')}
      </Link>

      {loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <SkeletonText lines={4} />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      )}

      {error && !loading && <ErrorState message={error} onRetry={reload} />}

      {data && !loading && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <LazyImage
                src={data.imageUrl}
                alt={productName(data)}
                wrapperClassName="aspect-[4/3] w-full rounded-xl"
              />
            </div>

            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="brand">{cropLabel(data.cropType)}</Badge>
                <Badge tone={data.inStock ? 'success' : 'danger'}>
                  {data.inStock ? t('inStock') : t('outOfStock')}
                </Badge>
              </div>

              <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
                {productName(data)}
              </h1>

              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {formatNaira(data.price)}
                <span className="ml-1 text-base font-medium text-slate-500">
                  /{unitLabel(data.unit)}
                </span>
              </p>

              <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                <Icon name="location" className="h-4 w-4" />
                {regionLabel(data.region)} {t('common:profile.state')}
              </p>

              <p className="mt-4 text-slate-700">
                {longDescription(
                  productDescription(data),
                  regionLabel(data.region),
                  cropLabel(data.cropType),
                )}
              </p>

              <div className="mt-6 space-y-2">
                <InquiryButton phone={data.supplierPhone} />
                <a
                  href={`tel:${data.supplierPhone.replace(/\s/g, '')}`}
                  className="focus-ring flex min-h-tap items-center justify-center gap-2 rounded-lg border-2 border-earth-200 font-semibold text-slate-700 hover:bg-earth-50"
                >
                  <Icon name="phone" className="h-5 w-5" />
                  {t('callSupplier', { phone: data.supplierPhone })}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('supplier')}</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">
                      {supplierName(data.supplierId, data.supplierName)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {regionLabel(data.region)} {t('common:profile.state')}
                    </p>
                  </div>
                  <StarRating rating={data.supplierRating} />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('priceTrend')}</CardTitle>
                <p className="mt-0.5 text-sm text-slate-500">
                  {t('priceTrendSubtitle')}
                </p>
              </CardHeader>
              <CardBody>
                <PriceTrendChart data={data.priceHistory} />
              </CardBody>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{t('reviews')}</CardTitle>
              <span className="text-sm text-slate-500">
                {t('reviewCount', { count: data.reviews.length })}
              </span>
            </CardHeader>
            <CardBody>
              <ul className="space-y-4">
                {data.reviews.map((review) => (
                  <li
                    key={review.id}
                    className="border-b border-earth-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {review.author}
                      </p>
                      <StarRating
                        rating={review.rating}
                        size="sm"
                        showNumber={false}
                      />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {reviewComment(review)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{review.date}</p>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProductDetailPage;
