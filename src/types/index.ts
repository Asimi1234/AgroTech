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

export type CropType = 'cassava' | 'maize' | 'oil-palm' | 'rice';

export interface CropInfo {
  id: CropType;
  label: string;
}

export type RegionId =
  | 'oyo'
  | 'kaduna'
  | 'benue'
  | 'cross-river'
  | 'kano'
  | 'enugu';

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
}

export interface Credentials {
  phone: string;
  pin: string;
  role: UserRole;
}
