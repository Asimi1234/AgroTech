import { useMemo } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import type { ChartData, ChartOptions, ScriptableContext } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { formatNaira } from '@/lib/cn';
import type { PricePoint } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const LINE_COLOR = '#1c5b2e';
const POINT_COLOR = '#153c22';
const GRID_COLOR = '#f0ece3';
const TICK_COLOR = '#64748b';

const compactNaira = (value: number): string => {
  if (value >= 1000) return `₦${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `₦${value}`;
};

const areaFill = (context: ScriptableContext<'line'>): string | CanvasGradient => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return 'rgba(35, 114, 55, 0.12)';
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, 'rgba(35, 114, 55, 0.20)');
  gradient.addColorStop(1, 'rgba(35, 114, 55, 0)');
  return gradient;
};

export const PriceTrendChart = ({ data }: { data: PricePoint[] }) => {
  const { t } = useTranslation('product');
  const first = data[0]?.price ?? 0;
  const last = data[data.length - 1]?.price ?? 0;
  const delta = last - first;
  const deltaPercent = first ? (delta / first) * 100 : 0;
  const up = delta >= 0;

  const chartData = useMemo<ChartData<'line'>>(
    () => ({
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: 'Price',
          data: data.map((d) => d.price),
          borderColor: LINE_COLOR,
          backgroundColor: areaFill,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: POINT_COLOR,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          pointHitRadius: 16,
        },
      ],
    }),
    [data],
  );

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#153c22',
          padding: 10,
          displayColors: false,
          titleColor: '#dcf0de',
          bodyColor: '#ffffff',
          bodyFont: { weight: 'bold' },
          callbacks: {
            label: (item) => formatNaira(item.parsed.y ?? 0),
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: GRID_COLOR },
          ticks: {
            color: TICK_COLOR,
            font: { size: 11 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
          },
        },
        y: {
          grid: { color: GRID_COLOR },
          border: { display: false },
          ticks: {
            color: TICK_COLOR,
            font: { size: 11 },
            maxTicksLimit: 5,
            callback: (value) => compactNaira(Number(value)),
          },
        },
      },
    }),
    [],
  );

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-extrabold text-slate-900">
          {formatNaira(last)}
        </p>
        <p
          className={`flex items-center gap-1 text-sm font-semibold ${
            up ? 'text-green-700' : 'text-red-700'
          }`}
        >
          <Icon name={up ? 'trend-up' : 'trend-down'} className="h-4 w-4" />
          {up ? '+' : ''}
          {formatNaira(delta)} ({deltaPercent.toFixed(1)}%)
          <span className="ml-1 font-normal text-slate-500">{t('days30')}</span>
        </p>
      </div>
      <div className="mt-3 h-56">
        <Line
          data={chartData}
          options={options}
          aria-label={t('chartAria')}
          role="img"
        />
      </div>
    </div>
  );
};
