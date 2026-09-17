import { expect, type Page } from '@playwright/test';

/*
 * What both tiers need to know about the app, in one place: which routes
 * exist, what "settled" means for a scene that crossfades, and how to
 * collect the problems a route is not allowed to have.
 */

export type Route = {
  /** Used in test titles and screenshot names. */
  name: string;
  path: string;
  /** What the server answers. The not-found route is the odd one. */
  status: number;
  /** The value SceneRoot puts on data-scene for this route. */
  scene: string;
};

/*
 * The five routes. /projects/haikumi is the first entry in
 * content/projects.ts, and the not-found route is reached by asking for a
 * path that is not built -- /404 itself is a static page and answers 200,
 * which would not exercise the status the visitor actually gets.
 */
export const ROUTES: Route[] = [
  { name: 'hello', path: '/', status: 200, scene: 'hello' },
  {
    name: 'projects',
    path: '/projects',
    status: 200,
    scene: 'projects',
  },
  {
    name: 'detail',
    path: '/projects/haikumi',
    status: 200,
    scene: 'projectDetail',
  },
  { name: 'about', path: '/about', status: 200, scene: 'about' },
  {
    name: 'not-found',
    path: '/no-such-page',
    status: 404,
    scene: 'notFound',
  },
];

/*
 * The eight themes, copied rather than imported: a Playwright spec that
 * imports app modules drags tsconfig path resolution into the test runner
 * for no gain. The copy is not allowed to drift -- e2e/hermetic/theme.spec
 * asserts the theme lens offers exactly this list.
 */
export const THEME_IDS = [
  'yellow',
  'lime',
  'rust',
  'teal',
  'pink',
  'cream',
  'paper',
  'chalk',
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** styles/theme-bootstrap.ts's key, read before first paint. */
export const THEME_STORAGE_KEY = 'oneglobe.theme';

/*
 * [data-theme] crossfades over 400ms and transition-hue rides on top, so
 * anything that samples colour -- a screenshot included -- reads a blend of
 * two themes before this has elapsed. 120ms of it is the theme painter's
 * own debounce in scene/theme.ts.
 */
export const THEME_SETTLE_MS = 900;

/** Hosts whose availability is not the app's concern. */
const IGNORED =
  /(google-analytics\.com|googletagmanager\.com|fonts\.gstatic\.com|fonts\.googleapis\.com)/;

/*
 * three.js says this on a context it cannot have, and GlitchImage answers
 * it by rendering the plain image -- which is the behaviour the no-WebGL
 * test is there to assert, not a failure.
 */
const EXPECTED_WITHOUT_WEBGL =
  /(WebGL|webgl|THREE\.WebGLRenderer|Could not create a WebGL context)/;

export type ProblemOptions = {
  /** Allows the three.js context errors the no-WebGL run is asserting. */
  allowWebglErrors?: boolean;
  /**
   * The document's own status, when it is not 200. Chromium logs every
   * non-2xx response as a console error, the main document included, so
   * the not-found route cannot be asked for a silent console -- it can
   * only be asked not to log anything BESIDES its own 404.
   */
  documentStatus?: number;
};

/**
 * Starts collecting everything a route is not allowed to produce, and
 * hands back the live list. Attach it before the first navigation.
 */
export const collectProblems = (
  page: Page,
  options: ProblemOptions = {},
): string[] => {
  const problems: string[] = [];
  const status = options.documentStatus;
  const ownStatus =
    status === undefined || status === 200
      ? null
      : new RegExp(`Failed to load resource.*status of ${status}\\b`);

  const allowed = (text: string): boolean =>
    IGNORED.test(text) ||
    (options.allowWebglErrors === true &&
      EXPECTED_WITHOUT_WEBGL.test(text)) ||
    (ownStatus !== null && ownStatus.test(text));

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (allowed(text)) return;
    problems.push(`console: ${text}`);
  });
  page.on('pageerror', (error) => {
    if (allowed(error.message)) return;
    problems.push(`pageerror: ${error.message}`);
  });
  return problems;
};

/* ---- the review tier's nets ------------------------------------------ */

/** The two capture sizes: the artboards' desktop, and a tall phone. */
export const DESKTOP = { width: 1440, height: 900 };
export const MOBILE = { width: 390, height: 844 };

/** How long a live basemap is given to stop fetching tiles. */
export const TILE_SETTLE_MS = 2_500;

/**
 * Everything that means "Mapbox is unhappy", from three directions at
 * once, because no one of them is complete.
 *
 * The console alone is not enough: scene/mapbox/instance.ts registers an
 * `error` listener and drops every error that arrives after style.load,
 * and a Map WITH an error listener does not log to the console at all. So
 * a 401 on a tile is invisible to console watching -- hence the response
 * and requestfailed nets, which see it regardless.
 */
