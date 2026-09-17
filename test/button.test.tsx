import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Button, {
  BUTTON_SIZE_ORDER,
  BUTTON_SIZES,
  type ButtonSize,
} from 'components/primitives/Button';

/*
 * The button system. The load-bearing assertion is the press-travel one: the
 * keycap's whole physical conceit is that pressing it moves it exactly the
 * height of the skirt it stands on, so the cap bottoms out on its own plate.
 * If those two numbers ever drift apart the cap either hovers above the plate
 * or sinks through it, and nothing else in the suite would notice.
 */

const cap = (): HTMLElement => screen.getByRole('button');

const prop = (node: HTMLElement, name: string): string =>
  node.style.getPropertyValue(name).trim();

const plate = (): HTMLElement =>
  cap().querySelector<HTMLElement>('.clif-button-inner')!;

/**
 * The skirt the cap stands on at rest, read back out of the plate's own
 * box-shadow. The rest state is the FALLBACK of --k-skirt-y rather than a
 * declaration of it -- an inline declaration would outrank the :hover and
 * :active rules that flip it -- so this is where that number actually lives.
 */
const restingSkirt = (): string =>
  /--k-skirt-y,\s*([\d.]+px)\)/.exec(plate().style.boxShadow)![1];

describe('Button: press travel', () => {
  it.each(BUTTON_SIZE_ORDER)(
    'travels exactly its own skirt at %s',
    (size: ButtonSize) => {
      const { unmount } = render(<Button size={size}>go</Button>);
      const node = cap();
      const skirt = `${BUTTON_SIZES[size].skirt}px`;

      // The skirt the cap stands on at rest...
      expect(restingSkirt()).toBe(skirt);
      // ...and the distance it falls when pressed are the same number.
      expect(prop(node, '--k-skirt-press')).toBe(skirt);
      // And the press state spends exactly that on --k-y, rather than a
      // constant that could drift from the skirt.
      expect(node).toHaveClass('active:[--k-y:var(--k-skirt-press)]');
      // The skirt collapses to nothing as it lands: it is on the plate.
      expect(node).toHaveClass('active:[--k-skirt-y:0px]');
      // And the plate reads the travel back, rather than moving on its own.
      expect(plate().style.transform).toBe(
        'translateY(var(--k-y, 0px))',
      );

      unmount();
    },
  );

  it('reserves the hover lift so layout never shifts', () => {
    BUTTON_SIZE_ORDER.forEach((size) => {
      const { unmount } = render(<Button size={size}>go</Button>);
      expect(prop(cap(), '--k-reserve')).toBe(
        `${BUTTON_SIZES[size].reserve}px`,
      );
      expect(cap()).toHaveClass('pb-(--k-reserve)');
      expect(cap()).toHaveClass('pointer-fine:hover:[--k-y:-1px]');
      unmount();
    });
  });

  it('bumps every shadow scalar off the skirt on hover', () => {
    render(<Button size="md">go</Button>);
    // bump(n) = round(skirt * n * 10) / 10 for 1.3 / 1.6 / 2.3 / 3.3.
    expect(prop(cap(), '--k-skirt-hot')).toBe('4.6px');
    expect(prop(cap(), '--k-edge-hot')).toBe('5.6px');
    // 3.5 * 2.3 is 8.05 on paper but 8.049999999999999 in IEEE 754, so the
    // bundle's own expression lands on 8px. See keycap.ts.
    expect(prop(cap(), '--k-amb-hot')).toBe('8px');
    expect(prop(cap(), '--k-amb-blur-hot')).toBe('11.5px');
  });
});

describe('Button: the size table', () => {
  it('carries the design system table verbatim', () => {
    expect(BUTTON_SIZES.md.skirt).toBe(3.5);
    expect(BUTTON_SIZES.sm.tracking).toBe('.16em');
    expect(BUTTON_SIZES.xs.glyphMargin).toBe(-10);
    expect(BUTTON_SIZE_ORDER).toEqual(['md', 'sm', 'xs']);
  });

  it('widens the left padding for a left mark only', () => {
    // The padding rides down as a property the plate's own `p-` utility
    // reads, so a caller's padding can merge with it; the wrapper is where
    // it is declared, because the state rules resolve there.
    const { rerender } = render(<Button>plain</Button>);
    expect(prop(cap(), '--b-pad')).toBe(BUTTON_SIZES.md.padPlain);
    expect(plate()).toHaveClass('p-(--b-pad)');

    rerender(<Button glyph="home">glyph</Button>);
    expect(prop(cap(), '--b-pad')).toBe(BUTTON_SIZES.md.pad);

    rerender(<Button expand>expand</Button>);
    expect(prop(cap(), '--b-pad')).toBe(BUTTON_SIZES.md.pad);

    rerender(<Button lead="←">lead</Button>);
    expect(prop(cap(), '--b-pad')).toBe(BUTTON_SIZES.md.pad);

    // The documented quirk, kept: a trail alone stays on padPlain.
    rerender(<Button trail="→">trail</Button>);
    expect(prop(cap(), '--b-pad')).toBe(BUTTON_SIZES.md.padPlain);
  });
});

