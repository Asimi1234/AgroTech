import { env } from '@/config/env';
import {
  advisories,
  buildProductDetail,
  commodityPrices,
  cooperatives,
  cropLabel,
  demoCredentials,
  productCategories,
  products,
  regions,
  supplierInquiries,
  suppliers,
  users,
  weatherForecasts,
} from '@/data/mockData';
import { addAccount, findAccount, phoneTaken } from './mockAccounts';
import { supabase, supabaseConfigured } from './supabase';
import type {
  Advisory,
  AdvisoryInput,
  CommodityPrice,
  Cooperative,
  CropType,
  DashboardSummary,
  GroupMember,
  PlatformAnalytics,
  Product,
  ProductCategory,
  ProductDetail,
  RegionId,
  Supplier,
  SupplierInquiry,
  User,
  UserRole,
  WeatherForecast,
} from '@/types';

// Re-export the core domain types so consumers can import them from the API
// surface directly (`import type { Product } from '@/services/api'`).
export type {
  Advisory,
  CommodityPrice,
  Cooperative,
  Product,
  ProductDetail,
  Supplier,
  User,
  WeatherForecast,
} from '@/types';

export interface NewCooperativeInput {
  name: string;
  cropFocus: CropType;
  region: RegionId;
  description: string;
  /** The user creating the group — becomes its first member and lead. */
  creator: { id: string; name: string; phone: string };
}

export interface ProductQuery {
  cropType?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'rating';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface LoginPayload {
  phone: string;
  pin: string;
  role: UserRole;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  pin: string;
  role: 'farmer' | 'supplier';
  region: RegionId;
  /** Crops grown (farmers) or product categories supplied (suppliers). */
  interests?: string[];
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  region: RegionId;
  avatarInitials: string;
}

export interface ApiError {
  status: number;
  message: string;
}

/**
 * The surface every consumer imports. Phase 2 only needs to provide a second
 * implementation of this interface backed by real HTTP calls — no component or
 * page changes required.
 */
export interface AgroApi {
  login(payload: LoginPayload): Promise<AuthenticatedUser>;
  register(payload: RegisterPayload): Promise<AuthenticatedUser>;
  /** End the session (server-side where applicable). */
  logout(): Promise<void>;
  /** Restore a persisted server session on app load, or `null` if none. */
  restoreSession(): Promise<AuthenticatedUser | null>;
  getCommodityPrices(): Promise<CommodityPrice[]>;
  getWeather(region: RegionId): Promise<WeatherForecast>;
  getAdvisories(): Promise<Advisory[]>;
  createAdvisory(input: AdvisoryInput): Promise<Advisory>;
  updateAdvisory(id: string, input: AdvisoryInput): Promise<Advisory>;
  deleteAdvisory(id: string): Promise<void>;
  getProducts(query?: ProductQuery): Promise<Paginated<Product>>;
  getProduct(id: string): Promise<ProductDetail>;
  getCooperatives(): Promise<Cooperative[]>;
  getCooperative(id: string): Promise<Cooperative>;
  createCooperative(input: NewCooperativeInput): Promise<Cooperative>;
  getUsers(): Promise<User[]>;
  setUserStatus(id: string, status: User['status']): Promise<User>;
  getSupplierInquiries(): Promise<SupplierInquiry[]>;
  /** The supplier directory profile for `name`, or `null` if none matches. */
  getSupplierProfile(name: string): Promise<Supplier | null>;
  getDashboardSummary(): Promise<DashboardSummary>;
  getPlatformAnalytics(): Promise<PlatformAnalytics>;
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T>(value: T): T =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const normalizePhone = (phone: string): string => phone.replace(/\D/g, '');

const filterAndSortProducts = (query: ProductQuery = {}): Product[] => {
  let result = [...products];

  if (query.cropType && query.cropType !== 'all') {
    result = result.filter((p) => p.cropType === query.cropType);
  }
  if (query.region && query.region !== 'all') {
    result = result.filter((p) => p.region === query.region);
  }
  if (typeof query.minPrice === 'number') {
    result = result.filter((p) => p.price >= query.minPrice!);
  }
  if (typeof query.maxPrice === 'number') {
    result = result.filter((p) => p.price <= query.maxPrice!);
  }
  if (query.search) {
    const term = query.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.supplierName.toLowerCase().includes(term),
    );
  }

  switch (query.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => b.supplierRating - a.supplierRating);
      break;
    case 'newest':
    default:
      result.sort(
        (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime(),
      );
  }

  return result;
};

class MockApi implements AgroApi {
  private latency = env.mockLatencyMs;

  /**
   * A mutable working copy of the advisories so admin create/update/delete
   * persist across route navigation within a session. Phase 2 replaces this
   * with real writes to the backend.
   */
  private advisories: Advisory[] = clone(advisories);
  private advisorySeq = advisories.length;

  /**
   * Mutable working copy of the user directory so admin status changes persist
   * across navigation within a session. Phase 2 replaces this with real writes.
   */
  private userList: User[] = clone(users);

  /** Mutable cooperative list so user-created groups persist within a session. */
  private coops: Cooperative[] = clone(cooperatives);
  private coopSeq = cooperatives.length;

  private async respond<T>(value: T, latencyOverride?: number): Promise<T> {
    await delay(latencyOverride ?? this.latency);
    return clone(value);
  }

  async login(payload: LoginPayload): Promise<AuthenticatedUser> {
    await delay(this.latency);
    const phone = normalizePhone(payload.phone);

    const demo = demoCredentials.find(
      (c) =>
        normalizePhone(c.phone) === phone &&
        c.pin === payload.pin &&
        c.role === payload.role,
    );
    if (demo) {
      const profile =
        users.find(
          (u) => normalizePhone(u.phone) === phone && u.role === payload.role,
        ) ?? users.find((u) => u.role === payload.role);
      return {
        id: profile?.id ?? 'u0',
        name: profile?.name ?? demo.name,
        role: demo.role,
        phone: profile?.phone ?? payload.phone,
        region: profile?.region ?? 'oyo',
        avatarInitials: profile?.avatarInitials ?? 'AG',
      };
    }

    const account = findAccount(payload.phone, payload.role);
    if (account && account.pin === payload.pin) {
      return {
        id: account.id,
        name: account.name,
        role: account.role,
        phone: account.phone,
        region: account.region,
        avatarInitials: account.avatarInitials,
      };
    }

    const error: ApiError = {
      status: 401,
      message:
        'Invalid phone, PIN, or role. Check your details or create an account.',
    };
    throw error;
  }

