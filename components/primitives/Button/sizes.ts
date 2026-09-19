import type { ButtonSize, ButtonSizeSpec } from './types';

/*
 * The design system's SIZES table (inventory §2.1), verbatim. Three sizes,
 * with the skirt scaling per size so the press travel always equals the skirt
 * and the cap bottoms out on its own plate.
 *
 * The font sizes here are the system's own button ramp and the reason there
 * is a table at all: 14/18, 12/16 and 10/14 are not restatements of the
 * --type-* tokens (only sm's 12px has one), so they are carried here, in the
 * single place the numbers are written, rather than at any call site.
 *
 * `glyphMargin` follows the bundle's rule `glyph < 0.56 ? -10 : -8`, resolved
 * per row so the rule does not have to be re-derived at render time.
 */
export const BUTTON_SIZES: Record<ButtonSize, ButtonSizeSpec> = {
  md: {
    pad: '14px 26px 14px 17px',
    padPlain: '14px 26px',
    radius: 7,
    gap: 10,
    fontSize: 14,
    lineHeight: 18,
    tracking: '.02em',
    textTransform: 'none',
    reserve: 4,
    skirt: 3.5,
    edge: 4.5,
    amb: 6,
    ambBlur: 9,
    glyph: 0.62,
    glyphMargin: -8,
    expand: 13,
  },
  sm: {
    pad: '10px 20px 10px 14px',
    padPlain: '10px 20px',
    radius: 7,
    gap: 9,
    fontSize: 12,
    lineHeight: 16,
    tracking: '.16em',
    textTransform: 'uppercase',
    reserve: 3,
    skirt: 3,
    edge: 4,
    amb: 5,
    ambBlur: 8,
    glyph: 0.56,
    glyphMargin: -8,
    expand: 12,
  },
  xs: {
    pad: '8px 14px 8px 11px',
    padPlain: '8px 14px',
    radius: 6,
    gap: 8,
    fontSize: 10,
    lineHeight: 14,
    tracking: '.14em',
    textTransform: 'uppercase',
    reserve: 2,
    skirt: 2.5,
    edge: 3.5,
    amb: 4,
    ambBlur: 7,
    glyph: 0.5,
    glyphMargin: -10,
    expand: 11,
  },
};

/** Every size, in the table's order, for specimens and tests to walk. */
export const BUTTON_SIZE_ORDER: readonly ButtonSize[] = [
  'md',
  'sm',
  'xs',
];

export const px = (value: number): string => `${value}px`;

/*
 * THE BOX IS CLASSES, THE NUMBERS ARE PROPERTIES.
 *
 * Both treatments used to stamp their padding, radius and type ramp
 * straight into the inline `style` of whichever element owned them. That
 * made a caller's `rounded-none px-1` silently inert: an inline
 * declaration outranks any utility that is not `!`-flagged, so `cn()` kept
 * the class and the cascade then threw it away. The numbers still have to
 * live here -- Tailwind's scanner cannot see a class name assembled at
 * render time from this table -- so instead the element carries them as
 * custom properties and REAL UTILITIES read them back. A caller's own box
 * class now merges against these and wins, like every other class.
 */
export const BOX_VARS = (
  spec: ButtonSizeSpec,
  padding: string,
  radius: string,
): Record<string, string> => ({
  '--b-pad': padding,
  '--b-radius': radius,
  '--b-gap': px(spec.gap),
  '--b-size': px(spec.fontSize),
  '--b-line': px(spec.lineHeight),
  '--b-track': spec.tracking,
});

/** The type ramp, off --b-size / --b-line / --b-track. */
export const TYPE_CLASS =
  'text-(length:--b-size) leading-(--b-line) tracking-(--b-track)';

/** The table's text-transform, as a utility a caller can merge against. */
export const CASE_CLASS: Record<
  ButtonSizeSpec['textTransform'],
  string
> = {
  none: 'normal-case',
  uppercase: 'uppercase',
};

/**
 * Whether the asymmetric `pad` applies. A glyph, an expand mark or a lead
 * pulls the left padding in; a TRAIL DOES NOT. That asymmetry is deliberate
 * and is kept from the bundle: `pad` exists to make room on the left for a
 * mark that overhangs its slot, and a trail sits on the right, where the
 * generous padding already is. Widening the left edge for it would shift the
 * label off the optical centre of every pager cap on the artboards.
 */
export const isPadded = (marks: {
  glyph: boolean;
  expand: boolean;
  lead: boolean;
}): boolean => marks.glyph || marks.expand || marks.lead;

/** `pad` when a left mark is present, `padPlain` otherwise. */
export const padFor = (
  spec: ButtonSizeSpec,
  padded: boolean,
): string => ({ true: spec.pad, false: spec.padPlain })[`${padded}`];
