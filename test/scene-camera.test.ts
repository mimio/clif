import { describe, expect, it } from 'vitest';
import { anchors } from 'content/anchors';
import {
  type CameraSpec,
  cameras,
  SCENE_EASE,
  SCENE_MOVE_LONG_MS,
  SCENE_MOVE_MS,
  type SceneId,
} from 'content/cameras';
import {
  cameraAt,
  cameraForHover,
  cameraForPath,
  coordLabel,
  dashRuns,
  forViewport,
  HOVER_NUDGE,
  MOBILE_MAX_WIDTH,
  moveDurationFor,
  nudgeToward,
  REDUCED_MOVE_MS,
  refinesCamera,
  resolveCamera,
  SCENE_BY_PATH,
  SCENE_REFRAME_MS,
  sceneIdForPath,
  spinRateFor,
  TERRAIN_MIN_ZOOM,
  terrainFor,
} from 'scene/camera';
import { cubicBezier } from 'scene/ease';

describe('route -> camera', () => {
  it('resolves every route in the design table', () => {
    expect(sceneIdForPath('/')).toBe('hello');
    expect(sceneIdForPath('/projects')).toBe('projects');
    expect(sceneIdForPath('/projects/[projectId]')).toBe(
      'projectDetail',
    );
    expect(sceneIdForPath('/about')).toBe('about');
  });

  it('sends anything unmapped to the 404 camera', () => {
    expect(sceneIdForPath('/404')).toBe('notFound');
    expect(sceneIdForPath('/_error')).toBe('notFound');
    expect(sceneIdForPath('/nothing/here')).toBe('notFound');
  });

  it('hands back the artboard camera for a path', () => {
    expect(cameraForPath('/')).toBe(cameras.hello);
    expect(cameraForPath('/about')).toBe(cameras.about);
    expect(cameraForPath('/nope')).toBe(cameras.notFound);
  });

  it('covers every scene the table names', () => {
    const named = new Set(Object.values(SCENE_BY_PATH));
    named.add('notFound');
    expect([...named].sort()).toEqual(
      (Object.keys(cameras) as SceneId[]).sort(),
    );
  });
});

describe('refinement', () => {
  const base = cameras.projectDetail;

  it('accepts a camera that only moves the centre', () => {
    expect(refinesCamera(cameraAt(base, [-71.11, 42.37]), base)).toBe(
      true,
    );
  });

  /*
   * Every field has to be checked, because the one that is not is the one
   * that lets a stale camera through. Overriding each in turn is the only
   * way to know none was forgotten.
   */
  const drifts: Partial<CameraSpec>[] = [
    { zoom: 3 },
    { pitch: 10 },
    { bearing: 44 },
    { terrain: null },
    { fog: 'space' },
    { interactive: true },
    { spin: 0.01 },
  ];

  it.each(drifts)('rejects a camera whose %o differs', (drift) => {
    expect(refinesCamera({ ...base, ...drift }, base)).toBe(false);
  });

  it('prefers the route over a camera left behind by the last one', () => {
    // What SceneRoot sees for one render after navigating away from
    // /about: its effect runs before the new page's.
    expect(resolveCamera('/', cameras.about)).toBe(cameras.hello);
  });

  /*
   * And that holds for EVERY pair, not just the one above.
   *
   * refinesCamera is what tells "this route's camera, reframed" from
   * "the last route's camera, still in context", and it does it on the
   * framing alone. Two scenes that happened to share a framing would be
   * mutual refinements, and the scene would accept the previous route's
   * centre as this route's -- silently, and only on the routes that
   * collided. Asked over the table rather than over a hand-picked pair,
   * so a scene added later is included by existing.
   */
  it('cannot mistake any scene for a refinement of another', () => {
    const ids = Object.keys(cameras) as SceneId[];
    const confused = ids.flatMap((from) =>
      ids
        .filter((to) => to !== from)
        .filter((to) => refinesCamera(cameras[from], cameras[to]))
        .map((to) => `${from} reads as ${to}`),
    );
    expect(confused).toEqual([]);
  });

  it('prefers a page refinement over the table entry', () => {
    const refined = cameraAt(cameras.projectDetail, [-71.11, 42.37]);
    expect(resolveCamera('/projects/[projectId]', refined)).toBe(
      refined,
    );
  });

  it('falls back to the table when no page has spoken', () => {
    expect(resolveCamera('/projects', null)).toBe(cameras.projects);
  });
});

describe('viewport', () => {
  it('leaves the desktop camera alone', () => {
    expect(forViewport(cameras.hello, 'hello', false)).toBe(
      cameras.hello,
    );
  });

  it('applies the mobile artboards', () => {
    expect(forViewport(cameras.hello, 'hello', true).zoom).toBe(1.4);
    const projects = forViewport(cameras.projects, 'projects', true);
    expect(projects.zoom).toBe(2.2);
    expect(projects.pitch).toBe(20);
    const about = forViewport(cameras.about, 'about', true);
    expect(about.zoom).toBe(10.2);
    expect(about.pitch).toBe(55);
    // 1h: exaggeration 1.0 on the mobile about view.
    expect(about.terrain).toBe(1);
  });

  it('flattens terrain on a route with no mobile artboard', () => {
    const detail = forViewport(
      cameras.projectDetail,
      'projectDetail',
      true,
    );
    expect(detail.zoom).toBe(cameras.projectDetail.zoom);
    expect(detail.terrain).toBe(1);
  });

  it('keeps the breakpoint where the tokens put it', () => {
    expect(MOBILE_MAX_WIDTH).toBe(650);
  });
});

