import {
  createElement,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { cn } from 'utils/cn';

/*
 * The page word: `hello.`, `projects`, `about`, `gopro`. Adder, lowercase,
 * letter-spaced .06em, painted with the themed --grad-word gradient through
 * background-clip:text. There is no logo; this is the mark.
 *
 * Artboard sizes, which is where the four steps come from:
 *   xl  92px  1a hello desktop
 *   lg  76px  1d project detail desktop, 64px on 1e about
 *   md  52px  1b projects desktop
 *   sm  40px  1c browse-all header, 1f hello mobile
 *
 * and the two steps down, read off the mobile artboards: 1f drops hello from
 * 92 to 40, 1g drops projects from 52 to 26, 1h drops about from 64 to 28.
 *
 * THE BOX IS SHRINK-TO-FIT, and that is the whole trick. A clipped gradient
 * samples the element's background box, so a full-width h1 would map the
 * 104deg ramp across the column and hand the word a flat slice of its first
 * stop. `w-fit` makes the box the word, so every page word gets the whole
 * ramp -- yellow into the second colour -- whatever it is sitting in.
 *
 * The sizes are px rather than tokens because the type scale has no step for
 * them: --type-heading-size (52pt) is Text's `heading`, a different thing.
 * This table is their only home in the codebase, so it is exported, and the
 * three steps reach the class list as custom properties rather than as four
 * hard-coded class strings -- one table, one place to change a number.
 */
export type PageWordSize = 'xl' | 'lg' | 'md' | 'sm';

export const PAGE_WORD_SIZES: Record<PageWordSize, number> = {
  xl: 92,
  lg: 76,
  md: 52,
  sm: 40,
};

type PageWordStep = {
  /** <1000px, the bundle's "tablet". */
  tablet: number;
  /** <650px, the bundle's "mobile". */
  mobile: number;
  /**
   * 1 for the words that sit on their baseline (`hello.`, `gopro`, `about`);
   * 1.14 plus a couple of pixels of pad for the two that hang a descender
   * (`projects`), exactly as artboards 1b and 1c set them.
   */
  line: number;
  pad: number;
};

export const PAGE_WORD_STEPS: Record<PageWordSize, PageWordStep> = {
  xl: { tablet: 76, mobile: 40, line: 1, pad: 0 },
  lg: { tablet: 64, mobile: 28, line: 1, pad: 0 },
  md: { tablet: 40, mobile: 26, line: 1.14, pad: 4 },
  sm: { tablet: 32, mobile: 24, line: 1.14, pad: 2 },
};

export type PageWordProps = {
  children: ReactNode;
  size?: PageWordSize;
  as?: ElementType;
  className?: string;
};

export const PageWord = ({
  children,
  size = 'xl',
  as,
  className,
}: PageWordProps) => {
  const step = PAGE_WORD_STEPS[size];
  const style = {
    '--page-word-size': `${PAGE_WORD_SIZES[size]}px`,
    '--page-word-size-tablet': `${step.tablet}px`,
    '--page-word-size-mobile': `${step.mobile}px`,
    '--page-word-line': step.line,
    '--page-word-pad': `${step.pad}px`,
  } as CSSProperties;

  return createElement(
    as ?? 'h1',
    {
      className: cn(
        'm-0 w-fit [background-image:var(--grad-word)] bg-clip-text font-display tracking-[.06em] text-transparent lowercase',
        'pb-[var(--page-word-pad)] text-[length:var(--page-word-size)] leading-[var(--page-word-line)]',
        'max-desktop:text-[length:var(--page-word-size-tablet)] max-tablet:text-[length:var(--page-word-size-mobile)]',
        className,
      ),
      'data-size': size,
      style,
    },
    children,
  );
};

export default PageWord;
