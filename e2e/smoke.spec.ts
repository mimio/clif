import { expect, test } from '@playwright/test';
import { stubMapbox } from './fixtures/mapbox-stub';

// Hosts whose availability is not the app's concern.
const IGNORED =
  /(google-analytics\.com|googletagmanager\.com|fonts\.gstatic\.com|fonts\.googleapis\.com)/;

test('/ responds 200 and logs no console errors', async ({
  context,
  page,
}) => {
  await stubMapbox(context);

  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !IGNORED.test(message.text())) {
      problems.push(`console: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    problems.push(`pageerror: ${error.message}`);
  });

  const response = await page.goto('/', { waitUntil: 'load' });

  expect(response?.status()).toBe(200);
  expect(problems).toEqual([]);
});
