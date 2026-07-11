import type {
  Advisory,
  CommodityPrice,
  Cooperative,
  CropInfo,
  Credentials,
  Product,
  ProductDetail,
  Region,
  Supplier,
  User,
  WeatherForecast,
} from '@/types';
import { placeholderImage } from './placeholderImage';
import { catalogCategory, catalogCrop, catalogRegion } from '@/i18n/catalog';

export const crops: CropInfo[] = [
  { id: 'cassava', label: 'Cassava' },
  { id: 'maize', label: 'Maize' },
  { id: 'oil-palm', label: 'Oil Palm' },
  { id: 'rice', label: 'Rice' },
];

export const regions: Region[] = [
  { id: 'oyo', label: 'Oyo' },
  { id: 'kaduna', label: 'Kaduna' },
  { id: 'benue', label: 'Benue' },
  { id: 'cross-river', label: 'Cross River' },
  { id: 'kano', label: 'Kano' },
  { id: 'enugu', label: 'Enugu' },
];

export const productCategories: { id: Product['category']; label: string }[] = [
  { id: 'seed', label: 'Seed' },
  { id: 'fertilizer', label: 'Fertilizer' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'crop-protection', label: 'Crop protection' },
  { id: 'produce', label: 'Produce' },
];

export const cropLabel = (id: string): string =>
  catalogCrop(id) ?? crops.find((c) => c.id === id)?.label ?? id;

export const regionLabel = (id: string): string =>
  catalogRegion(id) ?? regions.find((r) => r.id === id)?.label ?? id;

export const categoryLabel = (id: string): string =>
  catalogCategory(id) ?? productCategories.find((c) => c.id === id)?.label ?? id;

export const suppliers: Supplier[] = [
  { id: 's1', name: 'GreenField Agro Inputs', phone: '+234 803 111 2200', region: 'oyo', rating: 4.7, reviewCount: 128, verified: true, joinedYear: 2019 },
  { id: 's2', name: 'Savannah Seeds Ltd', phone: '+234 806 244 8890', region: 'kaduna', rating: 4.4, reviewCount: 86, verified: true, joinedYear: 2020 },
  { id: 's3', name: 'Benue Harvest Supplies', phone: '+234 813 550 7712', region: 'benue', rating: 4.1, reviewCount: 54, verified: false, joinedYear: 2021 },
  { id: 's4', name: 'Delta Palm Resources', phone: '+234 802 998 4410', region: 'cross-river', rating: 4.8, reviewCount: 173, verified: true, joinedYear: 2018 },
  { id: 's5', name: 'Northern Agro Depot', phone: '+234 809 332 1005', region: 'kano', rating: 3.9, reviewCount: 41, verified: false, joinedYear: 2022 },
  { id: 's6', name: 'Enugu Farm Solutions', phone: '+234 705 671 3388', region: 'enugu', rating: 4.5, reviewCount: 97, verified: true, joinedYear: 2020 },
];

const supplierById = (id: string): Supplier =>
  suppliers.find((s) => s.id === id) ?? suppliers[0];

interface ProductSeed {
  id: string;
  name: string;
  category: Product['category'];
  cropType: Product['cropType'];
  description: string;
  price: number;
  unit: string;
  region: Product['region'];
  supplierId: string;
  listedAt: string;
  inStock?: boolean;
}

