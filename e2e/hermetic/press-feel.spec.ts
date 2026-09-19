import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';
import { BUTTON_SIZES } from 'components/primitives/Button/sizes';
import {
  installMapboxGl,
  stubMapboxNetwork,
} from '../fixtures/mapbox-stub';

/*
 * HOW MUCH OF THE PRESS A CLICK ACTUALLY RENDERS.
 *
 * press-state.spec.ts proves the press state EXISTS: on the frame the
 * pointer goes down, --k-y is the skirt and --k-ink is the accent. That was
 * the answer to a cascade bug, and it was the right answer -- but the user
 * came back with "there still isnt a perceived active state for my
 * eyeballs", and they were right too, because a state that exists in the
 * computed style is not the same thing as a state the screen ever shows.
 *
 * WHAT WAS ACTUALLY WRONG. The state variables do not interpolate -- they
 * are unregistered custom properties, so they flip whole. Everything they
 * FEED does interpolate, and it did so on the same easings the cap uses to
 * settle into hover: transform and box-shadow over 70ms, color and
 * background over 160ms, and the glyph's scale over 240ms of back-out
 * overshoot that passes its target before settling. A click is shorter than
 * all three. Worse, a CSS transition is not created until the style
 * recalculation that follows the pointerdown, so the first frames of the
 * press render the HOVER values unchanged.
 *
 * Measured here against the pre-fix build, on the hello route, from a
 * settled hover, with trusted input -- peak fraction of the way from the
 * hovered value to the pressed one, over the frames the pointer was down:
 *
 *              hold 50ms     hold 72ms     hold 111ms
 *   travel        0.00          0.58          1.00
 *   ink           0.00          0.32          0.59
 *   glyph         0.00          0.53          0.87
 *
 * The 50ms column is the whole complaint in three numbers. It is not that
 * the press was subtle; it is that for a click of ordinary length NOTHING
 * MOVED AT ALL before the pointer came back up and all three reversed.
 *
 * THE FIX, and therefore what this file asserts: the press is immediate on
 * the way in and eased on the way out. keycap.ts's PRESS declares
 * --k-move, --k-hue and --g-move as 0s, so the down state is simply the
 * computed style on the frame the pointer lands; the release leaves those
 * variables to their 70/160/240ms fallbacks, so the cap still rises on the
 * prototype's easing rather than snapping. Both halves are asserted below,
 * because "immediate" alone would also describe a cap with no transition at
 * all, and that is a different, worse button.
 *
 * WHY THE NUMBERS ARE FRACTIONS AND NOT MILLISECONDS. This suite drives
 * Chromium over SwiftShader with a live WebGL globe on the page and the
 * measured frame cadence swings between roughly 20ms and 250ms. A
 * millisecond budget would be measuring the rasteriser. A fraction of the
 * design's own press values is a claim about the rendering and nothing
 * else, and it is read off the frames the browser really produced.
 */

/**
 * THE BAR, AND WHY IT IS NINE TENTHS.
 *
 * Not 1.0, which would be asserting that a float came back bit-exact
 * through a DOMMatrix and an rgb() round trip. Not a half, which is the
 * number the old build could already hit on a slow click and is precisely
 * the "caught mid-flight" look that reads as nothing happening.
 *
 * Nine tenths is where the remainder stops being visible. The md cap
 * travels 4.5px from the hovered lift (-1px) to the pressed skirt
 * (+3.5px), so 0.9 of it leaves under half a pixel on the table -- the cap
 * is on its skirt, not on its way to it. For the ink, 0.9 of the distance
 * from the hot white to the accent leaves a colour the eye reads as the
 * accent. Both are floors, and the fix clears them outright: every
 * measurement below comes back at 1.00, on the first frame after the
 * pointerdown, at every hold length down to 25ms.
 *
 * Against the pre-fix build the same assertion fails on the ink at any
 * hold (0.59 at 111ms) and on all three at a fast one.
 */
const RENDERED = 0.9;

/** A click, held for about as long as a person holds one. */
const HOLD_MS = 100;

