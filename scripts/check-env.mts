/*
 * Guards the public Mapbox token. The globe is on every route now, so a
 * production build without a token ships a site with no scene at all:
 * `pnpm build` still fails hard. `pnpm dev` only warns, because the scene
 * degrades to its no-token fallback and the rest of the app -- chrome,
 * content, type -- is perfectly workable without one.
 *
 *   node scripts/check-env.mts          # production build, hard fail
 *   node scripts/check-env.mts --dev    # dev server, warn only
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

// In dev the scene falls back to a token-less placeholder, so a missing or
// malformed token is worth saying out loud but is not worth blocking on.
const fail = (message: string): void => {
  if (dev) {
    console.warn(`warning: ${message}`);
    return;
  }
  console.error(message);
  process.exit(1);
};

if (!token) {
  fail(
    'NEXT_PUBLIC_MAPBOX_TOKEN is not set. Copy .env.example to .env.local ' +
      'and add a public Mapbox token (pk.…), or set it in the Vercel project ' +
      'settings.',
  );
} else if (!token.startsWith('pk.')) {
  fail(
    'NEXT_PUBLIC_MAPBOX_TOKEN must be a public Mapbox token (pk.…). It is ' +
      'shipped to every browser, so never use a secret (sk.) token here.',
  );
}
