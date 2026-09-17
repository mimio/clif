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

describe('Text', () => {
  it.each(VARIANTS)('%s reads its size from a token', (variant) => {
    render(<Text variant={variant}>{variant}</Text>);
    const node = screen.getByText(variant);
    expect(node.className).toContain('text-[length:var(--type-');
    expect(node.className).toContain('transition-hue');
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
