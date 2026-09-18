import { expect, test } from '@playwright/test';
import {
  ARTBOARD_DESKTOP,
  cameras,
  fogPresets,
} from 'content/cameras';
import { globeLimbAngle } from 'scene/globe';
import { horizonBlendFor } from 'scene/theme';
import { parseRgb, type Rgb } from 'styles/tokens/palette';
import {
  DESKTOP,
  installBasemapOnly,
  installSceneDebug,
  openThemeLens,
  samplePixels,
  showBasemapOnly,
  themeOption,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * HOW MUCH LIGHT COMES OUT FROM BEHIND THE GLOBE.
 *
 * This is the one thing in the repository that LOOKS at the atmosphere,
 * and it can, in tier 1, for a reason that is worth stating because the
 * rest of the suite's design assumes the opposite.
 *
 * mapbox's globe glow needs NO TILES. `drawAtmosphereGlow` is a
 * full-screen pass driven entirely by the fog properties and the
 * transform -- see `atmosphereFrag` in mapbox-gl's dist bundle -- so it
 * paints identically over a stubbed style and over the real basemap. The
 * only thing tier 1 cannot show is what is INSIDE the limb. Everything
 * this file samples is outside it.
 *
 * So these tests run the REAL mapbox-gl over stubMapboxNetwork (no
 * __MAPBOX_STUB__), against a real ANGLE/SwiftShader context, and measure
 * the composited frame. What they assert is the thing the design is
 * specific about and the shipped fog was not:
 *
 *   the prototype paints flat P.space past 1.34 globe radii.
 *
 * The scene used to send a constant horizon-blend of 0.04, whose glow was
 * still measurable at 1.50r on this frame -- and at 1.85r on 1f's mobile
 * one, because mapbox's falloff is angular while the design's reach is in
 * radii. A sample past 1.4r is therefore an over-glow detector and
 * nothing else.
 */

/** Where the hello globe is on the artboard, and how big. */
const CENTRE = {
  x: ARTBOARD_DESKTOP.width * 0.66,
  y: ARTBOARD_DESKTOP.height * 0.5,
};
const RADIUS = ARTBOARD_DESKTOP.height * 0.44;

/**
 * A fallback no token can produce, so a parse that fell through to it is
 * visible as a failure rather than as a passing comparison against junk.
 */
const MISSING: Rgb = [-1, -1, -1];

/**
 * A box on the ray LEFT of the globe's centre, `dd` radii out.
 *
 * Left because the globe is pushed to 66% of the width, so the right has
 * only 1.23 radii of room before the viewport ends. The glow is isotropic
 * about the centre -- it is a function of the angle from it and nothing
 * else -- so the direction is free.
 */
const boxAt = (dd: number, size = 24) => ({
  x: Math.round(CENTRE.x - RADIUS * dd - size / 2),
  y: Math.round(CENTRE.y - size / 2),
  width: size,
  height: size,
});

const open = async (
  context: Parameters<typeof stubMapboxNetwork>[0],
  page: Parameters<typeof installSceneDebug>[0],
) => {
  await stubMapboxNetwork(context);
  await installSceneDebug(page);
  await page.setViewportSize(DESKTOP);
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);
  await installBasemapOnly(page);
  // The style, the first fog and the first frame.
  await page.waitForTimeout(1_500);
};

