/*
 * THE PRESS, stated once for the whole site.
 *
 * Every control here had its press written independently, and independently
 * got it wrong. Measured in Chromium against the production build, on the
 * three shipped routes, a trusted pointerdown changed NOTHING on the rail
 * tabs, the scrubber ticks, the chips or the pills, and changed about a
 * pixel on the project rows and the two chrome balls. The keycap was the
 * only control on the site with a press a person could see -- and it only
 * has one because it was debugged twice, in isolation, with the finding
 * written into keycap.ts rather than anywhere the next control could reach.
 *
 * So the vocabulary is here, and so are the two rules that decide whether
 * any of it renders.
 *
 * RULE 1 -- A PRESS MOVES AWAY FROM REST, NOT TOWARD HOVER.
 *
 * The eye and the mouth used to press to `scale(1.02)` against a hover of
 * 1.08, and the comment above it called 1.02 "the smaller of the two",
 * which it is. But rest is 1.0, so from rest that press was a 2% GROWTH:
 * a touch tap, a keyboard activation and any click that landed before the
 * hover had settled all read as a weak hover rather than as a press. A
 * press has to be legible from whatever state the control was in, so it
 * compresses past rest -- PRESS_SCALE is below 1, not between 1 and hover.
 *
 * RULE 2 -- ANYTHING THAT WRITES A PROPERTY THE PRESS WRITES MUST BE
 * SCOPED `not-active:`.
 *
 * A press utility compiles to one class plus one pseudo-class. So does
 * `hover:`, so does `data-[selected=true]:`, so does `data-[active=true]:`
 * and so does `focus-within:`. At equal specificity the winner is whichever
 * rule Tailwind emits LAST, and that order is the compiler's business, not
 * ours:
 *
 *   pointer-fine:hover:*        emitted after every unconditional rule,
 *                               because the @media block is grouped last.
 *                               This is what beat the keycap, the eye, the
 *                               mouth and the pill.
 *   data-[*]:*                  emitted after `active:*`. This is what beat
 *                               the project rows and the chips -- and it
 *                               beat them on exactly the rows and chips a
 *                               person can press, because `data-active` is
 *                               set by the hover handler and `data-selected`
 *                               by the thing you just clicked.
 *
 * `not-active:` settles it by CONDITION instead of by order: the competing
 * selector stops matching while the control is down, so the press applies
 * unopposed however Tailwind chooses to sort its output. Reordering or a
 * specificity bump would both be hostage to the emit order, which is the
 * thing that has now broken this site three separate times.
 *
 * The guards cannot be generated from here. Tailwind's scanner reads source
 * TEXT, so `not-active:data-[active=true]:bg-accent-07` has to appear
 * literally in the file that uses it -- a helper returning the string would
 * compile to nothing. What this module can do is name the invariant and let
 * test/press.test.tsx enforce it across every component at once, which is
 * what it does: no rule may write a property a press rule writes unless it
 * excludes :active.
 *
 * RULE 3, which is really a corollary -- THE PRESS IS IMMEDIATE IN AND
 * EASED OUT.
 *
 * A click is 60-120ms. Measured on an 80ms click against the old build, the
 * eye's 180ms ease carried it from 1.08 to 1.030 -- 1.7px on a 34px ball,
 * never reaching its own target -- and then reversed. Every state value was
 * correct on the first frame; what was missing was the RENDERING of it. So
 * the down edge takes no transition at all and the up edge keeps the
 * control's own easing, which is what every tactile control does.
 *
 * PRESS_NOW is for a control whose `transition` is a CLASS: it is a class
 * plus a pseudo-class, so it outranks the bare transition utility on
 * specificity alone. A control whose transition is an INLINE declaration
 * cannot be reached this way -- an inline declaration outranks any class --
 * and has to read its duration from a custom property the press rule flips
 * instead. The keycap is the only one of those; see the PRESS block in
 * Button/keycap.ts.
 */

/**
 * The compression, as a number, for the tests and for anything that needs
 * to reason about the travel rather than wear the class.
 *
 * It is written twice -- here and inside PRESS_COMPRESS below -- and that
 * is not an oversight. Tailwind's scanner reads source TEXT, so
 * `active:scale-[${PRESS_SCALE}]` would compile to no rule at all; the
 * class has to appear literally. The duplication is held together by
 * test/press.test.tsx, which reads the scale off every rendered component
 * and fails if it is not exactly `scale-[${PRESS_SCALE}]`, so the two
 * cannot drift even though neither can be derived from the other.
 */
export const PRESS_SCALE = 0.94;

/**
 * The flat-control press: a 6% compression, below rest so it reads from
 * rest, hover, focus or a finger. Worn by the chrome balls, the rail tabs
 * and the scrubber ticks.
 *
 * It sets the `scale` property rather than `transform`, which is Tailwind
 * v4's behaviour and is load bearing on two of the three: the scrubber tick
 * and the stage's foreground both carry `animate-slide-in`, whose keyframes
 * end on `transform: translateY(0)` under `forwards` -- and a filling
 * animation outranks every normal author declaration, for ever. A press
 * written as `transform` would be silently overruled on any element that
 * has entered. `scale` is untouched by those keyframes.
 */
export const PRESS_COMPRESS = 'active:scale-[0.94]';

/**
 * The surface press: the accent wash deepens. accent-20 rather than the
 * accent-12 the rows used to reach for, because hover is accent-07 and the
 * step from 0.07 to 0.12 alpha is not a state change anyone can see.
 */
export const PRESS_WASH = 'active:bg-accent-20';

/**
 * The same press one rung further up the ladder, for a control whose HOVER
 * already reaches accent-20 -- the selected theme row and the contact
 * panel's email link. A press has to be deeper than the state it is pressed
 * from, and for those two accent-20 is that state rather than a step past
 * it.
 *
 * It is a second constant rather than a per-component arbitrary value so
 * that "one step deeper than this control's hover" stays a decision the
 * ladder makes. A third step would mean a control whose hover is accent-30,
 * and the answer there is to lower the hover, not to reach for accent-60.
 */
export const PRESS_WASH_DEEP = 'active:bg-accent-30';

/**
 * Collapses a class-declared transition for the down edge only. See rule 3.
 * The release is untouched: on pointerup the duration goes back to the
 * control's own, and a transition is generated from the after-change style,
 * so it eases back out.
 */
export const PRESS_NOW = 'active:[transition-duration:0s]';

/**
 * The release easing for a control that had no transition at all before it
 * was given a press -- the rail tabs and the scrubber ticks. 180ms on the
 * chrome's own curve, which is what the eye and the mouth already use.
 */
export const PRESS_RELEASE =
  'transition-transform duration-[180ms] ease-[cubic-bezier(.165,.84,.44,1)] motion-reduce:transition-none';
