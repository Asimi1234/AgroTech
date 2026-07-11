import type { RegionId, UserRole } from '@/types';

export interface StoredAccount {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: UserRole;
  region: RegionId;
  avatarInitials: string;
  /** Crops grown (farmers) or product categories supplied (suppliers). */
  interests: string[];
}

const STORAGE_KEY = 'agrotech-accounts';

export const normalizePhone = (phone: string): string => phone.replace(/\D/g, '');

const initialsFrom = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('') || 'AG';

export const loadAccounts = (): StoredAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
};

const saveAccounts = (accounts: StoredAccount[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

export const phoneTaken = (phone: string): boolean => {
  const target = normalizePhone(phone);
  return loadAccounts().some((account) => account.phone === target);
};

export const findAccount = (
  phone: string,
  role: UserRole,
): StoredAccount | undefined => {
  const target = normalizePhone(phone);
  return loadAccounts().find(
    (account) => account.phone === target && account.role === role,
  );
};

interface NewAccount {
  name: string;
  phone: string;
  pin: string;
  role: UserRole;
  region: RegionId;
  interests?: string[];
}

export const addAccount = (input: NewAccount): StoredAccount => {
  const accounts = loadAccounts();
  const account: StoredAccount = {
    id: `acct-${Date.now()}-${accounts.length + 1}`,
    name: input.name.trim(),
    phone: normalizePhone(input.phone),
    pin: input.pin,
    role: input.role,
    region: input.region,
    avatarInitials: initialsFrom(input.name),
    interests: input.interests ?? [],
  };
  accounts.push(account);
  saveAccounts(accounts);
  return account;
};
