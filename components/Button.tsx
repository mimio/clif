import type {
  ComponentType,
  MouseEventHandler,
  ReactNode,
  SVGProps,
} from 'react';
import NextLink from 'next/link';
import { cn } from 'utils/cn';
import { textClass } from './text';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type StyleProps = {
  disabled: boolean;
  hasChildren: boolean;
  vertical: boolean;
};

// Shared by the link, external link and button variants below. Later
// classes win in cn(), so the icon-only override follows the orientation
// classes it narrows, and the caller's className comes last.
const buttonClass = (
  { disabled, hasChildren, vertical }: StyleProps,
  className: string,
): string =>
  cn(
    'flex cursor-pointer items-center justify-center rounded-[16px] border border-accent/30 bg-transparent [&_svg]:w-4',
    textClass.detail2,
    // Physical pt/pb rather than py: py-* sets padding-block, which runs
    // horizontally once the writing mode is vertical.
    vertical
      ? 'w-8 pt-3 pb-3 [writing-mode:vertical-lr] [&_svg]:mb-3 [&_svg]:rotate-90'
      : 'h-8 px-3 [&_svg]:mr-3',
    !hasChildren && 'w-8 p-0 [&_svg]:m-0 [&_svg]:h-3',
    'hover:bg-accent hover:text-on-accent focus:bg-accent focus:text-on-accent active:bg-accent active:text-on-accent active:opacity-70!',
    disabled && 'pointer-events-none opacity-50',
    className,
  );

export type ButtonProps = {
  ariaLabel: string;
  Icon: IconComponent;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  /** Route within this site (rendered with next/link) rather than an external URL. */
  internal?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  vertical?: boolean;
};

const Button = ({
  ariaLabel,
  Icon,
  children = null,
  className = '',
  disabled = false,
  href,
  internal = false,
  onClick,
  vertical = false,
}: ButtonProps) => {
  const shared = {
    className: buttonClass(
      { disabled, hasChildren: Boolean(children), vertical },
      className,
    ),
    onClick,
    'aria-label': ariaLabel,
  };
  const meat = (
    <>
      <Icon />
      {children}
    </>
  );
  if (href && internal) {
    return (
      <NextLink
        href={href}
        aria-disabled={disabled || undefined}
        {...shared}
      >
        {meat}
      </NextLink>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={disabled || undefined}
        {...shared}
      >
        {meat}
      </a>
    );
  }
  return (
    <button type="button" disabled={disabled} {...shared}>
      {meat}
    </button>
  );
};

export default Button;
