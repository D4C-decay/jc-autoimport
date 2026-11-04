import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer loads .env on its own. Load it before reading the URLs so
// `prisma migrate deploy` and `prisma db seed` work from a clean shell.
for (const file of ['.env', '.env.local']) {
  if (existsSync(file)) loadEnvFile(file);
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Migrations and introspection must bypass the pooler: Supabase exposes the
    // direct/session connection in DIRECT_URL (port 5432), while the app uses
    // the transaction pooler in DATABASE_URL (port 6543 + pgbouncer=true).
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      'postgresql://jcauto:jcauto_password@localhost:5432/jcautoimport?schema=public',
  },
});
