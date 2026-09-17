import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Button, { BUTTON_SIZES } from 'components/primitives/Button';
import Chip from 'components/primitives/Chip';
import Glyph from 'components/primitives/Glyph';
import Icon from 'components/primitives/Icon';
import PageWord, {
  PAGE_WORD_SIZES,
} from 'components/primitives/PageWord';
import Pill, { PILL_SIZES } from 'components/primitives/Pill';
import Rule from 'components/primitives/Rule';
import Text from 'components/primitives/Text';

describe('Text', () => {
  it('defaults to a body span', () => {
    render(<Text>hi</Text>);
    const node = screen.getByText('hi');
    expect(node.tagName).toBe('SPAN');
    expect(node).toHaveAttribute('data-variant', 'body');
  });

  it('picks the variant tag and accepts an override', () => {
    const { rerender } = render(<Text variant="heading">word</Text>);
    expect(screen.getByText('word').tagName).toBe('H1');
    rerender(
      <Text
        as="p"
        className="x"
        style={{ color: 'red' }}
        variant="readout"
      >
        word
      </Text>,
    );
    const node = screen.getByText('word');
    expect(node.tagName).toBe('P');
    expect(node).toHaveClass('x');
  });
});

describe('PageWord', () => {
  it('defaults to an xl h1 and takes a size and tag', () => {
    const { rerender } = render(<PageWord>hello.</PageWord>);
    const node = screen.getByText('hello.');
    expect(node.tagName).toBe('H1');
    expect(node).toHaveAttribute('data-size', 'xl');
    rerender(
      <PageWord as="h2" className="x" size="sm">
        hello.
      </PageWord>,
    );
    expect(screen.getByText('hello.').tagName).toBe('H2');
    expect(PAGE_WORD_SIZES.xl).toBe(92);
  });
});

describe('Glyph', () => {
  it('draws a 34px box by default and scales', () => {
    const { container, rerender } = render(<Glyph kind="home" />);
    const node = container.querySelector('[data-glyph="home"]');
    expect(node).toHaveStyle({ width: '34px' });
    rerender(
      <Glyph className="x" kind="projects" scale={1.3} size={20} />,
    );
    expect(
      container.querySelector('[data-glyph="projects"]'),
    ).toHaveStyle({ width: '20px' });
  });
});

describe('Icon', () => {
  it('is decorative unless it is given a title', () => {
    const { container, rerender } = render(
      <Icon src="/icons/ufo.svg" />,
    );
    const node = container.querySelector('[data-icon-inline]');
    expect(node).toHaveAttribute('aria-hidden', 'true');
    expect(node).toHaveStyle({ width: '16px' });
    rerender(
      <Icon
        className="x"
        color="red"
        size={40}
        src="/icons/ufo.svg"
        title="UFO"
      />,
    );
    expect(screen.getByRole('img', { name: 'UFO' })).toBeVisible();
  });
});

describe('Pill', () => {
  it('is a button without an href and a link with one', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Pill onClick={onClick}>go</Pill>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Pill
        className="x"
        href="mailto:clif@mimio.io"
        size="sm"
        tone="accent"
        vertical
      >
        go
      </Pill>,
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'data-tone',
      'accent',
    );
    expect(screen.getByRole('link')).toHaveClass('x');
    expect(PILL_SIZES.sm.fontSize).toBe(11);
  });

  /*
   * The pill's own comment used to promise a caller "gets it" and then say
   * in the same sentence that the utility only wins when it is `!`-flagged.
   * Both halves were describing padding stamped into the inline style,
   * where a class could never win. Padding and tracking are properties the
   * element's own utilities read now, so an override merges and applies --
   * and the proof is that nothing inline is left to outrank it.
   */
  it('lets a caller re-box it', () => {
    render(<Pill className="px-1 tracking-[.4em]">go</Pill>);
    const node = screen.getByRole('button');
    expect(node).toHaveClass('px-1');
    expect(node).toHaveClass('tracking-[.4em]');
    expect(node.className).not.toContain('tracking-(--pill-track)');
    expect(node.style.padding).toBe('');
    expect(node.style.letterSpacing).toBe('');
    // The numbers still live in one table; they just travel as properties.
    expect(node.style.getPropertyValue('--pill-pad')).toBe(
      PILL_SIZES.md.padding,
    );
  });

  it('scopes its hover fill to a fine pointer', () => {
    // Bare `:hover` latches on a touch screen: the tap that fires the pill
    // would leave it washed until the next tap elsewhere.
    render(<Pill tone="accent">go</Pill>);
    screen
      .getByRole('button')
      .className.split(' ')
      .filter((name) => name.includes('hover:'))
      .forEach((name) =>
        expect(name.startsWith('pointer-fine:hover:')).toBe(true),
      );
  });
});

describe('Chip', () => {
  it('reports its pressed state and calls back', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Chip>all</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    rerender(
      <Chip className="x" onClick={onClick} selected>
        all
      </Chip>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Rule', () => {
  it('is neutral by default and can be accented', () => {
    const { container, rerender } = render(<Rule />);
    expect(container.querySelector('hr')).toHaveAttribute(
      'data-tone',
      'neutral',
    );
    rerender(<Rule className="x" tone="accent" />);
    expect(container.querySelector('hr')).toHaveAttribute(
      'data-tone',
      'accent',
    );
  });
});

describe('Button', () => {
  it('is a keycap button by default', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>projects</Button>);
    const node = screen.getByRole('button');
    expect(node).toHaveAttribute('data-variant', 'keycap');
    expect(node).toHaveAttribute('data-size', 'md');
    expect(node).toHaveAttribute('data-tone', 'primary');
    await userEvent.click(node);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders every slot when asked', () => {
    const { container } = render(
      <Button
        ariaLabel="Browse all"
        center
        className="x"
        expand
        glyph="projects"
        grow
        lead="←"
        size="xs"
        tone="secondary"
        trail="→"
        variant="flat"
      >
        browse all
      </Button>,
    );
    expect(
      container.querySelector('[data-slot="lead"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="trail"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="expand"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-glyph="projects"]'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Browse all' }),
    ).toHaveAttribute('data-grow', 'true');
  });

  it('does not fire when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        nope
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('routes an internal href and opens an external one', () => {
    const { rerender } = render(
      <Button href="/projects">projects</Button>,
    );
    expect(screen.getByRole('link')).not.toHaveAttribute('target');
    rerender(<Button href="https://example.com">out</Button>);
    expect(screen.getByRole('link')).toHaveAttribute(
      'target',
      '_blank',
    );
    rerender(<Button href="mailto:clif@mimio.io">mail</Button>);
    expect(screen.getByRole('link')).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('carries the design system size table', () => {
    expect(BUTTON_SIZES.md.skirt).toBe(3.5);
    expect(BUTTON_SIZES.xs.glyphMargin).toBe(-10);
  });
});
