import { readFileSync } from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { compile } from 'tailwindcss';
import { describe, expect, it } from 'vitest';
import Icon, { ICON_SRCS } from 'components/primitives/Icon';
import PageWord, {
  PAGE_WORD_SIZES,
  PAGE_WORD_STEPS,
  type PageWordSize,
} from 'components/primitives/PageWord';
import Text, { type TextVariant } from 'components/primitives/Text';

/*
 * Lane 1's own file, so the shared test/primitives.test.tsx stays where the
 * other lanes left it. It covers what the shared file does not: the whole
 * variant and size sweep (a missing key in one of the lookup tables would
 * otherwise render an element with no size at all), and the icon path that
 * nothing in public/icons answers to.
 */

const VARIANTS: TextVariant[] = [
  'heading',
  'heading2',
  'heading3',
  'subheader',
  'subheader2',
  'body',
  'body2',
  'detail',
  'detail2',
  'detail3',
  'label',
  'readout',
];

const SIZES: PageWordSize[] = ['xl', 'lg', 'md', 'sm'];

/** The rendered class list as exact names, for assertions that must not
 *  pass on a substring of a longer class. */
const classesOf = (text: string): string[] =>
  screen.getByText(text).className.split(' ');

/*
 * WEIGHT IS MEASURED, NOT READ OFF THE CLASS LIST, and that distinction is
 * the whole reason this harness exists.
 *
 * The variants used to set their weight as an arbitrary PROPERTY while
 * every caller overriding one wrote an arbitrary VALUE. tailwind-merge
 * files those in two different groups, so `cn()` kept both and the
 * compiled sheet decided -- and it sorts arbitrary-property rules after
 * named ones, so the variant won and the caller's weight was silently
 * dropped. A class-list assertion cannot see that: both classes are
 * present and both look right. Only the cascade knows.
 *
 * So: Tailwind itself compiles the utilities the element actually carries,
 * jsdom applies them in the order Tailwind emitted them, and the winning
 * declaration is resolved through the real --weight tokens.
 */
const ROOT = path.resolve(import.meta.dirname, '..');

const WEIGHT_TOKENS: Record<string, string> = Object.fromEntries(
  [
    ...readFileSync(
      path.join(ROOT, 'styles/tokens/typography.css'),
      'utf8',
    ).matchAll(/(--weight-[a-z]+):\s*(\d+)/g),
  ].map((found) => [found[1], found[2]]),
);

/** Tailwind's own default theme, so `font-light` means on the bench what
 *  it means on the site rather than resolving to nothing. */
const loadStylesheet = (
  id: string,
): Promise<{ content: string; base: string; path: string }> => {
  const file = path.join(ROOT, 'node_modules', id);
  return Promise.resolve({
    content: readFileSync(file, 'utf8'),
    base: path.dirname(file),
    path: file,
  });
};

const computedWeight = async (node: HTMLElement): Promise<number> => {
  const { build } = await compile(
    "@import 'tailwindcss/theme.css' theme(reference);\n@tailwind utilities;",
    { base: ROOT, loadStylesheet },
  );
  const sheet = document.createElement('style');
  sheet.textContent = build(node.className.split(' '));
  document.head.append(sheet);
  const won = getComputedStyle(node).fontWeight;
  sheet.remove();
  // jsdom applies the cascade but does not resolve var(), so the last step
  // is the lookup the browser would have done: the site's own --weight
  // token where the class names one, and Tailwind's inlined default
  // otherwise.
  const read = /^var\((--[a-z-]+)(?:,\s*([^)]+))?\)$/.exec(won);
  if (read === null) return Number(won);
  return Number(WEIGHT_TOKENS[read[1]] ?? read[2]);
};

