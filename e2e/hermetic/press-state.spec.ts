import {
  expect,
  test,
  type Locator,
  type Page,
} from '@playwright/test';
import { BUTTON_SIZES } from 'components/primitives/Button/sizes';
import { PRESS_SCALE } from 'components/primitives/press';
import {
  installMapboxGl,
  stubMapboxNetwork,
} from '../fixtures/mapbox-stub';

/*
 * WHEN THE PRESS STATE ARRIVES, measured from the trusted pointer down.
 *
 * The complaint this file answers was "when i press buttons i dont see
 * their active state until way later". There is no JavaScript press state
 * anywhere in the button -- no useState, no onPointerDown, no timer -- so
 * there was nothing to be late, and the press styling is plain CSS
 * `:active` on a 70ms transition with no transition-delay, which cannot be
 * late either.
 *
 * It was not late. IT NEVER ARRIVED. What the user saw "way later" was the
 * HOVER state falling away when they finally moved the pointer off the cap.
 *
 * The cause was cascade order between two rules of EQUAL specificity.
 * keycap.ts wrote hover behind `pointer-fine:` and press bare; both compile
 * to one class plus one pseudo-class, so on a cap that is both hovered and
 * pressed -- which, with a mouse, is every cap that is ever pressed -- the
 * winner is whichever Tailwind emits last. Tailwind v4 groups its output by
 * variant and emits the whole `@media (pointer: fine)` block after every
 * unconditional rule, so hover was last and hover won. Ten of the eleven
 * press declarations were overruled by their hover counterpart; the
 * eleventh, --k-shade, is the only one hover does not also set, and an
 * inset 1px bottom shade is not a press state.
 *
 * (keycap.ts used to claim "Tailwind emits `active:` after `hover:`". That
 * is true of two BARE variants and false of the asymmetric pair that was
 * actually written there. The asymmetry was the whole bug.)
 *
 * WHY THIS IS A RENDERED MEASUREMENT. Every press class was present before
 * the fix and is present after it, with the same values -- a class
 * assertion cannot tell the two builds apart, and test/button.test.tsx
 * carries the one invariant that can (no hover rule may reach a variable a
 * press rule sets). What tells the two builds apart in a browser is whether
 * the cap moves when the pointer goes down, so that is what is read here.
 *
 * WHY TRUSTED INPUT ONLY. `element.dispatchEvent(new MouseEvent(...))` does
 * not set `:active` in Chrome -- the flag comes from the browser's own
 * input handling, not from the event object. Every press here goes through
 * page.mouse, which is CDP-level and therefore trusted.
 */

/**
 * THE BUDGET, AND WHY IT IS COUNTED IN TWO DIFFERENT UNITS.
 *
 * "On the frame the pointer goes down" is a claim about the STATE, and the
 * state is observable exactly: --k-y is an unregistered custom property, so
 * it does not interpolate -- on the first frame after the pointerdown it is
 * either the press travel or it is not. That is asserted at ONE frame, with
 * no tolerance, and it is the assertion that fails against the old build
 * (it read -1px, the hover lift, for the entire press).
 *
 * What the frame AFTER that looks like is a claim about the RENDERING, and
 * it rides a 70ms transition. Wall-clock milliseconds cannot police it
 * here: this suite drives Chromium over SwiftShader with a live WebGL globe
 * on the page, and the measured rAF cadence on the hello route swings
 * between roughly 40ms and 250ms per frame. A 50ms ceiling would be
 * measuring the software rasteriser, not the cascade. So the rendered value
 * is held to a FRAME COUNT instead -- generous, because the first frame
 * after the press is where the transition is created at 0% progress and can
 * legitimately still read the old value -- and the thing that actually
 * proves nothing is stalling it is asserted directly: the transition on the
 * plate is 70ms long with a delay of 0s.
 *
 * Six frames is the ceiling. Against the old build the rendered value never
 * arrives at all, so the failure is unambiguous rather than marginal.
 */
