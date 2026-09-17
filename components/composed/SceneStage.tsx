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
 * --scrim-wide holds its strength under the full 620px column and only fades
 * past it, which is the whole reason the token exists.
 *
 * Insets are tokens (--foreground-left 112px, --foreground-right 120px,
 * --foreground-top 208px, --foreground-bottom 80px, each with tablet and
 * mobile steps), so they are not props.
 */
export type StageVignette =
  'left' | 'atmosphere' | 'night' | 'center' | 'sheet' | 'none';

/*
 * One themed token per name. `sheet` is the browse-all stack the 1c board
 * draws -- the centred ellipse with the sheet wash over it -- which is what
 * deepens the ground when the table goes full bleed.
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
  vignette?: StageVignette;
  align?: 'center' | 'top';
  className?: string;
};

// The column and the footer share the horizontal insets. Written
// mobile-first, so the base class is the narrowest step.
const INSET_X =
  'left-[var(--foreground-left-tablet)] right-[var(--foreground-right-mobile)] tablet:right-[var(--foreground-right-tablet)] desktop:left-[var(--foreground-left)] desktop:right-[var(--foreground-right)]';

export const SceneStage = ({
  word,
  children,
  footer,
  vignette = 'left',
  align = 'center',
  className,
}: SceneStageProps) => {
  const wash = STAGE_WASHES[vignette];
  const washStyle: CSSProperties = {
    backgroundImage: wash ?? undefined,
  };

  return (
    <main
      className={cn(
        'relative h-full w-full overflow-hidden',
        className,
      )}
      data-align={align}
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
          'absolute inset-y-0 z-10 flex animate-slide-in flex-col gap-6 overflow-x-hidden overflow-y-auto',
          INSET_X,
          'pb-[var(--foreground-bottom-mobile)] tablet:pb-[var(--foreground-bottom)]',
          align === 'center'
            ? 'justify-center'
            : 'justify-start pt-[var(--foreground-top-mobile)] tablet:pt-[var(--foreground-top-tablet)] desktop:pt-[var(--foreground-top)]',
        )}
      >
        {word === undefined ? null : <div>{word}</div>}
        {children}
      </div>
      {footer === undefined ? null : (
        <div
          className={cn(
            'absolute bottom-[var(--foreground-bottom-mobile)] z-10 tablet:bottom-[var(--foreground-bottom)]',
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
