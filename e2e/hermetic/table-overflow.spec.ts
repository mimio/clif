import { expect, test } from '@playwright/test';
import { ROUTES, waitForScene } from '../fixtures/app';
import {
  installMapboxGl,
  stubMapboxNetwork,
} from '../fixtures/mapbox-stub';

/*
 * THE TABLE NEVER SCROLLS SIDEWAYS, AND NEITHER DOES THE PAGE.
 *
 * "we don't want x overflow on the tables really, basically NEVER so things
 * should abbreviate before that happens." So this spec is not a screenshot
 * and not a class-name assertion: it measures the rendered boxes and asks
 * three questions of them, at eight widths, in both table states, on the
 * index and on two details.
 *
 *   PAGE      documentElement.scrollWidth <= clientWidth. This is the
 *             weakest of the three and it is stated first so nobody mistakes
 *             it for the check. `html`, `body` and `#__next` are
 *             `overflow: hidden` (styles/globals.css) and SceneStage's
 *             column is `overflow-x-hidden`, so a row 300px too wide is
 *             CLIPPED rather than scrolled and this assertion never sees it.
 *             It passed before the fix at every width below, and it passes
 *             now. It is here to catch a change that removes the clip, not
 *             to catch a wide table.
 *
 *   SCROLLER  nothing inside the foreground is a horizontal scroll container
 *             with something to scroll. This is the one that was red. The
 *             tbody asks for `overflow-y: auto`, which computes the other
 *             axis from `visible` to `auto`, and its rows carried a negative
 *             horizontal margin -- so the table answered a fourteen-row list
 *             with a horizontal scrollbar, at 1440, 1280, 1024, 768 and 650
 *             (+9px) and at 390 and 320 (+5px) alike.
 *
 *   RAIL      the project capture and the reading column do not overlap.
 *             This is the rule the widened column bought: the two used to be
 *             two hand-written numbers on two pages -- a 620px table and a
 *             560px prose block, each measured against a 600px plane pinned
 *             80px from the right -- and at 1024 they already crossed by
 *             328px on a detail, which nothing was measuring. They are one
 *             number now (--reading-max), and this is what holds it to its
 *             word at every width the rail is open at.
 *
 *   CELL      every element in a table-like surface that holds text of its
 *             own either fits its box or clips with an ellipsis, and lies
 *             inside the viewport. A cell whose content escapes its own cell
 *             is invisible to the two checks above -- the page does not
 *             scroll, nothing scrolls, and the text is simply painted over
 *             the column beside it. This is what caught the detail's meta
 *             grid, where `Wieden+Kennedy` ran 21px past its track at 390
 *             and 45px at 320.
 *
 * Truncation is the PASS, not the failure: `text-overflow: ellipsis` means
 * scrollWidth is expected to exceed clientWidth, and that is the degradation
 * the owner asked for. What is not allowed is content escaping a visible
 * box, or clipping with no ellipsis to say that it did.
 *
 * And today's content happening to fit is not the same as the layout being
 * safe, so every measurement runs twice: once on the real rows, and once
 * after a hostile title and client have been written into the rendered DOM
 * -- 120 characters with no space in them, which no wrap rule can break at a
 * space and no fixed track can absorb.
 */

/** Wide, laptop, small laptop, the breakpoint itself, tablet, phone, cruel. */
const WIDTHS = [1440, 1280, 1024, 999, 768, 650, 390, 320];

/*
 * `haikumi` carries `Wieden+Kennedy`, the longest client with no space in it
 * and the one the meta grid was losing; `poly` carries the longest title and
 * the longest client in content/projects.ts. Between them they are the worst
 * real content the detail has to hold before the hostile strings go in.
 */
const DETAILS = ['/projects/haikumi', '/projects/poly'];

/** 120 characters, no spaces: nothing can wrap it and nothing can fit it. */
const LONG_TITLE =
  'Hyperspectral-Orthorectification-and-Photogrammetric-Reconstruction-Pipeline-for-Subalpine-Watershed-Telemetry-Arrays2019';