const RENDER_FRAMES = 6;

/** The travel: md's cap falls exactly its own 3.5px skirt. */
const MD_SKIRT = BUTTON_SIZES.md.skirt;

/** The hover lift, which is what the cap is doing when the press lands. */
const HOVER_LIFT = -1;

/**
 * keycap.ts's TRANSITION, which nothing may lengthen or delay. It is the
 * duration of the RELEASE: the press-in collapses --k-move to 0s so the
 * down state lands on the frame the pointer does, and the travel this
 * number times is the cap coming back up. See press-feel.spec.ts.
 */
const TRAVEL_MS = 70;

type Sample = {
  t: number;
  y: number;
  scale: number;
  opacity: number;
};

type Trace = {
  down: number | null;
  up: number | null;
  /** --k-y as computed on the first frame that saw the pointerdown. */
  firstFrameVar: string | null;
  samples: Sample[];
  done: boolean;
};

declare global {
  interface Window {
    __pressTrace?: Trace;
    __releaseTiming?: Promise<{
      duration: number;
      delay: number;
    } | null>;
  }
}

/** The plate inside a keycap -- the element that actually travels. */
const plateOf = (cap: Locator): Locator =>
  cap.locator('.clif-button-inner');

/**
 * Waits for the element's own transitions to finish rather than for a
 * clock, then one more frame so the final value is committed. Same shape as
 * keycap-glyph.spec.ts's settle(), for the same reason.
 */
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

/** translateY of an element's computed transform, in px. */
const travelOf = async (target: Locator): Promise<number> =>
  target.evaluate((el: Element) => {
    const transform = getComputedStyle(el).transform;
    return transform === 'none'
      ? 0
      : new DOMMatrixReadOnly(transform).m42;
  });

/**
 * Arms a per-frame recorder on `wrapper`, reading `probe` (the element that
 * paints) every animation frame and stamping the trusted pointerdown and
 * pointerup against the same clock. It stops a few frames after the release
 * rather than after a fixed count, because a frame here can cost a quarter
 * of a second.
 *
 * getComputedStyle inside the rAF callback forces that frame's style
 * recalculation, so a sample is never a frame behind the state it reports.
 */