/**
 * The ceiling on what still counts as a click. waitForTimeout overshoots by
 * a few tens of milliseconds on a loaded runner, which is fine; a hold that
 * ran to a third of a second would be a press-and-HOLD, and this file would
 * be proving something easier than it claims.
 */
const HOLD_CEILING_MS = 300;

/** The travel: md's cap falls exactly its own 3.5px skirt. */
const PRESS_Y = BUTTON_SIZES.md.skirt;

/** The hover lift the press starts from, because a mouse hovers first. */
const HOVER_Y = -1;

/** Keycap.dc.html's style-hover / style-active: --g-mul 1.30 -> 1.22. */
const HOVER_MUL = 1.3;
const PRESS_MUL = 1.22;

/** keycap.ts's TRANSITION and Glyph's spring, on the way back out. */
const RELEASE_MOVE_MS = 70;
const RELEASE_SPRING_MS = 240;

type Sample = {
  t: number;
  y: number;
  color: string;
  scale: number;
};

type Trace = {
  down: number | null;
  up: number | null;
  samples: Sample[];
  done: boolean;
};

declare global {
  interface Window {
    __feelTrace?: Trace;
  }
}

const plateOf = (cap: Locator): Locator =>
  cap.locator('.clif-button-inner');

const sculptureIn = (cap: Locator): Locator =>
  cap.locator('[data-slot="glyph"] [data-glyph]');

/** Waits for the element's own transitions, then a frame to commit them. */
const settle = async (target: Locator): Promise<void> => {
  await target.evaluate(
    (el: Element) =>
      new Promise<void>((resolve) => {
        const frame = (fn: () => void) => requestAnimationFrame(fn);
        frame(() =>
          frame(() => {
            void Promise.allSettled(
              el
                .getAnimations()
                .map((animation) => animation.finished),
            ).then(() => frame(() => resolve()));
          }),
        );
      }),
  );
};

/** Parks the pointer well away from anything interactive. */
const park = async (page: Page): Promise<void> => {
  await page.mouse.move(2, 2);
};

/** Moves the trusted pointer onto the middle of an element. */
const pointerOnto = async (
  page: Page,
  target: Locator,
): Promise<void> => {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (box === null) throw new Error('the target has no box');
  await page.mouse.move(
    box.x + box.width / 2,
    box.y + box.height / 2,
  );
};

/** The three channels of an rgb()/rgba() string. */
const channels = (value: string): number[] => {
  const found = value.match(/[\d.]+/g);
  if (found === null) throw new Error(`not a colour: ${value}`);
  return found.slice(0, 3).map(Number);
};

/**
 * How far `at` has travelled from `from` towards `to`, as the projection
 * onto the line between them. A scalar ratio per channel would divide by
 * zero on white -> accent, whose red channel does not move at all.
 */
const along = (
  from: number[],
  to: number[],
  at: number[],
): number => {
  const span = to.reduce(
    (sum, value, index) => sum + (value - from[index]) ** 2,
    0,
  );
  if (span === 0) throw new Error('the two colours are the same');
  return (
    at.reduce(
      (sum, value, index) =>
        sum + (value - from[index]) * (to[index] - from[index]),
      0,
    ) / span
  );
};

/** A colour token resolved the way the browser would paint it. */
const resolve = async (page: Page, token: string): Promise<string> =>
  page.evaluate((value: string) => {
    const probe = document.createElement('div');
    probe.style.color = value;
    document.body.append(probe);
    const painted = getComputedStyle(probe).color;
    probe.remove();
    return painted;
  }, token);

/**
 * Arms a per-frame recorder on the cap, reading the plate's travel and ink
 * and the sculpture's scale every animation frame, and stamping the trusted
 * pointerdown and pointerup against the same clock.
 *
 * getComputedStyle inside the rAF callback forces that frame's style
 * recalculation, so a sample is never a frame behind the state it reports.
 * The click is swallowed at the window's capture phase because hello's caps
 * are links and a navigation would take the recorder with it.
 */
