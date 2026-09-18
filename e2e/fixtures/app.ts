import {
  expect,
  type ConsoleMessage,
  type Locator,
  type Page,
} from '@playwright/test';
import { BASEMAP_IMPORT } from 'scene/theme';
import {
  THEME_IDS,
  THEME_STORAGE_KEY,
  type ThemeId,
} from 'styles/theme-bootstrap';

export { BASEMAP_IMPORT };

/*
 * The only style this app can be themed on, as a string.
 *
 * It is a HAND COPY of scene/mapbox/loader.ts's DEFAULT_STYLE and cannot
 * be an import: loader.ts is where mapbox-gl is loaded, and the layer
 * rule in eslint.config.mjs keeps scene/mapbox/** reachable from scene/
 * and nowhere else.
 *
 * So it is guarded behaviourally instead, on every PR: the hermetic stub
 * records the style URL the app actually constructed its map with, and
 * e2e/hermetic/theme.spec.ts asserts that it is this. A copy compared
 * against the running app is worth more than a copy compared against
 * another copy, and this one cannot drift without that spec going red.
 */
export const THEMEABLE_STYLE = 'mapbox://styles/mapbox/standard';

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
 * The second fires when the STYLESHEET carries a colour theme mapbox
 * cannot load: `Couldn't load color theme from the stylesheet: ${err}`,
 * again through warnOnce. Different verb, different call site, same
 * silence -- and the pattern above does not match it, because "load" is
 * not "set".
 *
 * A THIRD PATTERN USED TO BE HERE AND HAS BEEN REMOVED ON PURPOSE:
 * /color-theme override/, which matches `Note: setColorTheme is called on
 * a style with a color-theme override, the passed color-theme won't be
 * visible.` It was watching for the case where everything succeeds and
 * nothing happens, and it can no longer mean that here.
 *
 * The scene now themes the basemap with setImportColorTheme, which IS
 * `fragmentStyle._styleColorTheme.colorThemeOverride = theme` -- so the
 * override on the fragment is ours, it wins over anything Standard's own
 * stylesheet or the import spec carries, and nothing in the app calls the
 * root setColorTheme at all (asserted in the unit suite and in tier 1).
 * The only remaining way for that line to be printed is mapbox-gl's own
 * bookkeeping: Style.updateConfigDependencies() walks every fragment and
 * re-sets a colour theme whose data does not match the LUT currently
 * loaded, which is true for the few milliseconds between
 * setImportColorTheme and the PNG finishing its decode. A
 * setConfigProperty landing inside that window prints the note about a
 * theme that is, in fact, perfectly visible.
 *
 * Keeping it would have made a tripwire that fires on a race rather than
 * on a defect, which is the "assertion that cannot be made green" this
 * suite is written to avoid. What replaces it is not a weaker check but a
 * stronger one: readBasemapLut() reads the LUT off the scope the globe is
 * painted from and e2e/review/scene.spec.ts requires it to be the one the
 * scene sent, per route and per theme. That is the fact the warning was a
 * proxy for.
 */
const COLOUR_THEME_TROUBLE = /Couldn't (set|load) color theme/i;

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
   * The style URL this build is running.
   *
   * NEXT_PUBLIC_MAPBOX_STYLE is inlined at build time and overrides the
   * default, so on a deployed preview there is no other way to find out
   * which style is in use -- and "which style" decides whether any of
   * the theming works at all.
   */
  styleUrl: string;
  /**
   * Whether that style has the import the colour theme is addressed to.
   * False means every theme change is a silent no-op on the basemap.
   */
  colorThemeSupported: boolean | null;
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
      styleUrl: scene.styleUrl(),
      colorThemeSupported: scene.colorThemeSupported(),
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
 *
 * This list is a HAND COPY of BasemapConfig's fields and cannot be an
 * import: tier 2 needs the key NAMES as strings and the type is erased.
 * So it is guarded instead, hermetically, in e2e/hermetic/routes.spec.ts
 * -- the stub records every [key, value] the scene sends, and that set
 * has to equal this one. Without that guard an eighth field added to
 * BasemapConfig would be the single thing tier 2 never asks Standard
 * about, which is the one question tier 2 exists to answer.
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

/* ---- what the LIVE style is actually wearing ------------------------- */

