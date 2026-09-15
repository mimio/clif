# clif

Clifton Campbell's personal site: a landing page with a rotating globe, a
filmstrip of projects with a WebGL glitch effect on each project page, and a
work history drawn on a Mapbox map.

Built with Next.js (Pages Router, Turbopack), React, TypeScript, Tailwind
CSS, Redux, mapbox-gl, three.js and d3. Deployed on Vercel.

## Requirements

- Node 22, at least 22.18 (`package.json` declares `>=22.18 <23`). The repo's
  scripts are TypeScript files that Node runs directly, which is unflagged
  from 22.18.
- pnpm 10. `corepack enable` picks up the version pinned in `package.json`.

## Getting started

```sh
pnpm install
cp .env.example .env.local   # then add a public Mapbox token
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
After adding images to `public/`, run `pnpm images`: it re-encodes images as
WebP at display size when that makes them smaller, leaves the rest alone, and
rewrites the references. `pnpm images --dry-run` shows what would change.

**Work history** lives in `makeHistoryData/features.ts`. Run `pnpm preprocess`
after editing it; it writes the GeoJSON, layer definitions and map config the
history page reads from `public/history/`, and that output is committed. The
map options live in `makeHistoryData/mapboxConfig.ts`; the access token does
not (see Configuration).

**Fonts** are self-hosted from `styles/fonts/` through `next/font/local`,
which exposes each as a CSS variable that the `font-mono` and `font-display`
utilities read.

## Styling

Tailwind CSS v4, configured entirely in `styles/globals.css`:

- Design tokens (colours, breakpoints, animations, the 4px spacing grid)
  live in its `@theme` block and become both CSS custom properties and
  utility classes: `--color-accent` gives `bg-accent`, `text-accent`,
  `border-accent/30` and so on.
- Recurring declaration groups are `@utility` classes (`transition-hue`,
  `transition-size`, `link-underline`, `scrollbar-hidden`), so they take
  variants like any other utility. Element defaults live in `@layer base`.
- `hover:` is redefined as plain `:hover` (`@custom-variant` in
  `globals.css`) to match the site's pre-Tailwind behaviour on touch;
  Tailwind's default applies it only where hovering is possible.
- Breakpoints are `tablet` (650px) and `desktop` (1000px), used mobile-first:
  `max-tablet:` targets phones, `max-desktop:` phones and tablets.
  `styles/breakpoints.ts` carries the same numbers for the Redux device
  selectors, and `styles/palette.ts` the colours for code that paints
  outside CSS (the history map layers).

Components style themselves with utilities in `className`. `cn()` in
`utils/cn.ts` joins conditional classes and lets a caller's `className`
override a component's own, so components list their classes first and the
caller's last. The type scale is `components/text.tsx`: `Heading`, `Body`,
`Detail3` and friends as components, and `textClass` for elements that are
not text. Prettier sorts class names (`prettier-plugin-tailwindcss`), and
`pnpm format` covers `.css` files too.

## Tests and CI

`pnpm test:e2e` needs a build first (`pnpm build`). It starts `next start` on
port 3999 (override with `PORT`) and drives every route in headless Chromium:
the globe, the filmstrip drag, the three.js effect and the Mapbox map. Mapbox
requests are answered locally, so it needs no network and no token quota.
Screenshots land in `.smoke-output/` (override with `SMOKE_OUT`). The first
run needs `pnpm exec playwright install chromium`.

GitHub Actions runs lint, typecheck, build and the smoke test on every pull
request and on pushes to `master`. A pre-commit hook (husky and lint-staged)
runs ESLint and Prettier on staged files.

## Configuration

Both variables are inlined at build time. Locally they go in `.env.local`
(start from `.env.example`); on Vercel they live in the project's Environment
Variables for Production, Preview and Development.

- `NEXT_PUBLIC_MAPBOX_TOKEN`, required: a public Mapbox token (`pk.…`) for the
  history map. `pnpm build` and `pnpm dev` refuse to start without it
  (`scripts/check-env.mts`), rather than shipping a history page whose map
  cannot load. Restrict the token to the site's domain in the Mapbox
  dashboard. CI builds with a placeholder because the smoke test answers every
  Mapbox request locally.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, optional: a Google Analytics 4 measurement
  id. Analytics is a no-op when it is unset.

## Credits

The globe started from [KoGor's d3 globe](https://gist.github.com/KoGor/5994804),
and the image effect from Codrops'
[wave motion effect](https://tympanus.net/codrops/2020/03/17/create-a-wave-motion-effect-on-an-image-with-three-js/).
