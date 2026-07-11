import { env } from '@/config/env';
import {
  advisories,
  buildProductDetail,
  commodityPrices,
  cooperatives,
  demoCredentials,
  productCategories,
  products,
  regions,
  users,
  weatherForecasts,
} from '@/data/mockData';
import { addAccount, findAccount, phoneTaken } from './mockAccounts';
import type {
  Advisory,
  AdvisoryInput,
  CommodityPrice,
  Cooperative,
  DashboardSummary,
  PlatformAnalytics,
  Product,
  ProductDetail,
  RegionId,
  User,
  UserRole,
  WeatherForecast,
} from '@/types';

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
  getUsers(): Promise<User[]>;
  setUserStatus(id: string, status: User['status']): Promise<User>;
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
    return this.respond(cooperatives);
  }

  async getCooperative(id: string): Promise<Cooperative> {
    const group = cooperatives.find((g) => g.id === id);
    if (!group) {
      const error: ApiError = { status: 404, message: 'Group not found.' };
      throw error;
    }
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

  getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  setUserStatus(id: string, status: User['status']): Promise<User> {
    return this.request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  getDashboardSummary(): Promise<DashboardSummary> {
    return this.request('/dashboard/summary');
  }

  getPlatformAnalytics(): Promise<PlatformAnalytics> {
    return this.request('/analytics');
  }
}

export const api: AgroApi = env.useMockApi ? new MockApi() : new HttpApi();

export const isApiError = (value: unknown): value is ApiError =>
  typeof value === 'object' &&
  value !== null &&
  'status' in value &&
  'message' in value;
