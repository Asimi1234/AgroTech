import { describe, it, expect, beforeEach } from 'vitest';
import {
  addAccount,
  emailTaken,
  findByIdentifier,
  normalizePhone,
  phoneTaken,
} from '@/services/mockAccounts';

beforeEach(() => {
  localStorage.clear();
});

describe('normalizePhone', () => {
  it('strips non-digits', () => {
    expect(normalizePhone('+234 803 445 1200')).toBe('2348034451200');
  });
});

describe('addAccount + findByIdentifier', () => {
  const base = {
    name: 'Ada Obi',
    phone: '08055667788',
    email: 'Ada@Example.com',
    pin: '654321',
    role: 'farmer' as const,
    region: 'lagos' as const,
  };

  it('finds an account by phone', () => {
    addAccount(base);
    const found = findByIdentifier('08055667788');
    expect(found?.name).toBe('Ada Obi');
  });

  it('finds an account by email, case-insensitively', () => {
    addAccount(base);
    expect(findByIdentifier('ada@example.com')?.name).toBe('Ada Obi');
  });

  it('returns undefined for an unknown identifier', () => {
    addAccount(base);
    expect(findByIdentifier('nobody@nowhere.com')).toBeUndefined();
    expect(findByIdentifier('08000000000')).toBeUndefined();
  });

  it('stores the email lowercased', () => {
    addAccount(base);
    expect(findByIdentifier('08055667788')?.email).toBe('ada@example.com');
  });
});

describe('phoneTaken / emailTaken', () => {
  it('reports whether a phone or email is already registered', () => {
    addAccount({
      name: 'Ada Obi',
      phone: '08055667788',
      email: 'ada@example.com',
      pin: '654321',
      role: 'farmer',
      region: 'lagos',
    });
    expect(phoneTaken('08055667788')).toBe(true);
    expect(phoneTaken('08000000000')).toBe(false);
    expect(emailTaken('ADA@example.com')).toBe(true);
    expect(emailTaken('other@example.com')).toBe(false);
  });
});