const LONG_CLIENT =
  'Vandenberg+Kettleman+Ashworth+Quintanilla-Interactive-Cartography-und-Geodatenverarbeitungsgesellschaft-mbH-Internation';

type Offender = {
  rule: string;
  where: string;
  detail: string;
};

/*
 * Runs in the page. Returns every box that breaks one of the three rules,
 * named well enough that a failure says which cell and by how much.
 */
const measure = (): Offender[] => {
  const out: Offender[] = [];

  const name = (el: Element): string => {
    const tag = el.tagName.toLowerCase();
    const cls =
      typeof el.className === 'string' && el.className.length > 0
        ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}`
        : '';
    const text = (el.textContent ?? '').trim().slice(0, 28);
    return `${tag}${cls} "${text}"`;
  };

  const doc = document.documentElement;
  if (doc.scrollWidth > doc.clientWidth) {
    out.push({
      rule: 'PAGE',
      where: 'documentElement',
      detail: `scrollWidth ${doc.scrollWidth} > clientWidth ${doc.clientWidth}`,
    });
  }

  const main = document.querySelector('main');
  if (main === null) {
    out.push({ rule: 'PAGE', where: 'main', detail: 'no <main>' });
    return out;
  }

  for (const el of [
    main,
    ...Array.from(main.querySelectorAll<HTMLElement>('*')),
  ]) {
    const { overflowX } = getComputedStyle(el);
    if (overflowX !== 'auto' && overflowX !== 'scroll') continue;
    if (el.scrollWidth <= el.clientWidth) continue;
    out.push({
      rule: 'SCROLLER',
      where: name(el),
      detail: `scrolls ${el.scrollWidth - el.clientWidth}px sideways (${el.scrollWidth} inside ${el.clientWidth})`,
    });
  }

  /*
   * The rail, where it is open. Below --breakpoint-wide the plane is a
   * child of the column by design -- it folds back into the flow -- so the
   * rule is asked only of a plane that has actually been pinned out of it.
   * getBoundingClientRect reads the TRANSFORMED box, so the capture's own
   * -16/-18deg rotateY (which throws its left edge a few pixels further
   * left than its layout box) is inside the measurement rather than an
   * allowance nobody remembered to make.
   */
  const railed = main.querySelector<HTMLElement>(
    '[data-slot="plane"]',
  );
  const column = main.querySelector<HTMLElement>(
    '.clif-stage-column',
  );
  if (
    railed !== null &&
    column !== null &&
    getComputedStyle(railed).position === 'fixed'
  ) {
    const plane = (
      railed.querySelector('figure') ?? railed
    ).getBoundingClientRect();
    const reading = column.getBoundingClientRect();
    if (plane.left < reading.right - 0.5) {
      out.push({
        rule: 'RAIL',
        where: name(railed),
        detail: `capture starts at ${plane.left.toFixed(1)}, ${(
          reading.right - plane.left
        ).toFixed(
          1,
        )}px inside a column that ends at ${reading.right.toFixed(1)}`,
      });
    }
  }

  /*
   * The table-like surfaces: the project index table and the detail's meta
   * grid. Reached by role and element rather than by class, so a rewrite of
   * either one stays under the same microscope.
   */
  const surfaces = Array.from(
    main.querySelectorAll<HTMLElement>('table[role="table"], dl'),
  );
  const viewport = doc.clientWidth;

  for (const surface of surfaces) {
    const boxes = [
      surface,
      ...Array.from(surface.querySelectorAll<HTMLElement>('*')),
    ];
    for (const el of boxes) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      if (rect.left < -0.5 || rect.right > viewport + 0.5) {
        out.push({
          rule: 'CELL',
          where: name(el),
          detail: `box ${rect.left.toFixed(1)}..${rect.right.toFixed(1)} is outside 0..${viewport}`,
        });
      }

      /*
       * Only boxes holding text of their own. A wrapper's overflow is the
       * SCROLLER rule's business; this rule is about a value in a cell, and
       * counting wrappers would report the same overflow once per ancestor.
       */
      const holdsText = Array.from(el.childNodes).some(
        (node) =>
          node.nodeType === Node.TEXT_NODE &&
          (node.textContent ?? '').trim().length > 0,
      );
      if (!holdsText) continue;
      if (el.scrollWidth <= el.clientWidth) continue;

      const style = getComputedStyle(el);
      if (
        style.textOverflow === 'ellipsis' &&
        style.overflowX !== 'visible'
      )
        continue;

      out.push({
        rule: 'CELL',
        where: name(el),
        detail: `content is ${el.scrollWidth - el.clientWidth}px wider than its ${el.clientWidth}px box, with overflow-x: ${style.overflowX} and no ellipsis`,
      });
    }
  }

  return out;
};

/*
 * Writes the hostile strings over whatever the surfaces are showing, leaf by
 * leaf, so the measurement runs against the live layout rather than against
 * a second fixture that could drift from it.
 */
const poison = (long: { title: string; client: string }): number => {
  const leaves = Array.from(
    document.querySelectorAll<HTMLElement>(
      'tbody tr a, tbody tr span, dl span',
    ),
  ).filter((el) => el.children.length === 0);
  leaves.forEach((el, index) => {
    el.textContent = index % 2 === 0 ? long.title : long.client;
  });
  return leaves.length;
};

const report = (offenders: Offender[]): string =>
  offenders
    .map((o) => `[${o.rule}] ${o.where} -- ${o.detail}`)
    .join('\n');

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installMapboxGl(page);
});

/*
 * The index, which has one state now: fourteen rows, five tracks and a
 * scrolling tbody on arrival, which is where the fixed tracks have the
 * least room. The hover is measured too, because a capture in the rail is
 * the one thing on this route that can reach the table's side of the page.
 */
for (const width of WIDTHS) {
  test(`/projects holds its columns at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/projects', { waitUntil: 'load' });
    await waitForScene(page);
    await expect(page.locator('tbody tr')).toHaveCount(14);

    expect(report(await page.evaluate(measure))).toBe('');

    expect(
      await page.evaluate(poison, {
        title: LONG_TITLE,
        client: LONG_CLIENT,
      }),
    ).toBeGreaterThan(0);
    expect(report(await page.evaluate(measure))).toBe('');

    // With a row's capture up: same rules, plus RAIL against a real plane.
    await page.reload({ waitUntil: 'load' });
    await waitForScene(page);
    await page.locator('tbody tr').first().hover();
    await page.waitForTimeout(400);

    expect(report(await page.evaluate(measure))).toBe('');

    expect(
      await page.evaluate(poison, {
        title: LONG_TITLE,
        client: LONG_CLIENT,
      }),
    ).toBeGreaterThan(0);
    expect(report(await page.evaluate(measure))).toBe('');
  });
}

for (const width of WIDTHS) {
  test(`a project detail holds its meta grid at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of DETAILS) {
      await page.goto(path, { waitUntil: 'load' });
      await waitForScene(page);
      await expect(page.locator('dl')).toBeVisible();

      expect(report(await page.evaluate(measure)), path).toBe('');

      expect(
        await page.evaluate(poison, {
          title: LONG_TITLE,
          client: LONG_CLIENT,
        }),
      ).toBeGreaterThan(0);
      expect(
        report(await page.evaluate(measure)),
        `${path} (hostile content)`,
      ).toBe('');
    }
  });
}

/*
 * The page-level rule on every route, including the three with no table at
 * all, so a change to the stage or the chrome cannot start the document
 * scrolling sideways somewhere this spec was not looking.
 */
test('no route scrolls the document sideways', async ({ page }) => {
  // Five routes at eight widths, each waiting on a map: the 30s default is
  // for one navigation, not forty.
  test.setTimeout(180_000);
  const problems: string[] = [];
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route.path, { waitUntil: 'load' });
      await waitForScene(page);
      const over = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });
      if (over > 0)
        problems.push(`${route.path} @ ${width}px: +${over}px`);
    }
  }
  expect(problems).toEqual([]);
});
