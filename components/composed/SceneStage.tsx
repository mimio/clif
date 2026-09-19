import type { CSSProperties, ReactNode } from 'react';
import { cn } from 'utils/cn';

/*
 * The foreground frame every route sits in. The scene itself is not a child:
 * it lives behind the whole app in scene/SceneRoot and never unmounts. What
 * this owns is the wash that makes type legible over terrain, and the column
 * the type sits in. Nothing here paints an opaque background -- the stage is
 * glass over the globe, not a page on top of it.
 *
 * NEVER blur the map to make text readable. The protection is a wash, and
 * the wash must never reach the map's own data: on 1b it is fully clear by
 * x835, twenty pixels before the first map label, because washing ink and
 * ground together collapses the ratio between them.
 *
 * `left` is --scrim-wide rather than --vignette-left on purpose. The plain
 * left vignette is what the cardless table failed on: it decays to 0.39 by
 * the table's right edge, so the last two columns sat on bare terrain.
 * --scrim-wide holds its strength under a column of about 620px and only
 * fades past it; a stage whose column runs wider than that wants `sheet`,
 * which is the pairing that protects the whole width.
 *
 * Insets are tokens (--foreground-left 112px, --foreground-right 120px,
 * --foreground-top 208px, --foreground-bottom 80px, each with tablet and
 * mobile steps), so they are not props.
 */
export type StageVignette =
  'left' | 'atmosphere' | 'night' | 'center' | 'sheet' | 'none';

/*
 * One themed token per name. `sheet` is the full-bleed stack the 1c board
 * draws -- the centred ellipse with the sheet wash over it -- which is what
 * deepens the ground under a column that runs most of the way across.
 */
export const STAGE_WASHES: Record<StageVignette, string | null> = {
  left: 'var(--scrim-wide)',
  atmosphere: 'var(--vignette-atmosphere)',
  night: 'var(--vignette-night)',
  center: 'var(--scrim-center)',
  sheet: 'var(--scrim-center), var(--scrim-sheet)',
  none: null,
};

export type SceneStageProps = {
  /** The page word, rendered above the column. */
  word?: ReactNode;
  children?: ReactNode;
  /** Pinned to the bottom of the stage, e.g. the about scrubber. */
  footer?: ReactNode;
  /**
   * The project capture. Passing one opens the rail on the right and
   * narrows the column to what is left of it -- whether or not the plane
   * has an image in it yet, because a column that resized on hover would
   * be worse than one that reserved the space.
   */
  plane?: ReactNode;
  /**
   * What the plane does below --breakpoint-wide, where there is no rail.
   * A detail always has a capture, so it folds back into the column; the
   * index's is a hover preview, and a hover preview with no hover to open
   * it is nothing, so it is dropped.
   */
  planeFold?: boolean;
  /**
   * How far down the rail the plane sits, in CSS pixels either side of its
   * resting top. The index uses it to track the hovered row; a detail,
   * which has one capture and no row to track, leaves it at 0.
   *
   * It moves the rail rather than the capture because the capture's own
   * transform is its perspective tilt, and a page that wanted to nudge it
   * would have to restate that tilt to do it.
   */
  planeShift?: number;
  vignette?: StageVignette;
  align?: 'center' | 'top';
  /**
   * Lets the pointer through the foreground to the map behind it.
   *
   * THE STAGE IS THE REASON /about'S MAP COULD NOT BE DRAGGED. Every
   * camera but the detail's has `interactive: true` and SceneRoot has
   * always applied it, so mapbox's drag, scroll-zoom and rotate handlers
   * were enabled the whole time -- they just never saw an event. This
   * <main> is `h-full w-full` at z-10 over a scene at z-0, and the column
   * inside it is `inset-y-0` across the stage insets, so between them
   * they cover the viewport and swallow every press. Turning the handlers
   * on again would have changed nothing; this is the flag that matters.
   *
   * It is opt-in per route rather than the default because the other
   * routes DO want to catch a stray press: hello and projects put their
   * own controls in that column, and a drag begun on a table row that
   * ended up panning the globe under it would be worse than a globe that
   * holds still.
   *
   * WHAT A PASS-THROUGH ROUTE OWES. Anything in the foreground that must
   * still take a pointer -- a link, a button, a paragraph a visitor might
   * want to select -- has to say `pointer-events-auto` for itself, and
   * the route's content has to be short enough not to need the column's
   * scroll, because a `pointer-events-none` scroll container cannot be
   * wheeled. /about is both: four lines of copy and a word.
   */
  passThrough?: boolean;
  className?: string;
};

// The column and the footer share the horizontal insets. Written
// mobile-first, so the base class is the narrowest step.
const INSET_X =
  'left-[var(--foreground-left-tablet)] right-[var(--foreground-right-mobile)] tablet:right-[var(--foreground-right-tablet)] desktop:left-[var(--foreground-left)] desktop:right-[var(--foreground-right)]';

