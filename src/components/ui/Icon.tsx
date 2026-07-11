import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  CloudRain,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Pencil,
  Phone,
  Pin,
  Plus,
  Search,
  Send,
  Shield,
  SlidersHorizontal,
  Store,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type IconName =
  | 'dashboard'
  | 'marketplace'
  | 'groups'
  | 'admin'
  | 'user'
  | 'logout'
  | 'phone'
  | 'location'
  | 'search'
  | 'filter'
  | 'chevron-right'
  | 'chevron-down'
  | 'arrow-left'
  | 'trend-up'
  | 'trend-down'
  | 'rain'
  | 'sun'
  | 'cloud'
  | 'verified'
  | 'menu'
  | 'close'
  | 'edit'
  | 'send'
  | 'plus'
  | 'check'
  | 'trash'
  | 'pin'
  | 'chart'
  | 'join'
  | 'leave'
  | 'alert';

const icons: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  marketplace: Store,
  groups: Users,
  admin: Shield,
  user: User,
  logout: LogOut,
  phone: Phone,
  location: MapPin,
  search: Search,
  filter: SlidersHorizontal,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'arrow-left': ArrowLeft,
  'trend-up': TrendingUp,
  'trend-down': TrendingDown,
  rain: CloudRain,
  sun: Sun,
  cloud: Cloud,
  verified: BadgeCheck,
  menu: Menu,
  close: X,
  edit: Pencil,
  send: Send,
  plus: Plus,
  check: Check,
  trash: Trash2,
  pin: Pin,
  chart: BarChart3,
  join: UserPlus,
  leave: UserMinus,
  alert: AlertTriangle,
};

interface IconProps {
  name: IconName;
  className?: string;
}

export const Icon = ({ name, className }: IconProps) => {
  const Glyph = icons[name];
  return <Glyph className={cn('h-5 w-5', className)} aria-hidden="true" />;
};