const arm = async (cap: Locator): Promise<void> => {
  await cap.evaluate((root: Element) => {
    const plate = root.querySelector('.clif-button-inner');
    const glyph = root.querySelector(
      '[data-slot="glyph"] [data-glyph]',
    );
    if (plate === null || glyph === null)
      throw new Error('the cap has no plate or no glyph');

    const trace: Trace = {
      down: null,
      up: null,
      samples: [],
      done: false,
    };
    window.__feelTrace = trace;

    window.addEventListener(
      'click',
      (event: Event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true,
    );
    root.addEventListener(
      'pointerdown',
      () => {
        trace.down = performance.now();
      },
      { once: true },
    );
    root.addEventListener(
      'pointerup',
      () => {
        trace.up = performance.now();
      },
      { once: true },
    );

    const scaleOf = (el: Element): number => {
      const transform = getComputedStyle(el).transform;
      return transform === 'none'
        ? 1
        : new DOMMatrixReadOnly(transform).a;
    };

    const loop = (): void => {
      const style = getComputedStyle(plate);
      trace.samples.push({
        t: performance.now(),
        y:
          style.transform === 'none'
            ? 0
            : new DOMMatrixReadOnly(style.transform).m42,
        color: style.color,
        scale: scaleOf(glyph),
      });
      const after =
        trace.up === null
          ? 0
          : trace.samples.filter(
              (sample) => sample.t >= (trace.up ?? 0),
            ).length;
      if (after >= 6) trace.done = true;
      else requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
};

/** A trusted click of roughly HOLD_MS, with every frame of it recorded. */
const click = async (page: Page, cap: Locator): Promise<Trace> => {
  await arm(cap);
  await page.mouse.down();
  await page.waitForTimeout(HOLD_MS);
  await page.mouse.up();
  await page.waitForFunction(() => window.__feelTrace?.done === true);
  return page.evaluate(() => window.__feelTrace as Trace);
};

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installMapboxGl(page);
});

/*
 * THE ASSERTION THE USER'S EYES WERE MAKING, on the page they land on.
 *
 * Every number is reported as an annotation whether it passes or fails, so
 * a regression here reads as a measurement rather than as a boolean.
 */
test('a 100ms click renders the whole press while the pointer is down', async ({
  page,
}, testInfo: TestInfo) => {
  await page.goto('/', { waitUntil: 'load' });

  const cap = page
    .locator('[data-variant="keycap"]:has([data-slot="glyph"])')
    .first();
  await expect(cap).toBeVisible();
  const plate = plateOf(cap);
  const glyph = sculptureIn(cap);

  // A mouse hovers before it presses, so the press starts from the lift.
  await park(page);
  await settle(plate);
  await pointerOnto(page, plate);
  await settle(plate);
  await settle(glyph);

  const accent = await resolve(
    page,
    await cap.evaluate((el: Element) =>
      getComputedStyle(el).getPropertyValue('--clif-accent').trim(),
    ),
  );
  const hovered = await plate.evaluate(
    (el: Element) => getComputedStyle(el).color,
  );
  expect(hovered).not.toBe(accent);

  const restScale = BUTTON_SIZES.md.glyph;
  const trace = await click(page, cap);
  expect(trace.down).not.toBeNull();
  expect(trace.up).not.toBeNull();

  const down = trace.down ?? 0;
  const up = trace.up ?? 0;
  const hold = up - down;
  const held = trace.samples.filter(
    (sample) => sample.t >= down && sample.t <= up,
  );

  // It has to have been a click, and it has to have been drawn.
  expect(hold).toBeLessThan(HOLD_CEILING_MS);
  expect(
    held.length,
    'no frame was drawn while the pointer was down',
  ).toBeGreaterThan(0);

  const travel = (sample: Sample): number =>
    (sample.y - HOVER_Y) / (PRESS_Y - HOVER_Y);
  const ink = (sample: Sample): number =>
    along(
      channels(hovered),
      channels(accent),
      channels(sample.color),
    );
  const growth = (sample: Sample): number =>
    (sample.scale - restScale * HOVER_MUL) /
    (restScale * PRESS_MUL - restScale * HOVER_MUL);

  const first = held[0];
  const peak = {
    travel: Math.max(...held.map(travel)),
    ink: Math.max(...held.map(ink)),
    glyph: Math.max(...held.map(growth)),
  };

  testInfo.annotations.push({
    type: 'press',
    description: `hold ${hold.toFixed(0)}ms over ${held.length} frames; first frame +${(first.t - down).toFixed(0)}ms travel ${travel(first).toFixed(2)} ink ${ink(first).toFixed(2)} glyph ${growth(first).toFixed(2)}; peak travel ${peak.travel.toFixed(2)} ink ${peak.ink.toFixed(2)} glyph ${peak.glyph.toFixed(2)}`,
  });

  /*
   * The peak: at some frame the pointer was down for, the cap was down.
   * This is the claim the complaint was about, and against the old build
   * the ink alone fails it at every hold a person produces.
   */
  expect(peak.travel, 'peak rendered travel').toBeGreaterThanOrEqual(
    RENDERED,
  );
  expect(peak.ink, 'peak rendered ink').toBeGreaterThanOrEqual(
    RENDERED,
  );
  expect(
    peak.glyph,
    'peak rendered glyph scale',
  ).toBeGreaterThanOrEqual(RENDERED);

  /*
   * ...and the sharper version, which is what "immediate on the way in"
   * actually means and which no frame cadence can flatter: the FIRST frame
   * drawn after the pointerdown is already there. Against the old build
   * that frame rendered the hover values untouched, at 0.00 on all three,
   * whatever the hold.
   */
  expect(
    travel(first),
    'travel on the first frame after the pointerdown',
  ).toBeGreaterThanOrEqual(RENDERED);
  expect(
    ink(first),
    'ink on the first frame after the pointerdown',
  ).toBeGreaterThanOrEqual(RENDERED);
  expect(
    growth(first),
    'glyph scale on the first frame after the pointerdown',
  ).toBeGreaterThanOrEqual(RENDERED);
});

/*
 * THE OTHER HALF, WHICH IS NOT DECORATION.
 *
 * Collapsing the durations under :active and leaving it there would give a
 * cap that snaps down AND snaps back, which is a worse button than the one
 * that was complained about -- the release is the part of a key press that
 * reads as springy. So the press-in has no transition (the value is simply
 * already correct on the frame the pointer lands) and the release keeps the
 * prototype's own easing: 70ms on the plate, 240ms on the glyph, no delay
 * on either.
 *
 * BOTH READINGS ARE ARMED INSIDE THE PAGE rather than taken after the
 * await, because a CDP round trip costs more than a 70ms transition lasts
 * and the release would be over before a question about it arrived. The
 * pointerdown and pointerup listeners schedule the read themselves, one
 * frame later, so each one lands where it means to.
 */
type Timing = { duration: number; delay: number } | null;
type Pair = { plate: Timing; glyph: Timing; y: number };

declare global {
  interface Window {
    __feelIn?: Promise<Pair>;
    __feelOut?: Promise<Pair>;
  }
}

test('the press-in has no transition to wait for and the release keeps its easing', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });

  const cap = page
    .locator('[data-variant="keycap"]:has([data-slot="glyph"])')
    .first();
  await expect(cap).toBeVisible();
  const plate = plateOf(cap);
  const glyph = sculptureIn(cap);

  await park(page);
  await settle(plate);
  await pointerOnto(page, plate);
  await settle(plate);
  await settle(glyph);

  await cap.evaluate((root: Element) => {
    const plateEl = root.querySelector('.clif-button-inner');
    const glyphEl = root.querySelector(
      '[data-slot="glyph"] [data-glyph]',
    );
    if (plateEl === null || glyphEl === null)
      throw new Error('the cap has no plate or no glyph');

    window.addEventListener(
      'click',
      (event: Event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true,
    );

    const transitionOf = (el: Element): Timing => {
      const found = el
        .getAnimations()
        .find(
          (animation) =>
            (animation as CSSTransition).transitionProperty ===
            'transform',
        );
      const timing = found?.effect?.getTiming();
      return timing === undefined
        ? null
        : {
            duration: Number(timing.duration),
            delay: Number(timing.delay),
          };
    };

    const readOnNextFrame = (event: string): Promise<Pair> =>
      new Promise<Pair>((done) => {
        root.addEventListener(
          event,
          () => {
            requestAnimationFrame(() => {
              const transform = getComputedStyle(plateEl).transform;
              done({
                plate: transitionOf(plateEl),
                glyph: transitionOf(glyphEl),
                y:
                  transform === 'none'
                    ? 0
                    : new DOMMatrixReadOnly(transform).m42,
              });
            });
          },
          { once: true },
        );
      });

    window.__feelIn = readOnNextFrame('pointerdown');
    window.__feelOut = readOnNextFrame('pointerup');
  });

  await page.mouse.down();
  const inbound = await page.evaluate(
    () => window.__feelIn as Promise<Pair>,
  );

  // Nothing to interpolate: the press duration is 0s, so no transition is
  // generated at all and the frame after the pointerdown IS the down state.
  expect(
    inbound.plate,
    'the press-in travel should not animate',
  ).toBeNull();
  expect(
    inbound.glyph,
    'the press-in glyph should not animate',
  ).toBeNull();
  expect(inbound.y).toBeCloseTo(PRESS_Y, 1);

  await page.waitForTimeout(HOLD_MS);
  await page.mouse.up();
  const outbound = await page.evaluate(
    () => window.__feelOut as Promise<Pair>,
  );

  expect(outbound.plate?.duration).toBe(RELEASE_MOVE_MS);
  expect(outbound.plate?.delay).toBe(0);
  expect(outbound.glyph?.duration).toBe(RELEASE_SPRING_MS);
  expect(outbound.glyph?.delay).toBe(0);
});

