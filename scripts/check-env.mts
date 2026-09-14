/*
 * Fails fast when the public Mapbox token is missing, so `pnpm build` and
 * `pnpm dev` stop before Next compiles a history page whose map cannot load.
 *
 *   node scripts/check-env.mts          # production build
 *   node scripts/check-env.mts --dev    # dev server
 *
 * The token is inlined into the client bundle from NEXT_PUBLIC_MAPBOX_TOKEN
 * at build time. This reads the same .env files Next does (.env.local, .env
 * and the mode-specific variants) so a local .env.local satisfies the check
 * the way the Vercel project settings do in a deployment.
 */
// @next/env ships as CommonJS, so its exports are only reachable through the
// default import under Node's ESM loader.
import nextEnv from '@next/env';

const dev = process.argv.includes('--dev');
// Next prints the list of loaded env files itself, so keep this run quiet.
nextEnv.loadEnvConfig(process.cwd(), dev, {
  info() {},
  error: console.error,
});

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!token) {
  console.error(
    'NEXT_PUBLIC_MAPBOX_TOKEN is not set. Copy .env.example to .env.local ' +
      'and add a public Mapbox token (pk.…), or set it in the Vercel project ' +
      'settings.',
  );
  process.exit(1);
}

if (!token.startsWith('pk.')) {
  console.error(
    'NEXT_PUBLIC_MAPBOX_TOKEN must be a public Mapbox token (pk.…). It is ' +
      'shipped to every browser, so never use a secret (sk.) token here.',
  );
  process.exit(1);
}