const productSeeds: ProductSeed[] = [
  { id: 'p1', name: 'Improved Cassava Stem Cuttings (TME 419)', category: 'seed', cropType: 'cassava', description: 'Disease-resistant, high-yield cassava stems, bundle of 50.', price: 3500, unit: 'bundle', region: 'oyo', supplierId: 's1', listedAt: '2026-07-08' },
  { id: 'p2', name: 'Hybrid Maize Seed (SAMMAZ 15)', category: 'seed', cropType: 'maize', description: 'Drought-tolerant hybrid maize, 90-day maturity.', price: 6200, unit: '2kg pack', region: 'kaduna', supplierId: 's2', listedAt: '2026-07-09' },
  { id: 'p3', name: 'Tenera Oil Palm Seedlings', category: 'seed', cropType: 'oil-palm', description: 'Certified sprouted tenera seedlings, high oil-extraction ratio.', price: 850, unit: 'seedling', region: 'cross-river', supplierId: 's4', listedAt: '2026-07-05' },
  { id: 'p4', name: 'FARO 44 Rice Seed', category: 'seed', cropType: 'rice', description: 'Lowland long-grain rice seed, aromatic, high milling yield.', price: 5400, unit: '5kg bag', region: 'benue', supplierId: 's3', listedAt: '2026-07-07' },
  { id: 'p5', name: 'NPK 20-10-10 Fertilizer', category: 'fertilizer', cropType: 'maize', description: 'Balanced granular fertilizer for cereal crops, 50kg.', price: 32000, unit: '50kg bag', region: 'kaduna', supplierId: 's2', listedAt: '2026-07-10' },
  { id: 'p6', name: 'Urea Fertilizer (46% N)', category: 'fertilizer', cropType: 'rice', description: 'High-nitrogen top-dressing fertilizer for paddy rice.', price: 34500, unit: '50kg bag', region: 'benue', supplierId: 's3', listedAt: '2026-07-06' },
  { id: 'p7', name: 'Organic Poultry Manure Pellets', category: 'fertilizer', cropType: 'cassava', description: 'Slow-release organic soil conditioner, improves root tubers.', price: 12000, unit: '25kg bag', region: 'oyo', supplierId: 's1', listedAt: '2026-07-04' },
  { id: 'p8', name: 'Palm Bunch Ash Potash', category: 'fertilizer', cropType: 'oil-palm', description: 'Potassium-rich amendment for mature oil palm plantations.', price: 9500, unit: '25kg bag', region: 'cross-river', supplierId: 's4', listedAt: '2026-07-03' },
  { id: 'p9', name: 'Knapsack Sprayer (16L)', category: 'equipment', cropType: 'maize', description: 'Manual lever knapsack sprayer, brass nozzle, UV-resistant tank.', price: 18500, unit: 'unit', region: 'kano', supplierId: 's5', listedAt: '2026-07-09' },
  { id: 'p10', name: 'Cassava Grating Machine', category: 'equipment', cropType: 'cassava', description: 'Petrol-powered grater, 500kg/hr throughput for garri processing.', price: 145000, unit: 'unit', region: 'enugu', supplierId: 's6', listedAt: '2026-07-02' },
  { id: 'p11', name: 'Rice Threshing Machine', category: 'equipment', cropType: 'rice', description: 'Pedal-and-motor rice thresher, reduces post-harvest loss.', price: 210000, unit: 'unit', region: 'benue', supplierId: 's3', listedAt: '2026-07-01', inStock: false },
  { id: 'p12', name: 'Motorized Palm Fruit Digester', category: 'equipment', cropType: 'oil-palm', description: 'Stainless digester for small-scale palm oil milling.', price: 320000, unit: 'unit', region: 'cross-river', supplierId: 's4', listedAt: '2026-06-30' },
  { id: 'p13', name: 'Glyphosate Herbicide (1L)', category: 'crop-protection', cropType: 'maize', description: 'Non-selective systemic herbicide for land clearing.', price: 4200, unit: '1L bottle', region: 'kaduna', supplierId: 's2', listedAt: '2026-07-08' },
  { id: 'p14', name: 'Mancozeb Fungicide (1kg)', category: 'crop-protection', cropType: 'cassava', description: 'Protective fungicide against cassava leaf blight.', price: 5600, unit: '1kg pack', region: 'oyo', supplierId: 's1', listedAt: '2026-07-07' },
  { id: 'p15', name: 'Cypermethrin Insecticide (1L)', category: 'crop-protection', cropType: 'rice', description: 'Broad-spectrum insecticide for stem borers and armyworm.', price: 4800, unit: '1L bottle', region: 'benue', supplierId: 's3', listedAt: '2026-07-06' },
  { id: 'p16', name: 'Neem Oil Bio-Pesticide (500ml)', category: 'crop-protection', cropType: 'oil-palm', description: 'Organic pest deterrent, safe for pollinators.', price: 3200, unit: '500ml bottle', region: 'enugu', supplierId: 's6', listedAt: '2026-07-05' },
  { id: 'p17', name: 'Dried Cassava Chips (Bulk)', category: 'produce', cropType: 'cassava', description: 'Sun-dried cassava chips for feed and starch, aggregator lot.', price: 78000, unit: 'tonne', region: 'oyo', supplierId: 's1', listedAt: '2026-07-10' },
  { id: 'p18', name: 'Yellow Maize Grain (Bulk)', category: 'produce', cropType: 'maize', description: 'Cleaned, dried yellow maize, moisture below 14%.', price: 520000, unit: 'tonne', region: 'kaduna', supplierId: 's2', listedAt: '2026-07-09' },
  { id: 'p19', name: 'Crude Palm Oil (25L)', category: 'produce', cropType: 'oil-palm', description: 'Freshly milled red palm oil, low free-fatty-acid content.', price: 62000, unit: '25L keg', region: 'cross-river', supplierId: 's4', listedAt: '2026-07-08' },
  { id: 'p20', name: 'Milled Long-Grain Rice (Bulk)', category: 'produce', cropType: 'rice', description: 'Destoned, polished local rice, 50kg bags, aggregator lot.', price: 68000, unit: '50kg bag', region: 'benue', supplierId: 's3', listedAt: '2026-07-07' },
];

