import { padFor, px } from './sizes';
import type { ButtonStyle, ButtonTone } from './types';

/*
 * The keycap: the production button. Every CTA on artboards 1a-1h is one.
 *
 * It is a single glass plate, no wall shell -- the frustum stays in the
 * playground as exploration. The plate sits on a flat-coloured skirt that
 * reads as the cap's own plate; on hover it lifts 1px and the skirt and cast
 * grow underneath it, and on press it travels EXACTLY its own skirt height
 * while the skirt collapses to nothing, so the cap bottoms out on that plate.
 * That identity -- travel == skirt -- is the whole physical conceit and is
 * asserted per size in test/button.test.tsx.
 *
 * HOW THE STATES ARE WIRED, and why it is done this way. The plate's face,
 * shadow, ink and transform are written once, in `face`/`shadow` below, in
 * terms of a handful of custom properties that are NEVER DECLARED AT REST:
 * every one is read as `var(--k-thing, <rest value>)`, so the rest state is
 * the absence of the variable. :hover and :active then declare them on the
 * wrapper and the plate inherits them.
 *
 * The alternative -- declaring the rest values inline and overriding them in
 * the state rules -- cannot work: an inline style beats any class rule, so
 * the cap would never move. The only values that are inline here are ones no
 * state ever flips (the per-size operands the state rules point at).
 *
 * Declaring the state on the WRAPPER rather than the plate is also load
 * bearing: press sets --k-y to var(--k-skirt-press), and a custom property
 * that references another is resolved on the element where it is declared,
 * so the operand has to be in scope there. (The bundle declares its operands
 * on the plate and its state on the plate's parent, where --k-skirt is not
 * visible; that silently resolves to the 0px fallback and the cap never
 * travels. Fixed here.)
 *
 * All eight --cap-* tokens are themed, so the cap re-themes for free.
 */

/**
 * Hover scalars: `bump(n) = round(skirt * n * 10) / 10 + 'px'`, the bundle's
 * arithmetic verbatim, float error and all. md's ambient offset is 3.5 x 2.3,
 * which is 8.05 on paper (the inventory table rounds it to 8.1) but
 * 8.049999999999999 in IEEE 754, so this rounds to 8px -- which is what the
 * approved prototype renders. Its blur, 3.5 x 3.3, lands on 11.5 for the same
 * reason. Kept as-is rather than "corrected": the cap that was signed off is
 * the one that ran this expression.
 */
const bump = (skirt: number, n: number): string =>
  px(Math.round(skirt * n * 10) / 10);

/** A top-lit sheen over the flat face colour. Rest face: --surface-raised. */
const FACE_SHEEN =
  'radial-gradient(ellipse 120% 150% at 50% 0%, rgba(255,255,255,.1) 0%, rgba(255,255,255,0) 60%)';

const face = (): string =>
  [
    FACE_SHEEN,
    'linear-gradient(180deg, var(--k-face, var(--surface-raised)) 0%, var(--k-face, var(--surface-raised)) 100%)',
  ].join(', ');

/**
 * Inset lip, inset shade, the solid skirt, the contact edge and the ambient
 * cast. Each operand carries this size's rest value as its fallback.
 */
const shadow = (spec: {
  skirt: number;
  edge: number;
  amb: number;
  ambBlur: number;
}): string =>
  [
    'inset 0 1px 0 var(--k-lip, var(--cap-lip))',
    'inset 0 -1px 0 var(--k-shade, var(--cap-shade))',
    `0 var(--k-skirt-y, ${px(spec.skirt)}) 0 0 var(--cap-skirt)`,
    `0 var(--k-edge-y, ${px(spec.edge)}) 1px 0 rgba(0,0,0,.5)`,
    `0 var(--k-amb-y, ${px(spec.amb)}) var(--k-amb-blur, ${px(spec.ambBlur)}) -2px var(--k-amb-tint, rgba(0,0,0,.55))`,
  ].join(', ');

const TRANSITION = [
  'transform 70ms cubic-bezier(.3,0,.5,1)',
  'box-shadow 70ms cubic-bezier(.3,0,.5,1)',
  'color 160ms ease-out',
  'background 160ms ease-out',
].join(', ');

/** The glyph and the expand mark grow on a spring, not on the cap's ease. */
const SPRING = 'transform 240ms cubic-bezier(.34,1.56,.64,1)';

const INK: Record<ButtonTone, string> = {
  primary: 'var(--cap-ink)',
  secondary: 'var(--cap2-ink)',
};

