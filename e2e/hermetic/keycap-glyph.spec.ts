import {
  expect,
  test,
  type Locator,
  type Page,
} from '@playwright/test';
import { BUTTON_SIZES } from 'components/primitives/Button/sizes';
import {
  installMapboxGl,
  stubMapboxNetwork,
} from '../fixtures/mapbox-stub';

/*
 * HOW BIG THE GLYPH ACTUALLY GETS, measured in a browser.
 *
 * The design says a hovered keycap grows its glyph to 1.30 of its resting
 * size and a pressed one to 1.22 (Keycap.dc.html's style-hover /
 * style-active), on top of a per-size rest scale of 0.62 / 0.56 / 0.5.
 * Every one of those numbers was already in keycap.ts and sizes.ts, and the
 * cap still grew by HALF AGAIN as much as it should: the slot and the Glyph
 * inside it both applied `scale(calc(var(--g-base) * var(--g-mul, 1)))`,
 * both inherited --g-mul from the hovered cap, and the growth landed twice
 * -- 1.3 x 1.3 = 1.69.
 *
 * WHICH IS WHY THIS IS A RENDERED MEASUREMENT AND NOT A CLASS ASSERTION.
 * `[--g-mul:1.3]` was present on the cap before the fix and is present
 * after it; so was every number in the size table. The only thing that told
 * the two apart was the size of the box on the screen, so that is what this
 * reads: getBoundingClientRect() on the sculpture, at rest and on hover,
 * and the ratio between them.
 *
 * WAITING FOR THE SPRING. The growth runs on
 * `transform 240ms cubic-bezier(.34,1.56,.64,1)`, a back-out curve that
 * OVERSHOOTS its target -- it passes about 1.36 of the rest size on the way
 * to 1.30 -- so a measurement taken on a timer can land above the number it
 * is checking. Two things stop that here, and they are independent:
 *
 *   settle()     waits two animation frames for the :hover style to be
 *                recalculated and the transition to be created, then awaits
 *                every running Animation's `finished` promise on that
 *                element -- the transition's own completion, not a guess at
 *                it -- and then one more frame so the final transform is
 *                committed before anything is measured.
 *   expect.poll  re-measures until the ratio settles, so even a sample
 *                taken mid-flight is retried rather than reported. A wrong
 *                ratio is constant, not transient, so this cannot paper
 *                over the bug: 1.69 stays 1.69 until the poll times out.
 *
 * Sizes come from /specimens, which is the only place all three keycap
 * sizes carry a glyph; the site itself ships md (hello's two caps, and the
 * 404's), which is measured here too, on the real page, for the same ratio.
 */

/** The design's hover multiplier: Keycap.dc.html style-hover, --g-mul:1.30. */
const HOVER_MUL = 1.3;

/** The 34x34 box every glyph is drawn in (components/primitives/Glyph). */
const GLYPH_BOX = 34;

/**
 * Rest, hover and back, with the transition awaited rather than timed.
 *
 * `el.getAnimations()` returns the CSS transitions running on the element,
 * and each one's `finished` promise resolves when it is done. The two
 * leading frames are what makes that list non-empty: Playwright's hover has
 * dispatched the pointer move, but the style recalculation and the
 * transition it creates happen on the next frame.
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

const widthOf = async (target: Locator): Promise<number> => {
  const box = await target.evaluate(
    (el: Element) => el.getBoundingClientRect().width,
  );
  return box;
};

/** The sculpture inside a cap's glyph slot: the element that scales. */
const sculptureIn = (cap: Locator): Locator =>
  cap.locator('[data-slot="glyph"] [data-glyph]');

/**
 * The rest width and the settled hover width of one element inside one cap,
 * with the pointer parked off the cap again afterwards so the next
 * measurement starts from rest.
 */
const growth = async (
  page: Page,
  cap: Locator,
  target: Locator,
): Promise<{ rest: number; hover: number; ratio: number }> => {
  await page.mouse.move(0, 0);
  await settle(target);
  const rest = await widthOf(target);

  await cap.hover();
  await settle(target);
  const hover = await widthOf(target);

  await page.mouse.move(0, 0);
  return { rest, hover, ratio: hover / rest };
};

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installMapboxGl(page);
});

for (const size of ['md', 'sm', 'xs'] as const) {
  test(`a hovered ${size} keycap grows its glyph by 1.30, not 1.69`, async ({
    page,
  }) => {
    await page.goto('/specimens', { waitUntil: 'load' });

    const cap = page
      .locator(
        `[data-variant="keycap"][data-size="${size}"]:has([data-slot="glyph"])`,
      )
      .first();
    await expect(cap).toBeVisible();
    const glyph = sculptureIn(cap);

    // The rest scale is this size's row of the table, rendered.
    const rest = await widthOf(glyph);
    expect(rest).toBeCloseTo(GLYPH_BOX * BUTTON_SIZES[size].glyph, 1);

    // ...and the hover is one multiplier above it, not two.
    await expect
      .poll(
        async () => {
          const { ratio } = await growth(page, cap, glyph);
          return ratio;
        },
        {
          message: `the ${size} keycap's glyph should grow by ${HOVER_MUL}`,
          timeout: 5_000,
        },
      )
      .toBeCloseTo(HOVER_MUL, 2);

    // And it goes back: the slot is not left holding a grown transform.
    await settle(glyph);
    expect(await widthOf(glyph)).toBeCloseTo(rest, 1);
  });
}

/*
 * THE EXPAND MARK IS THE CONTROL.
 *
 * It grows on the same --g-mul, from the same cap, on the same spring --
 * but it is a bare `scale(var(--g-mul, 1))` on an SVG with nothing nested
 * inside it to multiply again, so it was already correct while the glyph
 * beside it was not. If this ever drifts from 1.30 the fault is in the
 * measurement, not in the glyph.
 */
test('the expand mark, which was never doubled, grows by the same 1.30', async ({
  page,
}) => {
  await page.goto('/specimens', { waitUntil: 'load' });

  const cap = page
    .locator('[data-variant="keycap"]:has([data-slot="expand"])')
    .first();
  await expect(cap).toBeVisible();
  const mark = cap.locator('[data-slot="expand"]');

  await expect
    .poll(
      async () => {
        const { ratio } = await growth(page, cap, mark);
        return ratio;
      },
      { timeout: 5_000 },
    )
    .toBeCloseTo(HOVER_MUL, 2);
});

/*
 * The shipped page, not the harness: hello's two caps are the keycaps a
 * visitor actually hovers, and the ratio has to be the design's there.
 */
test('the caps on the hello route grow by 1.30 as well', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });

  const caps = page.locator(
    '[data-variant="keycap"]:has([data-slot="glyph"])',
  );
  await expect(caps).toHaveCount(2);

  for (let index = 0; index < 2; index += 1) {
    const cap = caps.nth(index);
    const glyph = sculptureIn(cap);

    expect(await widthOf(glyph)).toBeCloseTo(
      GLYPH_BOX * BUTTON_SIZES.md.glyph,
      1,
    );

    await expect
      .poll(
        async () => {
          const { ratio } = await growth(page, cap, glyph);
          return ratio;
        },
        {
          message: `hello's cap ${index} should grow its glyph by ${HOVER_MUL}`,
          timeout: 5_000,
        },
      )
      .toBeCloseTo(HOVER_MUL, 2);
  }
});