export const products: Product[] = productSeeds.map((seed) => {
  const supplier = supplierById(seed.supplierId);
  return {
    ...seed,
    inStock: seed.inStock ?? true,
    imageUrl: placeholderImage(seed.name, seed.category),
    supplierName: supplier.name,
    supplierRating: supplier.rating,
    supplierPhone: supplier.phone,
  };
});

const PRICE_HISTORY_DAYS = 30;
const PRICE_HISTORY_END = new Date('2026-07-11T00:00:00');

const priceStep = (base: number): number =>
  base >= 100000 ? 500 : base >= 10000 ? 100 : base >= 1000 ? 10 : 1;

/**
 * Deterministic 30-day daily price series: a gentle wave plus a mild drift so the
 * trend reads realistically without random noise. Anchored to a fixed end date so
 * the mock stays stable across renders and tests. Replace with real series in
 * Phase 2.
 */
const buildPriceHistory = (base: number): { date: string; price: number }[] => {
  const step = priceStep(base);
  return Array.from({ length: PRICE_HISTORY_DAYS }, (_, i) => {
    const progress = i / (PRICE_HISTORY_DAYS - 1);
    const wave = Math.sin(i / 3.3) * 0.035;
    const drift = (progress - 0.5) * 0.06;
    const price = Math.max(step, Math.round((base * (1 + wave + drift)) / step) * step);
    const date = new Date(PRICE_HISTORY_END);
    date.setDate(date.getDate() - (PRICE_HISTORY_DAYS - 1 - i));
    return {
      date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      price,
    };
  });
};

const reviewsBank: Record<string, ProductDetail['reviews']> = {
  default: [
    { id: 'r1', author: 'Musa I.', rating: 5, date: '2026-06-28', comment: 'Delivered on time and exactly as described. Will order again.' },
    { id: 'r2', author: 'Ngozi A.', rating: 4, date: '2026-06-15', comment: 'Good quality, though packaging could be sturdier.' },
    { id: 'r3', author: 'Yakubu D.', rating: 5, date: '2026-05-30', comment: 'Supplier answered all my questions before I paid. Trustworthy.' },
  ],
};

export const buildProductDetail = (product: Product): ProductDetail => ({
  ...product,
  longDescription: `${product.description} Sourced through vetted ${regionLabel(
    product.region,
  )} suppliers and suited to small-scale ${cropLabel(
    product.cropType,
  )} operations. Prices are indicative and may be negotiated directly with the supplier. Contact the supplier to confirm current stock, delivery options within ${regionLabel(
    product.region,
  )}, and bulk discounts for cooperative orders.`,
  priceHistory: buildPriceHistory(product.price),
  reviews: reviewsBank.default,
});

export const commodityPrices: CommodityPrice[] = [
  { cropType: 'cassava', label: 'Cassava (fresh tuber)', price: 145, unit: 'per kg', changePercent: 2.4, updatedAt: '2026-07-11' },
  { cropType: 'maize', label: 'Maize (dry grain)', price: 520, unit: 'per kg', changePercent: -1.1, updatedAt: '2026-07-11' },
  { cropType: 'oil-palm', label: 'Palm Oil (crude)', price: 2480, unit: 'per litre', changePercent: 3.7, updatedAt: '2026-07-11' },
  { cropType: 'rice', label: 'Paddy Rice', price: 610, unit: 'per kg', changePercent: 0.8, updatedAt: '2026-07-11' },
];

const forecastDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

export const weatherForecasts: WeatherForecast[] = [
  {
    region: 'oyo', regionLabel: 'Oyo', currentTempC: 29, condition: 'partly-cloudy', humidityPercent: 74, updatedAt: '2026-07-11 08:00',
    daily: [
      { day: forecastDays[0], tempHighC: 30, tempLowC: 23, rainfallMm: 6, condition: 'rain' },
      { day: forecastDays[1], tempHighC: 31, tempLowC: 23, rainfallMm: 2, condition: 'partly-cloudy' },
      { day: forecastDays[2], tempHighC: 29, tempLowC: 22, rainfallMm: 12, condition: 'rain' },
      { day: forecastDays[3], tempHighC: 28, tempLowC: 22, rainfallMm: 18, condition: 'storm' },
      { day: forecastDays[4], tempHighC: 30, tempLowC: 23, rainfallMm: 4, condition: 'cloudy' },
    ],
  },
  {
    region: 'kaduna', regionLabel: 'Kaduna', currentTempC: 27, condition: 'cloudy', humidityPercent: 68, updatedAt: '2026-07-11 08:00',
    daily: [
      { day: forecastDays[0], tempHighC: 28, tempLowC: 20, rainfallMm: 9, condition: 'rain' },
      { day: forecastDays[1], tempHighC: 29, tempLowC: 20, rainfallMm: 14, condition: 'rain' },
      { day: forecastDays[2], tempHighC: 27, tempLowC: 19, rainfallMm: 22, condition: 'storm' },
      { day: forecastDays[3], tempHighC: 28, tempLowC: 20, rainfallMm: 5, condition: 'cloudy' },
      { day: forecastDays[4], tempHighC: 30, tempLowC: 21, rainfallMm: 1, condition: 'sunny' },
    ],
  },
  {
    region: 'benue', regionLabel: 'Benue', currentTempC: 30, condition: 'sunny', humidityPercent: 71, updatedAt: '2026-07-11 08:00',
    daily: [
      { day: forecastDays[0], tempHighC: 32, tempLowC: 23, rainfallMm: 3, condition: 'partly-cloudy' },
      { day: forecastDays[1], tempHighC: 31, tempLowC: 23, rainfallMm: 8, condition: 'rain' },
      { day: forecastDays[2], tempHighC: 30, tempLowC: 22, rainfallMm: 15, condition: 'rain' },
      { day: forecastDays[3], tempHighC: 31, tempLowC: 23, rainfallMm: 6, condition: 'partly-cloudy' },
      { day: forecastDays[4], tempHighC: 33, tempLowC: 24, rainfallMm: 0, condition: 'sunny' },
    ],
  },
  {
    region: 'cross-river', regionLabel: 'Cross River', currentTempC: 28, condition: 'rain', humidityPercent: 86, updatedAt: '2026-07-11 08:00',
    daily: [
      { day: forecastDays[0], tempHighC: 29, tempLowC: 23, rainfallMm: 28, condition: 'storm' },
      { day: forecastDays[1], tempHighC: 28, tempLowC: 23, rainfallMm: 24, condition: 'rain' },
      { day: forecastDays[2], tempHighC: 29, tempLowC: 23, rainfallMm: 16, condition: 'rain' },
      { day: forecastDays[3], tempHighC: 30, tempLowC: 24, rainfallMm: 10, condition: 'rain' },
      { day: forecastDays[4], tempHighC: 30, tempLowC: 24, rainfallMm: 7, condition: 'partly-cloudy' },
    ],
  },
];