export type BasemapLut = {
  /**
   * 'ok'            the basemap scope holds a LUT;
   * 'no-lut'        it holds none, which is the silent failure;
   * 'no-style-api'  this build of mapbox-gl no longer answers the
   *                 question the way this reader asks it.
   */
  outcome: 'ok' | 'no-lut' | 'no-style-api';
  /** `${bytes}:${fnv}` over the LUT the basemap scope holds. */
  fingerprint: string | null;
  /** The same for the ROOT style's scope, which should hold none. */
  root: string | null;
};

/*
 * THE ONE READ THAT ANSWERS "IS THE GLOBE WEARING IT".
 *
 * Everything else this file offers reports the REQUEST: appliedLut() is
 * what the scene sent, and the LUT probe is what mapbox decoded. Both
 * were green on a deployment where the basemap wore none of the eight
 * themes, because `map.setColorTheme()` succeeds, decodes and applies --
 * to the ROOT style's layers. Standard's own layers live in the
 * `basemap` import and are painted with `style.getLut(layer.scope)`, so
 * the question that actually matters is which SCOPE holds a LUT.
 *
 * Style.getLut(scope) is how mapbox-gl itself asks it, and `map.style`
 * is not public API -- so this reports what it found rather than
 * throwing, and the spec asserts on the outcome. A mapbox-gl that no
 * longer answers this way comes back as 'no-style-api' and fails the
 * assertion with a message that says so, which is the right way for an
 * internal read to break: loudly, and about itself.
 */
export const readBasemapLut = (page: Page): Promise<BasemapLut> =>
  page.evaluate((importId) => {
    const scene = window.__SCENE__;
    if (!scene) {
      throw new Error('window.__SCENE__ is not published');
    }
    type Lut = { data?: string } | null | undefined;
    const style = (
      scene.map as unknown as {
        style?: { getLut?: (scope: string) => Lut };
      }
    ).style;
    if (!style || typeof style.getLut !== 'function') {
      return {
        outcome: 'no-style-api' as const,
        fingerprint: null,
        root: null,
      };
    }
    // The same FNV-1a over the same payload readScene() hashes, so the
    // two fingerprints are comparable by construction.
    const print = (lut: Lut): string | null => {
      if (!lut || typeof lut.data !== 'string') return null;
      let hash = 0x811c9dc5;
      for (let i = 0; i < lut.data.length; i += 1) {
        hash = Math.imul(hash ^ lut.data.charCodeAt(i), 0x01000193);
      }
      return `${lut.data.length}:${(hash >>> 0).toString(36)}`;
    };
    const basemap = print(style.getLut(importId));
    return {
      outcome:
        basemap === null ? ('no-lut' as const) : ('ok' as const),
      fingerprint: basemap,
      // The root style's scope is the empty string in mapbox-gl.
      root: print(style.getLut('')),
    };
  }, BASEMAP_IMPORT);

/* ---- sampling what the basemap actually painted ---------------------- */

/**
 * The attribute that hides everything in front of the globe.
 *
 * The app is three siblings in z order -- SceneRoot, the route's
 * foreground, the chrome -- so hiding the scene's two siblings leaves the
 * map and nothing else. It is an attribute toggle rather than a style tag
 * added and removed, because the theme lens lives in the chrome and a
 * `visibility: hidden` lens cannot be clicked.
 */
export const BASEMAP_ONLY = 'data-basemap-only';

/** Installs the rule the attribute switches on. Once per page. */
export const installBasemapOnly = async (
  page: Page,
): Promise<void> => {
  await page.addStyleTag({
    content: `html[${BASEMAP_ONLY}] [data-testid="scene-root"] ~ * {
      visibility: hidden !important;
    }`,
  });
};

/** Hides or restores everything in front of the globe. */
export const showBasemapOnly = (
  page: Page,
  on: boolean,
): Promise<void> =>
  page.evaluate(
    ([attribute, wanted]) =>
      new Promise<void>((resolve) => {
        document.documentElement.toggleAttribute(
          attribute as string,
          wanted as boolean,
        );
        // One frame, so the compositor has drawn the change before
        // anything screenshots it.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve()),
        );
      }),
    [BASEMAP_ONLY, on] as const,
  );

