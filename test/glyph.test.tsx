import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Glyph, {
  GLYPH_BOX,
  GLYPH_EASE,
  type GlyphKind,
} from 'components/primitives/Glyph';
import { GLYPH_LAYERS } from 'components/primitives/Glyph/layers';

/*
 * Lane 3 owns components/primitives/Glyph/**; this file is its unit
 * coverage. The sculpture itself is judged by eye in the specimens
 * harness -- what is asserted here is the contract the consumers rely on:
 * the box size, the two growth multipliers, and the drawing itself.
 *
 * WHY THE DRAWING IS PINNED, AND HOW.
 *
 * This file used to assert a 34px box, aria-hidden, and a span count it
 * derived from GLYPH_LAYERS -- the very table it was checking. Both sides
 * read from one source, so the only structural claim was a tautology, and
 * roughly five hundred lines of geometry sat under it unguarded: a
 * transposed pair of layers, a left swapped with a top, an accent swapped
 * for its turning face, a gyrus rotated the wrong way, or the whole `home`
 * array pasted under `about` all left the count intact and the test green.
 *
 * Two independent claims replace it. SHAPE is the nesting, written out as
 * literals below rather than read back off the table, so a layer that
 * moves between groups fails. DIGEST is a hash of every rendered layer's
 * style, in DOM order, so any change to a number, a colour or an order
 * fails -- and the three digests are asserted to differ, so a kind that
 * has been pasted over another cannot borrow its neighbour's.
 *
 * A DIGEST THAT FAILS IS NOT AUTOMATICALLY A BUG. Changing the sculpture
 * on purpose changes the hash; the fix is to look at the glyph in the
 * specimens harness, satisfy yourself it is what you meant, and paste the
 * new value in. The test exists to make that a decision rather than an
 * accident.
 */
const KINDS: GlyphKind[] = ['home', 'projects', 'about'];

/** Descendants under each top-level layer, in order. */
const SHAPES: Record<GlyphKind, number[]> = {
  // Fourteen flat planes: walls, eaves, roof, fascia, door, window.
  home: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // The brain's two lobes each carry their folds, and the stem carries six.
  projects: [0, 1, 0, 0, 0, 0, 1, 6, 0, 0],
  // The book is one group of thirteen -- boards, pages, ribbon, face.
  about: [13, 0],
};

/** FNV-1a over every layer's inline style, in DOM order. */
const DIGESTS: Record<GlyphKind, string> = {
  home: '8804645f',
  projects: '9129a597',
  about: '921a2bd9',
};

const shapeOf = (box: Element): number[] =>
  [...box.children].map(
    (layer) => layer.querySelectorAll('span').length,
  );

const digestOf = (box: Element): string => {
  let hash = 0x811c9dc5;
  box.querySelectorAll('span').forEach((layer) => {
    for (const char of `${layer.getAttribute('style')}|`) {
      hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193);
    }
  });
  return (hash >>> 0).toString(16).padStart(8, '0');
};

const boxFor = (kind: GlyphKind): Element => {
  const { container } = render(<Glyph kind={kind} />);
  return container.querySelector('[data-glyph-box]')!;
};

describe('Glyph', () => {
  it.each(KINDS)('draws %s as a 34px decorative box', (kind) => {
    const { container } = render(<Glyph kind={kind} />);
    const root = container.querySelector(`[data-glyph="${kind}"]`);
    expect(root).toHaveStyle({ width: `${GLYPH_BOX}px` });
    expect(root).toHaveAttribute('aria-hidden', 'true');
    // One top-level span per top-level layer, so a layer that never
    // reaches the DOM at all is loud.
    expect(
      container.querySelectorAll('[data-glyph-box] > span'),
    ).toHaveLength(GLYPH_LAYERS[kind].length);
  });

  it.each(KINDS)('stacks %s in the shape it was drawn in', (kind) => {
    expect(shapeOf(boxFor(kind))).toEqual(SHAPES[kind]);
  });

  it.each(KINDS)('draws %s exactly as it was signed off', (kind) => {
    expect(
      digestOf(boxFor(kind)),
      `${kind}'s geometry changed. Look at it in the specimens harness; if it is what you meant, update DIGESTS.${kind}.`,
    ).toBe(DIGESTS[kind]);
  });

  it('gives each kind its own drawing', () => {
    // A kind pasted over another would otherwise pass every check above
    // that it had been renumbered for.
    const seen = KINDS.map((kind) => digestOf(boxFor(kind)));
    expect(new Set(seen).size).toBe(KINDS.length);
  });

  it('scales the drawing to the requested size', () => {
    const { container } = render(
      <Glyph className="x" kind="projects" size={GLYPH_BOX * 2} />,
    );
    const root = container.querySelector('[data-glyph="projects"]');
    expect(root).toHaveClass('x');
    expect(root).toHaveStyle({ width: '68px' });
    expect(container.querySelector('[data-glyph-box]')).toHaveStyle({
      transform: 'scale(2)',
    });
  });

  it('composes its rest scale with an ancestor --g-mul', () => {
    const { container } = render(<Glyph kind="home" scale={0.62} />);
    const root = container.querySelector('[data-glyph="home"]');
    expect(root).toHaveStyle({
      transform: 'scale(calc(var(--g-base) * var(--g-mul, 1)))',
      transition: `transform var(--g-move, 240ms) ${GLYPH_EASE}`,
    });
    expect(root?.getAttribute('style')).toContain('--g-base: 0.62');
  });

  /*
   * ...AND ITS DURATION IS AN ANCESTOR'S TO TAKE, for the same reason the
   * multiplier is. The 240ms spring is the default and every consumer that
   * says nothing keeps it; a keycap declares --g-move as 0s under :active,
   * because 240ms of back-out overshoot is about twice as long as a click
   * and a press that has not finished growing has not been seen. The
   * rendered proof is e2e/hermetic/press-feel.spec.ts.
   */
  it('reads its spring duration from --g-move, defaulting to 240ms', () => {
    const { container } = render(<Glyph kind="home" />);
    const style = container
      .querySelector('[data-glyph="home"]')
      ?.getAttribute('style');
    expect(style).toContain('var(--g-move, 240ms)');
    // The glyph never declares it: an ancestor does, or nobody does.
    expect(style).not.toContain('--g-move:');
  });
});
