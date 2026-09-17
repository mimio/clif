import {
  expect,
  type ConsoleMessage,
  type Locator,
  type Page,
} from '@playwright/test';
import {
  THEME_IDS,
  THEME_STORAGE_KEY,
  type ThemeId,
} from 'styles/theme-bootstrap';

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
 * The eight themes and the key they are stored under, IMPORTED FROM THE APP
 * rather than restated.
 *
 * They used to be a copy here, on the stated grounds that importing an app
 * module "drags tsconfig path resolution into the test runner for no gain".
 * There is a gain, and it is the only one that matters: there is no second
 * list to keep in step. styles/theme-bootstrap.ts is a leaf with nothing to
 * drag -- the blocking script is a string it exports, not something it runs,
 * so importing it starts no DOM, no Next runtime and no mapbox -- and the
 * runner resolves it through the same "*" mapping in tsconfig.json that
 * every layer of the app already uses.
 *
 * The layer rule allows this: eslint.config.mjs's base restrict() bars only
 * scene/mapbox/**, and styles/ is L0.
 *
 * e2e/hermetic/theme.spec.ts still asserts the lens offers exactly this
 * list, which is now a check that the PANEL matches the app rather than a
 * check that two hand-written lists match each other.
 */
export { THEME_IDS, THEME_STORAGE_KEY, type ThemeId };

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
   * The route being loaded, when its own status is not 200. Chromium logs
   * every non-2xx response as a console error, the main document included,
   * so the not-found route cannot be asked for a silent console -- it can
   * only be asked not to log anything BESIDES its own 404.
   *
   * It is the ROUTE and not just the status, and that is the whole fix.
   * See below.
   */
  document?: Pick<Route, 'path' | 'status'>;
};

/*
 * WHY THE 404 ALLOWANCE MATCHES ON A URL AND NOT ON THE MESSAGE.
 *
 * It used to be a regex over message.text():
 *
 *   new RegExp(`Failed to load resource.*status of ${status}\\b`)
 *
 * and Chromium puts NO URL in that text. The URL is in
 * message.location().url, on its own. So the allowance written for "the
 * document's own 404" matched every 404 on the page: 404 both webfonts on
 * /no-such-page and collectProblems() returned []; 404 every
 * _next/static/**.js chunk and twelve raw console errors still returned
 * [], with the route's own test passing throughout. A net that catches
 * nothing is worse than no net, because the suite reports a pass.
 *
 * Matching on message.location().url is what makes it the document's own:
 * the main document's console error carries the document's URL, and a
 * font's carries the font's.
 */
