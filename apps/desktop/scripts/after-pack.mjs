#!/usr/bin/env node
/**
 * Copies the Next.js standalone output into the packaged app's resources.
 *
 * electron-builder always excludes `node_modules` from `extraResources`, but the
 * Next standalone server resolves `next` and its traced runtime dependencies from
 * `node_modules` on disk. Copying the tree here (plain fs, no builder filters) is
 * the only reliable way to get a working server inside the bundle.
 */
import { cp, rm, mkdir, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

export default async function afterPack(context) {
  const { appOutDir, electronPlatformName, packager } = context;
  const projectDir = packager.info.projectDir;
  const webDir = path.resolve(projectDir, '..', 'web');
  const dest = path.join(appOutDir, 'resources', 'web');

  const standalone = path.join(webDir, '.next', 'standalone');
  if (!(await exists(path.join(standalone, 'server.js')))) {
    throw new Error(
      `Falta ${standalone}/server.js. Ejecuta \`npm run build\` en apps/web antes de empaquetar.`,
    );
  }

  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });

  // 1. server.js + package.json + traced node_modules
  await cp(standalone, dest, {
    recursive: true,
    filter: (src) => !src.endsWith('.map'),
  });

  // 2. static assets, expected at <dest>/.next/static by server.js
  const staticDir = path.join(webDir, '.next', 'static');
  if (await exists(staticDir)) {
    await cp(staticDir, path.join(dest, '.next', 'static'), { recursive: true });
  }

  // 3. public/, served from the server root
  const publicDir = path.join(webDir, 'public');
  if (await exists(publicDir)) {
    await cp(publicDir, path.join(dest, 'public'), { recursive: true });
  }

  // Fail loudly rather than shipping an app that cannot boot its own server.
  for (const required of ['server.js', 'node_modules/next/package.json']) {
    if (!(await exists(path.join(dest, required)))) {
      throw new Error(`afterPack: falta ${required} en ${dest}`);
    }
  }

  console.log(`  • afterPack: recursos web copiados a ${path.relative(appOutDir, dest)}`);
  console.log(`    (plataforma: ${electronPlatformName ?? 'desconocida'})`);
}

// Referenced so bundlers/linters keep the import; electron-builder loads the default
// export directly, and this keeps `require` referenced for NodeNext CJS interop.
void require;
