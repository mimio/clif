import type { BrowserContext } from '@playwright/test';

// A minimal style document. Mapbox GL only needs a valid v8 style to reach a
// painted frame, and a flat background is enough to prove the canvas lives.
const LOCAL_STYLE = {
  version: 8,
  name: 'e2e-style',
  sources: {},
  glyphs:
    'https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#101418' },
    },
  ],
};

/*
 * The terrain DEM, which is not optional.
 *
 * `mapbox://mapbox.mapbox-terrain-dem-v1` normalises to
 * /v4/<tileset>.json, which the catch-all below used to answer with an
 * empty 204. A raster-dem source with no TileJSON has no tile cache, and
 * the first frame after a client-side navigation into a terrain route
 * died inside mapbox's own Terrain.update with "Cannot read properties
 * of undefined (reading 'get')". A direct load happened to survive it,
 * which is what made it look like an app bug.
 *
 * So the stub serves a real one. Terrain-RGB decodes elevation as
 * -10000 + (R * 65536 + G * 256 + B) * 0.1, so rgb(1, 134, 160) is
 * exactly 0m: a valid, flat, deterministic world. Terrain that is on and
 * flat is the right thing for a screenshot test anyway -- real DEM tiles
 * would make every terrain-route screenshot depend on the network.
 */
const DEM_TILESET = 'mapbox.mapbox-terrain-dem-v1';

const DEM_TILE_URL = `https://api.mapbox.com/v4/${DEM_TILESET}/{z}/{x}/{y}.png`;

const DEM_TILEJSON = {
  tilejson: '2.2.0',
  name: 'e2e-dem',
  format: 'png',
  encoding: 'mapbox',
  scheme: 'xyz',
  tiles: [DEM_TILE_URL],
  minzoom: 0,
  maxzoom: 15,
  bounds: [-180, -85.051129, 180, 85.051129],
};

/** 256x256 of rgb(1, 134, 160): sea level everywhere. */
const DEM_TILE_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAAB/0lEQVR42u3TQQ0AAAjEsMM8OpDKGw00qYIlS/XAW5EAA4ABwABgADAAGAAMAAYAA4ABwABgADAAGAAMAAYAA4ABwABgADAAGAAMAAYAA4ABwABgADAAGAAMAAYAA4ABwABgADAAGAAMAAYAA4ABwABgADAAGAAMAAYAA4ABwAAYQAUMAAYAA4ABwABgADAAGAAMAAYAA4ABwABgADAAGAAMAAYAA4ABwABgADAAGAAMAAYAA4ABwABgADAAGAAMAAYAA4ABwABgADAAGAAMAAYAA4ABwABgADAAGAAMAAYAA2AAMAAYAAwABgADgAHAAGAAMAAYAAwABgADgAHAAGAAMAAYAAwABgADgAHAAGAAMAAYAAwABgADgAHAAGAAMAAYAAwABgADgAHAAGAAMAAYAAwABgADgAHAAGAAMAAYAAOogAHAAGAAMAAYAAwABgADgAHAAGAAMAAYAAwABgADgAHAAGAAMAAYAAwABgADgAHAAGAAMAAYAAwABgADgAHAAGAAMAAYAAwABgADgAHAAGAAMAAYAAwABgADgAHAAGAADAAGAAOAAcAAYAAwABgADAAGAAOAAcAAYAAwABgADAAGAAOAAcAAYAAwABgADAAGAAOAAcAAYAAwABgADAAGAAOAAcAAYAAwABgADAAGAAOAAcAAYAAwABgArgWh1RFKMF4sNAAAAABJRU5ErkJggg==';

/*
 * Answers every Mapbox request from inside the browser context, so the suite
 * needs no network, no token and no quota. Salvaged from the old
 * scripts/smoke.mts, which proved the three routes are the complete set:
 * telemetry, styles and glyph ranges.
 *
 * Playwright matches the most recently registered route first, so the
 * specific handlers below have to come after the catch-all.
 */
export const stubMapbox = async (
  context: BrowserContext,
): Promise<void> => {
  await context.route(
    /https:\/\/(api|events)\.mapbox\.com\/.*/,
    (route) => route.fulfill({ status: 204, body: '' }),
  );
  await context.route(
    /https:\/\/api\.mapbox\.com\/styles\/v1\/.*/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(LOCAL_STYLE),
      }),
  );
  await context.route(
    /https:\/\/api\.mapbox\.com\/fonts\/v1\/.*/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/x-protobuf',
        body: Buffer.alloc(0),
      }),
  );
  await context.route(
    /https:\/\/api\.mapbox\.com\/v4\/[^/]+\.json.*/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(DEM_TILEJSON),
      }),
  );
  await context.route(
    /https:\/\/api\.mapbox\.com\/v4\/[^/]+\/\d+\/\d+\/\d+\.(png|webp|pngraw).*/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(DEM_TILE_PNG, 'base64'),
      }),
  );
};