describe('Button: variants', () => {
  it('is a primary md keycap by default', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>projects</Button>);
    const node = cap();
    expect(node).toHaveAttribute('data-variant', 'keycap');
    expect(node).toHaveAttribute('data-size', 'md');
    expect(node).toHaveAttribute('data-tone', 'primary');
    expect(node).toHaveAttribute('data-grow', 'false');
    expect(node).toHaveAttribute('data-center', 'false');
    expect(node).toHaveAttribute('data-disabled', 'false');
    expect(plate()).toHaveClass(
      'text-[color:var(--k-ink,var(--cap-ink))]',
    );
    await userEvent.click(node);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('takes the secondary ink on the secondary tone', () => {
    render(<Button tone="secondary">about</Button>);
    expect(plate()).toHaveClass(
      'text-[color:var(--k-ink,var(--cap2-ink))]',
    );
  });

  it('inverts to a solid accent fill on the flat pill', () => {
    const { rerender } = render(
      <Button variant="flat">contact</Button>,
    );
    // The pill paints the wrapper, because that is the element that gets
    // :hover and [data-disabled]. On the plate the inversion would only
    // fire over the plate and disabled would never fire at all.
    expect(cap()).toHaveClass('border-accent-30');
    expect(cap()).toHaveClass('pointer-fine:hover:bg-accent');
    expect(cap()).toHaveClass('pointer-fine:hover:text-on-accent');
    expect(cap()).toHaveClass('data-[disabled=true]:opacity-50');

    // Both tones invert the same way; the tone separates them at rest.
    rerender(
      <Button tone="secondary" variant="flat">
        contact
      </Button>,
    );
    expect(cap()).toHaveClass('border-surface-3');
    expect(cap()).toHaveClass('pointer-fine:hover:bg-accent');
    // No skirt, so no travel and nothing to reserve.
    expect(prop(cap(), '--k-skirt-press')).toBe('');
    expect(cap().className).not.toContain('active:[--k-y');
  });

  it('gives the flat pill its own box per size', () => {
    const { rerender } = render(<Button variant="flat">a</Button>);
    // 7 + the 18px md line + 7 is the §2.7 32px pill.
    expect(prop(cap(), '--b-pad')).toBe('7px 12px');
    expect(prop(cap(), '--b-radius')).toBe('var(--radius-control)');
    expect(cap()).toHaveClass('p-(--b-pad)');
    expect(cap()).toHaveClass('rounded-(--b-radius)');

    rerender(
      <Button lead="←" size="xs" variant="flat">
        a
      </Button>,
    );
    expect(prop(cap(), '--b-pad')).toBe('5px 9px 5px 7px');
  });

  /*
   * THE BOX HAS TO BE OVERRIDABLE, and only the cascade can say whether it
   * is. Both treatments used to stamp their padding and radius straight
   * into the inline style, which kept a caller's class through the merge
   * and then lost it in the cascade, because an inline declaration
   * outranks any utility that is not `!`-flagged. So the assertion is not
   * "the class is present" -- it always was -- but "nothing inline is
   * competing with it".
   */
  it('lets a caller re-box the flat pill', () => {
    render(
      <Button className="rounded-none px-1" variant="flat">
        a
      </Button>,
    );
    expect(cap()).toHaveClass('rounded-none');
    expect(cap()).toHaveClass('px-1');
    // The merge keeps `p-(--b-pad)` beside `px-1` on purpose -- the
    // vertical padding is still the pill's -- but the radius is replaced
    // outright, and neither property is declared inline any more.
    expect(cap().className).not.toContain('rounded-(--b-radius)');
    expect(cap().style.padding).toBe('');
    expect(cap().style.borderRadius).toBe('');
  });

  it('lets a caller re-box the keycap plate', () => {
    render(<Button plateClassName="rounded-none p-1">a</Button>);
    // className lands on the wrapper, which on a keycap paints nothing;
    // the plate is what the cap actually is, and it has its own prop.
    expect(plate()).toHaveClass('rounded-none');
    expect(plate()).toHaveClass('p-1');
    expect(plate().className).not.toContain('p-(--b-pad)');
    expect(plate().className).not.toContain('rounded-(--b-radius)');
    expect(plate().style.padding).toBe('');
    expect(plate().style.borderRadius).toBe('');
  });

  /*
   * The site redefines Tailwind's `hover` variant to bare `:hover`, with no
   * `(hover: hover)` guard, so an unscoped hover utility LATCHES on a touch
   * screen: the tap that fires the button leaves it lifted or inverted
   * until the next tap somewhere else. Every hover state here is therefore
   * behind `pointer-fine:`, and every press state is not -- a finger can
   * produce a press and cannot produce a hover.
   */
  it.each(['keycap', 'flat'] as const)(
    'scopes every %s hover to a fine pointer and leaves press alone',
    (variant) => {
      render(<Button variant={variant}>a</Button>);
      const hovers = cap()
        .className.split(' ')
        .filter((name) => name.includes('hover:'));
      expect(hovers.length).toBeGreaterThan(0);
      hovers.forEach((name) =>
        expect(name.startsWith('pointer-fine:hover:')).toBe(true),
      );
      expect(
        cap()
          .className.split(' ')
          .some((name) => name.startsWith('active:')),
      ).toBe(true);
    },
  );

  it('never lets its label be selected', () => {
    render(<Button>projects</Button>);
    expect(cap()).toHaveClass('select-none');
  });
});

