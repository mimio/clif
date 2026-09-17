import {
  createElement,
  type ElementType,
  type ReactNode,
} from 'react';
import { cn } from 'utils/cn';

/*
 * The page word: `hello.`, `projects`, `about`, `gopro`. Adder, letter-spaced
 * .06em, painted with the --grad-word gradient through background-clip:text.
 * There is no logo; this is the mark.
 *
 * Artboard sizes, which is where the four steps come from:
 *   xl  92px  1a hello desktop
 *   lg  76px  1d project detail desktop, 64px on 1e about
 *   md  52px  1b projects desktop
 *   sm  40px  1c browse-all header, 1f hello mobile
 */
export type PageWordSize = 'xl' | 'lg' | 'md' | 'sm';

export const PAGE_WORD_SIZES: Record<PageWordSize, number> = {
  xl: 92,
  lg: 76,
  md: 52,
  sm: 40,
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
}: PageWordProps) =>
  createElement(
    as ?? 'h1',
    {
      className: cn('clif-page-word', className),
      'data-size': size,
    },
    children,
  );

export default PageWord;