const isOwnDocumentFailure = (
  message: ConsoleMessage,
  own: Pick<Route, 'path' | 'status'>,
): boolean => {
  if (own.status === 200) return false;
  if (
    !new RegExp(
      `Failed to load resource.*status of ${own.status}\\b`,
    ).test(message.text())
  ) {
    return false;
  }
  const { url } = message.location();
  if (url === '') return false;
  try {
    return new URL(url).pathname === own.path;
  } catch {
    // A console location that is not a URL at all is not the document's.
    return false;
  }
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
  const own = options.document;

  const allowed = (text: string): boolean =>
    IGNORED.test(text) ||
    (options.allowWebglErrors === true &&
      EXPECTED_WITHOUT_WEBGL.test(text));

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (allowed(text)) return;
    if (own !== undefined && isOwnDocumentFailure(message, own))
      return;
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

/*
 * TWO MESSAGES THAT ARE NOT ERRORS AND MATTER MORE THAN MOST ERRORS.
 *
 * mapbox-gl reports a refused colour theme through `warnOnce`, not through
 * the map's error event: Style._reloadColorTheme() ends in
 * `.catch(e => warnOnce("Couldn't set color theme: " + e))`. So a LUT that
 * mapbox decodes but rejects -- wrong height, wrong width -- produces one
 * console WARNING and nothing else. It does not reach `map.on('error')`,
 * which means it does not reach scene/mapbox/instance.ts's reporter or
 * window.__SCENE__.errors() either. Watching for it at error level misses
 * it entirely.
 *
 * The second is worse, because it is the case where everything succeeds
 * and nothing happens: setColorTheme on a style that carries its own
 * `color-theme` override warns that the theme "won't be visible" and then
 * stores it anyway. appliedLut() would report the LUT, errors() would be
 * empty, the probe would see a clean decode, and the globe would still be
 * wearing Standard's colours. If Mapbox ever ships Standard with an
 * override, this line is the only thing that says so.
 *
 * The third was missing until now, and it is the one that fires when the
 * STYLESHEET carries a colour theme mapbox cannot load:
 * `Couldn't load color theme from the stylesheet: ${err}`, again through
 * warnOnce. Different verb, different call site, same silence -- and the
 * two patterns above do not match it, because "load" is not "set" and
 * there is no "color-theme override" in it.
 */
const COLOUR_THEME_TROUBLE =
  /Couldn't (set|load) color theme|color-theme override/i;

/**
 * Everything that means "Mapbox is unhappy", from four directions at once,
 * because no one of them is complete.
 *
 * The console at error level is not enough, for the two reasons above and
 * because mapbox-gl reports a 401 on a tile through the map's error event
 * rather than the console. scene/mapbox/instance.ts now logs those, so
 * they are visible again -- but the response and requestfailed nets see
 * them whether or not it does.
 */
export const collectMapboxFailures = (page: Page): string[] => {
  const failures: string[] = [];
  const mapbox = /\.mapbox\.com\//;

  page.on('console', (message) => {
    const text = message.text();
    // These two arrive as warnings, and are defects regardless.
    if (
      /Style is not done loading/.test(text) ||
      COLOUR_THEME_TROUBLE.test(text)
    ) {
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

/* ---- the scene handle ------------------------------------------------ */

/** Asks the scene to publish window.__SCENE__ before the app boots. */
export const installSceneDebug = async (
  page: Page,
): Promise<void> => {
  await page.addInitScript(() => {
    window.__SCENE_DEBUG__ = true;
  });
};

export type SceneReport = {
  styleStatus: 'loading' | 'ready' | 'failed';
  /**
   * The LUT the scene handed to setColorTheme, fingerprinted rather than
   * carried: it is about 175KB of base64 and all eight themes share a
   * prefix, so the hash is over the whole payload.
   */
  lut: string | null;
  /** Recent mapbox failures. Empty is the healthy state. */
  errors: string[];
  /** The last thing the scene asked the map to do; context for a failure. */
  lastAction: string;
};

/** Reads the scene's own account of itself out of the page. */
export const readScene = (page: Page): Promise<SceneReport> =>
  page.evaluate(() => {
    const scene = window.__SCENE__;
    if (!scene) {
      throw new Error(
        'window.__SCENE__ is not published: installSceneDebug() has to run before the app boots',
      );
    }
    const lut = scene.appliedLut();
    let hash = 0x811c9dc5;
    if (lut !== null) {
      for (let i = 0; i < lut.length; i += 1) {
        hash = Math.imul(hash ^ lut.charCodeAt(i), 0x01000193);
      }
    }
    return {
      styleStatus: scene.styleStatus(),
      lut:
        lut === null
          ? null
          : `${lut.length}:${(hash >>> 0).toString(36)}`,
      errors: scene.errors(),
      lastAction: scene.lastAction(),
    };
  });

/*
 * The seven knobs scene/theme.ts sends to the Standard import.
 *
 * These names are the second thing nobody could verify without a real
 * Mapbox account, and they fail in the quietest way there is:
 * Style.setConfigProperty() opens with `if (!schema || !schema[key])
 * return` -- an unknown key is not an error, not a warning, not an event.
 * It is a silent no-op, and the globe simply never gets the light preset
 * the route asked for. Reading each one back is the only way to find out.
 */
export const BASEMAP_CONFIG_KEYS = [
  'lightPreset',
  'theme',
  'showRoadLabels',
  'showPlaceLabels',
  'showPointOfInterestLabels',
  'showTransitLabels',
  'show3dObjects',
] as const;

/** What the Standard import reports for each key; null means unknown. */
export const readBasemapConfig = (
  page: Page,
  keys: string[],
): Promise<Record<string, unknown>> =>
  page.evaluate((names) => {
    const scene = window.__SCENE__;
    if (!scene) {
      throw new Error('window.__SCENE__ is not published');
    }
    const map = scene.map as unknown as {
      getConfigProperty: (id: string, key: string) => unknown;
    };
    const out: Record<string, unknown> = {};
    for (const name of names) {
      try {
        out[name] = map.getConfigProperty('basemap', name) ?? null;
      } catch (error) {
        out[name] = `threw: ${String(error)}`;
      }
    }
    return out;
  }, keys);

/**
 * Waits for the map's own `idle` event -- fired when it has finished
 * rendering and has nothing pending -- rather than for a number of
 * milliseconds someone guessed.
 *
 * Resolves true if the map said it was idle and false if it never did.
 * Both are useful: the callers treat false as "carry on, and say so in
 * the report" rather than as a failure, because a map that never goes
 * idle is still worth photographing.
 */
export const MAP_IDLE_BUDGET_MS = 30_000;

export const waitForMapIdle = (
  page: Page,
  timeout = MAP_IDLE_BUDGET_MS,
): Promise<boolean> =>
  page.evaluate((ms) => {
    const scene = window.__SCENE__;
    if (!scene) return Promise.resolve(false);
    const map = scene.map as unknown as {
      loaded?: () => boolean;
      on: (type: string, handler: () => void) => unknown;
      off: (type: string, handler: () => void) => unknown;
    };
    // Already settled: `idle` may not fire again for a long time.
    if (map.loaded?.() === true) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      // Boxed so the two closures can reach each other without either
      // being read before it is initialised.
      const handler: { onIdle: () => void } = { onIdle: () => {} };
      let timer = 0;
      const finish = (idle: boolean): void => {
        window.clearTimeout(timer);
        map.off('idle', handler.onIdle);
        resolve(idle);
      };
      handler.onIdle = () => finish(true);
      timer = window.setTimeout(() => finish(false), ms);
      map.on('idle', handler.onIdle);
    });
  }, timeout);

/**
 * Waits for the map to stop rendering, then gives the foreground a short
 * tail: [data-theme] crossfades over 400ms and the enter animations are
 * CSS, neither of which `idle` reports on. A map that never went idle is
 * given longer, because it is the case where waiting might still help.
 */
export const settle = async (page: Page): Promise<boolean> => {
  const idle = await waitForMapIdle(page);
  await page.waitForTimeout(idle ? THEME_SETTLE_MS : 3_000);
  return idle;
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

/* ---- the theme lens --------------------------------------------------- */

/*
 * THE ONE ACCESSOR FOR THE LENS, AND WHY BOTH TIERS SHARE IT.
 *
 * components/chrome/ThemeEye.tsx renders the panel as a role="group" named
 * by its own visible caption, holding eight ordinary buttons that report
 * aria-pressed. It used to be role="listbox" over role="option", and those
 * roles were removed on purpose -- they promised an arrow-key model the
 * widget does not implement (see that file's header).
 *
 * When they went, only the hermetic spec was updated. e2e/review/scene.spec
 * went on asking for a listbox, and nothing said so for weeks, because the
 * review tier runs only when PREVIEW_URL is set -- that is, only in CI on a
 * deployment_status event. The one suite that could see the break is the one
 * suite no PR runs, and before that the review job was red for an unrelated
 * reason, which hid it completely. A test that ran and told us nothing.
 *
 * So the locators live here once and both tiers import them. The next role
 * change fails the HERMETIC run -- which every PR runs -- on the PR that
 * makes it, rather than the review job weeks later.
 *
 * These deliberately assert against the real markup and nothing else. There
 * is no fallback to the old roles: a helper that accepted either would be
 * more forgiving than the app, which is how the first copy survived.
 */

/**
 * Opens the lens and hands back the panel, having checked it is really
 * there. The check is the point: a role change fails here, immediately and
 * by name, instead of as a click that waits out the whole test timeout.
 */
export const openThemeLens = async (page: Page): Promise<Locator> => {
  await page.getByRole('button', { name: 'Theme' }).click();
  const panel = page.getByRole('group', { name: 'theme' });
  await expect(
    panel,
    'the theme lens panel (role="group" named "theme") is not open',
  ).toBeVisible();
  return panel;
};

/** Every theme the open panel offers, in DOM order. */
export const themeOptions = (panel: Locator): Locator =>
  panel.getByRole('button');

/** One theme's row in the open panel. */
export const themeOption = (panel: Locator, id: ThemeId): Locator =>
  panel.getByRole('button', { name: id, exact: true });

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
