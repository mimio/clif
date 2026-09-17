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
 * Answers every Mapbox request from inside the browser context, so the suite
 * needs no network, no token and no quota. Salvaged from the old
 * scripts/smoke.mts, which proved the three routes are the complete set:
 * telemetry, styles and glyph ranges.
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
};
