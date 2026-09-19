import { defineConfig, devices } from '@playwright/test';

/*
 * TWO TIERS, AND THE CONFIG IS BINARY BETWEEN THEM.
 *
 * Tier 1 -- "hermetic" -- runs on every PR against a local production
 * build with mapbox-gl replaced through window.__MAPBOX_STUB__. No
 * network, no token, no GL context for the map. It answers everything
 * about the app's own behaviour: the routes, the single persistent map,
 * the screenshot plane surviving a navigation, the theme round trip, both
 * fallbacks.
 *
 * Tier 2 -- "review" -- runs only in CI, against the Vercel preview a
 * deployment_status event has just announced, using the owner's real
 * Mapbox token. It is the only place the real basemap exists, so it is
 * the only place that can say what the eight themes look like over real
 * terrain and whether Standard accepted the runtime colour-theme LUT.
 *
 * PREVIEW_URL is the switch, and it switches the whole config rather than
 * just adding a project: in review mode there is no webServer and no
 * hermetic project, because a visual job that also builds and boots a
 * local server spends minutes re-proving what the PR job already proved.
 */
/*
 * 4311 rather than 3999, and nothing reuses it.
 *
 * A stale `next start` left on the old port by another checkout served
 * a build that was not under test, twice, and both times the suite
 * reported a confident failure against code nobody was running -- the
 * HTML carried one build id and the chunks it asked for were 404, so the
 * page never hydrated and every scene assertion failed for a reason that
 * had nothing to do with the scene. `reuseExistingServer` is what made
 * that possible: Playwright skipped its own build-and-boot because
 * something was already answering.
 *
 * So it is off, unconditionally. Playwright now refuses to start when the
 * port is taken, which is a loud, one-line failure instead of a suite that
 * verifies the wrong thing. That is the whole trade, and it is not close:
 * the cost is re-booting a server the developer already had, and the
 * saving is never again trusting a result that was never produced.
 */
const PORT = Number(process.env.PORT) || 4311;
const LOCAL_URL = `http://127.0.0.1:${PORT}`;

const PREVIEW_URL = (process.env.PREVIEW_URL ?? '').trim();
const REVIEW = PREVIEW_URL.length > 0;

/*
 * An escape hatch for a machine whose Chromium is not the one Playwright
 * would have downloaded.
 *
 * PLAYWRIGHT_BROWSERS_PATH does NOT cover this case: it points Playwright
 * at a different registry, but Playwright still looks inside it for the
 * exact build it was pinned to -- so a pre-installed Chromium at any other
 * revision is invisible to it, and only executablePath reaches one.
 *
 * It is empty everywhere else, including CI, which downloads its own
 * matching browser; no path is ever committed here. Locally:
 *
 *   PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome pnpm test:e2e
 */
const CHROMIUM_PATH = process.env.PLAYWRIGHT_CHROMIUM_PATH;

/*
 * The globe is WebGL, and CI runners have no GPU. ANGLE over SwiftShader
 * gives a real (software) GL context instead of the null one Chromium
 * falls back to. The screenshot plane's shader needs it even in tier 1,
 * where the map itself does not.
 */
export const GL_ARGS = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
];

/** Shared with e2e/hermetic/fallback.spec.ts, which launches its own. */
export const launchOptions = {
  args: GL_ARGS,
  ...(CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : {}),
};

/*
 * A protected Vercel preview needs the bypass header. It arrives through
 * the environment so the workflow decides whether the secret exists at
 * all -- see .github/workflows/visual.yml, where a fork's commit never
 * gets one.
 */