export type PixelStats = {
  /** How many pixels the sample covered. Zero means the clip missed. */
  pixels: number;
  red: number;
  green: number;
  blue: number;
  /**
   * Mean red minus mean blue: the warm/cool axis, and the one the eight
   * themes separate on. It is a DIFFERENCE of two channels of the same
   * pixel, so exposure, the light preset and the fog -- which move all
   * three channels together -- largely cancel out of it, while a
   * basemap re-tinted from --map-land does not.
   */
  opponency: number;
};

/**
 * Screenshots a region and reports its mean colour.
 *
 * The map is a WebGL canvas with preserveDrawingBuffer off, so nothing
 * in the page can read its pixels back -- toDataURL on it returns an
 * empty buffer. Playwright's screenshot is a real composite of what the
 * compositor drew, which is the only honest way to see what the globe
 * looks like; it comes back as a PNG, and Chromium is right there to
 * decode it.
 */
export const samplePixels = async (
  page: Page,
  clip: { x: number; y: number; width: number; height: number },
): Promise<PixelStats> => {
  const shot = await page.screenshot({ clip });
  return page.evaluate(
    (encoded) =>
      new Promise<PixelStats>((resolve, reject) => {
        const image = new Image();
        image.onerror = () =>
          reject(new Error('the capture did not decode'));
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          if (!context) {
            reject(
              new Error('no 2d context to decode the capture in'),
            );
            return;
          }
          context.drawImage(image, 0, 0);
          const { data } = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          let red = 0;
          let green = 0;
          let blue = 0;
          const pixels = data.length / 4;
          for (let at = 0; at < data.length; at += 4) {
            red += data[at];
            green += data[at + 1];
            blue += data[at + 2];
          }
          resolve({
            pixels,
            red: red / pixels,
            green: green / pixels,
            blue: blue / pixels,
            opponency: (red - blue) / pixels,
          });
        };
        image.src = `data:image/png;base64,${encoded}`;
      }),
    shot.toString('base64'),
  );
};

/* ---- the globe, measured rather than assumed -------------------------
 *
 * WHY THIS EXISTS, AND WHY IT IS IN THE FIXTURES RATHER THAN IN ONE SPEC.
 *
 * e2e/review/scene.spec.ts's atmosphere assertion used to locate its
 * sample from the artboard's ratios -- centre at 0.66 of the width,
 * radius 0.44 of the height -- and then sample "1.45 radii out" from
 * those numbers. That is an assumption about the running page dressed up
 * as a measurement, and the first time the assertion ran against a real
 * preview it failed with the far field sixteen levels hotter than the
 * ground. Sixteen levels is not what an atmosphere leaves at 1.45r; it is
 * roughly what the globe's own limb region reads. A sample that is not
 * where it thinks it is cannot tell those apart.
 *
 * So both tiers now find the sphere the way e2e/hermetic/globe-frame.spec
 * .ts finds it -- by bisecting on mapbox's own inverse -- and measure
 * outward from THAT. The method is sound for the reason that file
 * argues at length: `unproject` round-trips through `project` on the
 * globe and clamps to the horizon off it, so "the outermost point whose
 * round trip still closes" is exactly the silhouette, with no model of
 * the projection involved.
 */

export type GlobeFraming = {
  /** The projection centre, in CSS pixels. */
  centre: { x: number; y: number };
  /** The silhouette radius, in CSS pixels, median of three rays. */
  radius: number;
  /** Per-ray radii, so a disagreement is visible rather than averaged away. */
  radii: number[];
  zoom: number;
  /** The layout viewport the scene framed itself against. */
  box: { width: number; height: number };
  /** mapbox's own idea of the same box. */
  canvas: { width: number; height: number };
};

/**
 * Where the globe actually is, off the live map.
 *
 * Requires the scene debug handle, so `installSceneDebug` has to have run
 * before the app booted.
 */
