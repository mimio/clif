import type { ReactNode } from 'react';
import { cn } from 'utils/cn';

/*
 * The foreground frame every route sits in. The scene itself is not a child:
 * it lives behind the whole app in scene/SceneRoot and never unmounts. What
 * this owns is the wash that makes type legible over terrain, and the column
 * the type sits in.
 *
 * The wash must never reach the map's own data. On 1b the protection is fully
 * clear by x835, twenty pixels before the first map label.
 *
 * Insets are tokens (--foreground-left 112px, --foreground-right 120px,
 * --foreground-top 208px, --foreground-bottom 80px, each with tablet and
 * mobile steps), so they are not props.
 */
export type StageVignette =
  'left' | 'atmosphere' | 'night' | 'center' | 'sheet' | 'none';

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

export const SceneStage = ({
  word,
  children,
  footer,
  vignette = 'left',
  align = 'center',
  className,
}: SceneStageProps) => (
  <main
    className={cn('clif-stage', className)}
    data-align={align}
    data-vignette={vignette}
  >
    <div aria-hidden="true" className="clif-stage-wash" />
    <div className="clif-stage-column">
      {word === undefined ? null : (
        <div className="clif-stage-word">{word}</div>
      )}
      {children}
    </div>
    {footer === undefined ? null : (
      <div className="clif-stage-footer">{footer}</div>
    )}
  </main>
);

export default SceneStage;
