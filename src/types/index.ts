export type UserRole = 'farmer' | 'supplier' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  region: RegionId;
  avatarInitials: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

// Commodities are admin-managed reference data (see the `commodities` table),
// so this is an open set. The known values keep autocomplete; `(string & {})`
// admits any slug a new commodity introduces without a code change.
export type CropType = 'cassava' | 'maize' | 'oil-palm' | 'rice' | (string & {});

export interface CropInfo {
  id: CropType;
  label: string;
}

/** Nigeria's 36 states plus the Federal Capital Territory. */
export type RegionId =
  | 'abia'
  | 'adamawa'
  | 'akwa-ibom'
  | 'anambra'
  | 'bauchi'
  | 'bayelsa'
  | 'benue'
  | 'borno'
  | 'cross-river'
  | 'delta'
  | 'ebonyi'
  | 'edo'
  | 'ekiti'
  | 'enugu'
  | 'fct'
  | 'gombe'
  | 'imo'
  | 'jigawa'
  | 'kaduna'
  | 'kano'
  | 'katsina'
  | 'kebbi'
  | 'kogi'
  | 'kwara'
  | 'lagos'
  | 'nasarawa'
  | 'niger'
  | 'ogun'
  | 'ondo'
  | 'osun'
  | 'oyo'
  | 'plateau'
  | 'rivers'
  | 'sokoto'
  | 'taraba'
  | 'yobe'
  | 'zamfara';

export interface Region {
  id: RegionId;
  label: string;
}

export type ProductCategory =
  | 'seed'
  | 'fertilizer'
  | 'equipment'
  | 'crop-protection'
  | 'produce';

/** Editable fields when a supplier creates or updates a listing. */
export interface ProductInput {
  name: string;
  category: ProductCategory;
  cropType: CropType;
  description: string;
  price: number;
  unit: string;
  region: RegionId;
  inStock: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  region: RegionId;
  rating: number;
  reviewCount: number;
  verified: boolean;
  joinedYear: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

/** Languages with localized dynamic content (UI chrome uses react-i18next). */
export type ContentLang = 'ha' | 'yo' | 'ig';

/**
 * Per-language overrides for a row's free-text fields, served by the backend
 * (Phase 2). Resolved against the active language at render time with an
 * English fallback; absent for user-generated content that has no translation.
 */
export type ContentI18n<K extends string> = Partial<
  Record<ContentLang, Partial<Record<K, string>>>
>;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  cropType: CropType;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  region: RegionId;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  supplierPhone: string;
  listedAt: string;
  inStock: boolean;
  i18n?: ContentI18n<'name' | 'description'>;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface ProductDetail extends Product {
  longDescription: string;
  priceHistory: PricePoint[];
  reviews: Review[];
}

export interface CommodityPrice {
  cropType: CropType;
  label: string;
  price: number;
  unit: string;
  changePercent: number;
  updatedAt: string;
}

/** A commodity in the reference table (list + display name + unit). */
export interface Commodity {
  cropType: CropType;
  label: string;
  unit: string;
}

/** Admin input to add a commodity. `slug` is derived from the label. */
export interface CommodityInput {
  label: string;
  unit: string;
}

export interface DailyForecast {
  day: string;
  tempHighC: number;
  tempLowC: number;
  rainfallMm: number;
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rain' | 'storm';
}

export interface WeatherForecast {
  region: RegionId;
  regionLabel: string;
  currentTempC: number;
  condition: DailyForecast['condition'];
  humidityPercent: number;
  updatedAt: string;
  daily: DailyForecast[];
}

export interface Advisory {
  id: string;
  cropType: CropType;
  title: string;
  window: string;
  detail: string;
  severity: 'info' | 'action' | 'warning';
  i18n?: ContentI18n<'title' | 'window' | 'detail'>;
}

/** Editable fields of an advisory (everything the admin controls, minus the id). */
export type AdvisoryInput = Omit<Advisory, 'id'>;

export interface DashboardSummary {
  marketListings: number;
  cooperativeCount: number;
  actionAdvisories: number;
  topMover: CommodityPrice;
}

export interface CategoryCount {
  category: ProductCategory;
  label: string;
  count: number;
}

export interface RegionCount {
  region: RegionId;
  label: string;
  count: number;
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalListings: number;
  cooperativeCount: number;
  cooperativeMembers: number;
  listingsByCategory: CategoryCount[];
  usersByRegion: RegionCount[];
}

export interface GroupMember {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export interface GroupMessage {
  id: string;
  author: string;
  timestamp: string;
  body: string;
}

export interface Cooperative {
  id: string;
  name: string;
  cropFocus: CropType;
  region: RegionId;
  memberCount: number;
  description: string;
  members: GroupMember[];
  messages: GroupMessage[];
  i18n?: ContentI18n<'name' | 'description'>;
}

export interface Credentials {
  phone: string;
  pin: string;
  role: UserRole;
}

export interface SupplierInquiry {
  id: string;
  buyerName: string;
  productId: string;
  productName: string;
  message: string;
  date: string;
  phone: string;
}
