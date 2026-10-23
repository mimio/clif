import { expect, test, type Page } from '@playwright/test';
import {
  DESKTOP,
  installSceneDebug,
  settle,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * CAN THE VISITOR MOVE THE MAP? ONLY A BROWSER KNOWS.
 *
 * /about's camera has said `interactive: true` since the day it was
 * written, and SceneRoot has always passed it to applyInteractivity, so
 * every gesture handler mapbox has was enabled -- and the map could not be
 * dragged. The handlers were never the problem: the foreground was on top
 * of them. SceneStage's <main> is `h-full w-full` at z-10 over a scene at
 * z-0, and its column is `inset-y-0` across the stage insets, so between
 * them they covered the viewport and every press landed on a div.
 *
 * NO UNIT TEST CAN SEE THAT. jsdom has no layout, no hit testing and no
 * compositing: an element with `pointer-events: none` and one without are
 * the same object to it, and a `toHaveClass` assertion passes against a
 * build where the drag goes nowhere. The class list is evidence about the
 * fix, not about the outcome. So the outcome is measured here, as a real
 * pointer over the real canvas and the map's own centre before and after.
 *
 * The three cases are one claim each:
 *   /about pans        the press reaches the map through the foreground
 *   the copy does not  what the route kept for itself still takes a pointer
 *   /projects holds    pass-through is opt-in, and the routes that did not
 *                      ask for it still catch the press
 *
 * THE LAST ONE IS A HIT TEST AND NOT A CAMERA READING, which is worth
 * saying because the obvious version of it is wrong. /projects moves its
 * camera on HOVER -- cameraForHover nudges it 8% toward the anchor city of
 * whatever row the pointer is over -- so dragging across the table moves
 * the globe on a healthy build, by design, and by an amount that depends
 * on which row the drag ended over and how far the nudge had eased when
 * the sample was taken. Measured, that is 0.05 degrees one run and 2.5 the
 * next, on identical code. A camera assertion there would be testing the
 * nudge, flakily, and saying nothing about the press. What is actually
 * claimed is that the press never reaches the canvas, and that is what
 * `document.elementFromPoint` answers directly.
 */

type Centre = { lng: number; lat: number };

const centre = (page: Page): Promise<Centre | null> =>
  page.evaluate(() => {
    const map = window.__SCENE__?.map;
    if (!map) return null;
    const at = map.getCenter();
    return { lng: at.lng, lat: at.lat };
  });

/** How far a drag moved the camera, in degrees of centre. */
const travelled = (from: Centre, to: Centre): number =>
  Math.abs(from.lng - to.lng) + Math.abs(from.lat - to.lat);

/*
 * A trusted drag, in the shape mapbox's DragPanHandler actually wants:
 * a move to arm the pointer, a down, several moves so the handler has a
 * delta to integrate, and an up. A single jump from down to up is below
 * its own click threshold and pans nothing, which would make this file
 * pass against a build that still swallows the press.
 */
const drag = async (
  page: Page,
  from: { x: number; y: number },
): Promise<void> => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let step = 1; step <= 20; step += 1) {
    await page.mouse.move(from.x - step * 6, from.y + step * 2);
  }
  await page.mouse.up();
};

type Hit = { canvas: boolean; what: string };

/**
 * What a press at each point would actually land on.
 *
 * `elementFromPoint` is the browser's own hit test, so it accounts for
 * stacking, insets and `pointer-events` together -- which is the whole
 * question here and the one thing a class-list assertion cannot answer.
 */
const hitTest = (page: Page, points: number[][]): Promise<Hit[]> =>
  page.evaluate(
    (at: number[][]) =>
      at.map((point) => {
        const found = document.elementFromPoint(point[0], point[1]);
        return {
          canvas: found?.tagName.toLowerCase() === 'canvas',
          what:
            found === null ? 'nothing' : found.tagName.toLowerCase(),
        };
      }),
    points,
  );

const arrive = async (page: Page, route: string): Promise<void> => {
  await installSceneDebug(page);
  await page.setViewportSize(DESKTOP);
  await page.goto(route, { waitUntil: 'load' });
  await waitForScene(page, 'live');
  // The arrival flight is 800ms and a drag during it would be measuring
  // the camera move rather than the pointer.
  await settle(page);
};

test.describe('the map the visitor can reach', () => {
  test('a drag over /about pans the camera', async ({
    context,
    page,
  }) => {
    await stubMapboxNetwork(context);
    await arrive(page, '/about');

    const before = await centre(page);
    expect(before, 'there is no map to drag').not.toBeNull();

    /*
     * Deliberately INSIDE the stage's column -- right of the copy, below
     * the word, well clear of the chrome in the corners. That is the
     * region that used to eat the press, so a drag anywhere else would
     * not be testing anything.
     */
    await drag(page, { x: 900, y: 600 });

    const after = await centre(page);
    expect(
      travelled(before as Centre, after as Centre),
      'the drag never reached the map',
    ).toBeGreaterThan(0.01);
  });

  test('a drag over the copy does not pan it', async ({
    context,
    page,
  }) => {
    await stubMapboxNetwork(context);
    await arrive(page, '/about');

    const copy = page.getByRole('heading', { name: 'Ubiquiti' });
    await expect(copy).toBeVisible();
    const box = await copy.boundingBox();
    expect(box, 'the copy has no box').not.toBeNull();
    const at = box as NonNullable<typeof box>;

    const before = await centre(page);
    // Rightwards and down off the company name, which keeps the whole
    // drag inside the copy block rather than sliding out of it.
    await drag(page, {
      x: at.x + at.width - 8,
      y: at.y + at.height / 2,
    });

    const after = await centre(page);
    expect(
      travelled(before as Centre, after as Centre),
      'a drag on the copy panned the map underneath it',
    ).toBeLessThan(0.0001);
  });

  test('the press still stops at the projects table', async ({
    context,
    page,
  }) => {
    await stubMapboxNetwork(context);
    await arrive(page, '/projects');

    // Three points down the reading column, where the table is: the
    // places on this route a visitor is most likely to start a stray
    // drag. None of them may be the map.
    const hits = await hitTest(page, [
      [400, 300],
      [400, 500],
      [900, 600],
    ]);

    expect(
      hits.filter((hit) => hit.canvas),
      'a press on the projects table reached the map',
    ).toEqual([]);
  });

  /*
   * The same read on /about, which is the other half of the pair: the
   * stage lets the press past, and the copy takes it back. Stated as the
   * hit test as well as the drag, because the drag proves the outcome and
   * this says which element produced it -- so a future regression names
   * itself rather than just failing to pan.
   */
  test('about hands the stage to the map and the copy to the reader', async ({
    context,
    page,
  }) => {
    await stubMapboxNetwork(context);
    await arrive(page, '/about');

    const [open, onCopy] = await hitTest(page, [
      [900, 600],
      [200, 250],
    ]);

    expect(open.canvas, `(900,600) landed on ${open.what}`).toBe(
      true,
    );
    expect(onCopy.canvas, `(200,250) landed on ${onCopy.what}`).toBe(
      false,
    );
  });
});