describe('Button: layout and slots', () => {
  it('renders every slot when asked', () => {
    render(
      <Button
        ariaLabel="Browse all"
        className="x"
        expand
        glyph="projects"
        grow
        lead="←"
        size="xs"
        tone="secondary"
        trail="→"
      >
        browse all
      </Button>,
    );
    const node = screen.getByRole('button', { name: 'Browse all' });
    expect(node).toHaveAttribute('data-grow', 'true');
    // toHaveClass, not toContain: RESET always contributes `text-left`, so
    // a substring check for 'x' passed with the prop removed entirely.
    expect(node).toHaveClass('x');
    expect(node.querySelector('[data-slot="lead"]')).not.toBeNull();
    expect(node.querySelector('[data-slot="trail"]')).not.toBeNull();
    expect(node.querySelector('[data-slot="expand"]')).not.toBeNull();
    expect(node.querySelector('[data-slot="glyph"]')).not.toBeNull();
    expect(
      node.querySelector('[data-glyph="projects"]'),
    ).not.toBeNull();
    // The expand mark's gradient is referenced by a url(#id), which cannot
    // carry useId's colons.
    const stroke = node
      .querySelector('[data-slot="expand"] g[stroke^="url"]')
      ?.getAttribute('stroke');
    expect(stroke).toMatch(/^url\(#clif-expand-[^:]+\)$/);
  });

  it('centres on grow, on center, and on neither', () => {
    const inner = (): Element | null =>
      cap().querySelector('.clif-button-inner');
    const { rerender } = render(<Button>a</Button>);
    expect(inner()).toHaveClass('justify-start');
    expect(cap()).toHaveClass('inline-flex');

    rerender(<Button grow>a</Button>);
    expect(inner()).toHaveClass('justify-center');
    expect(cap()).toHaveClass('flex-1');

    rerender(<Button center>a</Button>);
    expect(inner()).toHaveClass('justify-center');
    expect(cap()).toHaveClass('flex-none');
  });

  it('centres the flat pill the same three ways', () => {
    const inner = (): Element | null =>
      cap().querySelector('.clif-button-inner');
    const { rerender } = render(<Button variant="flat">a</Button>);
    expect(inner()).toHaveClass('justify-start');

    rerender(
      <Button grow variant="flat">
        a
      </Button>,
    );
    expect(inner()).toHaveClass('justify-center');
    expect(cap()).toHaveClass('flex-1');

    rerender(
      <Button center variant="flat">
        a
      </Button>,
    );
    expect(inner()).toHaveClass('justify-center');
  });

  it('scales the glyph slot off the size table', () => {
    render(
      <Button glyph="projects" size="sm" variant="flat">
        a
      </Button>,
    );
    const slot = cap().querySelector<HTMLElement>(
      '[data-slot="glyph"]',
    )!;
    expect(slot.style.margin).toBe('-8px');
    expect(slot.style.transform).toBe('scale(var(--g-base))');
    expect(prop(cap(), '--g-base')).toBe(`${BUTTON_SIZES.sm.glyph}`);
  });

  it('springs the glyph and the expand mark on the keycap', () => {
    render(
      <Button expand glyph="home" size="md">
        a
      </Button>,
    );
    const glyph = cap().querySelector<HTMLElement>(
      '[data-slot="glyph"]',
    )!;
    const mark = cap().querySelector<SVGElement>(
      '[data-slot="expand"]',
    )!;
    expect(glyph.style.transform).toBe(
      'scale(calc(var(--g-base) * var(--g-mul, 1)))',
    );
    expect(glyph.style.transition).toContain('240ms');
    expect(mark.getAttribute('width')).toBe(
      `${BUTTON_SIZES.md.expand}`,
    );
    expect(cap()).toHaveClass('pointer-fine:hover:[--g-mul:1.3]');
    expect(cap()).toHaveClass('active:[--g-mul:1.22]');
  });
});

describe('Button: elements', () => {
  it('does not fire when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        nope
      </Button>,
    );
    const node = cap();
    expect(node).toHaveAttribute('data-disabled', 'true');
    expect(node).toHaveClass(
      'data-[disabled=true]:pointer-events-none',
    );
    await userEvent.click(node);
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
    expect(screen.getByRole('link')).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );

    rerender(<Button href="mailto:clif@mimio.io">mail</Button>);
    expect(screen.getByRole('link')).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('passes the click through on a link', async () => {
    const onClick = vi.fn();
    render(
      <Button href="/projects" onClick={onClick}>
        projects
      </Button>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('passes the click through on an external link', async () => {
    const onClick = vi.fn();
    render(
      <Button href="https://example.com" onClick={onClick}>
        out
      </Button>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is clickable with no handler at all', async () => {
    render(<Button>silent</Button>);
    await userEvent.click(cap());
    expect(cap()).toBeInTheDocument();
  });
});
