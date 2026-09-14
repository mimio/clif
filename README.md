# clif

Clifton Campbell's personal site: a landing page with a rotating globe, a
filmstrip of projects with a WebGL glitch effect on each project page, and a
work history drawn on a Mapbox map.

Built with Next.js (Pages Router, Turbopack), React, TypeScript, Emotion,
Redux, mapbox-gl, three.js and d3. Deployed on Vercel.

## Requirements

- Node 22.18 or later. The repo's scripts are TypeScript files that Node runs
  directly, which is unflagged from 22.18.
- pnpm 10. `corepack enable` picks up the version pinned in `package.json`.

## Getting started

```sh
pnpm install
pnpm dev
```

## Scripts

| Command                       | What it does                                    |
| ----------------------------- | ----------------------------------------------- |
| `pnpm dev`                    | Development server                              |
| `pnpm build` / `pnpm start`   | Production build and server                     |
| `pnpm typecheck`              | Generates Next's route types and runs `tsc`     |
| `pnpm lint` / `pnpm lint:fix` | ESLint over the source                          |
| `pnpm format`                 | Prettier over the source                        |
| `pnpm preprocess`             | Regenerates the history map data (see Content)  |
| `pnpm images`                 | Re-encodes project images to WebP (see Content) |
| `pnpm test:e2e`               | Browser smoke test against a production build   |

## Content

**Projects** live in `constants/projects.tsx`. Each entry names its full image
(the texture for the effect on the project page) and its filmstrip preview.
After adding images to `public/`, run `pnpm images`: it converts them to WebP
at display size and rewrites the references. `pnpm images --dry-run` shows
what would change.

**Work history** lives in `makeHistoryData/features.ts`. Run `pnpm preprocess`
after editing it; it writes the GeoJSON, layer definitions and map config the
history page reads from `public/history/`, and that output is committed. The
Mapbox token in `makeHistoryData/mapboxConfig.js` is a public token; restrict
it to the site's domain in the Mapbox dashboard.

**Fonts** are self-hosted from `styles/fonts/` through `next/font/local`.

## Tests and CI

`pnpm test:e2e` needs a build first (`pnpm build`). It starts `next start` on
port 3999 (override with `PORT`) and drives every route in headless Chromium:
the globe, the filmstrip drag, the three.js effect and the Mapbox map. Mapbox
requests are answered locally, so it needs no network and no token quota.
Screenshots land in `.smoke-output/`. The first run needs
`pnpm exec playwright install chromium`.

GitHub Actions runs lint, typecheck, build and the smoke test on every pull
request and on pushes to `master`. A pre-commit hook (husky and lint-staged)
runs ESLint and Prettier on staged files.

## Configuration

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: a Google Analytics 4 measurement id.
  Analytics is a no-op when it is unset.

## Credits

The globe started from [KoGor's d3 globe](http://bl.ocks.org/KoGor/raw/5994804/),
and the image effect from Codrops'
[wave motion effect](https://tympanus.net/codrops/2020/03/17/create-a-wave-motion-effect-on-an-image-with-three-js/).
