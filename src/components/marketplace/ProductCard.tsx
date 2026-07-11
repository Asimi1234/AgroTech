import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StarRating } from '@/components/ui/StarRating';
import { LazyImage } from '@/components/LazyImage';
import { formatNaira } from '@/lib/cn';
import { cropLabel, regionLabel } from '@/data/mockData';
import { productName, supplierName, unitLabel } from '@/i18n/catalog';
import type { Product } from '@/types';

export const ProductCard = ({ product }: { product: Product }) => {
  const { t } = useTranslation('marketplace');
  return (
  <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
    <div className="relative">
      <LazyImage
        src={product.imageUrl}
        alt={productName(product)}
        wrapperClassName="h-40 w-full"
      />
      <div className="absolute left-2 top-2 flex gap-1">
        <Badge tone="earth">{t(`categories.${product.category}`)}</Badge>
        {!product.inStock && <Badge tone="danger">{t('card.outOfStock')}</Badge>}
      </div>
    </div>

    <div className="flex flex-1 flex-col p-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{cropLabel(product.cropType)}</span>
        <span className="flex items-center gap-1">
          <Icon name="location" className="h-3.5 w-3.5" />
          {regionLabel(product.region)}
        </span>
      </div>

      <h3 className="mt-1 line-clamp-2 font-bold leading-snug text-slate-900">
        {productName(product)}
      </h3>

      <p className="mt-1 text-sm text-slate-600">
        {supplierName(product.supplierId, product.supplierName)}
      </p>
      <div className="mt-1">
        <StarRating rating={product.supplierRating} size="sm" />
      </div>

      <div className="mt-3 flex items-end justify-between">
        <p className="text-xl font-extrabold text-slate-900">
          {formatNaira(product.price)}
          <span className="ml-1 text-sm font-medium text-slate-500">
            /{unitLabel(product.unit)}
          </span>
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Link to={`/product/${product.id}`} className={buttonClass('primary', 'md', true)}>
          {t('card.viewDetails')}
        </Link>
        <a
          href={`tel:${product.supplierPhone.replace(/\s/g, '')}`}
          className="focus-ring flex min-h-tap items-center justify-center gap-2 rounded-lg border-2 border-earth-200 text-sm font-semibold text-slate-700 hover:bg-earth-50"
        >
          <Icon name="phone" className="h-4 w-4" />
          {product.supplierPhone}
        </a>
      </div>
    </div>
  </Card>
  );
};