export const measureGlobe = (page: Page): Promise<GlobeFraming> =>
  page.evaluate(async () => {
    type Point = { x: number; y: number };
    type Probe = {
      project: (at: [number, number]) => Point;
      unproject: (at: [number, number]) => {
        lng: number;
        lat: number;
      };
      getCenter: () => { lng: number; lat: number };
      getZoom: () => number;
      getPadding: () => Record<string, number>;
      isEasing: () => boolean;
      transform: { width: number; height: number };
    };
    const scene = window.__SCENE__;
    if (!scene) throw new Error('window.__SCENE__ is not published');
    const map = scene.map as unknown as Probe;

    const wait = (ms: number) =>
      new Promise((done) => {
        setTimeout(done, ms);
      });
    // The same settle globe-frame.spec.ts uses: a completed scene pass,
    // no easing, and the framing holding still across three reads. The
    // hello camera spins for ever, so `idle` is not available here.
    const snapshot = (): string =>
      `${map.getZoom()}/${JSON.stringify(map.getPadding())}`;
    let previous = '';
    let still = 0;
    for (let tries = 0; tries < 300 && still < 3; tries += 1) {
      await wait(100);
      const now = snapshot();
      const settled =
        tries >= 3 &&
        scene.passes() >= 1 &&
        !map.isEasing() &&
        now === previous;
      still = settled ? still + 1 : 0;
      previous = now;
    }
    if (still < 3) throw new Error('the camera never settled');

    const centre = map.project([
      map.getCenter().lng,
      map.getCenter().lat,
    ]);
    const onGlobe = (x: number, y: number): boolean => {
      const place = map.unproject([x, y]);
      const back = map.project([place.lng, place.lat]);
      return Math.hypot(back.x - x, back.y - y) < 0.01;
    };
    const limb = (dx: number, dy: number): number => {
      let inside = 0;
      let outside = 8_000;
      while (outside - inside > 0.005) {
        const middle = (inside + outside) / 2;
        if (onGlobe(centre.x + dx * middle, centre.y + dy * middle)) {
          inside = middle;
        } else {
          outside = middle;
        }
      }
      return inside;
    };
    // Right, left and down. Up is left out because it crosses the north
    // pole at this latitude, where the round trip breaks for a reason
    // that has nothing to do with the limb.
    const radii = [limb(1, 0), limb(-1, 0), limb(0, 1)];
    const sorted = [...radii].sort((a, b) => a - b);
    const root = document.documentElement;
    return {
      centre: { x: centre.x, y: centre.y },
      radius: sorted[1],
      radii,
      zoom: map.getZoom(),
      box: { width: root.clientWidth, height: root.clientHeight },
      canvas: {
        width: map.transform.width,
        height: map.transform.height,
      },
    };
  });

/** One ring of the radial profile. */
export type RingStat = {
  /** Distance from the centre, in globe radii. */
  dd: number;
  /** How many boxes on the ring were wholly on screen. */
  boxes: number;
  /** Median of the per-box mean red, and the same for green and blue. */
  red: number;
  green: number;
  blue: number;
  /** The hottest per-box mean red on the ring, and the hottest pixel. */
  maxBoxRed: number;
  maxPixelRed: number;
};

/**
 * The atmosphere's radial profile, as MEDIANS around a ring.
 *
 * Three deliberate choices, each of which the point sample it replaces
 * got wrong:
 *
 *   A RING, NOT A POINT. The glow is isotropic about the globe's centre
 *   -- the shader's only spatial input is the angle from it -- so every
 *   box on a ring should read the same. One that does not is something
 *   else: a star, a piece of foreground that did not hide, the limb
 *   itself if the geometry is wrong. A point sample cannot tell.
 *
 *   THE MEDIAN, NOT THE MEAN. mapbox draws sixteen thousand white stars
 *   in the space region whenever `star-intensity` is above zero, and
 *   their positions rotate with the camera's centre -- so a fixed screen
 *   point sees a different sky in a tier that spins the globe and a tier
 *   that does not. Measured against the real library, the worst 24x24 box
 *   on a ring at 1.45r reads 0.4 levels above the ground with stars on
 *   and 0.1 with them off, so they cannot produce a failure on their own;
 *   the median removes what is left of them anyway.
 *
 *   ONE SCREENSHOT, DECODED IN THE PAGE. A screenshot per box is dozens
 *   of round trips and dozens of chances for the frame to change under
 *   the measurement.
 */