  async register(payload: RegisterPayload): Promise<AuthenticatedUser> {
    await delay(this.latency);
    const phone = normalizePhone(payload.phone);
    const reserved = demoCredentials.some(
      (c) => normalizePhone(c.phone) === phone,
    );
    if (reserved || phoneTaken(payload.phone)) {
      const error: ApiError = {
        status: 409,
        message: 'An account with this phone number already exists.',
      };
      throw error;
    }

    const account = addAccount({
      name: payload.name,
      phone: payload.phone,
      pin: payload.pin,
      role: payload.role,
      region: payload.region,
      interests: payload.interests,
    });

    return {
      id: account.id,
      name: account.name,
      role: account.role,
      phone: account.phone,
      region: account.region,
      avatarInitials: account.avatarInitials,
    };
  }

  // Mock/HTTP sessions live in the persisted client store — no server session.
  async logout(): Promise<void> {}
  async restoreSession(): Promise<AuthenticatedUser | null> {
    return null;
  }

  getCommodityPrices(): Promise<CommodityPrice[]> {
    return this.respond(commodityPrices);
  }

  async getWeather(region: RegionId): Promise<WeatherForecast> {
    const match =
      weatherForecasts.find((w) => w.region === region) ?? weatherForecasts[0];
    return this.respond(match);
  }

  getAdvisories(): Promise<Advisory[]> {
    return this.respond(this.advisories);
  }

  async createAdvisory(input: AdvisoryInput): Promise<Advisory> {
    const advisory: Advisory = { id: `a${(this.advisorySeq += 1)}`, ...input };
    this.advisories = [advisory, ...this.advisories];
    return this.respond(advisory);
  }

  async updateAdvisory(id: string, input: AdvisoryInput): Promise<Advisory> {
    const existing = this.advisories.find((a) => a.id === id);
    if (!existing) {
      const error: ApiError = { status: 404, message: 'Advisory not found.' };
      throw error;
    }
    const updated: Advisory = { ...existing, ...input };
    this.advisories = this.advisories.map((a) => (a.id === id ? updated : a));
    return this.respond(updated);
  }

  async deleteAdvisory(id: string): Promise<void> {
    this.advisories = this.advisories.filter((a) => a.id !== id);
    await delay(this.latency);
  }

  getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const all = filterAndSortProducts(query);
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? (all.length || 1));
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return this.respond({
      items,
      total: all.length,
      page,
      pageSize,
      hasMore: start + pageSize < all.length,
    });
  }

  async getProduct(id: string): Promise<ProductDetail> {
    const product = products.find((p) => p.id === id);
    if (!product) {
      const error: ApiError = { status: 404, message: 'Product not found.' };
      throw error;
    }
    return this.respond(buildProductDetail(product));
  }

  getCooperatives(): Promise<Cooperative[]> {
    return this.respond(this.coops);
  }

  async getCooperative(id: string): Promise<Cooperative> {
    const group = this.coops.find((g) => g.id === id);
    if (!group) {
      const error: ApiError = { status: 404, message: 'Group not found.' };
      throw error;
    }
    return this.respond(group);
  }

  async createCooperative(input: NewCooperativeInput): Promise<Cooperative> {
    const id = `g${(this.coopSeq += 1)}`;
    const group: Cooperative = {
      id,
      name: input.name,
      cropFocus: input.cropFocus,
      region: input.region,
      memberCount: 1,
      description: input.description,
      members: [
        {
          id: `${id}-m1`,
          name: input.creator.name,
          role: 'Chairperson',
          phone: input.creator.phone,
        },
      ],
      messages: [],
    };
    this.coops = [group, ...this.coops];
    return this.respond(group);
  }

  getUsers(): Promise<User[]> {
    return this.respond(this.userList);
  }

  async setUserStatus(id: string, status: User['status']): Promise<User> {
    const target = this.userList.find((u) => u.id === id);
    if (!target) {
      const error: ApiError = { status: 404, message: 'User not found.' };
      throw error;
    }
    // Admin accounts are protected — no admin may deactivate another admin.
    if (target.role === 'admin') {
      const error: ApiError = {
        status: 403,
        message: 'Admin accounts cannot be deactivated.',
      };
      throw error;
    }
    const updated: User = { ...target, status };
    this.userList = this.userList.map((u) => (u.id === id ? updated : u));
    return this.respond(updated);
  }

  getSupplierInquiries(): Promise<SupplierInquiry[]> {
    return this.respond(supplierInquiries);
  }

  getSupplierProfile(name: string): Promise<Supplier | null> {
    const match = suppliers.find((s) => s.name === name) ?? null;
    return this.respond(match);
  }

  getDashboardSummary(): Promise<DashboardSummary> {
    const topMover = commodityPrices.reduce((top, price) =>
      Math.abs(price.changePercent) > Math.abs(top.changePercent) ? price : top,
    );
    const actionAdvisories = this.advisories.filter(
      (a) => a.severity !== 'info',
    ).length;
    return this.respond({
      marketListings: products.filter((p) => p.inStock).length,
      cooperativeCount: cooperatives.length,
      actionAdvisories,
      topMover,
    });
  }

  getPlatformAnalytics(): Promise<PlatformAnalytics> {
    const listingsByCategory = productCategories
      .map((c) => ({
        category: c.id,
        label: c.label,
        count: products.filter((p) => p.category === c.id).length,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    const usersByRegion = regions
      .map((r) => ({
        region: r.id,
        label: r.label,
        count: this.userList.filter((u) => u.region === r.id).length,
      }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);

    return this.respond({
      totalUsers: this.userList.length,
      activeUsers: this.userList.filter((u) => u.status === 'active').length,
      totalListings: products.length,
      cooperativeCount: cooperatives.length,
      cooperativeMembers: cooperatives.reduce((sum, g) => sum + g.memberCount, 0),
      listingsByCategory,
      usersByRegion,
    });
  }
}

/**
 * Phase 2 stub. Fill each method with a fetch call against `env.apiBaseUrl` and
 * flip `VITE_USE_MOCK_API=false`. The shape returned must match `AgroApi`.
 */
class HttpApi implements AgroApi {
  private base = env.apiBaseUrl;

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.base}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: `Request failed: ${response.status}`,
      };
      throw error;
    }
    return (await response.json()) as T;
  }

  login(payload: LoginPayload): Promise<AuthenticatedUser> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  register(payload: RegisterPayload): Promise<AuthenticatedUser> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async logout(): Promise<void> {}
  async restoreSession(): Promise<AuthenticatedUser | null> {
    return null;
  }

  getCommodityPrices(): Promise<CommodityPrice[]> {
    return this.request('/prices');
  }

  getWeather(region: RegionId): Promise<WeatherForecast> {
    return this.request(`/weather/${region}`);
  }

  getAdvisories(): Promise<Advisory[]> {
    return this.request('/advisories');
  }

  createAdvisory(input: AdvisoryInput): Promise<Advisory> {
    return this.request('/advisories', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  updateAdvisory(id: string, input: AdvisoryInput): Promise<Advisory> {
    return this.request(`/advisories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteAdvisory(id: string): Promise<void> {
    await this.request(`/advisories/${id}`, { method: 'DELETE' });
  }

  getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    const qs = params.toString();
    return this.request(`/products${qs ? `?${qs}` : ''}`);
  }

  getProduct(id: string): Promise<ProductDetail> {
    return this.request(`/products/${id}`);
  }

  getCooperatives(): Promise<Cooperative[]> {
    return this.request('/cooperatives');
  }

  getCooperative(id: string): Promise<Cooperative> {
    return this.request(`/cooperatives/${id}`);
  }

  createCooperative(input: NewCooperativeInput): Promise<Cooperative> {
    return this.request('/cooperatives', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  setUserStatus(id: string, status: User['status']): Promise<User> {
    return this.request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  getSupplierInquiries(): Promise<SupplierInquiry[]> {
    return this.request('/supplier/inquiries');
  }

  async getSupplierProfile(name: string): Promise<Supplier | null> {
    const response = await fetch(
      `${this.base}/suppliers/profile?name=${encodeURIComponent(name)}`,
      { headers: { 'Content-Type': 'application/json' } },
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: `Request failed: ${response.status}`,
      };
      throw error;
    }
    return (await response.json()) as Supplier;
  }

  getDashboardSummary(): Promise<DashboardSummary> {
    return this.request('/dashboard/summary');
  }

  getPlatformAnalytics(): Promise<PlatformAnalytics> {
    return this.request('/analytics');
  }
}

/* -------------------------------------------------------------------------- */
/*  Supabase-backed implementation                                            */
/* -------------------------------------------------------------------------- */

/**
 * Raw row shapes as stored in Supabase (snake_case) after the `align_schema.sql`
 * migration. The app's rich domain types (`src/types`) are derived via the
 * mappers below. Columns added by the migration (`pin`, `status`, `category`,
 * `unit`, `condition`, `severity`, …) are optional here so mappers still work
 * against a not-yet-migrated database, falling back to inference.
 */
interface UserRow {
  id: string;
  email: string | null;
  name: string;
  role: string;
  location: string | null;
  phone: string | null;
  pin?: string | null;
  status?: string | null;
  last_active?: string | null;
  created_at: string;
}
interface ProductRow {
  id: string;
  supplier_id: string | null;
  name: string;
  crop_type: string;
  price: number;
  location: string | null;
  rating: number | null;
  image_url: string | null;
  description: string | null;
  category?: string | null;
  unit?: string | null;
  in_stock?: boolean | null;
  translations?: Product['i18n'] | null;
  created_at: string;
}
interface PriceRow {
  crop_type: string;
  location: string;
  price: number;
  date: string;
}
interface WeatherRow {
  location: string;
  temperature: number;
  rainfall: number;
  forecast: string;
  condition?: string | null;
  humidity?: number | null;
  date: string;
}
interface AdvisoryRow {
  id: string;
  crop_type: string;
  title: string;
  content: string | null;
  severity?: string | null;
  window?: string | null;
  translations?: Advisory['i18n'] | null;
}
interface GroupRow {
  id: string;
  name: string;
  crop_focus: string;
  location: string | null;
  description?: string | null;
  translations?: Cooperative['i18n'] | null;
}
interface SupplierInquiryRow {
  id: string;
  buyer_name: string;
  product_id: string | null;
  product_name: string;
  message: string;
  phone: string | null;
  date: string;
}

const debug = (...args: unknown[]): void => {
  if (import.meta.env.DEV) console.debug('[api]', ...args);
};

/** Build an `ApiError` from a Supabase error and throw it. */
const fail = (
  error: { message?: string } | null,
  status = 500,
): never => {
  const apiError: ApiError = {
    status,
    message: error?.message ?? 'Request failed.',
  };
  throw apiError;
};

const notFound = (message: string): never => {
  const apiError: ApiError = { status: 404, message };
  throw apiError;
};

// --- Reference-data mapping (static; reused from the shared catalog) ---------

const REGION_BY_LABEL = new Map(
  regions.map((r) => [r.label.toLowerCase(), r.id] as const),
);
const CROP_META = new Map(
  commodityPrices.map((c) => [c.cropType, { label: c.label, unit: c.unit }] as const),
);

// The database stores oil palm as `palm_oil`; the app's CropType enum uses
// `oil-palm`. Bridge the two vocabularies in both directions.
const CROP_DB_TO_APP: Record<string, CropType> = {
  palm_oil: 'oil-palm',
  oil_palm: 'oil-palm',
};
const CROP_APP_TO_DB: Partial<Record<CropType, string>> = {
  'oil-palm': 'palm_oil',
};
const toCropType = (dbCrop: string): CropType =>
  CROP_DB_TO_APP[dbCrop] ?? (dbCrop as CropType);
const toDbCrop = (crop: string): string =>
  CROP_APP_TO_DB[crop as CropType] ?? crop;

const toRegionId = (location: string | null | undefined): RegionId =>
  (location ? REGION_BY_LABEL.get(location.trim().toLowerCase()) : undefined) ??
  'oyo';

const regionLabelEn = (region: RegionId): string =>
  regions.find((r) => r.id === region)?.label ?? region;

/** Region → the location string stored in Supabase (its English label). */
const regionToLocation = regionLabelEn;

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || 'OF';

/** Last 10 digits — tolerant of `+234`, spaces, and leading-zero variants. */
const phoneKey = (phone: string): string => normalizePhone(phone).slice(-10);

// Supabase Auth is email/password; the app's UX is phone + 4-digit PIN. Map a
// phone to a deterministic synthetic email and derive a >=6-char password from
// the PIN. `phoneKey` (last 10 digits) is used so the same number typed in any
// valid format ("08031234567", "+234 803 123 4567") resolves to one account.
// Demo-grade: real phone auth would use an SMS OTP provider.
const phoneToEmail = (phone: string): string =>
  `${phoneKey(phone)}@ojafarm.local`;
const pinToPassword = (pin: string): string => `ojafarm-${pin}`;

const guessCategory = (name: string, description: string): ProductCategory => {
  const s = `${name} ${description}`.toLowerCase();
  if (/seed|cutting|seedling|stem|sapling/.test(s)) return 'seed';
  if (/fertil|manure|npk|urea|nutrient|compost/.test(s)) return 'fertilizer';
  if (/herbicide|pesticide|fungicide|insecticide|protection|spray/.test(s))
    return 'crop-protection';
  if (/tractor|equipment|sprayer|machine|tool|pump|tiller/.test(s))
    return 'equipment';
  return 'produce';
};

const UNIT_BY_CATEGORY: Record<ProductCategory, string> = {
  seed: 'per kg',
  fertilizer: 'per bag',
  'crop-protection': 'per litre',
  equipment: 'per unit',
  produce: 'per kg',
};

const conditionFromText = (text: string): WeatherForecast['condition'] => {
  const s = (text ?? '').toLowerCase();
  if (/storm|thunder/.test(s)) return 'storm';
  if (/rain|shower|drizzle|wet/.test(s)) return 'rain';
  if (/partly/.test(s)) return 'partly-cloudy';
  if (/cloud|overcast/.test(s)) return 'cloudy';
  return 'sunny';
};

const inferSeverity = (
  title: string,
  content: string | null,
): Advisory['severity'] => {
  const s = `${title} ${content ?? ''}`.toLowerCase();
  if (/urgent|immediat|warning|disease|outbreak|pest|flood|drought|alert/.test(s))
    return 'warning';
  if (/apply|spray|harvest|plant|fertil|irrigat|action|before|now/.test(s))
    return 'action';
  return 'info';
};

const weekday = (date: string): string => {
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString('en-US', { weekday: 'short' });
};

// --- localStorage offline cache (prices/weather) -----------------------------

const CACHE_TTL_MS = 30 * 60 * 1000;
const PRICES_CACHE = 'ojafarm.cache.prices';
const WEATHER_CACHE = 'ojafarm.cache.weather';

interface CacheEntry<T> {
  ts: number;
  data: T;
}

const readCacheEntry = <T>(key: string): CacheEntry<T> | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
};

/** Cached value if it is younger than 30 minutes, else `null`. */
const readFreshCache = <T>(key: string): T | null => {
  const entry = readCacheEntry<T>(key);
  return entry && Date.now() - entry.ts <= CACHE_TTL_MS ? entry.data : null;
};

/** Any cached value regardless of age — the offline fallback. */
const readStaleCache = <T>(key: string): T | null =>
  readCacheEntry<T>(key)?.data ?? null;

const writeCache = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // Storage unavailable — caching is best-effort.
  }
};

// --- Row → domain mappers ----------------------------------------------------

const mapUser = (row: UserRow): User => ({
  id: row.id,
  name: row.name,
  role: row.role as UserRole,
  phone: row.phone ?? '',
  region: toRegionId(row.location),
  avatarInitials: initials(row.name),
  status: row.status === 'inactive' ? 'inactive' : 'active',
  lastActive: row.last_active ?? row.created_at ?? '',
});

const mapProduct = (row: ProductRow, supplier?: UserRow): Product => {
  const category =
    (row.category as ProductCategory | null) ??
    guessCategory(row.name, row.description ?? '');
  return {
    id: row.id,
    name: row.name,
    category,
    cropType: toCropType(row.crop_type),
    description: row.description ?? '',
    price: Number(row.price),
    unit: row.unit ?? UNIT_BY_CATEGORY[category],
    imageUrl: row.image_url ?? '',
    region: toRegionId(row.location),
    supplierId: row.supplier_id ?? '',
    supplierName: supplier?.name ?? 'OjàFarm Supplier',
    supplierRating: Number(row.rating) || 0,
    supplierPhone: supplier?.phone ?? '',
    listedAt: row.created_at ?? '',
    inStock: row.in_stock ?? true,
    i18n: row.translations ?? undefined,
  };
};

const mapAdvisory = (row: AdvisoryRow): Advisory => ({
  id: row.id,
  cropType: toCropType(row.crop_type),
  title: row.title,
  window: row.window ?? '',
  detail: row.content ?? '',
  severity:
    (row.severity as Advisory['severity'] | null) ??
    inferSeverity(row.title, row.content),
  i18n: row.translations ?? undefined,
});

const mapCooperative = (
  row: GroupRow,
  members: GroupMember[],
): Cooperative => ({
  id: row.id,
  name: row.name,
  cropFocus: toCropType(row.crop_focus),
  region: toRegionId(row.location),
  memberCount: members.length,
  description: row.description ?? '',
  members,
  messages: [],
  i18n: row.translations ?? undefined,
});

const mapInquiry = (row: SupplierInquiryRow): SupplierInquiry => ({
  id: row.id,
  buyerName: row.buyer_name,
  productId: row.product_id ?? '',
  productName: row.product_name,
  message: row.message,
  date: row.date,
  phone: row.phone ?? '',
});

/** Collapse per-location commodity rows into one CommodityPrice per crop. */
const aggregatePrices = (rows: PriceRow[]): CommodityPrice[] => {
  const byCrop = new Map<string, Map<string, number[]>>();
  for (const row of rows) {
    const dates = byCrop.get(row.crop_type) ?? new Map<string, number[]>();
    byCrop.set(row.crop_type, dates);
    const list = dates.get(row.date) ?? [];
    list.push(Number(row.price));
    dates.set(row.date, list);
  }

  const result: CommodityPrice[] = [];
  for (const [crop, dateMap] of byCrop) {
    const dates = [...dateMap.keys()].sort((a, b) => b.localeCompare(a));
    const mean = (d: string): number => {
      const list = dateMap.get(d) ?? [];
      return list.reduce((sum, n) => sum + n, 0) / (list.length || 1);
    };
    const latest = mean(dates[0]);
    const previous = dates[1] ? mean(dates[1]) : latest;
    const changePercent = previous
      ? Math.round(((latest - previous) / previous) * 1000) / 10
      : 0;
    const cropType = toCropType(crop);
    const meta = CROP_META.get(cropType);
    result.push({
      cropType,
      label: meta?.label ?? cropLabel(cropType),
      price: Math.round(latest * 100) / 100,
      unit: meta?.unit ?? 'per kg',
      changePercent,
      updatedAt: dates[0],
    });
  }
  return result.sort((a, b) => a.label.localeCompare(b.label));
};

const buildForecast = (
  region: RegionId,
  rows: WeatherRow[],
): WeatherForecast => {
  const latest = rows[0];
  const daily = [...rows]
    .slice(0, 5)
    .reverse()
    .map((r) => ({
      day: weekday(r.date),
      tempHighC: Math.round(Number(r.temperature) + 3),
      tempLowC: Math.round(Number(r.temperature) - 4),
      rainfallMm: Math.round(Number(r.rainfall)),
      condition:
        (r.condition as WeatherForecast['condition'] | null) ??
        conditionFromText(r.forecast),
    }));
  return {
    region,
    regionLabel: regionLabelEn(region),
    currentTempC: Math.round(Number(latest.temperature)),
    condition:
      (latest.condition as WeatherForecast['condition'] | null) ??
      conditionFromText(latest.forecast),
    humidityPercent:
      latest.humidity != null
        ? Math.round(Number(latest.humidity))
        : Math.min(95, Math.round(55 + Number(latest.rainfall) * 3)),
    updatedAt: latest.date,
    daily,
  };
};

const emptyForecast = (region: RegionId): WeatherForecast => ({
  region,
  regionLabel: regionLabelEn(region),
  currentTempC: 0,
  condition: 'sunny',
  humidityPercent: 0,
  updatedAt: '',
  daily: [],
});

/** Fetch supplier profiles for a set of product `supplier_id`s in one query. */
const fetchSuppliers = async (
  ids: (string | null)[],
): Promise<Map<string, UserRow>> => {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map();
  const { data } = await supabase.from('users').select('*').in('id', unique);
  return new Map(((data ?? []) as UserRow[]).map((u) => [u.id, u]));
};

class SupabaseApi implements AgroApi {
  private toAuth(row: UserRow): AuthenticatedUser {
    return {
      id: row.id,
      name: row.name,
      role: row.role as UserRole,
      phone: row.phone ?? '',
      region: toRegionId(row.location),
      avatarInitials: initials(row.name),
    };
  }

  private unauthorized(): never {
    const apiError: ApiError = {
      status: 401,
      message:
        'Invalid phone, PIN, or role. Check your details or create an account.',
    };
    throw apiError;
  }

  /** Fetch the profile row for an authenticated user id. */
  private async profileFor(id: string): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) fail(error);
    return (data as UserRow | null) ?? null;
  }

  /**
   * Seeded demo credentials have no Auth account on first use. Provision one
   * (idempotently) via signUp and create its profile row, so the demo login
   * establishes a real session and RLS applies uniformly.
   */
  private async ensureDemoAccount(
    demo: (typeof demoCredentials)[number],
    email: string,
    password: string,
  ): Promise<void> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: demo.name, role: demo.role } },
    });
    if (error) {
      debug('ensureDemoAccount signUp', error.message);
      return;
    }
    const uid = data.user?.id;
    if (uid) {
      await supabase.from('users').upsert(
        {
          id: uid,
          name: demo.name,
          role: demo.role,
          phone: demo.phone,
          location: 'Oyo',
          status: 'active',
          email,
        },
        { onConflict: 'id' },
      );
    }
  }

  async login(payload: LoginPayload): Promise<AuthenticatedUser> {
    debug('login', payload.role);
    const email = phoneToEmail(payload.phone);
    const password = pinToPassword(payload.pin);

    let result = await supabase.auth.signInWithPassword({ email, password });

    // First-time demo login: provision the Auth account, then retry.
    if (result.error) {
      const demo = demoCredentials.find(
        (c) =>
          phoneKey(c.phone) === phoneKey(payload.phone) &&
          c.pin === payload.pin &&
          c.role === payload.role,
      );
      if (demo) {
        await this.ensureDemoAccount(demo, email, password);
        result = await supabase.auth.signInWithPassword({ email, password });
      }
    }

    const authUser = result.data?.user;
    if (result.error || !authUser) this.unauthorized();

    const profile = await this.profileFor(authUser!.id);
    if (!profile || profile.role !== payload.role) {
      await supabase.auth.signOut();
      this.unauthorized();
    }
    return this.toAuth(profile!);
  }

  async register(payload: RegisterPayload): Promise<AuthenticatedUser> {
    debug('register', payload.role);
    const email = phoneToEmail(payload.phone);
    const password = pinToPassword(payload.pin);
    const conflict = (): never => {
      const apiError: ApiError = {
        status: 409,
        message: 'An account with this phone number already exists.',
      };
      throw apiError;
    };

    // Demo phones are reserved for the built-in demo logins.
    if (demoCredentials.some((c) => phoneKey(c.phone) === phoneKey(payload.phone))) {
      conflict();
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: payload.name, role: payload.role, region: payload.region },
      },
    });

    let uid = data?.user?.id;
    let hasSession = Boolean(data?.session);

    if (error) {
      const exists = /already registered|already exists|User already/i.test(
        error.message,
      );
      if (!exists) {
        const apiError: ApiError = { status: 400, message: error.message };
        throw apiError;
      }
      // The Auth account already exists: either a real duplicate, or an orphan
      // left by an earlier signUp whose profile insert failed. Sign in to tell
      // them apart — and, if it's an orphan, to heal it below.
      const signIn = await supabase.auth.signInWithPassword({ email, password });
      if (signIn.error || !signIn.data.user) conflict();
      uid = signIn.data.user!.id;
      hasSession = true;
      if (await this.profileFor(uid)) {
        await supabase.auth.signOut();
        conflict();
      }
    }

    if (!uid || !hasSession) {
      // No session means Supabase requires email confirmation — incompatible
      // with synthetic phone emails. Disable "Confirm email" in Auth settings.
      const apiError: ApiError = {
        status: 500,
        message:
          'Sign-up succeeded but no session was returned. Disable email confirmation in Supabase Auth settings.',
      };
      throw apiError;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .upsert(
        {
          id: uid,
          name: payload.name,
          role: payload.role,
          location: regionToLocation(payload.region),
          phone: payload.phone,
          status: 'active',
          email,
        },
        { onConflict: 'id' },
      )
      .select()
      .single();
    if (profileError) {
      // Don't leave a half-authenticated session with no profile row.
      await supabase.auth.signOut();
      fail(profileError);
    }
    return this.toAuth(profile as UserRow);
  }

  async logout(): Promise<void> {
    debug('logout');
    // 'local' clears the persisted session immediately instead of deferring the
    // storage wipe behind a network token-revoke that can hang/fail offline.
    await supabase.auth.signOut({ scope: 'local' });
  }

  async restoreSession(): Promise<AuthenticatedUser | null> {
    const { data } = await supabase.auth.getSession();
    const authUser = data.session?.user;
    if (!authUser) return null;

    try {
      const profile = await this.profileFor(authUser.id);
      if (profile) return this.toAuth(profile);
    } catch {
      // Profile fetch failed (e.g. transient network) — fall through to the
      // JWT metadata so a valid session isn't bounced to the logged-out view.
    }

    const md = (authUser.user_metadata ?? {}) as {
      name?: string;
      role?: string;
      region?: string;
    };
    if (md.role) {
      return {
        id: authUser.id,
        name: md.name ?? '',
        role: md.role as UserRole,
        phone: '',
        region: (md.region as RegionId) ?? 'oyo',
        avatarInitials: initials(md.name ?? 'OjàFarm'),
      };
    }
    return null;
  }

  async getCommodityPrices(): Promise<CommodityPrice[]> {
    debug('getCommodityPrices');
    const fresh = readFreshCache<CommodityPrice[]>(PRICES_CACHE);
    if (fresh) return fresh;

    // Discover the crops present, then pull each crop's recent rows separately —
    // a single flat `limit()` ordered by date can push a low-frequency crop out
    // of the window entirely, dropping it from the result.
    const cropsRes = await supabase.from('commodity_prices').select('crop_type');
    if (cropsRes.error) {
      const stale = readStaleCache<CommodityPrice[]>(PRICES_CACHE);
      if (stale) return stale;
      return fail(cropsRes.error, 502);
    }
    const crops = [
      ...new Set(((cropsRes.data ?? []) as { crop_type: string }[]).map((r) => r.crop_type)),
    ];

    const perCrop = await Promise.all(
      crops.map((crop) =>
        supabase
          .from('commodity_prices')
          .select('crop_type, location, price, date')
          .eq('crop_type', crop)
          .order('date', { ascending: false })
          .limit(60),
      ),
    );
    const failed = perCrop.find((r) => r.error);
    if (failed) {
      const stale = readStaleCache<CommodityPrice[]>(PRICES_CACHE);
      if (stale) return stale;
      return fail(failed.error, 502);
    }

    const rows = perCrop.flatMap((r) => (r.data ?? []) as PriceRow[]);
    const result = aggregatePrices(rows);
    writeCache(PRICES_CACHE, result);
    return result;
  }

  async getWeather(region: RegionId): Promise<WeatherForecast> {
    debug('getWeather', region);
    const key = `${WEATHER_CACHE}.${region}`;
    const fresh = readFreshCache<WeatherForecast>(key);
    if (fresh) return fresh;

    const { data, error } = await supabase
      .from('weather')
      .select('*')
      .eq('location', regionToLocation(region))
      .order('date', { ascending: false })
      .limit(7);
    if (error) {
      const stale = readStaleCache<WeatherForecast>(key);
      if (stale) return stale;
      return fail(error, 502);
    }

    let rows = (data ?? []) as WeatherRow[];
    if (!rows.length) {
      // No rows for this region — fall back to the most recent weather from
      // any location so the panel shows a real forecast rather than zeroes.
      const { data: anyData } = await supabase
        .from('weather')
        .select('*')
        .order('date', { ascending: false })
        .limit(7);
      rows = (anyData ?? []) as WeatherRow[];
    }
    const result = rows.length
      ? buildForecast(region, rows)
      : emptyForecast(region);
    writeCache(key, result);
    return result;
  }

  async getAdvisories(): Promise<Advisory[]> {
    debug('getAdvisories');
    const { data, error } = await supabase
      .from('advisories')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) fail(error, 502);
    return ((data ?? []) as AdvisoryRow[]).map(mapAdvisory);
  }

  async createAdvisory(input: AdvisoryInput): Promise<Advisory> {
    debug('createAdvisory', input.title);
    const { data, error } = await supabase
      .from('advisories')
      .insert({
        crop_type: toDbCrop(input.cropType),
        title: input.title,
        content: input.detail,
        severity: input.severity,
        window: input.window,
      })
      .select()
      .single();
    if (error) fail(error);
    return mapAdvisory(data as AdvisoryRow);
  }

  async updateAdvisory(id: string, input: AdvisoryInput): Promise<Advisory> {
    debug('updateAdvisory', id);
    const { data, error } = await supabase
      .from('advisories')
      .update({
        crop_type: toDbCrop(input.cropType),
        title: input.title,
        content: input.detail,
        severity: input.severity,
        window: input.window,
      })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) fail(error);
    if (!data) notFound('Advisory not found.');
    return mapAdvisory(data as AdvisoryRow);
  }

  async deleteAdvisory(id: string): Promise<void> {
    debug('deleteAdvisory', id);
    const { error } = await supabase.from('advisories').delete().eq('id', id);
    if (error) fail(error);
  }

  async getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
    debug('getProducts', query);
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 1000);
    const start = (page - 1) * pageSize;

    let builder = supabase.from('products').select('*', { count: 'exact' });
    if (query.cropType && query.cropType !== 'all') {
      builder = builder.eq('crop_type', toDbCrop(query.cropType));
    }
    if (query.region && query.region !== 'all') {
      builder = builder.eq('location', regionToLocation(query.region as RegionId));
    }
    if (typeof query.minPrice === 'number') {
      builder = builder.gte('price', query.minPrice);
    }
    if (typeof query.maxPrice === 'number') {
      builder = builder.lte('price', query.maxPrice);
    }
    if (query.search) {
      // Strip characters that are meaningful in a PostgREST or() filter tree
      // (parentheses, commas, quotes, wildcards, backslash) so a search like
      // "NPK (15-15-15)" can't break the filter parse into a 400.
      const term = query.search
        .replace(/[(),."*%\\]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (term) {
        builder = builder.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
      }
    }

    switch (query.sort) {
      case 'price-asc':
        builder = builder.order('price', { ascending: true });
        break;
      case 'price-desc':
        builder = builder.order('price', { ascending: false });
        break;
      case 'rating':
        builder = builder.order('rating', { ascending: false, nullsFirst: false });
        break;
      case 'newest':
      default:
        builder = builder.order('created_at', { ascending: false });
    }

    const { data, error, count } = await builder.range(start, start + pageSize - 1);
    if (error) fail(error, 502);

    const rows = (data ?? []) as ProductRow[];
    const supplierMap = await fetchSuppliers(rows.map((r) => r.supplier_id));
    const items = rows.map((r) => mapProduct(r, supplierMap.get(r.supplier_id ?? '')));
    const total = count ?? items.length;
    return {
      items,
      total,
      page,
      pageSize,
      hasMore: start + rows.length < total,
    };
  }

  async getProduct(id: string): Promise<ProductDetail> {
    debug('getProduct', id);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) notFound('Product not found.');

    const row = data as ProductRow;
    const supplierMap = await fetchSuppliers([row.supplier_id]);
    const base = mapProduct(row, supplierMap.get(row.supplier_id ?? ''));

    const { data: priceData } = await supabase
      .from('commodity_prices')
      .select('date, price')
      .eq('crop_type', row.crop_type)
      .order('date', { ascending: true })
      .limit(60);
    const priceHistory = ((priceData ?? []) as { date: string; price: number }[]).map(
      (p) => ({ date: p.date, price: Number(p.price) }),
    );

    return { ...base, longDescription: base.description, priceHistory, reviews: [] };
  }

  private async membersByGroup(): Promise<Map<string, GroupMember[]>> {
    const { data, error } = await supabase
      .from('group_members')
      .select('group_id, role, users(*)');
    if (error) fail(error, 502);

    const map = new Map<string, GroupMember[]>();
    for (const row of (data ?? []) as unknown as {
      group_id: string;
      role: string | null;
      users: UserRow | null;
    }[]) {
      const u = row.users;
      if (!u) continue;
      const list = map.get(row.group_id) ?? [];
      list.push({ id: u.id, name: u.name, role: row.role ?? 'Member', phone: u.phone ?? '' });
      map.set(row.group_id, list);
    }
    return map;
  }

  async getCooperatives(): Promise<Cooperative[]> {
    debug('getCooperatives');
    const [groupsRes, members] = await Promise.all([
      supabase.from('groups').select('*').order('created_at', { ascending: false }),
      this.membersByGroup(),
    ]);
    if (groupsRes.error) fail(groupsRes.error, 502);
    return ((groupsRes.data ?? []) as GroupRow[]).map((g) =>
      mapCooperative(g, members.get(g.id) ?? []),
    );
  }

  async getCooperative(id: string): Promise<Cooperative> {
    debug('getCooperative', id);
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) notFound('Group not found.');

    const { data: memberData } = await supabase
      .from('group_members')
      .select('role, users(*)')
      .eq('group_id', id);
    const members = ((memberData ?? []) as unknown as {
      role: string | null;
      users: UserRow | null;
    }[])
      .filter((m): m is { role: string | null; users: UserRow } => Boolean(m.users))
      .map((m) => ({
        id: m.users.id,
        name: m.users.name,
        role: m.role ?? 'Member',
        phone: m.users.phone ?? '',
      }));

    return mapCooperative(data as GroupRow, members);
  }

  async createCooperative(input: NewCooperativeInput): Promise<Cooperative> {
    debug('createCooperative', input.name);
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: input.name,
        crop_focus: toDbCrop(input.cropFocus),
        location: regionToLocation(input.region),
        description: input.description,
      })
      .select()
      .single();
    if (error) fail(error);
    const group = data as GroupRow;

    // Best-effort: link the creator as Chairperson. A demo user has no real
    // row, so a foreign key failure is tolerated — the group is still created.
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: input.creator.id, role: 'Chairperson' });
    if (memberError) debug('createCooperative: member link skipped', memberError.message);

    return {
      id: group.id,
      name: group.name,
      cropFocus: input.cropFocus,
      region: input.region,
      memberCount: 1,
      description: input.description,
      members: [
        {
          id: input.creator.id,
          name: input.creator.name,
          role: 'Chairperson',
          phone: input.creator.phone,
        },
      ],
      messages: [],
    };
  }

  async getUsers(): Promise<User[]> {
    debug('getUsers');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) fail(error, 502);
    return ((data ?? []) as UserRow[]).map(mapUser);
  }

  async setUserStatus(id: string, status: User['status']): Promise<User> {
    debug('setUserStatus', id, status);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) notFound('User not found.');

    const row = data as UserRow;
    if (row.role === 'admin') {
      const apiError: ApiError = {
        status: 403,
        message: 'Admin accounts cannot be deactivated.',
      };
      throw apiError;
    }

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (updateError) fail(updateError);
    return mapUser(updated as UserRow);
  }

  async getSupplierInquiries(): Promise<SupplierInquiry[]> {
    debug('getSupplierInquiries');
    const { data, error } = await supabase
      .from('supplier_inquiries')
      .select('*')
      .order('date', { ascending: false });
    if (error) fail(error, 502);
    return ((data ?? []) as SupplierInquiryRow[]).map(mapInquiry);
  }

  async getSupplierProfile(name: string): Promise<Supplier | null> {
    debug('getSupplierProfile', name);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'supplier')
      .eq('name', name)
      .limit(1)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;

    const user = data as UserRow;
    const { data: productData } = await supabase
      .from('products')
      .select('rating')
      .eq('supplier_id', user.id);
    const ratings = ((productData ?? []) as { rating: number | null }[])
      .map((p) => Number(p.rating))
      .filter((n) => n > 0);
    const rating = ratings.length
      ? ratings.reduce((sum, n) => sum + n, 0) / ratings.length
      : 4.5;

    return {
      id: user.id,
      name: user.name,
      phone: user.phone ?? '',
      region: toRegionId(user.location),
      rating: Math.round(rating * 10) / 10,
      // No reviews table exists; `rating` is derived from the supplier's product
      // ratings, but there are genuinely zero written reviews to count.
      reviewCount: 0,
      verified: true,
      joinedYear: new Date(user.created_at).getFullYear() || new Date().getFullYear(),
    };
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    debug('getDashboardSummary');
    const [productsRes, groupsRes, advisoryList, prices] = await Promise.all([
      // Market listings = products currently in stock (mirrors the mock).
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('in_stock', true),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      this.getAdvisories(),
      this.getCommodityPrices(),
    ]);

    const fallback: CommodityPrice = {
      cropType: 'maize',
      label: cropLabel('maize'),
      price: 0,
      unit: 'per kg',
      changePercent: 0,
      updatedAt: '',
    };
    const topMover = prices.reduce(
      (top, price) =>
        Math.abs(price.changePercent) > Math.abs(top.changePercent) ? price : top,
      prices[0] ?? fallback,
    );

    return {
      marketListings: productsRes.count ?? 0,
      cooperativeCount: groupsRes.count ?? 0,
      actionAdvisories: advisoryList.filter((a) => a.severity !== 'info').length,
      topMover,
    };
  }

  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    debug('getPlatformAnalytics');
    const [
      userRowsRes,
      productRowsRes,
      groupsRes,
      membersRes,
      totalUsersRes,
      activeUsersRes,
      totalListingsRes,
    ] = await Promise.all([
      // Trimmed rows drive the per-region / per-category breakdowns…
      supabase.from('users').select('location'),
      supabase.from('products').select('name, description, category'),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      supabase.from('group_members').select('*', { count: 'exact', head: true }),
      // …while the headline totals use exact counts (not array length, which
      // PostgREST caps ~1000).
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
    ]);

    const userRows = (userRowsRes.data ?? []) as { location: string | null }[];
    const productRows = (productRowsRes.data ?? []) as Pick<
      ProductRow,
      'name' | 'description' | 'category'
    >[];

    const listingsByCategory = productCategories
      .map((c) => ({
        category: c.id,
        label: c.label,
        count: productRows.filter(
          (p) =>
            ((p.category as ProductCategory | null) ??
              guessCategory(p.name, p.description ?? '')) === c.id,
        ).length,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    const usersByRegion = regions
      .map((r) => ({
        region: r.id,
        label: r.label,
        count: userRows.filter((u) => toRegionId(u.location) === r.id).length,
      }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);

    return {
      totalUsers: totalUsersRes.count ?? 0,
      activeUsers: activeUsersRes.count ?? 0,
      totalListings: totalListingsRes.count ?? 0,
      cooperativeCount: groupsRes.count ?? 0,
      cooperativeMembers: membersRes.count ?? 0,
      listingsByCategory,
      usersByRegion,
    };
  }
}

const selectBackend = (): AgroApi => {
  if (env.useMockApi) return new MockApi();
  if (supabaseConfigured) return new SupabaseApi();
  return new HttpApi();
};

export const api: AgroApi = selectBackend();

/**
 * True when the active backend enforces sessions server-side (Supabase Auth).
 * The auth store uses this to decide whether to restore a real session on load
 * versus trusting the persisted client state (mock/HTTP).
 */
export const usesServerAuth = !env.useMockApi && supabaseConfigured;

export const isApiError = (value: unknown): value is ApiError =>
  typeof value === 'object' &&
  value !== null &&
  'status' in value &&
  'message' in value;
