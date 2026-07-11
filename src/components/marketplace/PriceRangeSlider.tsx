import { formatNaira } from '@/lib/cn';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: number;
  label: string;
  onChange: (value: number) => void;
}

export const PriceRangeSlider = ({
  min,
  max,
  value,
  label,
  onChange,
}: PriceRangeSliderProps) => (
  <div>
    <label
      htmlFor="price-range"
      className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-800"
    >
      <span>{label}</span>
      <span className="text-brand-800">{formatNaira(value)}</span>
    </label>
    <input
      id="price-range"
      type="range"
      min={min}
      max={max}
      step={500}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="focus-ring h-2 w-full cursor-pointer appearance-none rounded-full bg-earth-200 accent-brand-700"
      aria-valuetext={formatNaira(value)}
    />
    <div className="mt-1 flex justify-between text-xs text-slate-500">
      <span>{formatNaira(min)}</span>
      <span>{formatNaira(max)}</span>
    </div>
  </div>
);
