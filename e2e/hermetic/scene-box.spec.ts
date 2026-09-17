import { expect, test } from '@playwright/test';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * The globe has to have somewhere to be.
 *
 * mapbox-gl measures the container when it constructs the map, and a box
 * of zero height does not raise anything: it falls back to a 300px canvas
 * and paints a strip. The scene shipped that way on every route, because
 * the container's box was a class name with no rule behind it, and no
 * unit test can see it -- jsdom has no layout, so `toHaveClass` and even
 * a computed style pass happily against a container measuring 1440x0.
 *
 * Only a real browser can answer this, so it is asked here. These
 * assertions fail on a strip and cannot be satisfied by a class name.
 */
const ROUTES = ['/', '/projects', '/about'] as const;

test.describe('the scene container', () => {
  for (const route of ROUTES) {
    test(`fills the viewport on ${route}`, async ({
      context,
      page,
    }) => {
      await stubMapboxNetwork(context);
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(route, { waitUntil: 'load' });

      const scene = page.getByTestId('scene-root');
      await expect(scene).toBeAttached();

      const box = await scene.boundingBox();
      expect(box).not.toBeNull();
      // Effectively the whole viewport, rather than mapbox's 300px
      // fallback. Not asserted exactly: a scrollbar takes a little of
      // the width and that is not what this is about.
      expect(box?.width).toBeGreaterThan(1200);
      expect(box?.height).toBeGreaterThan(780);

      // And the canvas the map actually paints into follows it.
      const canvas = scene.locator('canvas').first();
      await expect(canvas).toBeAttached({ timeout: 15_000 });
      const painted = await canvas.boundingBox();
      expect(painted?.height).toBeGreaterThan(700);
      expect(painted?.width).toBeGreaterThan(1200);
    });
  }

  test('survives a client-side navigation into a terrain route', async ({
    context,
    page,
  }) => {
    await stubMapboxNetwork(context);
    const problems: string[] = [];
    page.on('pageerror', (error) => problems.push(error.message));

    await page.goto('/', { waitUntil: 'load' });
    await expect(page.getByTestId('scene-root')).toBeAttached();
    // Let the map settle first. Navigating immediately does NOT
    // reproduce it -- the crash needs a map that has been rendering for
    // a while, which is why it read as flaky rather than as a bug.
    await page.waitForTimeout(1_500);

    /*
     * Terrain switches on past z9, and the DEM source is added with it.
     * A stubbed DEM serving no TileJSON has no tile cache, and the first
     * frame after this navigation used to die inside mapbox's own
     * Terrain.update -- taking the tree with it. A direct load happened
     * to survive, which is what made it look like an app bug.
     *
     * Driven through the router rather than by clicking the keycap: what
     * is under test is that the persistent map survives a client-side
     * route change, not how another lane happens to mark up its links.
     */
    await page.evaluate(() =>
      (
        window as unknown as {
          next: { router: { push: (to: string) => void } };
        }
      ).next.router.push('/about'),
    );
    await page.waitForURL('**/about');
    await page.waitForTimeout(3_000);

    expect(problems).toEqual([]);
    // The tree is still mounted, and the scene still has its box.
    const scene = page.getByTestId('scene-root');
    await expect(scene).toBeAttached();
    await expect(scene).toHaveAttribute('data-scene', 'about');
    const box = await scene.boundingBox();
    expect(box?.height).toBeGreaterThan(700);
  });
});

/*
 * The debug handle, which exists so the visual tier does not have to
 * patch HTMLImageElement to find out what the style is wearing.
 *
 * It is opt-in: nothing publishes it unless __SCENE_DEBUG__ was set
 * before the app booted, which is what keeps it out of a normal session.
 */
test.describe('the debug handle', () => {
  test('is absent unless a test asks for it', async ({
    context,
    page,
  }) => {
    await stubMapboxNetwork(context);
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.getByTestId('scene-root')).toBeAttached();
    expect(
      await page.evaluate(
        () => (window as { __SCENE__?: unknown }).__SCENE__,
      ),
    ).toBeUndefined();
  });

  test('reports the style, the LUT and a clean error log', async ({
    context,
    page,
  }) => {
    await stubMapboxNetwork(context);
    await page.addInitScript(() => {
      (window as { __SCENE_DEBUG__?: boolean }).__SCENE_DEBUG__ =
        true;
    });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'live',
    );

    const seen = await page.evaluate(async () => {
      type Handle = {
        styleStatus: () => string;
        appliedLut: () => string | null;
        errors: () => string[];
        lastAction: () => string;
      };
      const handle = (window as { __SCENE__?: Handle }).__SCENE__;
      if (!handle) return null;
      // Give the style a moment to settle before reading it.
      await new Promise((done) => {
        setTimeout(done, 1_500);
      });
      return {
        status: handle.styleStatus(),
        lut: handle.appliedLut()?.slice(0, 16) ?? null,
        errors: handle.errors(),
        lastAction: handle.lastAction(),
      };
    });

    expect(seen).not.toBeNull();
    expect(seen?.status).toBe('ready');
    // The LUT the scene handed to the map's colour-theme API, read from
    // the scene rather than inferred from how mapbox decodes it. WHICH
    // call it made, and which scope ended up wearing it, is
    // e2e/hermetic/basemap-theme.spec.ts's -- that distinction is the
    // whole of the bug this one cannot see.
    expect(seen?.lut).toMatch(/^[A-Za-z0-9+/]+$/);
    expect(seen?.lastAction).not.toBe('none');
    // Nothing should have gone wrong. If the real Mapbox ever rejects
    // the LUT or a config key, this is where it will show up.
    expect(seen?.errors).toEqual([]);
  });
});