const arm = async (
  wrapper: Locator,
  probeSelector: string | null,
): Promise<void> => {
  await wrapper.evaluate((root: Element, selector: string | null) => {
    const probe =
      selector === null ? root : root.querySelector(selector);
    if (probe === null) throw new Error('no probe element');

    const read = (): Sample => {
      const style = getComputedStyle(probe);
      const transform = style.transform;
      return {
        t: performance.now(),
        y:
          transform === 'none'
            ? 0
            : new DOMMatrixReadOnly(transform).m42,
        scale: style.scale === 'none' ? 1 : parseFloat(style.scale),
        opacity: parseFloat(style.opacity),
      };
    };

    const trace: Trace = {
      down: null,
      up: null,
      firstFrameVar: null,
      samples: [],
      done: false,
    };
    window.__pressTrace = trace;

    /*
     * The mouse-up that ends the press is also a click, and some of the
     * elements measured here navigate or open a panel. A navigation
     * mid-trace would take the recorder with it, so the click is
     * swallowed at the window's capture phase -- ahead of React's own
     * root listener, so next/link never runs either. Nothing in this file
     * asserts on behaviour: the press state is a fact about the cascade,
     * not about routing.
     */
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

    const since = (mark: number | null): number =>
      mark === null
        ? 0
        : trace.samples.filter((sample) => sample.t >= mark).length;

    const loop = (): void => {
      if (trace.down !== null && trace.firstFrameVar === null) {
        trace.firstFrameVar = getComputedStyle(root)
          .getPropertyValue('--k-y')
          .trim();
      }
      trace.samples.push(read());
      if (trace.up !== null && since(trace.up) >= 8)
        trace.done = true;
      else requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }, probeSelector);
};

/**
 * Presses, holds for long enough that the 70ms travel has finished on any
 * cadence, releases, and hands back the whole trace.
 */
const pressAndRelease = async (
  page: Page,
  wrapper: Locator,
  probeSelector: string | null,
): Promise<Trace> => {
  await arm(wrapper, probeSelector);
  await page.mouse.down();
  await page.waitForFunction(() => {
    const down = window.__pressTrace?.down ?? null;
    if (down === null) return false;
    const frames =
      window.__pressTrace?.samples.filter(
        (sample) => sample.t >= down,
      ).length ?? 0;
    return frames >= 10;
  });
  await page.mouse.up();
  await page.waitForFunction(
    () => window.__pressTrace?.done === true,
  );
  return page.evaluate(() => window.__pressTrace as Trace);
};

/** The samples taken while the pointer was down. */
const held = (trace: Trace): Sample[] =>
  trace.samples.filter(
    (sample) =>
      sample.t >= (trace.down ?? 0) &&
      sample.t <= (trace.up ?? Number.POSITIVE_INFINITY),
  );

/**
 * How many frames after `after` it took for `reached` to become true.
 * Frames are 1-based: a value already correct on the first frame after the
 * event reports 1. Infinity means it never happened.
 */
const onsetOf = (
  trace: Trace,
  after: 'down' | 'up',
  reached: (sample: Sample) => boolean,
): number => {
  const mark = trace[after];
  if (mark === null) throw new Error(`no ${after} was recorded`);
  const index = trace.samples
    .filter((sample) => sample.t >= mark)
    .findIndex(reached);
  return index === -1 ? Number.POSITIVE_INFINITY : index + 1;
};

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installMapboxGl(page);
});

/*
 * THE CORE ASSERTION, on the page a visitor actually lands on.
 *
 * Against the old build --k-y read -1px on every frame of the press and the
 * plate never left the hover lift. Against this one the variable is the
 * press travel on the first frame, and the plate is sitting on its skirt a
 * few frames later.
 */
test('a pressed keycap takes the press state on the frame the pointer goes down', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });

  const cap = page.locator('[data-variant="keycap"]').first();
  await expect(cap).toBeVisible();
  const plate = plateOf(cap);

  // Rest, then hover: the cap is lifted 1px when the press lands, and that
  // lift is what the press has to beat.
  await park(page);
  await settle(plate);
  await pointerOnto(page, plate);
  await settle(plate);
  expect(await travelOf(plate)).toBeCloseTo(HOVER_LIFT, 1);

  const trace = await pressAndRelease(
    page,
    cap,
    '.clif-button-inner',
  );
  expect(trace.down).not.toBeNull();

  // The state machine does not interpolate, so it is a first-frame fact.
  expect(
    parseFloat(trace.firstFrameVar ?? 'NaN'),
    'the press travel should be declared on the first frame after the pointer goes down',
  ).toBeCloseTo(MD_SKIRT, 2);

  // And the plate lands on exactly its own skirt, which is the design's
  // travel, within the rendering budget.
  expect(
    onsetOf(trace, 'down', (sample) => sample.y > HOVER_LIFT + 0.25),
  ).toBeLessThanOrEqual(RENDER_FRAMES);
  expect(
    Math.max(...held(trace).map((sample) => sample.y)),
  ).toBeCloseTo(MD_SKIRT, 1);
});

/*
 * NOTHING IS WAITING ON A CLOCK. The frame counts above are soft because
 * the runner's cadence is; this is the hard version of the same claim,
 * read off the transition the browser actually created.
 *
 * IT IS READ ON THE RELEASE NOW, because the press no longer creates one.
 * When this test was written both edges ran the same 70ms ease, and 70ms
 * of ease is longer than a fast click renders -- measured, the cap had not
 * moved by a pixel inside a 50ms press (press-feel.spec.ts). The press-in
 * is therefore immediate and the release still eased, so the edge that has
 * a transition on it is the one coming back up. The claim is unchanged:
 * the cap's travel is 70ms of easing with no delay in front of it, and
 * nothing may lengthen or stall it.
 */
