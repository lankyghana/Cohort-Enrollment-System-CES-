import { z } from 'zod';

const envSchema = z.object({
  VITE_PAYSTACK_PUBLIC_KEY: z.string(),
  VITE_APP_NAME: z.string().optional(),
  VITE_API_URL: z.string().url().optional(),
  VITE_API_BASE_URL: z.string().url().optional(),
});

export const env = envSchema.parse(import.meta.env);
