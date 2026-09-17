import { cn } from 'utils/cn';

/*
 * A flat mark from public/icons, sized in px and tinted with currentColor.
 * The design system inlines the SVG so `fill: currentColor` resolves; this
 * stub carries the same box and data attribute so the CSS hook
 * (`[data-icon-inline] > svg`) already matches.
 *
 * Product sizes: 8 caret, 12 user/envelope, 16 button, 20 home,
 * 40 project glyph.
 */
export type IconProps = {
  /** Path under public/, e.g. '/icons/mountain.svg'. */
  src: string;
  size?: number;
  color?: string;
  /** Leave unset for decoration; set it and the icon gets a label. */
  title?: string;
  className?: string;
};

export const Icon = ({
  src,
  size = 16,
  color = 'currentColor',
  title,
  className,
}: IconProps) => (
  <span
    aria-hidden={title === undefined}
    aria-label={title}
    className={cn('clif-icon', className)}
    data-icon-inline
    data-src={src}
    role={title === undefined ? undefined : 'img'}
    style={{ width: size, height: size, color }}
  />
);

export default Icon;