export const collectMapboxFailures = (page: Page): string[] => {
  const failures: string[] = [];
  const mapbox = /\.mapbox\.com\//;

  page.on('console', (message) => {
    const text = message.text();
    // The one message the whole style lifecycle in instance.ts exists to
    // prevent, whatever level it is reported at.
    if (/Style is not done loading/.test(text)) {
      failures.push(`console: ${text}`);
      return;
    }
    if (message.type() === 'error' && /mapbox/i.test(text)) {
      failures.push(`console: ${text}`);
    }
  });
  page.on('response', (response) => {
    if (!mapbox.test(response.url())) return;
    // A missing DEM or vector tile at the edge of coverage is normal and
    // the map is expected to survive it. A token that is wrong, out of
    // scope or over quota is not.
    if ([401, 403, 429].includes(response.status())) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('requestfailed', (request) => {
    if (!mapbox.test(request.url())) return;
    failures.push(
      `requestfailed ${request.url()} ${
        request.failure()?.errorText ?? ''
      }`,
    );
  });
  return failures;
};

/**
 * Waits for a live basemap to stop arriving. `networkidle` is bounded and
 * swallowed rather than awaited outright: a map that is still streaming
 * telemetry never reaches it, and the fixed settle after it is what
 * actually matters. toHaveScreenshot then does its own stabilisation on
 * top, which is why this can be a wait rather than a poll.
 */
export const settle = async (page: Page): Promise<void> => {
  await page
    .waitForLoadState('networkidle', { timeout: 20_000 })
    .catch(() => undefined);
  await page.waitForTimeout(TILE_SETTLE_MS);
};

/** Waits for SceneRoot to report a live map rather than a pending one. */
export const waitForScene = async (
  page: Page,
  state: 'live' | 'fallback' = 'live',
): Promise<void> => {
  await expect(
    page.locator(
      `[data-testid="scene-root"][data-scene-state="${state}"]`,
    ),
  ).toBeAttached({ timeout: 30_000 });
};

/** Seeds the theme before first paint, so nothing ever crossfades. */
export const seedTheme = async (
  page: Page,
  id: ThemeId,
): Promise<void> => {
  await page.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Private mode: the bootstrap falls back to the default theme and
        // the test that asserts the theme will say so.
      }
    },
    [THEME_STORAGE_KEY, id] as const,
  );
};

/* ---- the colour-theme probe ------------------------------------------ */

/**
 * One `new Image()` mapbox-gl decoded from a data URL, which is how and
 * only how it applies a colour theme.
 */
export type LutImage = {
  /** Length of the base64 payload. */
  bytes: number;
  /**
   * FNV-1a over the whole payload, which is what tells two themes' LUTs
   * apart. A prefix would not: every theme's LUT is the same 1024x32 PNG
   * from the same encoder, so they agree exactly on length and on their
   * first hundred-odd characters.
   */
  hash: string;
  width: number;
  height: number;
  /** Decoded, and within the dimensions mapbox-gl requires. */
  ok: boolean;
  /** The image failed to decode at all. */
  failed: boolean;
};

declare global {
  interface Window {
    /** Present once the LUT probe is installed. */
    __ONEGLOBE_LUT__?: LutImage[];
  }
}

/*
 * THE ONE PLACE THE REAL LIBRARY'S COLOUR THEME IS OBSERVABLE FROM OUTSIDE.
 *
 * Style._loadColorTheme() is the whole of setColorTheme's work: it prefixes
 * the base64 with data:image/png;base64, if it is missing, assigns it to a
 * `new Image()`, and on load checks height <= 32 and width === height * height
 * before uploading the bytes as the style's LUT. Fail either check and it
 * rejects, the LUT stays null, and the basemap keeps Standard's own colours.
 *
 * The app exposes no handle on its Map -- scene/mapbox/instance.ts keeps
 * `instance` module-private and nothing puts it on window -- so there is no
 * way to read map.style._styleColorTheme back. Patching the src setter on
 * HTMLImageElement is: it needs no cooperation from the app, it leaves the
 * app's own bundle of mapbox-gl in place, and it observes exactly the check
 * mapbox-gl is about to make. A recorded entry with ok === true is the
 * condition under which the style's LUT gets set.
 */
export const lutProbeScript = (): void => {
  const PREFIX = 'data:image/png;base64,';
  const seen: LutImage[] = [];
  window.__ONEGLOBE_LUT__ = seen;

  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    'src',
  );
  if (!descriptor?.set || !descriptor.get) return;
  const nativeSet = descriptor.set;

  const fingerprint = (payload: string): string => {
    let hash = 0x811c9dc5;
    for (let i = 0; i < payload.length; i += 1) {
      hash = Math.imul(hash ^ payload.charCodeAt(i), 0x01000193);
    }
    return (hash >>> 0).toString(36);
  };

  const watch = (image: HTMLImageElement, value: string): void => {
    const payload = value.slice(PREFIX.length);
    const entry: LutImage = {
      bytes: payload.length,
      hash: fingerprint(payload),
      width: 0,
      height: 0,
      ok: false,
      failed: false,
    };
    seen.push(entry);
    // Registered before the assignment returns, so neither outcome is
    // missed, and mapbox-gl's own onload/onerror still run after these.
    image.addEventListener('load', () => {
      entry.width = image.naturalWidth;
      entry.height = image.naturalHeight;
      entry.ok =
        entry.height > 0 &&
        entry.height <= 32 &&
        entry.width === entry.height * entry.height;
    });
    image.addEventListener('error', () => {
      entry.failed = true;
    });
  };

  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true,
    enumerable: descriptor.enumerable,
    get: descriptor.get,
    set(this: HTMLImageElement, value: string) {
      if (typeof value === 'string' && value.startsWith(PREFIX)) {
        watch(this, value);
      }
      nativeSet.call(this, value);
    },
  });
};

/** Installs the LUT probe for every document this page loads. */
export const installLutProbe = async (page: Page): Promise<void> => {
  // addInitScript hands back a handle for removing the script again;
  // nothing here ever removes one, so it is dropped rather than returned.
  await page.addInitScript(lutProbeScript);
};

/** Reads back every LUT image mapbox-gl has decoded so far. */
export const readLuts = (page: Page): Promise<LutImage[]> =>
  page.evaluate(() => window.__ONEGLOBE_LUT__ ?? []);
