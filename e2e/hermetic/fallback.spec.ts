import { chromium, expect, test } from '@playwright/test';
import { collectProblems, waitForScene } from '../fixtures/app';
import {
  installMapboxGl,
  readStub,
  stubMapboxNetwork,
} from '../fixtures/mapbox-stub';

/*
 * The two ways this app is allowed to degrade, and neither of them may be
 * a blank screen.
 *
 * THE SCENE'S PLATE. SceneRoot shows the same static plate for a map it
 * could not build and for a stylesheet that never arrived, and reaches it
 * through one state: 'fallback'. The stylesheet path is the one a test can
 * drive, because NEXT_PUBLIC_MAPBOX_TOKEN is inlined into the client
 * bundle at build time -- there is no runtime switch that makes a built
 * app token-less, and a second production build to get one would cost
 * minutes per PR to reach the same setState. So the stub fails the style,
 * exactly as a token that cannot fetch it does, and the assertion is on
 * the plate itself.
 *
 * THE SHADER'S IMAGE. GlitchImage catches its own WebGL failure and
 * renders the plain next/image instead. It cannot be provoked by stubbing
 * anything -- three.js asks the browser for a context -- so this launches a
 * second browser with WebGL off, which is what scripts/smoke.mts did
 * before it was demolished.
 */

test.describe('the scene falls back to its plate', () => {
  test('when the stylesheet never arrives', async ({
    context,
    page,
  }) => {
    await stubMapboxNetwork(context);
    await installMapboxGl(page, { style: 'fail' });
    const problems = collectProblems(page);

    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'fallback');

    const plate = page.locator('[data-testid="scene-fallback"]');
    await expect(plate).toBeAttached();
    // It is behind the foreground and cannot eat a click: z-index -1 and
    // pointer-events none are load-bearing, not decoration.
    expect(
      await plate.evaluate((node) => {
        const style = window.getComputedStyle(node);
        return {
          z: style.zIndex,
          pointer: style.pointerEvents,
        };
      }),
    ).toEqual({ z: '-1', pointer: 'none' });

    // The foreground is untouched either way -- that is the claim the
    // plate exists to keep.
    await expect(page.locator('main')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Sections' }),
    ).toBeVisible();

    const record = await readStub(page);
    // A failed stylesheet means the style-guarded calls are still waiting,
    // not that they were made and threw.
    expect(record.styleLoaded).toBe(false);
    expect(record.colorTheme).toEqual([]);
    expect(problems).toEqual([]);
  });
});

test('the shader falls back to the plain image without WebGL', async () => {
  const project = test.info().project;
  const baseURL = project.use.baseURL;
  expect(baseURL, 'the hermetic project has a baseURL').toBeTruthy();

  /*
   * A second browser, because WebGL is decided at launch. The GL args the
   * project uses are deliberately NOT passed: --disable-webgl is the whole
   * point. executablePath is whatever the project resolved, so a sandbox
   * with a pre-installed Chromium and a CI runner with its own download
   * both work and neither is written down here.
   */
  const browser = await chromium.launch({
    args: ['--disable-webgl', '--disable-webgl2'],
    executablePath: project.use.launchOptions?.executablePath,
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await stubMapboxNetwork(context);
    await installMapboxGl(page);
    // three.js logs its own context failure here, and GlitchImage logs
    // the warning it answers with. Both are the expected path.
    const problems = collectProblems(page, {
      allowWebglErrors: true,
    });

    await page.goto(`${baseURL}/projects/haikumi`, {
      waitUntil: 'load',
    });
    await waitForScene(page);

    const plane = page.locator('figure[data-src]');
    await expect(plane).toBeVisible();
    // The image, not the canvas: the fallback is a next/image carrying the
    // project's title as its alt text.
    const image = plane.locator('img[alt]');
    await expect(image).toBeVisible();
    expect(await image.getAttribute('alt')).not.toBe('');
    await expect(plane.locator('canvas')).toHaveCount(0);

    // No dialog, and nothing the page could not survive.
    expect(problems).toEqual([]);
    await context.close();
  } finally {
    await browser.close();
  }
});