describe('terrain', () => {
  it('is off for a flat camera', () => {
    expect(terrainFor(cameras.hello)).toBeNull();
  });

  it('is on once the camera is close enough', () => {
    expect(terrainFor(cameras.about)).toBe(1.4);
    expect(cameras.about.zoom).toBeGreaterThanOrEqual(
      TERRAIN_MIN_ZOOM,
    );
  });

  it('stays off above the terrain zoom even when the route wants it', () => {
    expect(terrainFor({ ...cameras.about, zoom: 4 })).toBeNull();
  });
});

describe('move duration', () => {
  it('is 800ms between routes', () => {
    expect(moveDurationFor('hello', 'projects', false)).toBe(
      SCENE_MOVE_MS,
    );
  });

  it('is 900ms into the detail, and out of the 404', () => {
    expect(moveDurationFor('projects', 'projectDetail', false)).toBe(
      SCENE_MOVE_LONG_MS,
    );
    expect(moveDurationFor('notFound', 'hello', false)).toBe(
      SCENE_MOVE_LONG_MS,
    );
  });

  it('is 600ms for a reframe inside one route', () => {
    expect(moveDurationFor('projects', 'projects', false)).toBe(
      SCENE_REFRAME_MS,
    );
  });

  it('is the crossfade under reduced motion, whatever the move', () => {
    expect(moveDurationFor(null, 'projectDetail', true)).toBe(
      REDUCED_MOVE_MS,
    );
  });

  it('treats the first move of the tab as a route change', () => {
    expect(moveDurationFor(null, 'hello', false)).toBe(SCENE_MOVE_MS);
  });
});

describe('the hover nudge', () => {
  it('eases 8% toward the anchor city', () => {
    const nudged = cameraForHover(cameras.projects, 'cambridge');
    const [lng, lat] = cameras.projects.center;
    const [toLng, toLat] = anchors.cambridge.center;
    expect(nudged.center[0]).toBeCloseTo(
      lng + (toLng - lng) * HOVER_NUDGE,
      10,
    );
    expect(nudged.center[1]).toBeCloseTo(
      lat + (toLat - lat) * HOVER_NUDGE,
      10,
    );
    // Only the centre moves: the nudge must stay a refinement.
    expect(refinesCamera(nudged, cameras.projects)).toBe(true);
  });

  it('reverses to the resting camera on hover out', () => {
    expect(cameraForHover(cameras.projects, null)).toBe(
      cameras.projects,
    );
  });

  it('takes an explicit amount', () => {
    expect(nudgeToward(cameras.hello, [0, 0], 1).center).toEqual([
      0, 0,
    ]);
  });
});

describe('the readout and the two motion dials', () => {
  it('says HELD where the camera is not yours', () => {
    expect(coordLabel(cameras.projectDetail)).toBe('held');
    expect(coordLabel(cameras.hello)).toBe('camera');
    expect(coordLabel(null)).toBe('camera');
  });

  it('turns rotation off under reduced motion', () => {
    expect(spinRateFor(cameras.hello, false)).toBe(0.0015);
    expect(spinRateFor(cameras.hello, true)).toBeNull();
    expect(spinRateFor(cameras.projects, false)).toBeNull();
  });

  it('pauses the travelling dash on terrain routes', () => {
    expect(dashRuns(cameras.hello, false)).toBe(true);
    expect(dashRuns(cameras.hello, true)).toBe(false);
    expect(dashRuns(cameras.about, false)).toBe(false);
  });
});

describe('the easing curve', () => {
  const ease = cubicBezier(...SCENE_EASE);

  it('lands exactly on both ends', () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(-1)).toBe(0);
    expect(ease(2)).toBe(1);
  });

  it('is symmetric about the midpoint, as ease-in-out is', () => {
    expect(ease(0.5)).toBeCloseTo(0.5, 6);
    expect(ease(0.25) + ease(0.75)).toBeCloseTo(1, 6);
  });

  it('is monotonic', () => {
    let last = 0;
    for (let t = 0.05; t < 1; t += 0.05) {
      const value = ease(t);
      expect(value).toBeGreaterThan(last);
      last = value;
    }
  });

  it('starts slower than linear and ends faster', () => {
    expect(ease(0.2)).toBeLessThan(0.2);
    expect(ease(0.8)).toBeGreaterThan(0.8);
  });

  it('falls back to bisection where the curve has no slope', () => {
    // x(s) = s^3 has a vanishing derivative at the origin, which is the
    // case Newton cannot solve.
    const flat = cubicBezier(0, 0.5, 0, 0.5);
    expect(flat(0.0001)).toBeGreaterThan(0);
    expect(flat(0.0001)).toBeLessThan(0.5);
    expect(flat(0.999)).toBeCloseTo(1, 1);
  });
});