/*
 * THE FLAT PILL HAD THE SAME PROBLEM IN A MILDER FORM: its press dims to
 * 0.7 opacity on `transition-hue`, which is 150ms linear -- longer than a
 * click, and not started until the style recalculation after the
 * pointerdown either. It now dims on the frame the pointer lands and fades
 * back over the 150ms when the pointer comes up.
 */
declare global {
  interface Window {
    __flatPress?: Promise<number>;
  }
}

test('a 100ms click renders the flat pill dimmed', async ({
  page,
}) => {
  await page.goto('/specimens', { waitUntil: 'load' });

  // The harness paints the fixed scene over its unpositioned sections, so
  // a trusted pointerdown never reaches a pill through it. Same one-line
  // workaround as press-state.spec.ts, and for the same reason.
  await page.addStyleTag({
    content: '.clif-scene { pointer-events: none }',
  });

  const pill = page
    .locator('[data-variant="flat"][data-disabled="false"]')
    .first();
  await expect(pill).toBeVisible();

  await park(page);
  await settle(pill);
  await pointerOnto(page, pill);
  await settle(pill);

  await pill.evaluate((el: Element) => {
    window.addEventListener(
      'click',
      (event: Event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true,
    );
    window.__flatPress = new Promise<number>((done) => {
      el.addEventListener(
        'pointerdown',
        () => {
          requestAnimationFrame(() =>
            done(parseFloat(getComputedStyle(el).opacity)),
          );
        },
        { once: true },
      );
    });
  });

  await page.mouse.down();
  const first = await page.evaluate(
    () => window.__flatPress as Promise<number>,
  );
  await page.waitForTimeout(HOLD_MS);
  await page.mouse.up();

  // The whole press value, on the first frame the pointer was down for.
  expect(first).toBeCloseTo(0.7, 2);

  await settle(pill);
  expect(
    await pill.evaluate((el: Element) =>
      parseFloat(getComputedStyle(el).opacity),
    ),
  ).toBeCloseTo(1, 2);
});