/* Hover: the lip goes hot, the skirt and cast grow by the bump scalars and
   the whole cap rises 1px into the wrapper's reserved padding. */
const HOVER = [
  'hover:[--k-y:-1px]',
  'hover:[--g-mul:1.3]',
  'hover:[--k-face:var(--surface-hover)]',
  'hover:[--k-lip:var(--cap-lip-hot)]',
  'hover:[--k-ink:var(--cap-ink-hot)]',
  'hover:[--k-skirt-y:var(--k-skirt-hot)]',
  'hover:[--k-edge-y:var(--k-edge-hot)]',
  'hover:[--k-amb-y:var(--k-amb-hot)]',
  'hover:[--k-amb-blur:var(--k-amb-blur-hot)]',
  'hover:[--k-amb-tint:rgba(0,0,0,.6)]',
].join(' ');

/* Press: travel == skirt, skirt collapsed to zero, cast pulled in tight and
   the ink flipped to the accent. Tailwind emits `active:` after `hover:`, so
   a cap that is both hovered and pressed lands on these. */
const PRESS = [
  'active:[--k-y:var(--k-skirt-press)]',
  'active:[--g-mul:1.22]',
  'active:[--k-face:var(--surface-hover)]',
  'active:[--k-lip:var(--cap-lip-press)]',
  'active:[--k-shade:var(--cap-shade-press)]',
  'active:[--k-ink:var(--clif-accent)]',
  'active:[--k-skirt-y:0px]',
  'active:[--k-edge-y:1px]',
  'active:[--k-amb-y:2px]',
  'active:[--k-amb-blur:5px]',
  'active:[--k-amb-tint:rgba(0,0,0,.6)]',
].join(' ');

/* A dead cap does not lift, travel or take the pointer. */
const DISABLED = [
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

export const keycap: ButtonStyle = ({
  spec,
  tone,
  grow,
  center,
  padded,
}) => ({
  wrapper: {
    className: `${BOX[`${grow}`]} ${HOVER} ${PRESS} ${DISABLED} min-w-0 cursor-pointer select-none`,
    style: {
      /* Absorbs the 1px hover lift and the grown skirt, so nothing below the
         cap moves when it rises. */
      paddingBottom: px(spec.reserve),

      /* Operands the state rules point at. None is ever overridden, so none
         of them is in a specificity fight with a class. */
      '--g-base': `${spec.glyph}`,
      '--k-skirt-hot': bump(spec.skirt, 1.3),
      '--k-edge-hot': bump(spec.skirt, 1.6),
      '--k-amb-hot': bump(spec.skirt, 2.3),
      '--k-amb-blur-hot': bump(spec.skirt, 3.3),

      /* Press travel. It is the skirt, not a number of its own: the cap
         lands on the plate it has been standing on. */
      '--k-skirt-press': px(spec.skirt),

      /* The expand mark's two-stop gradient and its backing rim. */
      '--k-mark': 'var(--clif-accent)',
      '--k-mark-2': 'var(--clif-accent-2)',
      '--k-mark-rim': 'var(--iris-rim)',
    },
  },
  inner: {
    className: `${JUSTIFY[`${grow || center}`]} flex min-w-0 flex-auto items-center`,
    style: {
      gap: px(spec.gap),
      padding: padFor(spec, padded),
      borderRadius: px(spec.radius),
      background: face(),
      boxShadow: shadow(spec),
      color: `var(--k-ink, ${INK[tone]})`,
      fontSize: px(spec.fontSize),
      lineHeight: px(spec.lineHeight),
      letterSpacing: spec.tracking,
      textTransform: spec.textTransform,
      transform: 'translateY(var(--k-y, 0px))',
      transition: TRANSITION,
    },
  },
  glyph: {
    className:
      'h-[34px] w-[34px] flex-none origin-center will-change-transform',
    style: {
      margin: px(spec.glyphMargin),
      transform: 'scale(calc(var(--g-base) * var(--g-mul, 1)))',
      transition: SPRING,
    },
  },
  expand: {
    className:
      'block flex-none origin-center overflow-visible will-change-transform',
    style: {
      transform: 'scale(var(--g-mul, 1))',
      transition: SPRING,
    },
  },
  mark: {
    className: 'flex-none',
    style: {
      color: 'var(--clif-accent)',
      textShadow:
        '0 1px 0 var(--iris-rim), 0 0 6px var(--map-atmosphere)',
    },
  },
  label: {
    className:
      'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
    style: {},
  },
});

export default keycap;
