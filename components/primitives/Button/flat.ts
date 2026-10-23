import { BOX_VARS, CASE_CLASS, px, TYPE_CLASS } from './sizes';
import type { ButtonSize, ButtonStyle, ButtonTone } from './types';

/*
 * The flat pill (inventory §2.7): the escape hatch for the places a cap would
 * be too loud -- panel actions, inline controls, anything sitting inside
 * prose. No skirt, no travel, no sheen: a 32px lozenge that is transparent on
 * an accent-30 border at rest and fills SOLID accent with ink-coloured text on
 * hover. That inversion is the one high-contrast state in the whole system,
 * which is exactly why it is not the production button.
 *
 * It shares the keycap's type ramp (gap, size, line, tracking, transform come
 * straight off the §2.1 table) so the two treatments line up in a row, and
 * owns only its own box: the pill is set by its padding rather than a fixed
 * height, so a glyph grows it instead of overflowing it. md's 7px + the 18px
 * line + 7px is the §2.7 32px pill exactly.
 *
 * Unlike the keycap, the flat pill paints the WRAPPER rather than the plate
 * inside it. Nothing here moves, so there is no reason for a second element
 * to exist visually -- and it has to be this way round: :hover and
 * [data-disabled] are on the wrapper, and a `hover:` utility only styles the
 * element it is written on. Put these on the plate and the inversion fires
 * only when the pointer is over the plate itself, while disabled never fires
 * at all, because the plate carries no data-disabled.
 *
 * Press has no state in the bundle's code; the readme says it drops to 0.7
 * opacity, and that is what is implemented here -- IMMEDIATELY on the way
 * in and on `transition-hue`'s own 150ms on the way out, for the reason
 * keycap.ts's PRESS block sets out at length. The pill had the keycap's
 * timing problem in a milder form: 150ms linear is longer than most clicks,
 * and the transition is not even created until the style recalculation
 * after the pointerdown, so a fast click dimmed the pill by nothing at all
 * before the pointer came back up.
 *
 * The keycap fixes that with a custom property because its `transition` is
 * an inline declaration that no class can outrank. The pill's is a class
 * -- `transition-hue`, one class of specificity -- so it takes the simpler
 * road: `active:[transition-duration:0s]` is a class AND a pseudo-class,
 * which outranks it on specificity alone. Neither mechanism depends on the
 * order Tailwind emits anything in, which is the property that matters;
 * they differ only because the two elements declare their transitions in
 * different places.
 *
 * ITS BOX IS OVERRIDABLE. The pill paints the wrapper, which is also where
 * a caller's `className` lands, so every visible box property here is a
 * utility rather than an inline declaration -- see BOX_VARS in sizes.ts for
 * why the numbers can still live in one table. `rounded-none px-1` on a
 * flat pill does what it says.
 *
 * Hover is scoped to `pointer-fine:`. The site redefines Tailwind's `hover`
 * to bare `:hover`, which on a touch screen LATCHES: the tap that fires the
 * button leaves it inverted until the next tap somewhere else. A coarse
 * pointer therefore gets rest and press only, which is the whole of the
 * feedback it can actually use.
 */

type FlatBox = {
  padY: number;
  /** Horizontal padding with no left mark. */
  padX: number;
  /** Left padding when a glyph, expand mark or lead is present. */
  padXTight: number;
};

const FLAT_BOXES: Record<ButtonSize, FlatBox> = {
  md: { padY: 7, padX: 12, padXTight: 10 },
  sm: { padY: 6, padX: 10, padXTight: 8 },
  xs: { padY: 5, padX: 9, padXTight: 7 },
};

const padding = (box: FlatBox, padded: boolean): string =>
  ({
    true: `${px(box.padY)} ${px(box.padX)} ${px(box.padY)} ${px(box.padXTight)}`,
    false: `${px(box.padY)} ${px(box.padX)}`,
  })[`${padded}`];

/*
 * Rest is transparent over an outline; hover fills and inverts; press dims;
 * disabled halves out and stops taking the pointer. `transition-hue` is the
 * design system's colour-only transition group (globals.css).
 *
 * Both tones invert to the SAME solid accent, because §2.7 defines exactly
 * one high-contrast state and --text-on-accent is the only ink guaranteed
 * legible on it in all eight themes. The tone separates the two at rest
 * instead: primary carries the accent outline, secondary a neutral one.
 */
const TONE_REST: Record<ButtonTone, string> = {
  primary: 'border-accent-30 text-accent',
  secondary: 'border-surface-3 text-fg-3',
};

const STATES = [
  'bg-transparent',
  'pointer-fine:hover:border-accent pointer-fine:hover:bg-accent pointer-fine:hover:text-on-accent',
  'active:opacity-70',
  'active:[transition-duration:0s]',
  'data-[disabled=true]:pointer-events-none',
  'data-[disabled=true]:cursor-default',
  'data-[disabled=true]:opacity-50',
].join(' ');

const BOX = {
  true: 'flex flex-1',
  false: 'inline-flex flex-none',
};

const JUSTIFY = {
  true: 'justify-center',
  false: 'justify-start',
};

export const flat: ButtonStyle = ({
  size,
  spec,
  tone,
  grow,
  center,
  padded,
}) => ({
  wrapper: {
    className: `${BOX[`${grow}`]} ${TONE_REST[tone]} ${STATES} ${TYPE_CLASS} ${CASE_CLASS[spec.textTransform]} transition-hue min-w-0 cursor-pointer items-center border p-(--b-pad) font-[number:var(--weight-regular)] select-none rounded-(--b-radius)`,
    style: {
      ...BOX_VARS(
        spec,
        padding(FLAT_BOXES[size], padded),
        'var(--radius-control)',
      ),

      /* currentColor throughout, for the same reason as the marks below. */
      '--k-mark': 'currentColor',
      '--k-mark-2': 'currentColor',
      '--k-mark-rim': 'transparent',
    },
  },
  inner: {
    className: `${JUSTIFY[`${grow || center}`]} flex min-w-0 flex-auto items-center gap-(--b-gap)`,
    style: {},
  },
  /*
   * Layout only, like the keycap's: the slot reserves the 34x34 box and
   * the rest scale rides down as `scale` for Glyph to apply once. The
   * pill still does not spring -- nothing here ever declares --g-mul, so
   * the glyph's transform never changes and its transition never runs.
   */
  glyph: {
    className: 'h-[34px] w-[34px] flex-none',
    scale: spec.glyph,
    style: {
      margin: px(spec.glyphMargin),
    },
  },
  expand: {
    className: 'block flex-none origin-center overflow-visible',
    style: {},
  },
  /* currentColor, not accent: the hover fill IS accent, so an accent mark
     would disappear into it. */
  mark: {
    className: 'flex-none',
    style: { color: 'currentColor' },
  },
  label: {
    className:
      'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
    style: {},
  },
});

export default flat;