describe('Text', () => {
  it.each(VARIANTS)('%s reads its size from a token', (variant) => {
    render(<Text variant={variant}>{variant}</Text>);
    const node = screen.getByText(variant);
    expect(node.className).toContain('text-[length:var(--type-');
    expect(node.className).toContain('transition-hue');
  });

  /*
   * The accent ink is picked by size, and getting it wrong is invisible on
   * the six dark themes and illegible on paper and chalk, where the full
   * accent measures 3.79:1 and 4.41:1 against the ground. Copy takes
   * --text-accent-body, which is the full accent everywhere it already
   * clears AA and the darkened step on those two.
   */
  it.each(['body2', 'detail2'] as TextVariant[])(
    '%s paints copy-sized accent with the ground-aware ink',
    (variant) => {
      render(<Text variant={variant}>{variant}</Text>);
      // Split rather than substring-match: "text-accent" is a substring of
      // "--text-accent-body", so a loose check passes on the wrong class.
      expect(classesOf(variant)).toContain('text-accent-body');
    },
  );

  it.each(['heading', 'subheader2'] as TextVariant[])(
    '%s keeps the accent at full strength',
    (variant) => {
      render(<Text variant={variant}>{variant}</Text>);
      expect(classesOf(variant)).toContain('text-accent');
    },
  );

  /*
   * subheader2 is 29.3px by default and 24px at max-desktop -- both large
   * text, which AA lets sit at 3:1 -- but 18.7px at max-tablet, which is
   * not, and on paper and chalk full-strength accent only reaches 3.79:1
   * and 4.41:1 there. The colour steps because the size steps; without this
   * the smallest subheader2 is the one place accent type falls under AA.
   */
  it('deepens subheader2 at the width where it stops being large text', () => {
    render(<Text variant="subheader2">subheader2</Text>);
    const classes = classesOf('subheader2');
    expect(classes).toContain('max-tablet:text-accent-body');
    expect(classes).toContain(
      'max-tablet:text-[length:var(--type-subheader-size-mobile)]',
    );
    // ...and nowhere above it.
    expect(classes).not.toContain('max-desktop:text-accent-body');
  });

  it('keeps its own weight when the caller asks for nothing', async () => {
    render(<Text variant="heading2">plain</Text>);
    await expect(
      computedWeight(screen.getByText('plain')),
    ).resolves.toBe(Number(WEIGHT_TOKENS['--weight-bold']));
  });

  it.each([
    ['the token form', 'font-[number:var(--weight-light)]', 200],
    ['a bare number', 'font-[200]', 200],
    ['a named weight', 'font-thin', 100],
  ] as const)(
    'lets a caller override the variant weight with %s',
    async (_label, override, want) => {
      // heading2's own cut is the bold token. Whatever shape the caller's
      // override takes, the element has to end up at the caller's number.
      render(
        <Text className={override} variant="heading2">
          {override}
        </Text>,
      );
      await expect(
        computedWeight(screen.getByText(override)),
      ).resolves.toBe(want);
    },
  );

  /*
   * A variant is a SCALE, not a set of independent declarations: its
   * max-desktop/max-tablet steps exist only to restate the same property
   * further down. tailwind-merge will not merge across modifiers -- rightly
   * -- so an unprefixed override used to win above 1000px and lose to the
   * variant's own steps underneath, which is the opposite of what
   * "className wins" means. Text drops the steps whose property the caller
   * has claimed.
   */
  it('retires the variant steps a plain override has claimed', () => {
    render(
      <Text
        className="text-[length:var(--type-body-size)]"
        variant="heading"
      >
        sized
      </Text>,
    );
    const classes = classesOf('sized');
    expect(classes).toContain('text-[length:var(--type-body-size)]');
    expect(classes).not.toContain(
      'max-desktop:text-[length:var(--type-heading-size-tablet)]',
    );
    expect(classes).not.toContain(
      'max-tablet:text-[length:var(--type-heading-size-mobile)]',
    );
    // The steps for properties the caller did NOT claim stay put.
    expect(classes).toContain('text-accent');
  });

  it('retires a responsive colour step the caller has claimed', () => {
    render(
      <Text className="text-fg-2" variant="subheader2">
        inked
      </Text>,
    );
    const classes = classesOf('inked');
    expect(classes).toContain('text-fg-2');
    expect(classes).not.toContain('max-tablet:text-accent-body');
    // Size is a different property, so its steps are untouched.
    expect(classes).toContain(
      'max-tablet:text-[length:var(--type-subheader-size-mobile)]',
    );
  });

  it('leaves the variant alone for a caller with their own step', () => {
    render(
      <Text
        className="max-tablet:text-[length:var(--type-body-size)]"
        variant="heading"
      >
        stepped
      </Text>,
    );
    const classes = classesOf('stepped');
    // A modified override merges with the variant's own in the ordinary
    // way; it says nothing about the widths it does not name.
    expect(classes).toContain(
      'max-desktop:text-[length:var(--type-heading-size-tablet)]',
    );
    expect(classes).toContain(
      'max-tablet:text-[length:var(--type-body-size)]',
    );
  });
});

describe('PageWord', () => {
  it.each(SIZES)(
    '%s carries three steps and the gradient',
    (size) => {
      render(<PageWord size={size}>hello.</PageWord>);
      const node = screen.getByText('hello.');
      const step = PAGE_WORD_STEPS[size];
      expect(node).toHaveStyle({
        '--page-word-size': `${PAGE_WORD_SIZES[size]}px`,
        '--page-word-size-tablet': `${step.tablet}px`,
        '--page-word-size-mobile': `${step.mobile}px`,
      });
      // The clipped ramp is only the word's own width, never the column's.
      expect(node.className).toContain('w-fit');
      expect(node.className).toContain(
        '[background-image:var(--grad-word)]',
      );
    },
  );
});

describe('Icon', () => {
  it.each(ICON_SRCS)('inlines %s', (src) => {
    const { container } = render(<Icon src={src} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('draws an empty box for a path it does not have', () => {
    const { container } = render(<Icon src="/icons/nope.svg" />);
    expect(
      container.querySelector('[data-src="/icons/nope.svg"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });
});
