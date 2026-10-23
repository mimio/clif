import { expect, type Page, test } from '@playwright/test';
import { installSceneDebug, waitForScene } from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * HOW OFTEN DOES THE CHROME RENDER, AND WHAT RENDERS WHEN IT DOES.
 *
 * The globe turns by walking its CENTRE MERIDIAN: `setCenter` once per
 * animation frame, which is `jumpTo`, which fires `move`. The coordinate
 * pill reads that transform, so on `/` and on the 404 a `move` arrives
 * every frame for the life of the tab.
 *
 * That was wired to React state held in ChromeRoot, at the top of the
 * whole chrome, and set with a freshly allocated pair every time -- so
 * the nav rail, the altimeter and its twelve notches, the theme eye and
 * the contact mouth were ALL rendered again, at the display's refresh
 * rate, permanently, to display values none of them had been handed.
 * Measured here before the fix, on this runner, which draws the globe at
 * about 15fps: 76 commits in five seconds, 8,664 chrome DOM nodes
 * reconciled inside them, 5,928 of them the altimeter's. On a 120Hz
 * display it is eight times that.
 *
 * WHY THE `move` COUNT IS NOT THE MEASUREMENT. It was not far off -- 77
 * moves for 76 commits -- but it is a count of the CAUSE, and the claim
 * is about the effect. A fix that coalesced the events and still rendered
 * the whole chrome would show the same improvement in `move` and none of
 * the improvement that matters.
 *
 * WHY THE DOM IS NOT THE MEASUREMENT EITHER. A component that renders to
 * the output it already had writes nothing, so a MutationObserver sees a
 * silent storm as perfect stillness. The altimeter's twelve notches never
 * changed a pixel through any of the above.
 *
 * SO IT COUNTS FIBERS. React is asked directly, through the hook it
 * already offers the DevTools extension in a production build:
 * `onCommitFiberRoot` fires once per commit and hands over the committed
 * tree. Walking it gives the two numbers this file is about.
 *
 *   COMMITS       how many times React committed at all.
 *   RE-RENDERS    how many fibers in that commit are NEW OBJECTS since
 *                 the previous one.
 *
 * The second is exact rather than a proxy, and it is worth saying why it
 * works. React double-buffers: a component it re-renders gets its fiber
 * rebuilt through createWorkInProgress, which returns the OTHER of the
 * two buffers, while a subtree that bails out is carried over BY
 * REFERENCE -- bailoutOnAlreadyFinishedWork returns null and the
 * children are the same objects they were. So "this fiber is not the
 * object it was in the last commit" is precisely "React re-ran and
 * re-reconciled this node", which is the cost the storm was made of.
 */

/** Long enough to be dozens of frames at the 6-15fps this runner draws. */
const WINDOW_MS = 4_000;

/*
 * Past the route's own 800ms flight and the foreground's entrance, so
 * what is measured is the resting globe rather than the arrival.
 */
const SETTLE_MS = 4_000;

type Churn = {
  seconds: number;
  /** React commits over the window. */
  commits: number;
  /** Distinct strings the readout displayed over the window. */
  printed: number;
  /** Chrome DOM nodes React re-reconciled, inside the pill. */
  pill: number;
  /**
   * ...on the way to it: the chrome layer and the stack that holds the
   * pill. React cannot reach a component without walking the path to it,
   * so this is the floor, not a leak. It does NOT mean those components
   * ran again -- cloneChildFibers copies the fibers on the path without
   * re-invoking anything above the update.
   */
  path: number;
  /** ...and anywhere else in the chrome: the rail, the eye, the mouth. */
  elsewhere: number;
  /** Of those, the altimeter's own: the worst of the old storm. */
  rail: number;
};

/*
 * The hook goes in before anything else runs, because React looks for it
 * once, when react-dom is first evaluated, and never again.
 */