test('the press travel is a 70ms transition with no delay', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });

  const cap = page.locator('[data-variant="keycap"]').first();
  await expect(cap).toBeVisible();
  const plate = plateOf(cap);

  await park(page);
  await settle(plate);
  await pointerOnto(page, plate);
  await settle(plate);

  expect(
    await plate.evaluate(
      (el: Element) => getComputedStyle(el).transitionDelay,
    ),
  ).toBe('0s, 0s, 0s, 0s');

  /*
   * Armed inside the page rather than asked for after the await: the
   * transition being measured is 70ms long and a CDP round trip is not
   * reliably shorter than that, so the question has to already be waiting
   * when the pointer comes up.
   */
  await plate.evaluate((el: Element) => {
    window.__releaseTiming = new Promise<{
      duration: number;
      delay: number;
    } | null>((resolve) => {
      const wrapper = el.closest('.clif-button');
      if (wrapper === null) throw new Error('the plate has no cap');
      wrapper.addEventListener(
        'pointerup',
        () => {
          requestAnimationFrame(() => {
            const transform = el
              .getAnimations()
              .find(
                (animation) =>
                  (animation as CSSTransition).transitionProperty ===
                  'transform',
              );
            if (transform === undefined) {
              resolve(null);
              return;
            }
            const spec = transform.effect?.getTiming();
            resolve({
              duration: Number(spec?.duration ?? -1),
              delay: Number(spec?.delay ?? -1),
            });
          });
        },
        { once: true },
      );
    });
  });

  await page.mouse.down();
  await page.mouse.up();
  const timing = await page.evaluate(
    () =>
      window.__releaseTiming as Promise<{
        duration: number;
        delay: number;
      } | null>,
  );

  expect(timing).not.toBeNull();
  expect(timing?.duration).toBe(TRAVEL_MS);
  expect(timing?.delay).toBe(0);
});

/*
 * ...AND IT LETS GO. A press state that latches is the same complaint from
 * the other side. The pointer never leaves the cap, so it returns to the
 * hover lift rather than to rest.
 */
test('a released keycap leaves the press state', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });

  const cap = page.locator('[data-variant="keycap"]').first();
  await expect(cap).toBeVisible();
  const plate = plateOf(cap);

  await park(page);
  await settle(plate);
  await pointerOnto(page, plate);
  await settle(plate);

  const trace = await pressAndRelease(
    page,
    cap,
    '.clif-button-inner',
  );
  expect(trace.up).not.toBeNull();

  // The cap has to have GONE DOWN for "it comes back up" to mean anything.
  expect(
    Math.max(...held(trace).map((sample) => sample.y)),
  ).toBeCloseTo(MD_SKIRT, 1);

  expect(
    onsetOf(trace, 'up', (sample) => sample.y < MD_SKIRT - 0.25),
  ).toBeLessThanOrEqual(RENDER_FRAMES);

  await settle(plate);
  expect(await travelOf(plate)).toBeCloseTo(HOVER_LIFT, 1);
});

/*
 * THE INK IS THE OTHER HALF OF THE PRESS. The design flips the label to the
 * accent while the cap is down (Keycap.dc.html's style-active), and that
 * declaration was overruled by the hover ink exactly as the travel was.
 * --k-ink is unregistered too, so this is another first-frame fact: against
 * the old build it read the hot ink instead.
 */
