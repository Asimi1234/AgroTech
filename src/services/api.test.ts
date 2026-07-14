import { describe, it, expect } from 'vitest';
import {
  aggregatePrices,
  buildForecast,
  identifierToEmail,
  phoneKey,
  slugify,
  toCropType,
  toDbCrop,
} from '@/services/api';

describe('identifierToEmail', () => {
  it('normalizes a real email', () => {
    expect(identifierToEmail('  User@Example.COM ')).toBe('user@example.com');
  });
  it('derives the synthetic email from a phone', () => {
    expect(identifierToEmail('08034451200')).toBe('8034451200@ojafarm.local');
  });
  it('resolves any phone format to the same synthetic email', () => {
    expect(identifierToEmail('+234 803 445 1200')).toBe(
      identifierToEmail('08034451200'),
    );
  });
});

describe('phoneKey', () => {
  it('takes the last 10 digits regardless of format', () => {
    expect(phoneKey('08034451200')).toBe('8034451200');
    expect(phoneKey('+234 803 445 1200')).toBe('8034451200');
  });
});

describe('crop vocabulary mapping', () => {
  it('bridges palm_oil (db) and oil-palm (app)', () => {
    expect(toCropType('palm_oil')).toBe('oil-palm');
    expect(toDbCrop('oil-palm')).toBe('palm_oil');
    expect(toDbCrop(toCropType('palm_oil'))).toBe('palm_oil');
  });
  it('passes other crops through unchanged', () => {
    expect(toCropType('maize')).toBe('maize');
    expect(toDbCrop('maize')).toBe('maize');
  });
});

describe('slugify', () => {
  it('lowercases and underscores a display name', () => {
    expect(slugify('Yellow Maize')).toBe('yellow_maize');
  });
  it('trims and collapses punctuation', () => {
    expect(slugify('  Palm Oil (crude) ')).toBe('palm_oil_crude');
  });
});

describe('aggregatePrices', () => {
  const rows = [
    { crop_type: 'maize', location: 'Kaduna', price: 500, date: '2026-07-13' },
    { crop_type: 'maize', location: 'Oyo', price: 520, date: '2026-07-13' },
    { crop_type: 'maize', location: 'National', price: 600, date: '2026-07-14' },
    { crop_type: 'maize', location: 'Kaduna', price: 540, date: '2026-07-14' },
  ];

  it('prefers the authoritative National row for the latest day', () => {
    const [price] = aggregatePrices(rows);
    expect(price.cropType).toBe('maize');
    expect(price.price).toBe(600); // National, not the mean of 600 & 540
    expect(price.updatedAt).toBe('2026-07-14');
  });

  it('computes change vs the previous day (mean when no National)', () => {
    // previous day = mean(500, 520) = 510; (600-510)/510 ≈ +17.6%
    const [price] = aggregatePrices(rows);
    expect(price.changePercent).toBeCloseTo(17.6, 1);
  });

  it('falls back to the location mean when no National row exists', () => {
    const [price] = aggregatePrices([
      { crop_type: 'rice', location: 'Benue', price: 600, date: '2026-07-14' },
      { crop_type: 'rice', location: 'Oyo', price: 620, date: '2026-07-14' },
    ]);
    expect(price.price).toBe(610);
  });
});

describe('buildForecast', () => {
  const rows = [
    { location: 'Oyo', temperature: 30, rainfall: 5, forecast: 'Sunny', condition: 'sunny', humidity: 60, date: '2026-07-14' },
    { location: 'Oyo', temperature: 28, rainfall: 12, forecast: 'Rain', condition: 'rain', humidity: 80, date: '2026-07-15' },
    { location: 'Oyo', temperature: 29, rainfall: 2, forecast: 'Cloudy', condition: 'cloudy', humidity: 55, date: '2026-07-16' },
  ];

  it('takes current conditions from the earliest (nearest) day', () => {
    const f = buildForecast('oyo', rows);
    expect(f.region).toBe('oyo');
    expect(f.regionLabel).toBe('Oyo');
    expect(f.currentTempC).toBe(30);
    expect(f.condition).toBe('sunny');
    expect(f.humidityPercent).toBe(60);
    expect(f.updatedAt).toBe('2026-07-14');
  });

  it('returns the days ascending with derived high/low', () => {
    const f = buildForecast('oyo', rows);
    expect(f.daily.map((d) => d.day)).toHaveLength(3);
    expect(f.daily[0].tempHighC).toBe(33); // 30 + 3
    expect(f.daily[0].tempLowC).toBe(26); // 30 - 4
    expect(f.daily[0].rainfallMm).toBe(5);
  });
});