const BYPASS = (process.env.PREVIEW_BYPASS_TOKEN ?? '').trim();
const previewHeaders = BYPASS
  ? {
      'x-vercel-protection-bypass': BYPASS,
      'x-vercel-set-bypass-cookie': 'true',
    }
  : undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'list',

  /*
   * Baselines live beside the specs that own them rather than under
   * test-results, because they are committed artefacts: the workflow
   * uploads every capture and the owner commits the ones they accept.
   * They are platform-tagged because a Linux runner and a developer's
   * laptop rasterise type differently, and only the runner's are usable.
   */
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{projectName}/{platform}/{testFilePath}/{arg}{ext}',

  /*
   * NOTHING WRITES A BASELINE, and this one word is why the review job is
   * green on a fresh checkout.
   *
   * Playwright's default is 'missing': a comparison with no baseline
   * writes the file and attaches a SOFT ERROR, which does not throw and
   * therefore cannot be caught -- the test is marked failed no matter how
   * the call is wrapped. With eighteen captures and no committed
   * baselines, that is eighteen red tests saying nothing about the site.
   *
   * 'none' makes a missing baseline an ordinary thrown assertion, which
   * e2e/fixtures/capture.ts catches and turns into an annotation. Every
   * capture is still written -- to test-results/review-captures, under
   * the exact path its baseline would occupy -- so accepting a run is one
   * copy out of the uploaded artifact.
   */
  updateSnapshots: 'none',

  use: {
    baseURL: REVIEW ? PREVIEW_URL : LOCAL_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...(previewHeaders ? { extraHTTPHeaders: previewHeaders } : {}),
  },

  /*
   * THE COMPARISON TOLERANCE. THRESHOLD IS THE BINDING CONSTRAINT, and
   * this comment used to reason only about maxDiffPixelRatio.
   *
   * The two numbers are not a pair of dials on the same axis. `threshold`
   * decides whether a pixel COUNTS as different at all, and
   * maxDiffPixelRatio only then decides how many counted pixels are too
   * many. A pixel that threshold ignores never reaches the ratio, so a
   * loose threshold does not make the comparison lenient -- it makes it
   * BLIND, and the diff it reports is not "small", it is zero.
   *
   * pixelmatch ignores a pixel whose YIQ delta is below
   * 35215 * threshold^2. At Playwright's default 0.2 that is 1408.6.
   * Measured between the eight themes' --map-land anchors
   * (styles/tokens/themes.css), which is the colour most of every globe
   * capture is actually made of:
   *
   *   yellow/rust      2.9      rust/pink       8.6      lime/cream    94.1
   *   yellow/pink      3.8      yellow/cream    9.4      yellow/lime  122.8
   *   rust/cream       6.4      pink/cream     15.5      yellow/teal  176.1
   *   lime/teal       17.3      paper/chalk    24.5
   *   ...and the six-dark-to-two-light pairs, 13001 to 14431.
   *
   * So at 0.2 the ONLY pairs that register are dark-against-light --
   * anything against paper or chalk. The globe could ship wearing `rust`
   * where the baseline was `yellow`, over the entire basemap, and the
   * capture would be recorded as matching its baseline with a diff of
   * ZERO pixels. paper against chalk, the two light themes, is Δ24.5 and
   * equally invisible. That defeats most of what eight globe-<theme>.png
   * captures are for.
   *
   * 0.02 gives maxDelta 14.1, which is below pink/cream (15.5), lime/teal
   * (17.3) and paper/chalk (24.5) -- so a whole-basemap theme swap
   * registers for 23 of the 28 pairs instead of 13. maxDiffPixelRatio
   * 0.02 is then free to do the job it was chosen for: absorb scattered
   * tile and terrain noise, while a recolour of the whole frame is nowhere
   * near 2% of it.
   *
   * WHAT IS STILL NOT COVERED, honestly: five pairs sit under 10 and no
   * usable threshold separates them. Catching yellow/rust (Δ2.9) needs
   * roughly 0.009, which is close enough to exact-match that ordinary
   * rasterisation noise would flood it. And the 0.02 ratio remains a
   * STARTING POINT, not a measurement: nobody has yet compared two runs of
   * this site against real Mapbox, and until the first few runs'
   * annotations exist, the right number for tile noise is unknown. Waiting
   * on the map's own `idle` event rather than on a clock should make the
   * frames far closer to deterministic than the old numbers assumed, but
   * "should" is the word this branch has been wrong about before. If the
   * annotations come back noisy, raise maxDiffPixelRatio -- NOT threshold,
   * which is the one that decides whether the suite can see colour.
   *
   * (The previous 0.3/0.08 was chosen so a nondeterministic basemap could
   * not turn the job red, from a design in which the comparison WAS the
   * gate. It is not any more: e2e/review/scene.spec.ts asserts facts and
   * fails the build, while every comparison in e2e/review/capture.spec.ts
   * is caught and recorded as an annotation.)
   *
   * These feed toMatchSnapshot rather than toHaveScreenshot, because
   * toHaveScreenshot's stabilisation loop -- capture until two frames are
   * identical -- can never converge on a live WebGL canvas. See
   * e2e/fixtures/capture.ts.
   */
  expect: {
    toMatchSnapshot: {
      threshold: 0.02,
      maxDiffPixelRatio: 0.02,
    },
  },

  projects: REVIEW
    ? [
        {
          name: 'review',
          testDir: './e2e/review',
          /*
           * A network-backed map needs a proportionate budget. The 30s
           * default was not one: a single route can spend most of it
           * waiting for the style, the DEM and every visible tile, and
           * the first version of this job spent its whole timeout inside
           * settle() and then reported "Target page, context or browser
           * has been closed" -- the shutdown, not the cause. The
           * 180_000 elsewhere in this file is the webServer's and has
           * never applied here; the review tier has no webServer at all.
           */
          timeout: 150_000,
          use: {
            ...devices['Desktop Chrome'],
            launchOptions,
            /*
             * The hello and 404 cameras spin, and scene/camera.ts
             * resolves that dial to off under reduced motion -- the
             * app's own switch, so this is the honest way to stop it
             * rather than a test-only freeze.
             *
             * It does NOT make the canvas still, and nothing can: tiles
             * fade in and terrain refines under their own render loop.
             * That is why the captures are single frames rather than
             * stabilised comparisons.
             *
             * WHAT TIER 2 IS THEREFORE NOT A GATE FOR, written down
             * because it was not, anywhere.
             *
             * In review mode `review` is the ONLY project, so this
             * applies to the hard gate as well as to the captures. The
             * app answers reduced motion by turning the motion off:
             *
             *   scene/camera.ts          spinRateFor() -> null. The
             *                            globe does not turn.
             *   scene/camera.ts:330-341  moveDurationFor() collapses the
             *                            800/900/600ms flights to
             *                            REDUCED_MOVE_MS = 200ms, which
             *                            the motion card specifies as a
             *                            crossfade rather than a move.
             *   scene/enter.ts:79-91     foregroundEnter() takes the
             *                            reduced branch, so
             *                            foregroundHandoffMs() is never
             *                            evaluated at all.
             *
             * So the ONE PLACE THE REAL BASEMAP EXISTS CANNOT SEE ANY OF
             * THE MOTION. Every one of those dials is verified against
             * the stub alone -- the unit suite and tier 1 -- and a spin
             * rate or a flight duration that is wrong over real terrain
             * would not be caught here.
             *
             * That division is deliberate and defensible: a spinning
             * globe cannot be photographed reproducibly, and a camera
             * flight timed against a network-backed map measures the
             * network. But it is a division, not a coincidence, and the
             * next person to ask "is the motion covered end to end?"
             * should get the answer from this comment rather than from a
             * green check.
             */
            reducedMotion: 'reduce',
          },
        },
      ]
    : [
        {
          name: 'hermetic',
          testDir: './e2e/hermetic',
          use: {
            ...devices['Desktop Chrome'],
            launchOptions,
          },
        },
      ],

  webServer: REVIEW
    ? undefined
    : {
        // The e2e suite runs against a production build, the same as the
        // site. CI has already run `pnpm build` as its own step, so it
        // sets PLAYWRIGHT_REUSE_BUILD and this only boots the server.
        command: process.env.PLAYWRIGHT_REUSE_BUILD
          ? 'pnpm start'
          : 'pnpm build && pnpm start',
        url: LOCAL_URL,
        // Never. See the note on PORT above.
        reuseExistingServer: false,
        timeout: 180_000,
        env: {
          PORT: String(PORT),
          NEXT_TELEMETRY_DISABLED: '1',
          // The stub replaces mapbox-gl before the token is read, so the
          // build only needs a token-shaped value, never a real one.
          NEXT_PUBLIC_MAPBOX_TOKEN:
            process.env.NEXT_PUBLIC_MAPBOX_TOKEN ??
            'pk.e2e-placeholder',
          /*
           * The harness is built here, and only here.
           *
           * e2e/hermetic/keycap-glyph.spec.ts measures a rendered glyph at
           * all three keycap sizes, and /specimens is the only place all
           * three carry one -- the site itself ships md. Tier 1 was never
           * the production artefact in the first place (it builds against
           * pk.e2e-placeholder, above), so the one thing the .harness.tsx
           * extension actually guarantees -- that a DEPLOY has no
           * /specimens route -- is untouched: Vercel does not set this.
           * CI sets the same flag on its own `pnpm build` step, which is
           * the build PLAYWRIGHT_REUSE_BUILD then serves.
           */
          NEXT_PUBLIC_SPECIMENS: '1',
        },
      },
});
