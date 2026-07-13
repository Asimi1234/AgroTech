import type { Commodity, CropInfo, Product, Region } from '@/types';
import { catalogCategory, catalogCrop, catalogRegion } from '@/i18n/catalog';

/**
 * Backend-agnostic reference data: fixed lookup lists and label helpers shared by
 * BOTH the mock and Supabase backends and the UI. This is NOT mock data — it's
 * real reference data that happens to be small and stable enough to live in code
 * (per the "hardcode truly-fixed sets" rule). Data that grows or is admin-managed
 * lives in a Supabase table instead (e.g. `commodities`). Mock-backend fixtures
 * live in `mockData.ts`.
 */

/** Crop types offered in filters and selectors. */
export const crops: CropInfo[] = [
  { id: 'cassava', label: 'Cassava' },
  { id: 'maize', label: 'Maize' },
  { id: 'oil-palm', label: 'Oil Palm' },
  { id: 'rice', label: 'Rice' },
];

/** Nigeria's 36 states plus the Federal Capital Territory. */
export const regions: Region[] = [
  { id: 'abia', label: 'Abia' },
  { id: 'adamawa', label: 'Adamawa' },
  { id: 'akwa-ibom', label: 'Akwa Ibom' },
  { id: 'anambra', label: 'Anambra' },
  { id: 'bauchi', label: 'Bauchi' },
  { id: 'bayelsa', label: 'Bayelsa' },
  { id: 'benue', label: 'Benue' },
  { id: 'borno', label: 'Borno' },
  { id: 'cross-river', label: 'Cross River' },
  { id: 'delta', label: 'Delta' },
  { id: 'ebonyi', label: 'Ebonyi' },
  { id: 'edo', label: 'Edo' },
  { id: 'ekiti', label: 'Ekiti' },
  { id: 'enugu', label: 'Enugu' },
  { id: 'fct', label: 'FCT (Abuja)' },
  { id: 'gombe', label: 'Gombe' },
  { id: 'imo', label: 'Imo' },
  { id: 'jigawa', label: 'Jigawa' },
  { id: 'kaduna', label: 'Kaduna' },
  { id: 'kano', label: 'Kano' },
  { id: 'katsina', label: 'Katsina' },
  { id: 'kebbi', label: 'Kebbi' },
  { id: 'kogi', label: 'Kogi' },
  { id: 'kwara', label: 'Kwara' },
  { id: 'lagos', label: 'Lagos' },
  { id: 'nasarawa', label: 'Nasarawa' },
  { id: 'niger', label: 'Niger' },
  { id: 'ogun', label: 'Ogun' },
  { id: 'ondo', label: 'Ondo' },
  { id: 'osun', label: 'Osun' },
  { id: 'oyo', label: 'Oyo' },
  { id: 'plateau', label: 'Plateau' },
  { id: 'rivers', label: 'Rivers' },
  { id: 'sokoto', label: 'Sokoto' },
  { id: 'taraba', label: 'Taraba' },
  { id: 'yobe', label: 'Yobe' },
  { id: 'zamfara', label: 'Zamfara' },
];

/** Product categories (a closed set tied to the ProductCategory type + UI icons). */
export const productCategories: { id: Product['category']; label: string }[] = [
  { id: 'seed', label: 'Seed' },
  { id: 'fertilizer', label: 'Fertilizer' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'crop-protection', label: 'Crop protection' },
  { id: 'produce', label: 'Produce' },
];

/**
 * Default commodities seeded into the `commodities` table. Used as the offline
 * fallback for labels/units when that table can't be read, so the Supabase path
 * needs no dependency on mock fixtures. Keep in sync with `supabase/commodities.sql`.
 */
export const baseCommodities: Commodity[] = [
  { cropType: 'maize', label: 'Maize (dry grain)', unit: 'per kg' },
  { cropType: 'cassava', label: 'Cassava (fresh tuber)', unit: 'per kg' },
  { cropType: 'oil-palm', label: 'Palm Oil (crude)', unit: 'per litre' },
  { cropType: 'rice', label: 'Paddy Rice', unit: 'per kg' },
];

export const cropLabel = (id: string): string =>
  catalogCrop(id) ?? crops.find((c) => c.id === id)?.label ?? id;

export const regionLabel = (id: string): string =>
  catalogRegion(id) ?? regions.find((r) => r.id === id)?.label ?? id;

export const categoryLabel = (id: string): string =>
  catalogCategory(id) ?? productCategories.find((c) => c.id === id)?.label ?? id;
