import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page, type TestInfo } from '@playwright/test';

/*
 * THE SOFT RECORD.
 *
 * The review tier used to compare with `toHaveScreenshot`, and every
 * comparison in CI burned its timeout "generating new stable screenshot
 * expectation". The reason is structural rather than a matter of waiting
 * longer: toHaveScreenshot captures repeatedly until two consecutive
 * frames are identical, and a live Mapbox canvas does not deliver that.
 * `reducedMotion: 'reduce'` stops the camera spin because
 * scene/camera.ts resolves it to null, and `animations:
 * 'disabled'` finishes CSS animations and transitions -- neither reaches
 * inside a WebGL canvas that is fading tiles in and refining terrain.
 * That was, again, a mechanism verified against a stub that did hold
 * still.
 *
 * So the pictures are taken, not asserted. `page.screenshot()` grabs one
 * frame and always terminates. The capture is attached to the report
 * unconditionally, which is what the owner asked for -- they are there to
 * be looked at.
 *
 * A baseline, when one exists, is still compared: `toMatchSnapshot` takes
 * a buffer, so it does the image diff WITHOUT the stabilisation loop that
 * made the assertion impossible. The result is recorded as an annotation
 * and never fails the test. The hard gate in scene.spec.ts is what fails
 * a build.
 *
 * WHY NOTHING WRITES A BASELINE. playwright.config.ts sets
 * `updateSnapshots: 'none'`, so a missing baseline throws here and is
 * caught, rather than being written and reported as a soft failure --
 * which is what turned the first run red. Instead every capture is
 * mirrored into test-results/review-captures/ under the exact path its
 * baseline would occupy, so accepting a run is one copy from the
 * uploaded artifact:
 *
 *   cp -r test-results/review-captures/e2e .
 */

export type CaptureResult = {
  name: string;
  /** 'compared', 'drift', or 'no-baseline'. */
  outcome: string;
  detail?: string;
};

/*
 * The repository root, which is NOT testInfo.config.rootDir: Playwright
 * sets rootDir to the common base of the projects' testDirs, so with a
 * single review project it is e2e/ and the mirror landed inside e2e/. The
 * config file's own directory is the repo root by construction.
 */
const repoRoot = (testInfo: TestInfo): string =>
  testInfo.config.configFile
    ? path.dirname(testInfo.config.configFile)
    : process.cwd();

const mirrorPath = (testInfo: TestInfo, baseline: string): string => {
  const root = repoRoot(testInfo);
  return path.join(
    root,
    'test-results',
    'review-captures',
    path.relative(root, baseline),
  );
};

/**
 * Photographs the viewport, attaches it, mirrors it, and compares it to a
 * baseline if there is one. Never throws, and never fails the test.
 */
export const capture = async (
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<CaptureResult> => {
  const file = `${name}.png`;
  const shot = await page.screenshot({
    animations: 'disabled',
    caret: 'hide',
    scale: 'css',
  });

  await testInfo.attach(file, {
    body: shot,
    contentType: 'image/png',
  });

  const baseline = testInfo.snapshotPath(file);
  const mirror = mirrorPath(testInfo, baseline);
  await fs.promises.mkdir(path.dirname(mirror), { recursive: true });
  await fs.promises.writeFile(mirror, shot);

  if (!fs.existsSync(baseline)) {
    const result: CaptureResult = {
      name: file,
      outcome: 'no-baseline',
      detail: `captured; accept it from ${path.relative(
        repoRoot(testInfo),
        mirror,
      )}`,
    };
    testInfo.annotations.push({
      type: 'capture',
      description: `${result.name}: ${result.detail}`,
    });
    return result;
  }

  try {
    // Thresholds come from expect.toMatchSnapshot in playwright.config.ts.
    expect(shot).toMatchSnapshot(file);
    testInfo.annotations.push({
      type: 'capture',
      description: `${file}: matches its baseline`,
    });
    return { name: file, outcome: 'compared' };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : String(error);
    /*
     * A drift is a note for a human, not a build failure: see the header.
     * Playwright has already attached the expected, actual and diff
     * images by the time this runs, so the annotation only has to say
     * that it happened -- with the terminal colouring stripped, because
     * an annotation is read in a web report rather than a terminal.
     */
    testInfo.annotations.push({
      type: 'capture-drift',
      // eslint-disable-next-line no-control-regex
      description: `${file}: ${detail.split('\n')[0].replace(/\[[0-9;]*m/g, '')}`,
    });
    return { name: file, outcome: 'drift', detail };
  }
};