test('a pressed keycap flips its ink to the accent', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });

  const cap = page.locator('[data-variant="keycap"]').first();
  await expect(cap).toBeVisible();
  const plate = plateOf(cap);

  await park(page);
  await settle(plate);
  await pointerOnto(page, plate);
  await settle(plate);

  const accent = await cap.evaluate((el: Element) =>
    getComputedStyle(el).getPropertyValue('--clif-accent').trim(),
  );
  expect(accent.length).toBeGreaterThan(0);

  await page.mouse.down();
  const ink = await cap.evaluate(
    (el: Element) =>
      new Promise<string>((resolve) => {
        requestAnimationFrame(() =>
          resolve(
            getComputedStyle(el).getPropertyValue('--k-ink').trim(),
          ),
        );
      }),
  );
  await page.mouse.up();

  expect(ink).toBe(accent);
});

/*
 * THE FLAT PILL, which had the same asymmetry in its class list and did NOT
 * have the bug: its hover inverts border, background and colour while its
 * press dims opacity, and two rules that touch different properties never
 * race. Asserted rather than assumed, because the next person to read
 * flat.ts will find the same shape that broke the keycap.
 */
test('a pressed flat pill dims', async ({ page }) => {
  await page.goto('/specimens', { waitUntil: 'load' });

  /*
   * The flat pill ships nowhere but the specimen harness, and on that page
   * every one of them is behind the scene: SceneRoot is `position: fixed;
   * inset: 0; z-index: 0`, the harness sections are not positioned, and a
   * positioned element paints over an unpositioned one whatever the source
   * order. So the scene, which is aria-hidden decoration, wins the hit test
   * over the whole page and a trusted pointerdown never reaches a pill.
   *
   * That is a stacking quirk of the harness, not of the button, and it is
   * NOT what this file is about -- so the scene is taken out of the hit
   * test for the duration and nothing else is touched. Hovering works
   * through it today (keycap-glyph.spec.ts), pressing does not, and the
   * shipped routes do not have the problem at all.
   */
  await page.addStyleTag({
    content: '.clif-scene { pointer-events: none }',
  });

  // Not a disabled one: [data-disabled=true] sets pointer-events: none, so
  // it never sees the pointerdown at all.
  const pill = page
    .locator('[data-variant="flat"][data-disabled="false"]')
    .first();
  await expect(pill).toBeVisible();

  await park(page);
  await settle(pill);
  await pointerOnto(page, pill);
  await settle(pill);

  const trace = await pressAndRelease(page, pill, null);
  expect(
    onsetOf(trace, 'down', (sample) => sample.opacity < 0.99),
  ).toBeLessThanOrEqual(RENDER_FRAMES);
  expect(
    Math.min(...held(trace).map((sample) => sample.opacity)),
  ).toBeCloseTo(0.7, 2);
});

/*
 * THE CHROME'S TWO BALLS, which had the keycap's bug in its purest form:
 * one property, two rules of equal specificity, and the press value is the
 * SMALLER of the two -- so before the fix a press left the ball sitting at
 * its hover size and the press scale was unreachable with a mouse.
 *
 * TWO THINGS WERE STILL WRONG AFTER THAT FIX, and both are asserted below
 * because both were invisible to a class assertion.
 *
 * The press was 1.02 against a rest of 1.0. Smaller than hover, so the
 * guard worked -- but a GROWTH from rest, so a tap, a keyboard activation
 * or any click that beat the hover read as a weak hover. The press now
 * compresses past rest, and the test starts from REST as well as from
 * hover, which is the case the old one could not have failed.
 *
 * And it ran the 180ms release easing on the way down. Measured on an 80ms
 * click, the ball travelled 1.08 -> 1.030 and never reached its own target
 * before reversing: the state was right on the first frame and the
 * RENDERING of it was not. So the down edge is now immediate, and that is
 * asserted as a first-frame fact rather than a frame count.
 *
 * (The old class names are described rather than spelled here on purpose:
 * Tailwind's scanner reads comments, and writing one out emits it into the
 * stylesheet as a live rule with nothing wearing it.)
 */
