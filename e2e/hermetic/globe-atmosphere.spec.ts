import { expect, test } from '@playwright/test';
import { cameras, fogPresets } from 'content/cameras';
import { globeLimbAngle } from 'scene/globe';
import { horizonBlendFor } from 'scene/theme';
import { parseRgb, type Rgb } from 'styles/tokens/palette';
import {
  describeProfile,
  DESKTOP,
  installBasemapOnly,
  installSceneDebug,
  measureGlobe,
  notice,
  openThemeLens,
  sampleRadial,
  showBasemapOnly,
  themeOption,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * WHAT TIER 1 CAN AND CANNOT SAY ABOUT THE ATMOSPHERE.
 *
 * It can say a great deal, and the reason is worth stating because the
 * rest of the suite's design assumes the opposite. mapbox's globe glow
 * needs NO TILES: `drawAtmosphereGlow` is a full-screen pass whose only
 * inputs are the fog properties and the transform -- see `atmosphereFrag`
 * in mapbox-gl's dist bundle -- so the REAL library over a stubbed style,
 * against a real ANGLE/SwiftShader context, paints the fog's own
 * contribution exactly as it will over Mapbox Standard.
 *
 * WHAT IT CANNOT SAY, written down because an earlier version of this
 * file claimed the opposite and a reviewer believed it.
 *
 * "The fog's own contribution" is not "the frame". This file said the
 * atmosphere "paints identically over a stubbed style and over the real
 * basemap", and e2e/review/scene.spec.ts's assertion then found the far
 * field sixteen levels of red hotter on the first real preview than tier
 * 1 had measured. Two things were wrong with the claim:
 *
 *   THE COMPOSITE IS NOT THE PASS. Mapbox Standard is not the two-layer
 *   stub. Anything else it draws in the space region -- and it carries
 *   its own fog, its own lights, and a layer table this repository has
 *   only ever seen through e2e/review/cartography.spec.ts -- lands in the
 *   same pixels. Tier 1 has none of it, so tier 1 cannot rule it out.
 *
 *   A SAMPLE IS ONLY AS GOOD AS ITS GEOMETRY. Both tiers used to locate
 *   the sample from the artboard's ratios rather than from the running
 *   page. Sixteen levels is not what any atmosphere leaves at 1.45r; it
 *   is roughly what the globe's own limb region reads. Neither tier could
 *   have told those apart.
 *
 * So: this file measures the sphere with `measureGlobe` and samples rings
 * outward from it, which is the same instrument the review tier now uses,
 * and its claim is the narrow one -- THE FOG THE SCENE SENDS PRODUCES
 * THIS PROFILE. Whether the deployed page shows that profile is
 * e2e/review/scene.spec.ts's to answer, and it is the authority.
 */

/**
 * A fallback no token can produce, so a parse that fell through to it is
 * visible as a failure rather than as a passing comparison against junk.
 */
const MISSING: Rgb = [-1, -1, -1];

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
    expect([r, g, b]).not.toEqual(MISSING);

    const framing = await measureGlobe(page);
    /*
     * The frame is 1a's, and globe-frame.spec.ts is what proves that in
     * detail. It is re-checked here only so that a failure below says
     * whether it is the atmosphere or the geometry that moved -- which is
     * exactly the question this file could not answer before.
     */
    expect(framing.radius).toBeGreaterThan(
      DESKTOP.height * 0.44 * 0.98,
    );
    expect(framing.radius).toBeLessThan(DESKTOP.height * 0.44 * 1.02);

    const rings = await sampleRadial(
      page,
      framing,
      [1.02, 1.08, 1.2, 1.34, 1.45, 1.6],
    );
    // Also a `::notice::`, so the profile is in the run log and, if this
    // tier ever runs in CI, in an annotation -- which is the only reading
    // anyone outside a runner gets. e2e/fixtures/app.ts says why.
    notice(
      'atmosphere (tier 1, stub style)',
      `ground ${ground} — ${describeProfile(rings)}`,
    );
    test.info().annotations.push({
      type: 'atmosphere',
      description: `ground ${ground} — ${describeProfile(rings)}`,
    });

    const at = (dd: number) => {
      const found = rings.find((one) => one.dd === dd);
      if (!found) throw new Error(`no ring measured at ${dd}`);
      return found;
    };

    const far = at(1.45);
    expect(far.boxes).toBeGreaterThan(3);
    /*
     * A level and a half. Measured against the real mapbox-gl at this
     * frame, the design's fog leaves 0.34 of a level of accent here; the
     * constant blend that shipped before left the far field at
     * rgb(20, 20, 19) against a ground of rgb(22, 22, 22) -- partly glow,
     * partly the 0.9-shaded space colour that went with it. So this
     * separates them, and it is the design's own claim: past 1.34r the
     * prototype paints P.space and nothing else.
     */
    const SLACK = 1.5;
    expect(
      Math.abs(far.red - r),
      `still lit 1.45 radii out: ${describeProfile(rings)}`,
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
    const rim = at(1.02);
    expect(rim.red).toBeGreaterThan(far.red + 20);
    expect(rim.red - rim.blue).toBeGreaterThan(
      far.red - far.blue + 20,
    );
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

    await page.waitForTimeout(1_500);
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
