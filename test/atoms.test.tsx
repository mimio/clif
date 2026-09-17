import { render, screen } from '@testing-library/react';
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
      expect(classesOf(variant)).toContain(
        'text-[color:var(--text-accent-body)]',
      );
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
    expect(classes).toContain(
      'max-tablet:text-[color:var(--text-accent-body)]',
    );
    expect(classes).toContain(
      'max-tablet:text-[length:var(--type-subheader-size-mobile)]',
    );
    // ...and nowhere above it.
    expect(classes).not.toContain(
      'max-desktop:text-[color:var(--text-accent-body)]',
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
