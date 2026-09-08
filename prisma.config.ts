import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: 'postgresql://jcauto:jcauto_password@localhost:5432/jcautoimport?schema=public',
  },
});
