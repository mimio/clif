import { expect, test } from '@playwright/test';
import { routes } from 'content/routes';
import { DESKTOP, THEME_IDS, waitForScene } from '../fixtures/app';
import {
  installMapboxGl,
  stubMapboxNetwork,
} from '../fixtures/mapbox-stub';

/*
 * THE THREE NOTCH ITEMS ARE ONE WIDTH, AND THE FOCUS RING IS ONE SHAPE.
 *
 * "please make sure all altimeter items become the width of their widest
 * member and allow for consistently shaped focus rings please, currently
 * focus rings for altimiter items are jagged and each member is of a
 * different width, they need to be rectangular and consistent width"
 *
 * The two complaints are the same complaint. Each item was a shrink-to-fit
 * flex box -- label, 6px gap, 34px glyph -- pinned by its RIGHT edge, so
 * its width was whatever its own label happened to measure: `hello` and
 * `about` are five characters, `projects` is eight, and at 14px Roboto Mono
 * that is a 26px spread. The focus indicator was the UA ring, which draws
 * around whatever box it is given, so three different boxes gave three
 * different rings stacked 40px apart -- the "jagged" edge.
 *
 * So this spec measures BOXES, never classes:
 *
 *   WIDTH   the three getBoundingClientRect().width values are EXACTLY
 *           equal (tolerance 0, they are one computed width) and equal to
 *           the widest label's natural box.
 *   RING    each item is focused with a real Tab press and the ring's own
 *           rectangle -- the border box grown by outline-offset plus
 *           outline-width -- is measured. Same size on all three, square
 *           corners, and actually drawn (a ring with no style or no width
 *           is not a ring).
 *   BOX     the rail's own element is still exactly ALTIMETER_SIZE square
 *           and still pinned 48px from the top and right, and no item
 *           reaches outside the viewport. See the note on the left-hand
 *           overhang below -- it is unchanged by this fix, by construction.
 *   THEMES  the ring is painted in a colour that separates from the ground
 *           in all eight themes, the two light ones included.
 */

/**
 * Altimeter.tsx's ALTIMETER_SIZE, and ChromeRoot.tsx's desktop pin.
 *
 * Hand-copied rather than imported: everything else in e2e/ imports plain
 * TS leaves (content/routes below, styles/theme-bootstrap through the
 * fixtures), and reaching into a .tsx would drag React and the scene into
 * the Playwright runner for two integers. The copies cannot drift
 * silently -- they are asserted against the rendered element here.
 */
const ALTIMETER_SIZE = 120;
const PIN = 48;

/**
 * The notch pitch, which is also the budget for the ring's total height:
 * a ring taller than this would cross into the neighbouring row.
 */
const NOTCH_PITCH = 40;

type ItemBox = {
  route: string;
  width: number;
  height: number;
  left: number;
  right: number;
};

type RingBox = {
  route: string;
  /** The border box grown by the ring's offset and width. */
  width: number;
  height: number;
  outlineWidth: number;
  outlineOffset: number;
  outlineStyle: string;
  outlineColor: string;
  /** All four corners, so "rectangular" is a measurement. */
  radii: string[];
};

const RAIL = 'nav[aria-label="Sections"]';

const readItems = (
  page: import('@playwright/test').Page,
): Promise<ItemBox[]> =>
  page.evaluate(
    (rail) =>
      [
        ...document.querySelectorAll<HTMLElement>(
          `${rail} [data-route]`,
        ),
      ].map((element) => {
        const box = element.getBoundingClientRect();
        return {
          route: element.dataset.route ?? '',
          width: box.width,
          height: box.height,
          left: box.left,
          right: box.right,
        };
      }),
    RAIL,
  );

/**
 * Tabs until the focused element is the named item, then measures the ring
 * it is wearing. Real keyboard input, because `:focus-visible` is exactly
 * the distinction between a Tab and a click and `element.focus()` would
 * not tell us which one the app answers.
 */
