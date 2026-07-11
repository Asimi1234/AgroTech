type ClassValue = string | number | false | null | undefined;

/** Minimal class-name joiner — filters out falsy values and joins with a space. */
export const cn = (...values: ClassValue[]): string =>
  values.filter(Boolean).join(' ');

export const formatNaira = (amount: number): string =>
  `₦${amount.toLocaleString('en-NG')}`;
