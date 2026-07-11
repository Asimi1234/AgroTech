import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui/PageHeading';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { CommodityPrices } from '@/components/dashboard/CommodityPrices';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { AdvisoriesCard } from '@/components/dashboard/AdvisoriesCard';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { useAuthStore } from '@/store/authStore';

export const FarmerDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation('dashboard');
  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <div>
      <PageHeading
        title={t('welcome', { name: firstName })}
        subtitle={t('subtitle')}
      />

      <DashboardStats />

      <div className="mt-6">
        <QuickLinks />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CommodityPrices />
          {user && <WeatherWidget region={user.region} />}
        </div>
        <AdvisoriesCard />
      </div>
    </div>
  );
};

export default FarmerDashboard;
