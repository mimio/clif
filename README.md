# clif

Clifton Campbell's personal site. One globe, three routes: `hello`,
`projects` and `about` — the last of which a visitor reads as **about me**;
the id, the path and the scene keep the shorter name. The scene is a single
persistent Mapbox map mounted behind the whole app; changing route moves the
camera rather than rebuilding anything.

On `/about` the map is also the route's control. The stage passes the
pointer through to it (`SceneStage`'s `passThrough`), so the camera is the
visitor's to drag and zoom, and clicking a work-history stop drives the copy
above it rather than moving the camera. The other two routes keep the press:
their own controls live in the foreground, and a drag begun on a table row
must not pan the globe under it.

Built with Next.js (Pages Router, Turbopack), React, TypeScript, Tailwind
CSS, mapbox-gl and three.js. Tested with Vitest and Playwright. Deployed on
Vercel.

## Requirements

- Node 22, at least 22.18 (`package.json` declares `>=22.18 <23`). The repo's
  scripts are TypeScript files that Node runs directly, which is unflagged
  from 22.18.
- pnpm 10. `corepack enable` picks up the version pinned in `package.json`.

## Getting started

```sh
pnpm install
cp .env.example .env.local   # optional in dev; see Configuration
pnpm dev
```

## Architecture

Five layers. Each may import the ones below it, plus `content/` and
`utils/`.

| Layer | Where                     | What                                            |
| ----- | ------------------------- | ----------------------------------------------- |
| L0    | `styles/`                 | Design tokens, the type faces, the theme id     |
| L1    | `components/primitives/`  | Text PageWord Button Glyph Icon Pill Chip Rule  |
| L2    | `components/composed/`    | SceneStage ProjectTable Sheet Scrubber Pager …  |

`Sheet` and `Scrubber` are still part of the system and still specimen'd and
tested, but no route renders them since `/about` was simplified: they are
the panel and the timeline rail that route used to carry.
| L3    | `components/chrome/`      | Altimeter ThemeEye ContactMouth CoordPill       |
| L4    | `pagesComponents/<route>/`| One component per route                         |
| L4    | `pages/`                  | Data, composition and one `useSceneCamera()`    |

ESLint enforces this with `no-restricted-imports` blocks in
`eslint.config.mjs`, so a violation fails `pnpm lint`. What is enforced,
precisely:

- Every directory above has a block of its own. A flat config resolves per
  file, so a directory without one falls through to the base config and is
  governed by the mapbox restriction alone — silently. That happened to
  `pagesComponents/` and `styles/`, so `test/eslint-layers.test.ts` now
  asserts the resolved config for a file in each layer and fails if a layer
  is left unguarded.
- `styles/`, `content/` and `utils/` are leaves. They may not import the
  component stack, the routes or the scene.
- `pagesComponents/` may not import `pages/`. Nothing else is barred to it.
- `pages/` may import anything, and is not restricted.
- `test/**` and the specimen boards are exempt on purpose: their job is to
  reach across layers.

Outside the stack:

- `scene/` owns the map. It is a service sibling rather than a rung: the
  chrome, the route components and the pages may all use it, because the
  scene owns numbers the foreground has to agree with — `scene/enter` derives
  the type's entrance delay from the camera move that route actually makes.
  The lower layers and the leaves may not touch it. Only `scene/` may import
  `scene/mapbox/**`, which is the one place mapbox-gl is loaded, lazily and
  only when a token exists.
- `content/` is data, not components: projects, work history, city anchors,
  per-route cameras and the route table. It imports nothing from the layers.

Page files are named `<name>.page.tsx`; see Specimens for why.

`pages/_app.page.tsx` renders exactly three siblings: `SceneRoot` (z-0, never
unmounts), the page (z-10), and `ChromeRoot` (z-40, never unmounts).

## Scripts

| Command                       | What it does                                     |
| ----------------------------- | ------------------------------------------------ |
| `pnpm dev`                    | Development server                               |
| `pnpm specimens`              | Dev server with the `/specimens` harness enabled |
| `pnpm build` / `pnpm start`   | Production build and server                      |
| `pnpm typecheck`              | Generates Next's route types and runs `tsc`      |
| `pnpm lint` / `pnpm lint:fix` | ESLint over the source                           |
| `pnpm format`                 | Prettier over the source                         |
| `pnpm images`                 | Re-encodes project images to WebP (see Content)  |
| `pnpm test:unit`              | Vitest                                           |
| `pnpm test:coverage`          | Vitest with coverage, gated at 100%              |
| `pnpm test:e2e`               | Playwright against a production build            |
| `pnpm test`                   | Unit tests, then e2e                             |

## Content

**Projects** live in `content/projects.ts`. Prose is a typed rich-text shape
(paragraphs of spans, where a span is a string or a `{ text, href }` link)
rather than JSX, so the data can be read without React. Each entry names its
full image, which is the texture for the shader plane on the detail route.
After adding images to `public/`, run `pnpm images`; `--dry-run` shows what
would change.

**Work history** lives in `content/history.ts`: six stops with dates,
coordinates and prose. There is no build step any more — the old
`makeHistoryData` pipeline and its committed GeoJSON are gone, and the scene
reads the module directly.

**Cameras** live in `content/cameras.ts`, one `CameraSpec` per scene, taken
from the design system's artboards. A page declares its camera with a single
`useSceneCamera()` call.

**Fonts** are self-hosted from `styles/fonts/` through `next/font/local`,
which exposes each as a CSS variable.

## Styling

Tailwind CSS v4, configured in `styles/globals.css`. Components style
themselves with utilities in `className`; `cn()` in `utils/cn.ts` joins
conditional classes and lets a caller's `className` override a component's
own. Prettier sorts class names, and `pnpm format` covers `.css` too.

Themes: eight token scopes selected by `data-theme` on the documentElement.
`styles/theme-bootstrap.ts` holds the identity list and the blocking script
that `pages/_document.page.tsx` injects into `<head>`, so the stored theme is
applied before first paint and there is no flash.

## Tests and CI

`pnpm test:unit` runs Vitest in jsdom. `vitest.config.mts` re-implements the
loader rules `next.config.ts` gives Turbopack, because Vitest never reads it:
SVGs through `vite-plugin-svgr` as default exports, and `.glsl` through a
small inline plugin that returns the file text. `NEXT_PUBLIC_MAPBOX_TOKEN` is
pinned empty in the test environment, so unit tests always exercise the
no-token fallback.

Re-implementing those rules means they can drift, and the SVG rule did:
`@svgr/webpack` runs SVGO and `vite-plugin-svgr` does not, so every icon
compiled differently under test than in a browser. The shared options live in
`svgr.config.mjs` and `test/svgr-parity.test.ts` diffs the two transforms
over every icon, reading those same options rather than restating them.

`pnpm test:coverage` is gated at 100% on statements, branches, functions and
lines, and CI runs that, not `test:unit` — a threshold nothing evaluates is
not a gate. Everything excluded from it carries its reason in the config.

`pnpm test:e2e` runs Playwright, which builds and starts the app itself.
Mapbox requests are answered locally by `e2e/fixtures/mapbox-stub.ts`, so it
needs no network and no token quota; Chromium runs on SwiftShader so the
scene has a GL context on a GPU-less runner. The first run needs
`pnpm exec playwright install chromium`.

GitHub Actions runs lint, typecheck, unit tests with the coverage gate,
build and e2e on every pull request and on pushes to `master`. A pre-commit hook (husky and lint-staged)
runs ESLint and Prettier on staged files.

## Specimens

`/specimens` is a design harness and is not part of the site. Each section is
its own file under `pagesComponents/specimens/`, registered in one line in
`pages/specimens.harness.tsx`.

Keeping it out of the build is why page files carry marker extensions.
`getStaticProps` returning `notFound` stops a page being *served*, but it is
still compiled, bundled and deployed — measured, the harness was 131,623
bytes of client chunks, a `/specimens` entry in the manifest every visitor
downloads, and a second production consumer of `scene/`. Next decides what a
page is from the filename, so:

- real pages are `<name>.page.tsx`, and `pageExtensions` is
  `['page.tsx', 'page.ts']`;
- the harness is `specimens.harness.tsx`, and `harness.tsx` joins
  `pageExtensions` only when `NEXT_PUBLIC_SPECIMENS` is set.

With the flag off Next never sees the file: no route, no chunk, no manifest
entry. It keeps its `.tsx` extension either way, so TypeScript and ESLint
still check it.

## Configuration

Both variables are inlined at build time. Locally they go in `.env.local`
(start from `.env.example`); on Vercel they live in the project's Environment
Variables for Production, Preview and Development.

- `NEXT_PUBLIC_MAPBOX_TOKEN`: a public Mapbox token (`pk.…`). `pnpm build`
  refuses to start without one, because a production deploy with no scene is
  not worth shipping; `pnpm dev` only warns, and the scene degrades to an
  empty container so the rest of the app is still workable. Restrict the
  token to the site's domain in the Mapbox dashboard. CI builds with a
  placeholder because the e2e suite answers every Mapbox request locally.
- `NEXT_PUBLIC_MAPBOX_STYLE`, optional, and **best left unset**. It defaults
  to `mapbox://styles/mapbox/standard`, and Mapbox Standard is the only style
  this site can theme.

  The eight themes are applied at runtime rather than baked into a style, and
  the whole of that mechanism is addressed to Standard's `basemap` import
  through `setConfigProperty('basemap', …)` — the light preset and the label
  toggles, and the **cartography**: one colour key per feature class
  (`colorWater`, `colorGreenspace`, `colorLand`, the roads, the buildings,
  the boundaries), each set straight from that theme's `--map-*` tokens.
  mapbox-gl answers a call on a style that has no such import by returning —
  no throw, no warning, no error event — so a site pointed at any other style
  comes up looking entirely healthy and wears none of its themes.

  There used to be a colour LUT above all that, a 3D cube handed to
  `setImportColorTheme('basemap', …)` that re-graded every basemap pixel. It
  is gone. A grade sees a pixel value rather than a feature, so it could tint
  Mapbox's cartography but never re-author it — on a blue theme a forest came
  out a blue-tinted *green*. It was also the expensive tier: mapbox-gl
  reloads every visible tile when an import's colour theme changes, by
  design, and `setConfigProperty` reloads none, so switching themes got
  dramatically cheaper as a side effect. `styles/tokens/cartography.ts` has
  the measurement that retired it, including why a cube and the colour keys
  cannot both be primary.

  Every one of those label toggles is **off**, and the site draws the place
  names itself from `mapbox://mapbox.mapbox-streets-v8` instead. That started
  as a workaround — the colour LUT was applied to a symbol layer's text
  exactly as to a fill, so Standard's label colour was an input to a tone
  compressor spanning about 1.4:1 on a light theme — and it is a choice now
  that the LUT is gone and `colorPlaceLabels` would work: the map is set in
  the site's own mono, and two typefaces naming the same places is worse than
  either alone. `scene/theme.ts`'s `basemapConfig` has the derivation and
  `test/map-text.test.ts` has the measurement, per theme.

  The `--map-*` tokens live in `styles/tokens/themes.css`, one block per
  theme, as literals a designer can move one at a time. `/specimens` renders
  all eight side by side.

  That is not hypothetical: this variable is inlined at build time, so a value
  left on the Vercel project from the old hand-maintained
  `mapbox://styles/chiefkleef/…` style is invisible everywhere except on the
  deployed page. **If the deployed globe is not themed, remove
  `NEXT_PUBLIC_MAPBOX_STYLE` from the Vercel project's Environment Variables
  (Production, Preview and Development) and redeploy.** The scene now logs a
  console error naming the style and the consequence when it detects one, and
  `e2e/review/scene.spec.ts` fails the build on it.
- `NEXT_PUBLIC_SITE_URL`, optional: the canonical origin, no trailing slash
  (e.g. `https://clif.mimio.io`). Every route emits a canonical link and
  `og:`/`twitter:` URLs; without this they stay root-relative, which resolves
  correctly against the document that served them — right on localhost and on
  every preview, but it means the deployed site publishes no absolute
  canonical. Set it on the production environment.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, optional: a Google Analytics 4 measurement
  id. Analytics is a no-op when it is unset.

## Credits

The image effect started from Codrops'
[wave motion effect](https://tympanus.net/codrops/2020/03/17/create-a-wave-motion-effect-on-an-image-with-three-js/).