const tabToRing = async (
  page: import('@playwright/test').Page,
  route: string,
): Promise<RingBox> => {
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });

  for (let press = 0; press < 60; press += 1) {
    await page.keyboard.press('Tab');
    const found = await page.evaluate(
      (id) =>
        document.activeElement?.getAttribute('data-route') === id,
      route,
    );
    if (found) {
      return page.evaluate(() => {
        const element = document.activeElement as HTMLElement;
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        const grow =
          parseFloat(style.outlineOffset) +
          parseFloat(style.outlineWidth);
        return {
          route: element.dataset.route ?? '',
          width: box.width + grow * 2,
          height: box.height + grow * 2,
          outlineWidth: parseFloat(style.outlineWidth),
          outlineOffset: parseFloat(style.outlineOffset),
          outlineStyle: style.outlineStyle,
          outlineColor: style.outlineColor,
          radii: [
            style.borderTopLeftRadius,
            style.borderTopRightRadius,
            style.borderBottomRightRadius,
            style.borderBottomLeftRadius,
          ],
        };
      });
    }
  }

  throw new Error(`Tab never reached the ${route} notch`);
};

/**
 * sRGB channels out of either notation the token files use: computed
 * styles come back as `rgb(r, g, b)`, but a raw custom property is
 * whatever was typed, and the two light grounds are typed as hex.
 */
const channels = (color: string): number[] => {
  const hex = color.trim().match(/^#([\da-f]{6})$/i);
  if (hex !== null) {
    return [0, 2, 4].map((at) =>
      parseInt(hex[1].slice(at, at + 2), 16),
    );
  }
  return (color.match(/[\d.]+/g) ?? ['0', '0', '0'])
    .slice(0, 3)
    .map(Number);
};

/** WCAG relative luminance. */
const luminance = (color: string): number => {
  const [red, green, blue] = channels(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const contrast = (one: string, two: string): number => {
  const [dark, light] = [luminance(one), luminance(two)].sort(
    (a, b) => a - b,
  );
  return (light + 0.05) / (dark + 0.05);
};

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installMapboxGl(page);
  await page.setViewportSize(DESKTOP);
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);
});

test('every notch item is the width of the widest label', async ({
  page,
}) => {
  const items = await readItems(page);
  expect(items.map((item) => item.route)).toEqual(
    routes.map((route) => route.id),
  );

  // Reported on failure as well as on success, because the numbers are
  // the point of the spec.
  const widths = items.map((item) => item.width);
  test.info().annotations.push({
    type: 'item widths',
    description: items
      .map((item) => `${item.route}=${item.width.toFixed(3)}`)
      .join(' '),
  });

  // EXACTLY equal. Tolerance zero: the three boxes resolve one shared
  // width expression, so any difference at all is the bug coming back.
  expect(new Set(widths).size).toBe(1);

  /*
   * ...and equal to the box the LONGEST label needs, not to some number
   * that merely happens to be shared. A stray `width: 40px` would satisfy
   * the check above while truncating `projects`, so the label cell is
   * measured against its own text: the cell must hold the text it carries.
   */
  const fits = await page.evaluate(
    (rail) =>
      [
        ...document.querySelectorAll<HTMLElement>(
          `${rail} [data-route] > span:first-child`,
        ),
      ].map((label) => ({
        text: label.textContent ?? '',
        client: label.clientWidth,
        scroll: label.scrollWidth,
      })),
    RAIL,
  );

  for (const label of fits) {
    expect(
      label.scroll,
      `${label.text} overflows its cell`,
    ).toBeLessThanOrEqual(label.client);
  }

  // The widest label's own text really does fill the shared cell, so the
  // width is derived from it rather than padded past it.
  const longest = fits.reduce((widest, label) =>
    label.text.length > widest.text.length ? label : widest,
  );
  expect(longest.scroll).toBeGreaterThan(longest.client - 2);
});

