import { ESLint } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

/*
 * The layer rule is only as good as its coverage of the layers.
 *
 * A flat config resolves per file, and a directory with no block of its own
 * falls through to the base config -- which carries the mapbox restriction
 * and nothing else. That failure is silent: `pnpm lint` stays green and the
 * layer is simply unguarded. It happened to pagesComponents/ and styles/,
 * and the only reason anyone noticed was a hand-run of --print-config.
 *
 * So this asserts the shape of the resolved config rather than trusting the
 * source to look complete: every layer directory must resolve to a
 * no-restricted-imports that names its own upward rule, not just the base
 * one. Add a layer without a block and this fails.
 */
type Pattern = { group: string[]; message: string };

const LAYERS = [
  'components/primitives/Text.tsx',
  'components/composed/Sheet.tsx',
  'components/chrome/CoordPill.tsx',
  'content/routes.ts',
  'utils/cn.ts',
  'styles/theme-bootstrap.ts',
  'pagesComponents/hello/index.tsx',
  'scene/budget.ts',
];

/*
 * Resolving a config loads the whole eslint-config-next graph, which is
 * seconds on a cold worker -- well past the 5s default, and slower again
 * under coverage instrumentation. Doing it once here, with a timeout that
 * fits, is what keeps this a gate rather than an intermittent failure.
 */
const resolved = new Map<string, Pattern[]>();

const patternsFor = (file: string): Pattern[] =>
  resolved.get(file) as Pattern[];

beforeAll(async () => {
  const eslint = new ESLint();
  await Promise.all(
    LAYERS.map(async (file) => {
      const config = await eslint.calculateConfigForFile(file);
      const rule = config.rules?.['no-restricted-imports'];
      // ['error', { patterns: [...] }]
      const options = (rule as [unknown, { patterns: Pattern[] }])[1];
      resolved.set(file, options.patterns);
    }),
  );
}, 120_000);

describe('the layer rule', () => {
  it.each(LAYERS)('guards %s with its own block', (file) => {
    const patterns = patternsFor(file);
    const layerRule = patterns.filter((pattern) =>
      pattern.message.startsWith('Layer rule:'),
    );
    expect(layerRule).toHaveLength(1);
    expect(layerRule[0].group.length).toBeGreaterThan(0);
  });

  it('bars every layer but scene/ from scene/mapbox', () => {
    const guarded = LAYERS.filter(
      (file) => !file.startsWith('scene/'),
    );
    const results = guarded.map((file) =>
      patternsFor(file).some((pattern) =>
        pattern.group.includes('scene/mapbox/**'),
      ),
    );
    expect(results).toEqual(guarded.map(() => true));
  });

  it('lets scene/ reach its own mapbox wrapper', () => {
    const patterns = patternsFor('scene/budget.ts');
    expect(
      patterns.some((pattern) =>
        pattern.group.includes('scene/mapbox/**'),
      ),
    ).toBe(false);
  });

  it('bars the leaves from the component stack and the scene', () => {
    const [leaf] = patternsFor('styles/theme-bootstrap.ts').filter(
      (pattern) => pattern.message.startsWith('Layer rule:'),
    );
    expect(leaf.group).toEqual(
      expect.arrayContaining([
        'components/**',
        'pagesComponents/**',
        'pages/**',
        'scene/**',
      ]),
    );
  });

  it('bars the route components from pages/, and nothing else', () => {
    const [route] = patternsFor(
      'pagesComponents/hello/index.tsx',
    ).filter((pattern) => pattern.message.startsWith('Layer rule:'));
    // scene/ is deliberately absent: scene/enter owns the foreground timing
    // the routes have to agree with.
    expect(route.group).toEqual(['pages', 'pages/**']);
  });
});
