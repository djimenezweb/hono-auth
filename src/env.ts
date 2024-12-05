import { z, ZodError } from 'zod';

const EnvSchema = z.object({
  ENVIRONMENT: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
});

let env: z.infer<typeof EnvSchema>;

try {
  env = EnvSchema.parse({
    ENVIRONMENT: process.env.ENVIRONMENT,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  });
} catch (err) {
  const error = err as ZodError;
  console.error(error.flatten().fieldErrors);
  process.exit(1);
}

export default env;