test.describe('the globe atmosphere', () => {
  test('is flat space past the design reach, and a rim at the limb', async ({
    context,
    page,
  }) => {
    await open(context, page);
    // The chrome and the type are painted over the map; hide them or
    // this samples them instead.
    await showBasemapOnly(page, true);

    // The tokens are authored as hex, so this is the app's own parser
    // rather than a regex that would read `#161616` as the number 161616.
    const ground = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--surface-ground')
        .trim(),
    );
    const [r, g, b] = parseRgb(ground, MISSING);

    /*
     * FAR FIELD. 1.45 radii out is past the design's hard edge at 1.34
     * with room to spare, and it is where the old constant blend still
     * put measurable glow. Two levels of tolerance covers the 8-bit
     * rounding of the fog's own space colour and nothing else.
     */
    const far = await samplePixels(page, boxAt(1.45));
    expect(far.pixels).toBeGreaterThan(0);
    /*
     * A level and a half. Measured against the real mapbox-gl at this
     * frame, the design's fog leaves 0.34 of a level of accent here; the
     * constant blend that shipped left the far field at rgb(20, 20, 19)
     * against a ground of rgb(22, 22, 22) -- two to three levels out,
     * partly glow and partly the 0.9-shaded space colour that went with
     * it. So this separates them, and it is the design's own claim: past
     * 1.34r the prototype paints P.space and nothing else.
     */
    const SLACK = 1.5;
    expect(
      Math.abs(far.red - r),
      `still lit 1.45 radii out: red ${far.red.toFixed(2)} against a ground of ${r}`,
    ).toBeLessThanOrEqual(SLACK);
    expect(Math.abs(far.green - g)).toBeLessThanOrEqual(SLACK);
    expect(Math.abs(far.blue - b)).toBeLessThanOrEqual(SLACK);

    /*
     * THE RIM IS STILL THERE. Removing the bloom is only half of it: the
     * design's limb is 0.2 of `accent` over 0.104 of `accent2`, which on
     * every shipped theme is a good deal warmer and brighter than the
     * ground. A fog that had simply been turned off would pass the
     * assertion above and fail this one.
     */
    const rim = await samplePixels(page, boxAt(1.04, 12));
    test.info().annotations.push({
      type: 'atmosphere',
      description:
        `ground ${ground} — 1.04r rgb(${rim.red.toFixed(1)}, ` +
        `${rim.green.toFixed(1)}, ${rim.blue.toFixed(1)}), ` +
        `1.45r rgb(${far.red.toFixed(1)}, ${far.green.toFixed(1)}, ` +
        `${far.blue.toFixed(1)})`,
    });
    // The design puts about 42 levels of red here on the default theme.
    // The constant blend put about 11, because its rim was the fog's own
    // near-black `color` and its only warmth was a fifth of a yellow
    // smeared from 1.0r to 1.5r. Twenty separates the two cleanly.
    expect(rim.red).toBeGreaterThan(far.red + 20);
    expect(rim.opponency).toBeGreaterThan(far.opponency + 20);
  });

  test('sends mapbox the fog the design and the theme resolve to', async ({
    context,
    page,
  }) => {
    await open(context, page);

    const read = () =>
      page.evaluate(() => {
        const scene = window.__SCENE__;
        if (!scene) throw new Error('no scene handle');
        const fog = scene.map.getFog() as Record<string, unknown>;
        const css = getComputedStyle(document.documentElement);
        return {
          fog,
          accent: css.getPropertyValue('--clif-accent').trim(),
          accent2: css.getPropertyValue('--clif-accent-2').trim(),
          ground: css.getPropertyValue('--surface-ground').trim(),
        };
      });

    /** The channels and the alpha out of an `rgba(r, g, b, a)` string. */
    const numbers = (value: string): number[] =>
      (value.match(/-?[\d.]+/g) ?? []).map(Number);

    const check = (seen: Awaited<ReturnType<typeof read>>) => {
      // Hex tokens, so the app's parser -- see the note in the test above.
      const accent = parseRgb(seen.accent, MISSING);
      const accent2 = parseRgb(seen.accent2, MISSING);
      const ground = parseRgb(seen.ground, MISSING);
      expect(accent).not.toEqual(MISSING);
      // The rim colours ARE the theme's two accents, at the prototype's
      // two peak alphas. Nothing here is a fixed yellow any more.
      expect(numbers(String(seen.fog.color))).toEqual([
        ...accent,
        0.2,
      ]);
      expect(numbers(String(seen.fog['high-color']))).toEqual([
        ...accent2,
        0.13,
      ]);
      // And past the halo, the ground token itself.
      expect(numbers(String(seen.fog['space-color']))).toEqual([
        ...ground,
      ]);
      // Solved against this camera's globe, not a constant.
      expect(seen.fog['horizon-blend']).toBeCloseTo(
        horizonBlendFor(
          fogPresets.space,
          globeLimbAngle(cameras.hello.zoom, DESKTOP.height),
        ),
        4,
      );
    };

    const first = await read();
    check(first);

    // Now move the theme and read it again: the fog has to follow. The
    // lens lives in the chrome, which is why nothing is hidden here.
    const panel = await openThemeLens(page);
    await themeOption(panel, 'teal').click();
    await page.waitForTimeout(1_500);
    const second = await read();
    check(second);
    expect(second.fog.color).not.toBe(first.fog.color);
  });
});