for (const control of [
  { label: 'theme eye', name: 'Theme' },
  { label: 'contact mouth', name: 'Contact' },
] as const) {
  test(`the ${control.label} takes its press scale`, async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });

    const ball = page
      .getByRole('button', { name: control.name })
      .first();
    await expect(ball).toBeVisible();

    await park(page);
    await settle(ball);
    await pointerOnto(page, ball);
    await settle(ball);
    expect(
      await ball.evaluate((el: Element) =>
        parseFloat(getComputedStyle(el).scale),
      ),
    ).toBeCloseTo(1.08, 2);

    // From hover: the press is there on the FIRST frame, not eased into
    // over 180ms. There is no transition on the down edge to wait for, so
    // this is a first-frame fact and takes no frame budget.
    const trace = await pressAndRelease(page, ball, null);
    expect(
      onsetOf(trace, 'down', (sample) => sample.scale < 1.075),
    ).toBe(1);
    expect(
      Math.min(...held(trace).map((sample) => sample.scale)),
    ).toBeCloseTo(PRESS_SCALE, 2);

    /*
     * ...AND A CLICK THAT BEATS THE HOVER, which is the case the 1.02
     * press could not serve at all.
     *
     * The old press sat BETWEEN rest and hover, so it only read as a press
     * from a settled hover. It is reached here from the other end: the
     * pointer arrives and the button goes down without waiting out the
     * 180ms growth, so the ball is somewhere near 1.0 and climbing when
     * the press lands -- the ordinary way a person clicks something they
     * are not already pointing at, and the only way a finger or a keyboard
     * can reach it at all.
     *
     * Against every build before this one the ball would have grown, to
     * 1.02. It has to shrink past rest instead, so the threshold is 1 and
     * there is nothing marginal about which side of it the old value was
     * on.
     */
    await park(page);
    await settle(ball);
    await pointerOnto(page, ball);
    const unsettled = await pressAndRelease(page, ball, null);
    expect(
      Math.min(...held(unsettled).map((sample) => sample.scale)),
    ).toBeLessThan(1);
  });
}

/*
 * THE PROJECT ROW, and the reason it is measured here rather than trusted
 * to its class list.
 *
 * This row had the defect in its most instructive form. `active:` and
 * `data-[active=true]:` are both one class plus one simple selector,
 * Tailwind emits the `data-*` group after the `active:` group, and
 * `data-active` follows the pointer -- the row's pointerenter reaches the
 * route through onHoverRow and comes back as activeId. So the press wash
 * was overruled by the hover wash under another name, on every row a mouse
 * can reach.
 *
 * What makes it worth a browser: this row was ALREADY "fixed" once. The
 * hover half was scoped `not-active:`, the class list gained exactly the
 * guard the keycap had, every unit assertion passed, and the rendered
 * press did not change by one value -- because the guard had gone on the
 * competitor that was not winning. A rendered measurement is the only
 * thing that can tell a real fix from that one, and this is the assertion
 * that would have caught it.
 */