const installFiberCounter = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    type Fiber = {
      child: Fiber | null;
      sibling: Fiber | null;
      stateNode: unknown;
    };
    type Counter = {
      commits: number;
      pill: number;
      path: number;
      elsewhere: number;
      rail: number;
      seen: Set<Fiber>;
      on: boolean;
    };
    const counter: Counter = {
      commits: 0,
      pill: 0,
      path: 0,
      elsewhere: 0,
      rail: 0,
      seen: new Set<Fiber>(),
      on: false,
    };
    window.__CHURN__ = counter;

    /*
     * The three regions, found through what the chrome already exposes:
     * the altimeter's accessible name, and the pill's readout testid.
     * The chrome layer is the rail's parent, and the pill is the child of
     * the stack that contains the readout. Structural, but it is the
     * structure ChromeRoot documents, and a selector on a Tailwind class
     * would be archaeology.
     */
    const regions = (): {
      chrome: Element;
      pill: Element;
      rail: Element;
    } | null => {
      const rail = document.querySelector(
        'nav[aria-label="Sections"]',
      );
      const readout = document.querySelector(
        '[data-testid="coord-readout"]',
      );
      const chrome = rail?.parentElement ?? null;
      if (!rail || !readout || !chrome) return null;
      const stack = [...chrome.children].find((el) =>
        el.contains(readout),
      );
      const pill = stack
        ? [...stack.children].find((el) => el.contains(readout))
        : undefined;
      if (!pill) return null;
      return { chrome, pill, rail };
    };

    const walk = (root: Fiber): void => {
      const next = new Set<Fiber>();
      const where = counter.on ? regions() : null;
      const stack: Fiber[] = [root];
      while (stack.length > 0) {
        const fiber = stack.pop() as Fiber;
        next.add(fiber);
        if (where !== null && !counter.seen.has(fiber)) {
          const node = fiber.stateNode;
          if (
            node instanceof Element &&
            where.chrome.contains(node)
          ) {
            if (where.pill.contains(node)) counter.pill += 1;
            else if (node.contains(where.pill)) counter.path += 1;
            else counter.elsewhere += 1;
            if (where.rail.contains(node)) counter.rail += 1;
          }
        }
        if (fiber.child) stack.push(fiber.child);
        if (fiber.sibling) stack.push(fiber.sibling);
      }
      counter.seen = next;
      if (counter.on) counter.commits += 1;
    };

    const hook = {
      renderers: new Map<number, unknown>(),
      supportsFiber: true,
      inject: (renderer: unknown): number => {
        hook.renderers.set(1, renderer);
        return 1;
      },
      onCommitFiberRoot: (
        _id: unknown,
        root: { current: Fiber },
      ): void => walk(root.current),
      onPostCommitFiberRoot: (): void => {},
      onCommitFiberUnmount: (): void => {},
      checkDCE: (): void => {},
      isDisabled: false,
      emit: (): void => {},
      on: (): void => {},
      off: (): void => {},
      sub: () => (): void => {},
      getFiberRoots: () => new Set<unknown>(),
      setStrictMode: (): void => {},
    };
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook;
  });
};

/** Watches for `ms`, counting commits, re-rendered nodes and readings. */
const watch = (page: Page, ms: number): Promise<Churn> =>
  page.evaluate(
    (duration) =>
      new Promise<Churn>((done) => {
        const counter = window.__CHURN__;
        const readout = document.querySelector(
          '[data-testid="coord-readout"]',
        );
        if (!counter || !readout) {
          throw new Error('the chrome was never rendered');
        }
        counter.commits = 0;
        counter.pill = 0;
        counter.path = 0;
        counter.elsewhere = 0;
        counter.rail = 0;
        counter.on = true;

        let printed = 0;
        let last = readout.textContent ?? '';
        const observer = new MutationObserver(() => {
          const next = readout.textContent ?? '';
          if (next === last) return;
          last = next;
          printed += 1;
        });
        observer.observe(readout, {
          characterData: true,
          childList: true,
          subtree: true,
        });

        const opened = performance.now();
        const step = (): void => {
          const now = performance.now();
          if (now - opened < duration) {
            requestAnimationFrame(step);
            return;
          }
          observer.disconnect();
          counter.on = false;
          done({
            seconds: (now - opened) / 1_000,
            commits: counter.commits,
            printed,
            pill: counter.pill,
            path: counter.path,
            elsewhere: counter.elsewhere,
            rail: counter.rail,
          });
        };
        requestAnimationFrame(step);
      }),
    ms,
  );

