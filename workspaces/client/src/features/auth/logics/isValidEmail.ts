import { z } from 'zod';

export const isValidEmail = (data: string): boolean => {
  return z.string().email().safeParse(data).success;
};