export const advisories: Advisory[] = [
  { id: 'a1', cropType: 'maize', title: 'Top-dress maize with nitrogen now', window: 'Weeks 4-6 after planting', detail: 'Apply urea at the knee-high stage before the heavy rains forecast midweek. Split application reduces leaching losses.', severity: 'action' },
  { id: 'a2', cropType: 'cassava', title: 'Scout for cassava mosaic disease', window: 'Vegetative stage', detail: 'Inspect young leaves for yellow mottling. Rogue out and destroy infected plants to protect the field.', severity: 'warning' },
  { id: 'a3', cropType: 'rice', title: 'Maintain 5cm water level in paddies', window: 'Tillering stage', detail: 'Steady flooding suppresses weeds and supports tillering. Expect adequate rainfall this week across lowland areas.', severity: 'info' },
  { id: 'a4', cropType: 'oil-palm', title: 'Ring-weed young palms before fertilizing', window: 'Establishment year', detail: 'Clear a 1m radius around each palm, then apply potash. Reduces competition and improves nutrient uptake.', severity: 'info' },
  { id: 'a5', cropType: 'maize', title: 'Fall armyworm pressure rising', window: 'Whorl stage', detail: 'Regional traps show increased moth counts. Scout early mornings and treat only if damage exceeds 20% of plants.', severity: 'warning' },
];

export const cooperatives: Cooperative[] = [
  {
    id: 'g1', name: 'Oyo Cassava Growers Cooperative', cropFocus: 'cassava', region: 'oyo', memberCount: 42,
    description: 'Aggregates fresh tubers and dried chips for collective sale to processors.',
    members: [
      { id: 'm1', name: 'Adewale Ogun', role: 'Chairperson', phone: '+234 803 445 1200' },
      { id: 'm2', name: 'Bisi Adeyemi', role: 'Secretary', phone: '+234 806 771 3390' },
      { id: 'm3', name: 'Tunde Balogun', role: 'Member', phone: '+234 813 900 4521' },
      { id: 'm4', name: 'Funke Alabi', role: 'Treasurer', phone: '+234 705 222 8810' },
    ],
    messages: [
      { id: 'gm1', author: 'Adewale Ogun', timestamp: '2026-07-10 14:20', body: 'Processor confirmed pickup for Friday. Please bring dried chips to the collection point by 9am.' },
      { id: 'gm2', author: 'Bisi Adeyemi', timestamp: '2026-07-10 15:05', body: 'Noted. I will have 12 bags ready.' },
      { id: 'gm3', author: 'Tunde Balogun', timestamp: '2026-07-11 07:40', body: 'Can we discuss the new grating machine cost-share at the next meeting?' },
    ],
  },
  {
    id: 'g2', name: 'Kaduna Maize Aggregators', cropFocus: 'maize', region: 'kaduna', memberCount: 58,
    description: 'Bulk grain aggregation and shared access to drying floors and storage.',
    members: [
      { id: 'm5', name: 'Ibrahim Sani', role: 'Chairperson', phone: '+234 802 118 9900' },
      { id: 'm6', name: 'Halima Bello', role: 'Secretary', phone: '+234 809 654 2201' },
      { id: 'm7', name: 'Danjuma Musa', role: 'Member', phone: '+234 813 447 6650' },
    ],
    messages: [
      { id: 'gm4', author: 'Ibrahim Sani', timestamp: '2026-07-09 11:00', body: 'Grain price at the depot moved to 520/kg. Hold your stock if you can wait a week.' },
      { id: 'gm5', author: 'Halima Bello', timestamp: '2026-07-09 12:30', body: 'Storage space is available for 20 more tonnes.' },
    ],
  },
  {
    id: 'g3', name: 'Cross River Palm Oil Millers', cropFocus: 'oil-palm', region: 'cross-river', memberCount: 31,
    description: 'Small-scale millers sharing a motorized digester and marketing crude palm oil.',
    members: [
      { id: 'm8', name: 'Effiong Bassey', role: 'Chairperson', phone: '+234 803 556 7788' },
      { id: 'm9', name: 'Grace Etim', role: 'Treasurer', phone: '+234 806 223 4419' },
    ],
    messages: [
      { id: 'gm6', author: 'Effiong Bassey', timestamp: '2026-07-08 09:15', body: 'Digester maintenance done. Booking sheet is open for next week.' },
    ],
  },
  {
    id: 'g4', name: 'Benue Rice Farmers Union', cropFocus: 'rice', region: 'benue', memberCount: 74,
    description: 'Lowland rice growers coordinating inputs, milling, and market access.',
    members: [
      { id: 'm10', name: 'Terhemba Iorpev', role: 'Chairperson', phone: '+234 813 220 1145' },
      { id: 'm11', name: 'Doosuur Aki', role: 'Secretary', phone: '+234 705 889 6600' },
      { id: 'm12', name: 'Sesugh Ade', role: 'Member', phone: '+234 802 447 1123' },
    ],
    messages: [
      { id: 'gm7', author: 'Terhemba Iorpev', timestamp: '2026-07-10 16:45', body: 'Thresher is fixed. Reminder: harvest starts in three weeks, prepare your bags.' },
    ],
  },
  {
    id: 'g5', name: 'Enugu Youth Agripreneurs', cropFocus: 'cassava', region: 'enugu', memberCount: 26,
    description: 'Young farmers pooling resources for cassava processing and value addition.',
    members: [
      { id: 'm13', name: 'Chidi Okeke', role: 'Coordinator', phone: '+234 806 334 7781' },
      { id: 'm14', name: 'Amaka Nwosu', role: 'Member', phone: '+234 809 112 5540' },
    ],
    messages: [
      { id: 'gm8', author: 'Chidi Okeke', timestamp: '2026-07-11 08:10', body: 'Garri packaging training this Saturday. RSVP here.' },
    ],
  },
  {
    id: 'g6', name: 'Kano Dry-Season Farmers', cropFocus: 'maize', region: 'kano', memberCount: 49,
    description: 'Irrigated dry-season production with shared pumps and input bulk-buying.',
    members: [
      { id: 'm15', name: 'Aminu Garba', role: 'Chairperson', phone: '+234 803 778 2210' },
      { id: 'm16', name: 'Fatima Yusuf', role: 'Secretary', phone: '+234 806 445 9982' },
    ],
    messages: [
      { id: 'gm9', author: 'Aminu Garba', timestamp: '2026-07-07 10:20', body: 'Bulk fertilizer order closes Friday. Send your quantities.' },
    ],
  },
];

