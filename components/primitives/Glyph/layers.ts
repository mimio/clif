import type { CSSProperties } from 'react';

/*
 * The sculpture, as data. Every glyph is a stack of absolutely positioned
 * boxes inside the same 34x34 frame -- clip-path, border-radius, layered
 * gradients and inset shadows, no SVG and no images. Geometry is verbatim
 * from Glyph.dc.html (design inventory 3.2-3.4): a classic western house,
 * a lobed brain in three-quarter profile, and a hardcover book with a face.
 *
 * Only three colours are themed -- --clif-accent is the lit face,
 * --clif-accent-2 the turning face and --iris-rim the terminator -- so a
 * glyph relights itself wholesale when the eye picks a new theme. The
 * fallbacks are the yellow theme's, matching the prototype. The book's
 * paper and its ribbon are the deliberate exceptions: paper stays paper.
 */
export type GlyphKind = 'home' | 'projects' | 'about';

/** One box in the stack. `children` is always an array, never absent. */
export type GlyphLayer = {
  style: CSSProperties;
  children: GlyphLayer[];
};

const leaf = (style: CSSProperties): GlyphLayer => ({
  style,
  children: [],
});

const group = (
  style: CSSProperties,
  children: GlyphLayer[],
): GlyphLayer => ({ style, children });

const ACCENT = 'var(--clif-accent, #FFE520)';
const ACCENT_2 = 'var(--clif-accent-2, #FF8A2B)';
const RIM = 'var(--iris-rim, #6B3A12)';

/** The same back-cast shadow the eye and the mouth wear. */
export const EYE_SHADOW =
  'var(--eye-shadow, 0 3px 9px rgba(0, 0, 0, 0.55))';

// The two lighting ramps the lumpy forms share: a lobe whose crown catches
// the key light, and one that sits a step back in the same light.
const whiteCore = (at: string): string =>
  `radial-gradient(ellipse at ${at}, #ffffff 0%, ${ACCENT} 16%, ${ACCENT} 44%, ${ACCENT_2} 76%, ${RIM} 100%)`;

const accentCore = (at: string): string =>
  `radial-gradient(ellipse at ${at}, ${ACCENT} 0%, ${ACCENT} 28%, ${ACCENT_2} 66%, ${RIM} 100%)`;

/*
 * A gyrus is a raised tube, not a drawn line: a transparent ellipse ring
 * lit along its top border and shaded along its bottom one. The highlight
 * fades and the shadow deepens as the folds recede down the mass.
 */
const gyrus = (
  left: number,
  top: number,
  width: number,
  height: number,
  hi: number,
  lo: number,
  rotate: number,
): GlyphLayer =>
  leaf({
    left,
    top,
    width,
    height,
    borderRadius: '50%',
    border: '2px solid transparent',
    borderTopColor: `rgba(255, 255, 255, ${hi})`,
    borderBottomColor: `rgba(0, 0, 0, ${lo})`,
    transform: `rotate(${rotate}deg)`,
  });

