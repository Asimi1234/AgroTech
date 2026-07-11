import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { crops, cropLabel, regionLabel, regions } from '@/data/mockData';
import { PriceRangeSlider } from './PriceRangeSlider';

export interface MarketFilters {
  cropType: string;
  region: string;
  maxPrice: number;
  sort: 'newest' | 'price-asc' | 'price-desc' | 'rating';
  search: string;
}

export const MAX_PRICE = 550000;

export const defaultFilters: MarketFilters = {
  cropType: 'all',
  region: 'all',
  maxPrice: MAX_PRICE,
  sort: 'newest',
  search: '',
};

const sortKey: Record<MarketFilters['sort'], string> = {
  newest: 'sort.newest',
  'price-asc': 'sort.priceAsc',
  'price-desc': 'sort.priceDesc',
  rating: 'sort.rating',
};

interface Props {
  filters: MarketFilters;
  onChange: (filters: MarketFilters) => void;
  resultCount: number;
}

export const MarketplaceFilters = ({
  filters,
  onChange,
  resultCount,
}: Props) => {
  const { t } = useTranslation('marketplace');
  const update = (patch: Partial<MarketFilters>) =>
    onChange({ ...filters, ...patch });

  const sortOptions = (
    ['newest', 'price-asc', 'price-desc', 'rating'] as MarketFilters['sort'][]
  ).map((value) => ({ value, label: t(sortKey[value]) }));

  const regionOptions = [
    { value: 'all', label: t('filters.allRegions') },
    ...regions.map((r) => ({ value: r.id, label: regionLabel(r.id) })),
  ];

  const cropPills = [
    { id: 'all', label: t('filters.allCrops') },
    ...crops.map((c) => ({ id: c.id, label: cropLabel(c.id) })),
  ];
  const isDefault =
    JSON.stringify(filters) === JSON.stringify(defaultFilters);

  return (
    <Card>
      <CardBody className="space-y-4">
        <Input
          type="search"
          placeholder={t('filters.search')}
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          aria-label={t('filters.search')}
        />

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">
            {t('filters.cropType')}
          </p>
          <div className="flex flex-wrap gap-2">
            {cropPills.map((crop) => {
              const active = filters.cropType === crop.id;
              return (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => update({ cropType: crop.id })}
                  aria-pressed={active}
                  className={cn(
                    'focus-ring rounded-full border px-3 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'border-brand-700 bg-brand-700 text-white'
                      : 'border-earth-200 bg-white text-slate-700 hover:border-brand-300',
                  )}
                >
                  {crop.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('filters.location')}
            options={regionOptions}
            value={filters.region}
            onChange={(e) => update({ region: e.target.value })}
          />
          <Select
            label={t('filters.sortBy')}
            options={sortOptions}
            value={filters.sort}
            onChange={(e) =>
              update({ sort: e.target.value as MarketFilters['sort'] })
            }
          />
        </div>

        <PriceRangeSlider
          min={0}
          max={MAX_PRICE}
          value={filters.maxPrice}
          label={t('filters.maxPrice')}
          onChange={(maxPrice) => update({ maxPrice })}
        />

        <div className="flex items-center justify-between border-t border-earth-100 pt-3">
          <p className="text-sm font-medium text-slate-600">
            {t('filters.results', { count: resultCount })}
          </p>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDefault}
            onClick={() => onChange(defaultFilters)}
          >
            <Icon name="close" className="h-4 w-4" />
            {t('filters.reset')}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
