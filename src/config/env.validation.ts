import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
