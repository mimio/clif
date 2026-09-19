import type { CSSProperties } from 'react';
import Glyph, {
  GLYPH_BOX,
  type GlyphKind,
} from 'components/primitives/Glyph';
import Text from 'components/primitives/Text';
import type { Specimen } from 'pagesComponents/specimens/types';

/*
 * Lane 3's section: the three sculpted glyphs, big enough to judge.
 *
 * What to look at, in the order the owner rejected earlier drafts for:
 *   - the house's right wall and the receding roof plane meeting on one
 *     line, not trailing off at two angles;
 *   - nothing under the doorway but the sill, which runs the full base;
 *   - the book reading as one hinged object, the spine bridging cover and
 *     back board rather than two flat planes floating apart.
 * Then the themes: every lit face, turning face and terminator is a token,
 * so the whole family relights when the eye picks a new scope.
 */
const KINDS: GlyphKind[] = ['home', 'projects', 'about'];

/** 1x, 2x, 4x and 8x the 34px box. */
const SIZES = [
  GLYPH_BOX,
  GLYPH_BOX * 2,
  GLYPH_BOX * 4,
  GLYPH_BOX * 8,
];

/** Enough of the eight scopes to prove the tokens carry the object. */
const THEMES = ['yellow', 'paper', 'teal', 'lime', 'rust', 'pink'];

const SURFACES = [
  { id: 'ground', label: 'ground', className: 'bg-surface' },
  { id: 'raised', label: 'raised', className: 'bg-surface-2' },
  { id: 'sheet', label: 'sheet', className: 'bg-sheet' },
];

/*
 * Rest, hover and press, side by side. The glyph never sets --g-mul
 * itself, so this is exactly how Button and the altimeter drive it: an
 * ancestor declares the multiplier and the glyph springs to it over 240ms.
 */
const GROWTH = [
  { id: 'rest', label: 'rest', mul: 1 },
  { id: 'hover', label: 'hover x1.30', mul: 1.3 },
  { id: 'press', label: 'press x1.22', mul: 1.22 },
];

const CAP_SCALES = [0.62, 0.56, 0.5];

const Caption = ({ children }: { children: string }) => (
  <Text className="block text-fg-4" variant="detail3">
    {children}
  </Text>
);

const Row = ({ size }: { size: number }) => (
  <div className="flex flex-wrap items-end gap-8">
    {KINDS.map((kind) => (
      <div className="flex flex-col items-center gap-2" key={kind}>
        <Glyph kind={kind} size={size} />
        <Caption>{`${kind} ${size}px`}</Caption>
      </div>
    ))}
  </div>
);

export const glyphs: Specimen = {
  id: 'glyphs',
  title: 'Glyphs',
  note: 'The house, brain and book, at rest and hovered.',
  render: () => (
    <div className="flex flex-col gap-12 font-mono">
      {/* Big enough to see the modelling: 8x the shipped box. */}
      <section className="flex flex-col gap-4">
        <Caption>sculpture, 272px</Caption>
        <div className="flex flex-wrap items-end gap-12 rounded-[var(--radius-card)] bg-surface p-10">
          {KINDS.map((kind) => (
            <div
              className="flex flex-col items-center gap-3"
              key={kind}
            >
              <Glyph kind={kind} size={SIZES[3]} />
              <Caption>{kind}</Caption>
            </div>
          ))}
        </div>
      </section>

      {/* The shipped sizes, on each surface the glyph actually lands on. */}
      {SURFACES.map((surface) => (
        <section className="flex flex-col gap-4" key={surface.id}>
          <Caption>{surface.label}</Caption>
          <div
            className={`flex flex-col gap-8 rounded-[var(--radius-card)] p-8 ${surface.className}`}
          >
            {SIZES.slice(0, 3).map((size) => (
              <Row key={size} size={size} />
            ))}
          </div>
        </section>
      ))}

      {/* Growth, driven the way a consumer drives it. */}
      <section className="flex flex-col gap-4">
        <Caption>growth via --g-mul, 240ms back-out</Caption>
        <div className="flex flex-wrap gap-10 rounded-[var(--radius-card)] bg-surface-2 p-10">
          {GROWTH.map((state) => (
            <div
              className="flex flex-col items-center gap-3"
              key={state.id}
              style={{ '--g-mul': state.mul } as CSSProperties}
            >
              <div className="flex items-end gap-6 py-6">
                {KINDS.map((kind) => (
                  <Glyph key={kind} kind={kind} size={SIZES[2]} />
                ))}
              </div>
              <Caption>{state.label}</Caption>
            </div>
          ))}
        </div>
      </section>

      {/* A live hover target, so the spring can be felt and not just read. */}
      <section className="flex flex-col gap-4">
        <Caption>live hover (mouse over a tile)</Caption>
        <div className="flex flex-wrap gap-6">
          {KINDS.map((kind) => (
            <div
              className="flex cursor-pointer flex-col items-center gap-3 rounded-[var(--radius-card)] bg-surface-2 px-10 py-8 hover:[--g-mul:1.3]"
              key={kind}
            >
              <Glyph kind={kind} size={SIZES[1]} />
              <Caption>{kind}</Caption>
            </div>
          ))}
        </div>
      </section>

      {/* Retheming: same markup, a different scope on the wrapper. */}
      <section className="flex flex-col gap-4">
        <Caption>themes</Caption>
        <div className="flex flex-wrap gap-4">
          {THEMES.map((theme) => (
            <div
              className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] bg-surface p-6"
              data-theme={theme}
              key={theme}
            >
              <div className="flex items-end gap-5">
                {KINDS.map((kind) => (
                  <Glyph key={kind} kind={kind} size={SIZES[1]} />
                ))}
              </div>
              <Caption>{theme}</Caption>
            </div>
          ))}
        </div>
      </section>

      {/* The rest scales Button asks for, to check they still read small. */}
      <section className="flex flex-col gap-4">
        <Caption>keycap rest scales 0.62 / 0.56 / 0.50</Caption>
        <div className="flex flex-wrap items-center gap-8 rounded-[var(--radius-card)] bg-surface p-8">
          {CAP_SCALES.map((scale) => (
            <div className="flex items-center gap-4" key={scale}>
              {KINDS.map((kind) => (
                <Glyph key={kind} kind={kind} scale={scale} />
              ))}
              <Caption>{`x${scale}`}</Caption>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};

export default glyphs;