/*
 * THE RAIL. One wrapper, one plane, whatever the viewport: the breakpoint
 * moves the same box rather than rendering a second one, because a second
 * one is a remount and ScreenshotPlane's shader swaps a texture on update.
 *
 * `fixed` rather than `absolute`, because the column scrolls and an
 * absolutely-positioned child of a scroll container is clipped by it. A
 * viewport-anchored box is not -- as long as nothing between it and the
 * viewport carries a transform, which is what STILL below is for.
 *
 * The `!` widths are aimed at ScreenshotPlane's own inline width/height:
 * the rail decides how wide the capture is, and the capture keeps the
 * artboard's 600x380 ratio while it does.
 */
const PLANE_RAIL =
  'z-10 wide:fixed wide:top-[var(--plane-top)] wide:right-[var(--plane-right)] wide:w-[var(--plane-width)] [&>figure]:w-full! wide:[&>figure]:h-auto! wide:[&>figure]:aspect-[600/380]';

/*
 * The drift, and why it is `transform` written out rather than
 * `translate-y-*`. Tailwind's translate utilities set the `translate`
 * PROPERTY, which `transition-transform` does not cover -- the shift would
 * jump between rows instead of gliding. Stating the transform means the
 * transition beside it is the one that runs.
 *
 * Only where there is a rail: folded into the column the plane is in flow,
 * and moving it would open a gap under the pager.
 */
const PLANE_DRIFT =
  'wide:[transform:translateY(var(--plane-shift,0px))] transition-transform duration-[320ms] ease-scene motion-reduce:transition-none';

/** Folded into the column, below the rail's breakpoint. */
const PLANE_FOLD =
  'max-wide:mt-2 max-wide:[&>figure]:h-[260px]! max-tablet:[&>figure]:h-[200px]!';

/*
 * --enter-page fills `forwards`, so once the column lands it keeps
 * `transform: translateY(0)` for good -- and any transform other than
 * `none` makes an element the containing block for its fixed descendants.
 * With the travel on, the rail's `fixed` quietly means "relative to the
 * column": the plane lands 120px left of where it was asked for and is
 * clipped at the column's right edge. Nothing is lost by dropping it,
 * because both routes that open a rail step their own blocks in with
 * scene/enter.ts instead.
 */
const STILL = 'animate-none';

export const SceneStage = ({
  word,
  children,
  footer,
  plane,
  planeFold = true,
  planeShift = 0,
  vignette = 'left',
  align = 'center',
  passThrough = false,
  className,
}: SceneStageProps) => {
  const wash = STAGE_WASHES[vignette];
  const washStyle: CSSProperties = {
    backgroundImage: wash ?? undefined,
  };
  const railed = plane !== undefined;

  return (
    <main
      className={cn(
        'relative h-full w-full overflow-hidden',
        passThrough && 'pointer-events-none',
        className,
      )}
      data-align={align}
      data-rail={railed}
      data-through={passThrough}
      data-vignette={vignette}
    >
      {wash === null ? null : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={washStyle}
        />
      )}
      <div
        className={cn(
          'clif-stage-column absolute inset-y-0 z-10 flex flex-col gap-6 overflow-x-hidden overflow-y-auto motion-reduce:animate-none',
          // The column's own 600ms travel is the one piece of motion this
          // frame owns; the steps inside it are the routes' inline
          // animations, which scene/enter.ts already reduces. A railed
          // stage does not get it -- see STILL -- and the two are written
          // as a branch rather than as an override, because both are plain
          // `animation` declarations in the same layer and which one won
          // would otherwise be a question about class order.
          railed ? STILL : 'animate-slide-in',
          // Restated on the column and not left to inherit: it is a
          // positioned box of its own, and `pointer-events` is inherited
          // rather than applied down a tree, so a child that sets `auto`
          // -- which a pass-through route's content must -- would make
          // the whole column catch presses again.
          passThrough && 'pointer-events-none',
          INSET_X,
          'pb-[var(--foreground-bottom-mobile)] tablet:pb-[var(--foreground-bottom)]',
          align === 'center'
            ? // `safe center`, not `center`. A centred scroll container
              // overflows at BOTH ends and the top end cannot be scrolled
              // back to, so a column taller than the stage loses its first
              // line for good. `safe` centres while it fits and starts at
              // the top when it does not.
              '[justify-content:safe_center]'
            : 'justify-start pt-[var(--foreground-top-mobile)] tablet:pt-[var(--foreground-top-tablet)] desktop:pt-[var(--foreground-top)]',
          railed && 'wide:max-w-[var(--reading-max)]',
        )}
      >
        {word === undefined ? null : <div>{word}</div>}
        {children}
        {railed ? (
          <div
            className={cn(
              PLANE_RAIL,
              PLANE_DRIFT,
              planeFold ? PLANE_FOLD : 'max-wide:hidden',
            )}
            data-slot="plane"
            style={
              {
                '--plane-shift': `${String(planeShift)}px`,
              } as CSSProperties
            }
          >
            {plane}
          </div>
        ) : null}
      </div>
      {footer === undefined ? null : (
        <div
          className={cn(
            'absolute bottom-[var(--foreground-bottom-mobile)] z-10 tablet:bottom-[var(--foreground-bottom)]',
            passThrough && 'pointer-events-none',
            INSET_X,
          )}
        >
          {footer}
        </div>
      )}
    </main>
  );
};

export default SceneStage;