export const sampleRadial = async (
  page: Page,
  framing: GlobeFraming,
  ddValues: number[],
  boxSize = 24,
): Promise<RingStat[]> => {
  const shot = await page.screenshot();
  return page.evaluate(
    ({ encoded, centre, radius, ddValues: dds, boxSize: size }) =>
      new Promise<RingStat[]>((resolve, reject) => {
        const image = new Image();
        image.onerror = () =>
          reject(new Error('the capture did not decode'));
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          if (!context) {
            reject(
              new Error('no 2d context to decode the capture in'),
            );
            return;
          }
          context.drawImage(image, 0, 0);
          const { data, width, height } = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          /*
           * The capture is in device pixels; everything else is CSS.
           * innerWidth, not documentElement.clientWidth: the screenshot
           * covers the whole viewport INCLUDING a classic scrollbar,
           * while clientWidth excludes it, and the difference would slide
           * every box a few pixels outward on a page that scrolls.
           * map.project's origin is the fixed, inset-0 scene container,
           * which shares the screenshot's top-left corner.
           */
          const scale = canvas.width / window.innerWidth;
          const half = (size * scale) / 2;
          const out = dds.map((dd) => {
            const ring = radius * dd * scale;
            const cx = centre.x * scale;
            const cy = centre.y * scale;
            const reds: number[] = [];
            const greens: number[] = [];
            const blues: number[] = [];
            let maxPixelRed = 0;
            for (let degrees = 0; degrees < 360; degrees += 6) {
              const angle = (degrees * Math.PI) / 180;
              const bx = cx + ring * Math.cos(angle);
              const by = cy + ring * Math.sin(angle);
              if (
                bx - half < 0 ||
                bx + half >= width ||
                by - half < 0 ||
                by + half >= height
              ) {
                continue;
              }
              let r = 0;
              let g = 0;
              let b = 0;
              let n = 0;
              for (let dy = -half; dy < half; dy += 1) {
                for (let dx = -half; dx < half; dx += 1) {
                  const at =
                    (Math.round(by + dy) * width +
                      Math.round(bx + dx)) *
                    4;
                  r += data[at];
                  g += data[at + 1];
                  b += data[at + 2];
                  if (data[at] > maxPixelRed) maxPixelRed = data[at];
                  n += 1;
                }
              }
              reds.push(r / n);
              greens.push(g / n);
              blues.push(b / n);
            }
            const mid = (values: number[]): number =>
              values.length === 0
                ? Number.NaN
                : [...values].sort((a, b) => a - b)[
                    Math.floor(values.length / 2)
                  ];
            return {
              dd,
              boxes: reds.length,
              red: mid(reds),
              green: mid(greens),
              blue: mid(blues),
              maxBoxRed:
                reds.length === 0 ? Number.NaN : Math.max(...reds),
              maxPixelRed,
            };
          });
          resolve(out);
        };
        image.src = `data:image/png;base64,${encoded}`;
      }),
    {
      encoded: shot.toString('base64'),
      centre: framing.centre,
      radius: framing.radius,
      ddValues,
      boxSize,
    },
  );
};

/* ---- getting a measurement out of CI ---------------------------------
 *
 * The review tier runs only on a deployment_status event, on a runner
 * nobody in this project can reach: its logs redirect to blob storage the
 * egress policy denies, and its artifacts need the same. What DOES come
 * back is check-run annotations. GitHub creates one for every `::notice::`
 * workflow command a step writes to stdout, so that is the channel, and a
 * console.log is not.
 *
 * Locally it is an ordinary line of output, which is what it should be.
 */
const escapeData = (value: string): string =>
  value
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A');

const escapeProperty = (value: string): string =>
  escapeData(value).replace(/:/g, '%3A').replace(/,/g, '%2C');

/** Emits a GitHub notice, which is the only reading this job gets out. */
export const notice = (title: string, message: string): void => {
  console.log(
    `::notice title=${escapeProperty(title)}::${escapeData(message)}`,
  );
};

/** A radial profile as one line, for a notice or a failure message. */
export const describeProfile = (rings: RingStat[]): string =>
  rings
    .map(
      (ring) =>
        `${ring.dd.toFixed(2)}r rgb(${ring.red.toFixed(1)}, ` +
        `${ring.green.toFixed(1)}, ${ring.blue.toFixed(1)}) ` +
        `[n=${ring.boxes} hottestBox=${ring.maxBoxRed.toFixed(1)} ` +
        `hottestPx=${ring.maxPixelRed}]`,
    )
    .join('; ');
