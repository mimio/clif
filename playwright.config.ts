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
   * THE COMPARISON TOLERANCE, AND WHY IT TIGHTENED.
   *
   * This used to be threshold 0.3 / maxDiffPixelRatio 0.08, chosen so a
   * nondeterministic basemap could not turn the job red. That reasoning
   * belonged to a design where the comparison was the gate. It is not any
   * more: e2e/review/scene.spec.ts is the gate and it asserts facts, while
   * every comparison in e2e/review/capture.spec.ts is caught and recorded
   * as an annotation. A soft signal calibrated not to fire tells nobody
   * anything -- the failure mode reverses, and the loose number that was
   * protecting the build is now just hiding drift from a human.
   *
   * So: Playwright's default 0.2 per pixel, and 0.02 of the frame. Two
   * percent is still generous for a picture that is mostly terrain, and
   * it is deliberately a STARTING POINT rather than a measurement. Nobody
   * has ever compared two runs of this site against real Mapbox, so the
   * honest number is whatever the first few runs' annotations show; the
   * job exists partly to find that out. Waiting on the map's own `idle`
   * event rather than on a clock should make the frames much closer to
   * deterministic than the old number assumed -- tiles are all in by then
   * -- but "should" is the word this branch has been wrong about before.
   *
   * These feed toMatchSnapshot rather than toHaveScreenshot, because
   * toHaveScreenshot's stabilisation loop -- capture until two frames are
   * identical -- can never converge on a live WebGL canvas. See
   * e2e/fixtures/capture.ts.
   */
  expect: {
    toMatchSnapshot: {
      threshold: 0.2,
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
             * The hello and 404 cameras spin and the work path dashes,
             * and scene/camera.ts resolves both dials to off under
             * reduced motion -- the app's own switch, so this is the
             * honest way to stop them rather than a test-only freeze.
             *
             * It does NOT make the canvas still, and nothing can: tiles
             * fade in and terrain refines under their own render loop.
             * That is why the captures are single frames rather than
             * stabilised comparisons.
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
        },
      },
});
