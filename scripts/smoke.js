#!/usr/bin/env node
/*
 * Browser smoke test for the production build. Run `pnpm build` first, then:
 *
 *   pnpm test:e2e
 *
 * Starts `next start` on a free port, drives every route in headless
 * Chromium, and fails on page errors, failed requests, or a broken feature:
 * the d3 globe, the filmstrip drag, the three.js image effect, and the
 * Mapbox history map. Mapbox style, glyph, session and telemetry requests
 * are answered locally so the test needs no network and no token quota.
 * Screenshots of every route land in SMOKE_OUT (default: .smoke-output).
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = Number(process.env.PORT) || 3999;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.resolve(process.env.SMOKE_OUT || '.smoke-output');
// Third-party hosts whose availability is not the app's concern.
const IGNORED_HOSTS =
  /(google-analytics\.com|googletagmanager\.com|fonts\.gstatic\.com|fonts\.googleapis\.com)/;

const localStyle = {
  version: 8,
  name: 'smoke-style',
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

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function startServer() {
  const nextBin = require.resolve('next/dist/bin/next');
  const server = spawn(
    process.execPath,
    [nextBin, 'start', '-p', String(PORT)],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'production' },
    },
  );
  let output = '';
  server.stdout.on('data', (d) => (output += d));
  server.stderr.on('data', (d) => (output += d));
  for (let i = 0; i < 120; i += 1) {
    if (server.exitCode !== null) {
      throw new Error(`next start exited early:\n${output}`);
    }
    try {
      const res = await fetch(`${BASE}/`);
      if (res.ok) return server;
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  server.kill();
  throw new Error(`server did not respond on ${BASE}\n${output}`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
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
        body: JSON.stringify(localStyle),
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

  let failures = 0;
  const report = (name, ok, detail) => {
    console.log(
      `${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` ${detail}` : ''}`,
    );
    if (!ok) failures += 1;
  };

  async function visit(route, checks) {
    const page = await context.newPage();
    const pageErrors = [];
    const consoleErrors = [];
    const failedRequests = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    page.on('console', (m) => {
      if (
        m.type() === 'error' &&
        !/Failed to load resource/.test(m.text())
      ) {
        consoleErrors.push(m.text());
      }
    });
    page.on('requestfailed', (r) => {
      if (!IGNORED_HOSTS.test(r.url())) {
        failedRequests.push(`${r.failure()?.errorText} ${r.url()}`);
      }
    });
    const response = await page.goto(`${BASE}${route}`, {
      waitUntil: 'load',
      timeout: 60000,
    });
    report(
      `${route} responds 200`,
      response.status() === 200,
      String(response.status()),
    );
    await page.waitForTimeout(1500);
    let result = null;
    try {
      result = await checks(page);
    } catch (err) {
      report(`${route} checks`, false, String(err.message || err));
    }
    await page.screenshot({
      path: path.join(
        OUT,
        `${route.replace(/\//g, '_') || '_root'}.png`,
      ),
    });
    report(
      `${route} no page errors`,
      pageErrors.length === 0,
      pageErrors.join(' | '),
    );
    report(
      `${route} no failed requests`,
      failedRequests.length === 0,
      failedRequests.join(' | '),
    );
    report(
      `${route} no console errors`,
      consoleErrors.length === 0,
      consoleErrors.slice(0, 3).join(' | '),
    );
    await page.close();
    return result;
  }

  await visit('/', async (page) => {
    const globe = await page.evaluate(() => {
      const canvas = document.getElementById('globe');
      if (!canvas) return { found: false };
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      const data = ctx.getImageData(
        width / 2 - 50,
        height / 2 - 50,
        100,
        100,
      ).data;
      let painted = 0;
      for (let i = 3; i < data.length; i += 4)
        if (data[i] > 0) painted += 1;
      return { found: true, painted };
    });
    report(
      '/ globe canvas painted',
      globe.found && globe.painted > 0,
      JSON.stringify(globe),
    );
    const styles = await page.evaluate(
      () => document.querySelectorAll('style[data-emotion]').length,
    );
    report(
      '/ emotion styles injected',
      styles > 0,
      `${styles} style tags`,
    );
  });

  const firstProject = await visit('/projects', async (page) => {
    const links = await page.locator('a[href^="/projects/"]').count();
    report(
      '/projects project links rendered',
      links > 0,
      `${links} links`,
    );
    const strip = await page.evaluate(() => {
      let el = document.querySelector('a[href^="/projects/"]');
      while (el && el !== document.body) {
        const overflow = getComputedStyle(el).overflowX;
        if (
          /(hidden|auto|scroll)/.test(overflow) &&
          el.scrollWidth > el.clientWidth
        )
          break;
        el = el.parentElement;
      }
      if (!el || el === document.body) return null;
      el.setAttribute('data-smoke-strip', '1');
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        scrollLeft: el.scrollLeft,
      };
    });
    report('/projects filmstrip container found', Boolean(strip));
    if (strip) {
      await page.mouse.move(strip.x, strip.y);
      await page.mouse.down();
      for (let i = 1; i <= 10; i += 1) {
        await page.mouse.move(strip.x - i * 40, strip.y);
        await page.waitForTimeout(16);
      }
      await page.mouse.up();
      await page.waitForTimeout(1000);
      const after = await page.evaluate(
        () => document.querySelector('[data-smoke-strip]').scrollLeft,
      );
      report(
        '/projects drag scrolls filmstrip',
        after > strip.scrollLeft,
        `scrollLeft ${strip.scrollLeft} -> ${after}`,
      );
    }
    const previews = await page.evaluate(
      () =>
        Array.from(document.images).filter(
          (img) => img.complete && img.naturalWidth > 0,
        ).length,
    );
    report(
      '/projects preview images loaded',
      previews > 0,
      `${previews} images`,
    );
    return page
      .locator('a[href^="/projects/"]')
      .first()
      .getAttribute('href');
  });

  await visit(firstProject || '/projects/haikumi', async (page) => {
    const canvases = await page.evaluate(() =>
      Array.from(document.querySelectorAll('canvas')).map((c) => ({
        w: c.width,
        webgl: Boolean(
          c.getContext('webgl2') || c.getContext('webgl'),
        ),
      })),
    );
    report(
      `${firstProject} three.js canvas has WebGL`,
      canvases.some((c) => c.webgl && c.w > 0),
      JSON.stringify(canvases),
    );
  });

  await visit('/history', async (page) => {
    await page.waitForFunction(
      () =>
        window.map &&
        window.map.loaded &&
        window.map.loaded() &&
        window.map.getLayer('work-source'),
      null,
      { timeout: 60000 },
    );
    const info = await page.evaluate(() => ({
      pitch: window.map.getPitch(),
      layers: window.map.getStyle().layers.length,
      features: window.map.querySourceFeatures('work-source').length,
    }));
    report(
      '/history map loaded with layers',
      info.layers === 4 && info.features === 10,
      JSON.stringify(info),
    );
    report(
      '/history pitch preserved',
      info.pitch === 60,
      String(info.pitch),
    );
  });

  await browser.close();
  server.kill();
  console.log(
    failures
      ? `\n${failures} check(s) failed (screenshots in ${OUT})`
      : '\nall checks passed',
  );
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error('smoke test crashed:', err);
  process.exit(2);
});