export const users: User[] = [
  { id: 'u1', name: 'Adewale Ogun', role: 'farmer', phone: '+234 803 445 1200', region: 'oyo', avatarInitials: 'AO', status: 'active', lastActive: '2026-07-11 08:30' },
  { id: 'u2', name: 'Ibrahim Sani', role: 'farmer', phone: '+234 802 118 9900', region: 'kaduna', avatarInitials: 'IS', status: 'active', lastActive: '2026-07-11 07:55' },
  { id: 'u3', name: 'GreenField Agro Inputs', role: 'supplier', phone: '+234 803 111 2200', region: 'oyo', avatarInitials: 'GA', status: 'active', lastActive: '2026-07-10 18:12' },
  { id: 'u4', name: 'Savannah Seeds Ltd', role: 'supplier', phone: '+234 806 244 8890', region: 'kaduna', avatarInitials: 'SS', status: 'inactive', lastActive: '2026-06-29 13:40' },
  { id: 'u5', name: 'Effiong Bassey', role: 'farmer', phone: '+234 803 556 7788', region: 'cross-river', avatarInitials: 'EB', status: 'active', lastActive: '2026-07-11 06:20' },
  { id: 'u6', name: 'Delta Palm Resources', role: 'supplier', phone: '+234 802 998 4410', region: 'cross-river', avatarInitials: 'DP', status: 'active', lastActive: '2026-07-10 20:05' },
  { id: 'u7', name: 'Terhemba Iorpev', role: 'farmer', phone: '+234 813 220 1145', region: 'benue', avatarInitials: 'TI', status: 'inactive', lastActive: '2026-07-02 09:15' },
  { id: 'u8', name: 'Platform Admin', role: 'admin', phone: '+234 700 000 0000', region: 'oyo', avatarInitials: 'PA', status: 'active', lastActive: '2026-07-11 08:45' },
];

/**
 * Demo credentials for the mock auth layer. Any listed phone + the shared PIN
 * signs in as the matching role. Replace with a real auth flow in Phase 2.
 */
export const demoCredentials: (Credentials & { name: string })[] = [
  { name: 'Adewale Ogun (Farmer)', phone: '08034451200', pin: '1234', role: 'farmer' },
  { name: 'GreenField Agro (Supplier)', phone: '08031112200', pin: '1234', role: 'supplier' },
  { name: 'Platform Admin', phone: '07000000000', pin: '1234', role: 'admin' },
];
