import { afterEach, describe, expect, it, vi } from 'vitest';
import { cn } from 'utils/cn';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values and lets a later utility win', () => {
    const off: string | false = false;
    expect(cn('p-2', off, 'p-4')).toBe('p-4');
  });
});

describe('analytics', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    delete window.gtag;
  });

  const load = async () => import('utils/analytics');

  it('is a no-op without a measurement id', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
    vi.resetModules();
    const gtag = vi.fn();
    window.gtag = gtag;
    const analytics = await load();
    expect(analytics.MEASUREMENT_ID).toBe('');
    analytics.pageview('/a');
    analytics.event('thing');
    expect(gtag).not.toHaveBeenCalled();
  });

  it('is a no-op when gtag has not loaded', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST');
    vi.resetModules();
    const analytics = await load();
    expect(() => analytics.pageview('/a')).not.toThrow();
    expect(() => analytics.event('thing')).not.toThrow();
  });

  it('sends a page view and an event once configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST');
    vi.resetModules();
    const gtag = vi.fn();
    window.gtag = gtag;
    const analytics = await load();
    analytics.pageview('/a');
    analytics.event('thing', { n: 1 });
    expect(gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({ page_path: '/a' }),
    );
    expect(gtag).toHaveBeenCalledWith('event', 'thing', { n: 1 });
  });
});