/* --- home: the house, 14 layers bottom-up ------------------------------ */
const HOME: GlyphLayer[] = [
  // Side wall. Shaded from the right so it is front-lit with everything
  // else -- an `inset 0 -2px` here used to imply a light from above.
  leaf({
    left: 22,
    top: 17,
    width: 7,
    height: 12,
    background: `linear-gradient(100deg, ${ACCENT_2} 0%, ${RIM} 100%)`,
    boxShadow: 'inset -2px 0 3px rgba(0, 0, 0, 0.3)',
  }),
  leaf({
    left: 7,
    top: 17,
    width: 15,
    height: 12,
    background: `radial-gradient(ellipse at 26% 14%, #ffffff 0%, ${ACCENT} 20%, ${ACCENT} 60%, ${ACCENT_2} 100%)`,
    boxShadow:
      'inset 1px 1px 2px rgba(255, 255, 255, 0.5), inset -1px -2px 4px rgba(0, 0, 0, 0.26)',
  }),
  // Eave shadow under the roofline, then the corner where the two walls
  // meet: the pair is what turns two flat rectangles into a corner.
  leaf({
    left: 7,
    top: 17,
    width: 22,
    height: 2,
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0.44) 0%, rgba(0, 0, 0, 0) 100%)',
  }),
  leaf({
    left: 21.5,
    top: 17,
    width: 1,
    height: 12,
    background: 'rgba(0, 0, 0, 0.42)',
  }),
  // The receding roof plane is the gable's own right slope moved 5px
  // across, so the two share the line (15,3)->(26,17) exactly and nothing
  // trails off at its own angle.
  leaf({
    left: 15,
    top: 3,
    width: 16,
    height: 14,
    clipPath: 'polygon(0 0, 31.25% 0, 100% 100%, 68.75% 100%)',
    background: `linear-gradient(116deg, rgba(255, 255, 255, 0.5) 0%, ${ACCENT_2} 14%, ${ACCENT_2} 40%, ${RIM} 100%)`,
  }),
  leaf({
    left: 4,
    top: 3,
    width: 22,
    height: 14,
    clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
    background: `linear-gradient(126deg, #ffffff 0%, ${ACCENT} 16%, ${ACCENT_2} 68%, ${RIM} 100%)`,
  }),
  // Fascia, spanning the whole roofline (x3-32) rather than stopping short.
  leaf({
    left: 3,
    top: 16,
    width: 29,
    height: 2,
    borderRadius: 1,
    background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_2} 62%, ${RIM} 100%)`,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.42)',
  }),
  leaf({
    left: 21,
    top: 7,
    width: 4,
    height: 7,
    background: `linear-gradient(90deg, ${ACCENT_2} 0%, ${RIM} 100%)`,
    boxShadow:
      'inset 1px 0 1px rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.4)',
  }),
  leaf({
    left: 20,
    top: 6,
    width: 6,
    height: 2,
    borderRadius: 1,
    background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_2} 100%)`,
  }),
  leaf({
    left: 11,
    top: 20,
    width: 6,
    height: 8,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(180deg, #2a1a10 0%, #0b0b0b 100%)',
    boxShadow:
      'inset 1px 2px 3px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.18)',
  }),
  leaf({
    left: 8,
    top: 20,
    width: 3,
    height: 3,
    borderRadius: 1,
    background:
      'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.5) 100%)',
    boxShadow:
      'inset -1px -1px 1px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.22)',
  }),
  leaf({
    left: 17,
    top: 20,
    width: 3,
    height: 3,
    borderRadius: 1,
    background:
      'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.44) 100%)',
    boxShadow:
      'inset -1px -1px 1px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.22)',
  }),
  // A sill across the whole base (x6-30). What used to sit here was a
  // blurred contact shadow, which read as a stray line under the door.
  leaf({
    left: 6,
    top: 28,
    width: 24,
    height: 2,
    background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_2} 62%, ${RIM} 100%)`,
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.45)',
  }),
  leaf({
    left: 10,
    top: 10,
    width: 8,
    height: 3,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.7)',
    filter: 'blur(1.1px)',
    transform: 'rotate(-38deg)',
  }),
];

/* --- projects: the brain, 15 layers ------------------------------------ */
const LOBE_SHADOW =
  'inset -1px -2px 3px rgba(0, 0, 0, 0.42), inset 1px 1px 2px rgba(255, 255, 255, 0.4)';

const PROJECTS: GlyphLayer[] = [
  leaf({
    left: 18,
    top: 24,
    width: 5,
    height: 9,
    borderRadius: '2px 2px 3px 3px',
    transform: 'rotate(-8deg)',
    background: `linear-gradient(90deg, ${RIM} 0%, ${ACCENT_2} 45%, ${RIM} 100%)`,
    boxShadow: 'inset 0 -2px 2px rgba(0, 0, 0, 0.45)',
  }),
  // Cerebellum: a squashed blob striped with folia, clipped to its own
  // silhouette so the stripes end where the form does.
  group(
    {
      left: 21,
      top: 18,
      width: 11,
      height: 9,
      borderRadius: '46% 54% 56% 44% / 52% 48% 52% 48%',
      overflow: 'hidden',
      background: accentCore('34% 26%'),
      boxShadow:
        'inset -1px -2px 3px rgba(0, 0, 0, 0.45), inset 1px 1px 1px rgba(255, 255, 255, 0.35), 0 1px 2px rgba(0, 0, 0, 0.45)',
    },
    [
      leaf({
        inset: 0,
        background:
          'repeating-linear-gradient(172deg, rgba(0, 0, 0, 0) 0 1.4px, rgba(0, 0, 0, 0.32) 1.4px 2.2px)',
      }),
    ],
  ),
  // Four bumps tucked behind the main mass, so the silhouette is lobed
  // rather than round.
  leaf({
    left: 7,
    top: 3,
    width: 11,
    height: 9,
    borderRadius: '50%',
    background: whiteCore('40% 30%'),
    boxShadow: LOBE_SHADOW,
  }),
  leaf({
    left: 16,
    top: 3,
    width: 11,
    height: 9,
    borderRadius: '50%',
    background: accentCore('40% 30%'),
    boxShadow: LOBE_SHADOW,
  }),
  leaf({
    left: 1,
    top: 9,
    width: 11,
    height: 11,
    borderRadius: '50%',
    background: whiteCore('38% 28%'),
    boxShadow: LOBE_SHADOW,
  }),
  leaf({
    left: 24,
    top: 8,
    width: 8,
    height: 10,
    borderRadius: '50%',
    background: accentCore('34% 26%'),
    boxShadow: LOBE_SHADOW,
  }),
  group(
    {
      left: 7,
      top: 17,
      width: 14,
      height: 10,
      borderRadius: '40% 60% 55% 45% / 45% 45% 55% 55%',
      background: accentCore('36% 24%'),
      boxShadow:
        'inset -1px -2px 4px rgba(0, 0, 0, 0.45), inset 1px 1px 2px rgba(255, 255, 255, 0.35), 0 1px 2px rgba(0, 0, 0, 0.45)',
    },
    [gyrus(1, 2, 11, 5, 0.34, 0.34, 8)],
  ),
  // The main mass, drawn over the bumps and carrying six folds of its own.
  group(
    {
      left: 3,
      top: 5,
      width: 28,
      height: 17,
      borderRadius: '48% 52% 46% 54% / 66% 68% 32% 34%',
      background: whiteCore('30% 22%'),
      boxShadow: `inset -3px -3px 7px rgba(0, 0, 0, 0.42), inset 2px 2px 4px rgba(255, 255, 255, 0.42), ${EYE_SHADOW}`,
    },
    [
      gyrus(2, 2, 12, 6, 0.5, 0.32, -18),
      gyrus(13, 1, 12, 6, 0.4, 0.32, 14),
      gyrus(1, 8, 12, 6, 0.36, 0.36, -4),
      gyrus(12, 8, 13, 6, 0.3, 0.36, 6),
      gyrus(5, 12, 11, 5, 0.28, 0.4, -10),
      gyrus(15, 12, 11, 5, 0.24, 0.4, 12),
    ],
  ),
  // The Sylvian fissure, dividing temporal lobe from cerebrum, and the
  // specular hit that says the whole thing is wet.
  leaf({
    left: 5,
    top: 16,
    width: 20,
    height: 6,
    borderRadius: '50%',
    borderBottom: '2px solid rgba(0, 0, 0, 0.55)',
    transform: 'rotate(4deg)',
  }),
  leaf({
    left: 8,
    top: 6,
    width: 7,
    height: 3,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.9)',
    filter: 'blur(1px)',
    transform: 'rotate(-16deg)',
  }),
];

/* --- about: the book with a face, 11 layers ---------------------------- */
const PAGE_STRIPE_180 =
  'repeating-linear-gradient(180deg, #FBF4E4 0 1px, #C0AB84 1px 2px)';
const PAGE_STRIPE_90 =
  'repeating-linear-gradient(90deg, #FBF4E4 0 1px, #C0AB84 1px 2px)';

const SPINE_BAND: CSSProperties = {
  left: 1,
  right: 1,
  height: 1,
  borderRadius: 1,
  background: 'rgba(0, 0, 0, 0.28)',
};

const ABOUT: GlyphLayer[] = [
  group(
    {
      left: 5,
      top: 6,
      width: 25,
      height: 22,
      transform: 'rotate(-9deg)',
    },
    [
      leaf({
        left: 3,
        top: 2,
        right: 0,
        bottom: 0,
        borderRadius: '1px 2px 2px 1px',
        background: `linear-gradient(180deg, ${ACCENT_2} 0%, ${RIM} 100%)`,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
      }),
      leaf({
        left: 4,
        top: 3,
        right: 1,
        bottom: 1,
        borderRadius: '0 1px 1px 0',
        background:
          'linear-gradient(180deg, #FBF4E4 0%, #E7DCC2 62%, #C9B998 100%)',
      }),
      // Real stacked leaves along the bottom and the fore-edge.
      leaf({
        left: 4,
        right: 1,
        bottom: 1,
        height: 4,
        background: PAGE_STRIPE_180,
      }),
      leaf({
        top: 3,
        bottom: 1,
        right: 1,
        width: 4,
        background: PAGE_STRIPE_90,
      }),
      // The cover is hinged at the spine and top-aligned with the board,
      // so the two faces read as one hinged object rather than two slabs.
      group(
        {
          left: 3,
          top: 0,
          width: 21,
          height: 20,
          borderRadius: '1px 3px 3px 1px',
          background: `radial-gradient(ellipse at 30% 22%, #ffffff 0%, ${ACCENT} 18%, ${ACCENT} 44%, ${ACCENT_2} 78%, ${RIM} 100%)`,
          boxShadow:
            'inset 1px 1px 3px rgba(255, 255, 255, 0.45), inset -2px -3px 6px rgba(0, 0, 0, 0.4), 2px 3px 4px rgba(0, 0, 0, 0.45)',
        },
        [
          group(
            {
              left: 7,
              top: 4,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 36% 28%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.22) 66%, rgba(0, 0, 0, 0.14) 100%)',
              boxShadow:
                'inset -1px -1px 2px rgba(0, 0, 0, 0.3), inset 1px 1px 1px rgba(255, 255, 255, 0.55)',
            },
            [
              leaf({
                left: 3,
                top: 3,
                width: 2,
                height: 2,
                borderRadius: '50%',
                background: RIM,
              }),
              leaf({
                left: 7,
                top: 3,
                width: 2,
                height: 2,
                borderRadius: '50%',
                background: RIM,
              }),
              leaf({
                left: 3,
                top: 7,
                width: 6,
                height: 3,
                borderRadius: '0 0 4px 4px',
                background: RIM,
              }),
            ],
          ),
          leaf({
            left: 8,
            top: 1,
            width: 8,
            height: 3,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.85)',
            filter: 'blur(1.1px)',
          }),
        ],
      ),
      // Drawn last on purpose: one full-height cylinder that overlaps and
      // bridges the seam between cover and back board.
      group(
        {
          left: 0,
          top: 0,
          width: 7,
          height: 22,
          borderRadius: '4px 1px 1px 4px',
          background: `linear-gradient(90deg, ${RIM} 0%, ${ACCENT_2} 38%, ${ACCENT} 62%, ${ACCENT_2} 84%, ${RIM} 100%)`,
          boxShadow:
            'inset 0 2px 2px rgba(255, 255, 255, 0.34), inset 0 -2px 3px rgba(0, 0, 0, 0.5), 1px 0 2px rgba(0, 0, 0, 0.35)',
        },
        [
          leaf({ ...SPINE_BAND, top: 2 }),
          leaf({ ...SPINE_BAND, bottom: 2 }),
        ],
      ),
    ],
  ),
  // Outside the rotated group so it hangs straight down. The only colour
  // in the set that never themes.
  leaf({
    left: 15,
    top: 25,
    width: 5,
    height: 9,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)',
    background:
      'linear-gradient(90deg, #7A1A20 0%, #D2363F 46%, #8E1F26 100%)',
    filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5))',
  }),
];

export const GLYPH_LAYERS: Record<GlyphKind, GlyphLayer[]> = {
  home: HOME,
  projects: PROJECTS,
  about: ABOUT,
};