test.describe('the chrome does not render on every frame', () => {
  test.beforeEach(async ({ context, page }) => {
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
    await installFiberCounter(page);
  });

  test('the spinning globe renders the pill and nothing else', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live');
    await page.waitForTimeout(SETTLE_MS);

    const churn = await watch(page, WINDOW_MS);
    test.info().annotations.push({
      type: 'churn',
      description: JSON.stringify(churn),
    });

    /*
     * (0) THE WINDOW WAS LIVE. Every bound below is an upper one, and a
     * globe that had stopped turning would satisfy all of them while
     * measuring nothing. The readout has to have moved.
     */
    expect(
      churn.printed,
      'the readout never changed: the globe was not turning',
    ).toBeGreaterThan(10);

    /*
     * (1) ONE COMMIT PER DISPLAYED CHANGE, not one per frame.
     *
     * On THIS route the two happen to coincide, and saying so is more
     * useful than implying a saving that is not there: the pill carries
     * three decimals and the globe turns 1.5 degrees a second, so the
     * printed longitude changes every 0.67ms -- faster than any display
     * refreshes. There is no rounding that makes the number on screen
     * stand still here. What the frame gate guarantees is that the
     * commit rate can never EXCEED the display's, whatever the event
     * rate is; the slack is for the caption and the hover pose, which
     * are commits nobody is complaining about.
     */
    expect(
      churn.commits,
      `${churn.commits} commits for ${churn.printed} readings`,
    ).toBeLessThanOrEqual(churn.printed + 3);

    /*
     * (2) AND THE COMMIT IS THE PILL. This is the fix. The altimeter,
     * the theme eye and the contact mouth show nothing a camera move
     * changes, so none of them may be re-reconciled by one -- not fewer
     * than before, none.
     */
    expect(
      churn.rail,
      'the altimeter was re-rendered by the globe turning',
    ).toBe(0);
    expect(
      churn.elsewhere,
      'chrome beside the coordinate pill was re-rendered by the globe turning',
    ).toBe(0);
    /*
     * The path down to the pill is the floor and is counted separately so
     * that it cannot hide anything: React has to walk the chrome layer
     * and the stack to reach the component that changed. Two nodes, once
     * per commit. If this ever became the whole subtree again it would be
     * the old bug wearing a different name.
     */
    expect(
      churn.path,
      'more than the path to the pill was walked',
    ).toBeLessThanOrEqual(churn.commits * 3);

    /*
     * ...and the pill itself did render, which is the other half of the
     * claim: this is a boundary, not a freeze. A pill that stopped
     * updating would pass (2) trivially and be a worse bug than the one
     * being fixed.
     */
    expect(
      churn.pill,
      'the pill stopped rendering altogether',
    ).toBeGreaterThan(0);
  });

  test('a pan the visitor drives costs the same as the spin', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live');
    await page.waitForTimeout(SETTLE_MS);

    /*
     * `move` fires for a drag and an ease as well as for the spin, and a
     * pointer can deliver them well above the refresh rate -- so a fix
     * that only held for the one source that happens to arrive on a
     * frame already would not be a fix. The drag is real mouse input
     * over the canvas.
     */
    const box = await page.locator('canvas').first().boundingBox();
    expect(box, 'there is no canvas to drag').not.toBeNull();
    const at = box as NonNullable<typeof box>;
    const x = at.x + at.width / 2;
    const y = at.y + at.height / 2;

    const churn = await Promise.all([
      watch(page, WINDOW_MS),
      (async () => {
        await page.mouse.move(x, y);
        await page.mouse.down();
        for (let step = 1; step <= 40; step += 1) {
          await page.mouse.move(x - step * 3, y + step);
        }
        await page.mouse.up();
      })(),
    ]).then(([measured]) => measured);

    test.info().annotations.push({
      type: 'churn',
      description: JSON.stringify(churn),
    });

    expect(
      churn.printed,
      'the readout never changed during the drag',
    ).toBeGreaterThan(10);
    expect(
      churn.commits,
      `${churn.commits} commits for ${churn.printed} readings`,
    ).toBeLessThanOrEqual(churn.printed + 3);
    expect(
      churn.rail,
      'the altimeter was re-rendered by a drag',
    ).toBe(0);
    expect(
      churn.elsewhere,
      'chrome beside the coordinate pill was re-rendered by a drag',
    ).toBe(0);
    expect(
      churn.path,
      'more than the path to the pill was walked',
    ).toBeLessThanOrEqual(churn.commits * 3);
  });
});