test('the focus ring is one rectangle on all three items', async ({
  page,
}) => {
  const rings: RingBox[] = [];
  for (const route of routes) {
    rings.push(await tabToRing(page, route.id));
  }

  test.info().annotations.push({
    type: 'ring boxes',
    description: rings
      .map(
        (ring) =>
          `${ring.route}=${ring.width.toFixed(3)}x${ring.height.toFixed(
            3,
          )}`,
      )
      .join(' '),
  });

  for (const ring of rings) {
    // Drawn at all.
    expect(ring.outlineStyle, ring.route).not.toBe('none');
    expect(ring.outlineWidth, ring.route).toBeGreaterThan(0);
    // Rectangular: four square corners, so the ring cannot round or
    // follow a shape of its own.
    expect(ring.radii, ring.route).toEqual([
      '0px',
      '0px',
      '0px',
      '0px',
    ]);
    // ...and `auto` is the UA ring, which draws its own shape and its own
    // colour and is the thing being replaced.
    expect(ring.outlineStyle, ring.route).not.toBe('auto');
    // It must not reach into the row above or below.
    expect(ring.height, ring.route).toBeLessThanOrEqual(NOTCH_PITCH);
  }

  expect(new Set(rings.map((ring) => ring.width)).size).toBe(1);
  expect(new Set(rings.map((ring) => ring.height)).size).toBe(1);
  expect(new Set(rings.map((ring) => ring.outlineColor)).size).toBe(
    1,
  );
});

test('the rail keeps its declared box and stays on screen', async ({
  page,
}) => {
  const rail = await page.evaluate((selector) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element === null) return null;
    const box = element.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      top: box.top,
      rightGap: window.innerWidth - box.right,
    };
  }, RAIL);

  expect(rail).not.toBeNull();
  expect(rail?.width).toBe(ALTIMETER_SIZE);
  expect(rail?.height).toBe(ALTIMETER_SIZE);
  expect(rail?.top).toBe(PIN);
  expect(rail?.rightGap).toBe(PIN);

  /*
   * THE LEFT-HAND OVERHANG, STATED RATHER THAN ASSERTED AWAY.
   *
   * The items are pinned by their right edge 14px inside the rail and run
   * leftward, so the widest one has always reached a few px past the
   * rail's own 120px box -- that is how the rail was drawn before this
   * fix and equalising the widths does not move it, because every item
   * now measures exactly what the widest one already measured. What must
   * hold is that nothing leaves the VIEWPORT and the page does not
   * scroll sideways.
   */
  const items = await readItems(page);
  for (const item of items) {
    expect(item.left, item.route).toBeGreaterThan(0);
    expect(item.right, item.route).toBeLessThanOrEqual(DESKTOP.width);
  }

  const document_ = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(document_.scrollWidth).toBeLessThanOrEqual(
    document_.clientWidth,
  );
});

test('the focus ring separates from the ground in all eight themes', async ({
  page,
}) => {
  const ring = await tabToRing(page, routes[0].id);
  expect(ring.outlineStyle).not.toBe('none');

  for (const theme of THEME_IDS) {
    /*
     * The TOKENS rather than a painted background: `body` crossfades its
     * background-color over 400ms (styles/tokens/themes.css), so a read
     * taken straight after the scope changes is the colour the theme is
     * leaving, not the one it is arriving at. The outline colour itself
     * has no transition on it and is read from the focused element.
     *
     * Both grounds are checked because the rail has no plate of its own:
     * --map-land is what is actually behind it on a loaded route, and
     * --surface-ground is what is behind it before the map paints.
     */
    const measured = await page.evaluate((id) => {
      document.documentElement.dataset.theme = id;
      const root = getComputedStyle(document.documentElement);
      return {
        outline: getComputedStyle(
          document.activeElement as HTMLElement,
        ).outlineColor,
        ground: root.getPropertyValue('--surface-ground'),
        land: root.getPropertyValue('--map-land'),
      };
    }, theme);

    // 3:1 is the WCAG 1.4.11 floor for a non-text indicator.
    for (const behind of [measured.ground, measured.land]) {
      expect(
        contrast(measured.outline, behind),
        `${theme}: ${measured.outline} on ${behind}`,
      ).toBeGreaterThanOrEqual(3);
    }
  }
});
