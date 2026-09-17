import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Glyph, {
  GLYPH_BOX,
  GLYPH_EASE,
  type GlyphKind,
} from 'components/primitives/Glyph';
import { GLYPH_LAYERS } from 'components/primitives/Glyph/layers';

// Lane 3 owns components/primitives/Glyph/**; this file is its unit
// coverage. The sculpture itself is judged by eye in the specimens
// harness -- what is asserted here is the contract the consumers rely on:
// the box size, the two growth multipliers, and one span per layer.
const KINDS: GlyphKind[] = ['home', 'projects', 'about'];

const countLayers = (
  layers: (typeof GLYPH_LAYERS)[GlyphKind],
): number =>
  layers.reduce(
    (total, layer) => total + 1 + countLayers(layer.children),
    0,
  );

describe('Glyph', () => {
  it('draws every kind as a 34px box of stacked layers', () => {
    KINDS.forEach((kind) => {
      const { container } = render(<Glyph kind={kind} />);
      const root = container.querySelector(`[data-glyph="${kind}"]`);
      expect(root).toHaveStyle({ width: `${GLYPH_BOX}px` });
      expect(root).toHaveAttribute('aria-hidden', 'true');
      const box = container.querySelector('[data-glyph-box]');
      expect(box?.querySelectorAll('span')).toHaveLength(
        countLayers(GLYPH_LAYERS[kind]),
      );
    });
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
      transition: `transform 240ms ${GLYPH_EASE}`,
    });
    expect(root?.getAttribute('style')).toContain('--g-base: 0.62');
  });
});
