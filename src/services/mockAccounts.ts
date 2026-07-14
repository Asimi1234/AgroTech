import type { RegionId, UserRole } from '@/types';

export interface StoredAccount {
  id: string;
  name: string;
  phone: string;
  /** Optional real email; when present the account can log in with it. */
  email?: string;
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

export const emailTaken = (email: string): boolean => {
  const target = email.trim().toLowerCase();
  return loadAccounts().some((account) => account.email === target);
};

/** Look up an account by email (identifier contains '@') or phone. */
export const findByIdentifier = (identifier: string): StoredAccount | undefined => {
  const accounts = loadAccounts();
  if (identifier.includes('@')) {
    const target = identifier.trim().toLowerCase();
    return accounts.find((account) => account.email === target);
  }
  const target = normalizePhone(identifier);
  return accounts.find((account) => account.phone === target);
};

interface NewAccount {
  name: string;
  phone: string;
  email?: string;
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
    email: input.email?.trim().toLowerCase() || undefined,
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
