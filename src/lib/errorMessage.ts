import { isApiError } from '@/services/api';

export const errorMessage = (err: unknown): string => {
  if (isApiError(err)) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
};
