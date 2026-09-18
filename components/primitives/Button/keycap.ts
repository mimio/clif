import {
  BOX_VARS,
  CASE_CLASS,
  padFor,
  px,
  TYPE_CLASS,
} from './sizes';
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
 *
 * WHAT A CALLER CAN AND CANNOT OVERRIDE. The plate's BOX -- padding,
 * radius, gap, the type ramp, the case and the ink -- is written as
 * utilities over custom properties (BOX_VARS in sizes.ts), so a caller
 * reaching the plate through `plateClassName` can merge against every one
 * of them. The plate's PHYSICS -- the face, the five-part shadow, the
 * travel transform and the transition -- stays inline and is deliberately
 * not overridable: those five declarations ARE the state machine, they are
 * written in terms of variables the state rules flip, and a class that
 * replaced one would either break the lift or lose to it silently. The
 * wrapper, which `className` reaches, owns only the reserve and the
 * operands.
 *
 * Hover is scoped to `pointer-fine:`. The site redefines Tailwind's
 * `hover` to bare `:hover`, which on a touch screen latches: the tap that
 * fires the cap leaves it lifted, hot-lipped and grown until the next tap
 * lands somewhere else. A coarse pointer gets rest and press, which are the
 * two states a finger can actually produce.
 *
 * ...AND IT IS ALSO SCOPED TO `not-active:`, WHICH IS NOT DECORATION.
 * Hover and press write the same ten variables, and `pointer-fine:hover:`
 * and `active:` compile to selectors of EQUAL specificity -- one class plus
 * one pseudo-class each -- so on a cap that is both (which is every cap a
 * mouse ever presses) the winner is whichever Tailwind emits last. Tailwind
 * v4 groups its output by variant, and the whole `@media (pointer: fine)`
 * block is emitted AFTER every unconditional rule, so hover was last and
 * hover won: a pressed cap stayed lifted, hot-lipped and hot-inked, and the
 * only press declaration that survived was --k-shade, the one hover does
 * not also set. The symptom was not a slow press. It was NO press, and then
 * a 70ms drop out of the hover lift whenever the pointer finally left the
 * cap -- which is what "i dont see their active state until way later"
 * actually was.
 *
 * `not-active:` settles it by CONDITION rather than by order:
 * `&:not(:active):hover` does not match while the cap is down, so the press
 * rules apply unopposed however Tailwind chooses to sort them. Reordering
 * or a specificity bump would both have been hostage to the compiler's emit
 * order, which is precisely what went wrong the first time. It is also the
 * honest description of the cap: a plate that has bottomed out on its skirt
 * is not simultaneously floating 1px above it.
 *
 * e2e/hermetic/press-state.spec.ts measures this in a browser under trusted
 * input, because every class involved was present before the fix and is
 * present after it -- only the rendered cap can tell the two apart.
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

/**
 * The expand mark grows on a spring, not on the cap's ease. The glyph
 * springs on the same curve over the same 240ms, but declares it itself --
 * Glyph owns its transform now, so it owns the transition with it.
 */
const SPRING = 'transform 240ms cubic-bezier(.34,1.56,.64,1)';

/* The rest ink, as the fallback of the variable the state rules flip. Both
   are written out as whole class names because the scanner reads source
   text, not the string this table is spliced into. */
const INK: Record<ButtonTone, string> = {
  primary: 'text-[color:var(--k-ink,var(--cap-ink))]',
  secondary: 'text-[color:var(--k-ink,var(--cap2-ink))]',
};

/* Hover: the lip goes hot, the skirt and cast grow by the bump scalars and
   the whole cap rises 1px into the wrapper's reserved padding -- but only
   while the cap is NOT down. See the note on `not-active:` at the top. */
const HOVER = [
  'pointer-fine:not-active:hover:[--k-y:-1px]',
  'pointer-fine:not-active:hover:[--g-mul:1.3]',
  'pointer-fine:not-active:hover:[--k-face:var(--surface-hover)]',
  'pointer-fine:not-active:hover:[--k-lip:var(--cap-lip-hot)]',
  'pointer-fine:not-active:hover:[--k-ink:var(--cap-ink-hot)]',
  'pointer-fine:not-active:hover:[--k-skirt-y:var(--k-skirt-hot)]',
  'pointer-fine:not-active:hover:[--k-edge-y:var(--k-edge-hot)]',
  'pointer-fine:not-active:hover:[--k-amb-y:var(--k-amb-hot)]',
  'pointer-fine:not-active:hover:[--k-amb-blur:var(--k-amb-blur-hot)]',
  'pointer-fine:not-active:hover:[--k-amb-tint:rgba(0,0,0,.6)]',
].join(' ');

/* Press: travel == skirt, skirt collapsed to zero, cast pulled in tight and
   the ink flipped to the accent. These are bare `active:` -- a finger can
   press and cannot hover -- and they beat the hover block above because
   that block excludes :active, NOT because of the order Tailwind emits
   them in. It does not emit them in that order: measured against the
   compiled stylesheet, every `pointer-fine:` rule lands after every
   unconditional one. */
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
    className: `${BOX[`${grow}`]} ${HOVER} ${PRESS} ${DISABLED} min-w-0 cursor-pointer pb-(--k-reserve) select-none`,
    style: {
      /* Absorbs the 1px hover lift and the grown skirt, so nothing below the
         cap moves when it rises. A property read by a utility rather than an
         inline declaration, so a caller's own padding can merge with it. */
      '--k-reserve': px(spec.reserve),

      /* The plate's box travels down as properties; the plate's own classes
         read them, and a plateClassName override merges against those. */
      ...BOX_VARS(spec, padFor(spec, padded), px(spec.radius)),

      /* Operands the state rules point at. None is ever overridden, so none
         of them is in a specificity fight with a class. */
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
    className: `${JUSTIFY[`${grow || center}`]} ${TYPE_CLASS} ${CASE_CLASS[spec.textTransform]} ${INK[tone]} flex min-w-0 flex-auto items-center gap-(--b-gap) rounded-(--b-radius) p-(--b-pad)`,
    style: {
      background: face(),
      boxShadow: shadow(spec),
      transform: 'translateY(var(--k-y, 0px))',
      transition: TRANSITION,
    },
  },
  /*
   * THE SLOT IS LAYOUT ONLY; THE GLYPH DOES THE SCALING.
   *
   * It reserves the sculpture's 34x34 box and pulls it into the cap's
   * padding, and that is all. The rest scale rides down as `scale`, which
   * Glyph writes as its own --g-base and multiplies by whatever --g-mul
   * this cap is currently declaring -- so the growth is applied ONCE, on
   * one element, on the glyph's own spring.
   *
   * Scaling here as well was a factor of --g-mul SQUARED: the slot grew
   * 1.3x and the glyph inside it grew another 1.3x, for 1.69x on hover
   * against the 1.30x the design asks for. Glyph's contract is the right
   * one -- an ancestor's multiplier COMPOSES with the instance's rest
   * scale -- so the fix is for the cap to stop competing with it, which
   * is also the prototype's own structure (Keycap.dc.html: the 34px div
   * scales, the imported Glyph is a plain sculpture).
   */
  glyph: {
    className: 'h-[34px] w-[34px] flex-none',
    scale: spec.glyph,
    style: {
      margin: px(spec.glyphMargin),
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