test('a pressed project row deepens its wash', async ({ page }) => {
  await page.goto('/projects', { waitUntil: 'load' });

  const row = page.locator('tr[role="row"][data-active]').first();
  await expect(row).toBeVisible();

  // The mouse-up is a click on a row that navigates, and the trace would
  // go with it. Same swallow as arm(), for the same reason.
  await page.evaluate(() =>
    window.addEventListener(
      'click',
      (event: Event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true,
    ),
  );

  const alphaOf = async (): Promise<number> =>
    row.evaluate((el: Element) => {
      const parts = getComputedStyle(el)
        .backgroundColor.replace(/[^0-9.,]/g, '')
        .split(',');
      return parts.length < 4 ? 0 : Number(parts[3]);
    });

  await park(page);
  await settle(row);
  await pointerOnto(page, row);
  await settle(row);

  /*
   * Hovering is what sets data-active, so by the time the press lands the
   * competing rule is live. Asserted rather than assumed: if the route
   * ever stopped feeding activeId back, this test would be measuring a
   * race that no longer exists and would pass for the wrong reason.
   */
  await expect(row).toHaveAttribute('data-active', 'true');
  const hovered = await alphaOf();
  expect(hovered).toBeGreaterThan(0);

  await page.mouse.down();
  const pressed = await row.evaluate(
    (el: Element) =>
      new Promise<number>((resolve) => {
        requestAnimationFrame(() => {
          const parts = getComputedStyle(el)
            .backgroundColor.replace(/[^0-9.,]/g, '')
            .split(',');
          resolve(parts.length < 4 ? 0 : Number(parts[3]));
        });
      }),
  );
  await page.mouse.up();

  /*
   * On the FIRST frame, because the row collapses its own 120ms transition
   * under :active. Against the old build this read the hover alpha exactly
   * -- not a smaller step, the same number.
   *
   * The threshold is a real step rather than "different", because the
   * value this replaced was accent-12 over accent-07: a 0.05 change that
   * rendered as nothing. A press has to clear that by a margin to be a
   * state rather than a rounding difference.
   */
  expect(pressed - hovered).toBeGreaterThan(0.1);

  // ...and it lets go, back to the hover wash the pointer is still over.
  await settle(row);
  expect(await alphaOf()).toBeCloseTo(hovered, 3);
});

/*
 * THE CONTROLS THAT HAD NO PRESS STATE AT ALL.
 *
 * The rail tabs and the scrubber ticks were never written a press: measured
 * against the old build, a trusted pointerdown on any of them changed not
 * one computed property. The rail is the site's primary navigation, so this
 * was the single most-pressed control on the site and the one with the
 * least to say.
 *
 * They are checked in a browser rather than by their class lists for the
 * same reason as everything else in this file -- and for one more that is
 * specific to them. Both wear `animate-slide-in`, whose keyframes end on
 * `transform: translateY(0)` under `forwards`, and a filling animation
 * outranks every normal author declaration for as long as the element
 * lives. A press written as `transform` would be present in the class list,
 * correct on inspection and dead on screen. `scale` is a separate property
 * and the keyframes do not touch it; only a rendered measurement can tell
 * those two builds apart.
 *
 * THE SCRUBBER TICK IS NO LONGER ONE OF THEM, and the reason is a route
 * change rather than a press change. /about was the only page that drew a
 * scrubber, and the simplified 1e draws none -- the map is that route's
 * control now -- so there is no production URL left to press a tick on.
 * The tick's press is unchanged and still covered: Scrubber.tsx carries
 * it, test/press.test.tsx asserts it, and the specimen board renders it.
 * What is gone is the browser measurement, because a browser needs a page,
 * and /specimens is not in the production build (see the README's
 * Specimens section for why). Put a scrubber back on a route and this
 * matrix is where it belongs.
 */
for (const control of [
  { label: 'rail tab', route: '/', name: 'projects' },
] as const) {
  test(`the ${control.label} takes a press`, async ({ page }) => {
    await page.goto(control.route, { waitUntil: 'load' });

    const target = page
      .getByRole('button', { name: control.name })
      .first();
    await expect(target).toBeVisible();

    await park(page);
    await settle(target);
    await pointerOnto(page, target);
    await settle(target);

    const trace = await pressAndRelease(page, target, null);
    expect(onsetOf(trace, 'down', (sample) => sample.scale < 1)).toBe(
      1,
    );
    expect(
      Math.min(...held(trace).map((sample) => sample.scale)),
    ).toBeCloseTo(PRESS_SCALE, 2);

    // And it lets go: a press state that latches is the same complaint
    // from the other side.
    await settle(target);
    expect(
      await target.evaluate((el: Element) => {
        const { scale } = getComputedStyle(el);
        return scale === 'none' ? 1 : parseFloat(scale);
      }),
    ).toBeCloseTo(1, 2);
  });
}
