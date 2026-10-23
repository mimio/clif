import { useId } from 'react';
import Link from 'next/link';
import Glyph from 'components/primitives/Glyph';
import { cn } from 'utils/cn';
import flat from './flat';
import keycap from './keycap';
import { BUTTON_SIZES, isPadded } from './sizes';
import type {
  ButtonProps,
  ButtonSlotStyle,
  ButtonStyle,
  ButtonVariant,
} from './types';

/*
 * One button for the whole site, with the treatment as a first-class prop
 * rather than two components that drift apart.
 *
 * `keycap` is the production button: every CTA on artboards 1a-1h is one.
 * `flat` is the quiet pill for the places a cap would be too loud. Both are
 * this same element tree -- wrapper, plate, slots -- dressed by a style
 * module in keycap.ts / flat.ts behind the ButtonStyle interface. A third
 * treatment is a new file plus a member on ButtonVariant.
 *
 * Sizes are the design system's, verbatim, in sizes.ts. The wrapper is the
 * interactive element (button, a, or next/link) and carries the state
 * utilities; the plate inside it is what actually moves, so a lift or a
 * press never changes the hit target.
 *
 * TWO className PROPS, because there are two elements and they are not
 * interchangeable. `className` dresses the wrapper -- layout, and on the
 * flat pill the whole box, since the pill paints the wrapper.
 * `plateClassName` dresses the plate, which is what the keycap paints; on
 * a keycap, `className` alone can never reach the cap's padding or radius,
 * and before this prop existed a caller writing `rounded-none` on one got
 * a class that landed on an element with no border-radius at all. Both
 * merge through `cn()`, so what a caller writes wins.
 */

export * from './types';
export { BUTTON_SIZES, BUTTON_SIZE_ORDER } from './sizes';

const BUTTON_STYLES: Record<ButtonVariant, ButtonStyle> = {
  keycap,
  flat,
};

/*
 * Element reset. A <button> does not inherit the page's font, and both it and
 * an <a> arrive with a UA box; the plate inside supplies every visible edge.
 * user-select is off on the wrapper because a CTA is a target, not a passage
 * of text -- dragging across one should never select its label.
 */
const RESET =
  'm-0 appearance-none border-0 bg-transparent p-0 text-left font-mono no-underline';

const isExternal = (href: string): boolean =>
  href.startsWith('http') || href.startsWith('mailto:');

/**
 * The four-corner registration mark. Drawn for the caps that opened
 * browse-all, which the projects index no longer has; the specimen board is
 * its only consumer now, and it stays because the mark is part of the
 * keycap's spec rather than part of that one page. The
 * backing stroke is a soft rim under a two-stop gradient outline plus the
 * four diagonals; both colours come from the variant through --k-mark*.
 */
const ExpandMark = ({
  size,
  markId,
  slot,
}: {
  size: number;
  markId: string;
  slot: ButtonSlotStyle;
}) => (
  <svg
    className={slot.className}
    data-slot="expand"
    height={size}
    style={slot.style}
    viewBox="0 0 13 13"
    width={size}
  >
    <defs>
      <linearGradient id={markId} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="var(--k-mark)" />
        <stop offset=".46" stopColor="var(--k-mark)" />
        <stop offset="1" stopColor="var(--k-mark-2)" />
      </linearGradient>
    </defs>
    <g
      fill="none"
      opacity=".55"
      stroke="var(--k-mark-rim)"
      strokeLinecap="square"
      strokeWidth="2.6"
      transform="translate(.5 .7)"
    >
      <path d="M1.5 4.2V1.5h2.7M8.8 1.5h2.7v2.7M11.5 8.8v2.7H8.8M4.2 11.5H1.5V8.8" />
    </g>
    <g
      fill="none"
      stroke={`url(#${markId})`}
      strokeLinecap="square"
      strokeWidth="1.2"
    >
      <path d="M1.5 4.2V1.5h2.7M8.8 1.5h2.7v2.7M11.5 8.8v2.7H8.8M4.2 11.5H1.5V8.8" />
      <path
        d="M1.8 1.8 4.6 4.6M11.2 1.8 8.4 4.6M11.2 11.2 8.4 8.4M1.8 11.2 4.6 8.4"
        opacity=".5"
      />
    </g>
  </svg>
);

export const Button = ({
  children,
  variant = 'keycap',
  size = 'md',
  tone = 'primary',
  glyph,
  lead,
  trail,
  expand = false,
  grow = false,
  center = false,
  disabled = false,
  href,
  onClick,
  ariaLabel,
  className,
  plateClassName,
}: ButtonProps) => {
  // useId's colons are legal in an id but not in a url(#...) reference.
  const markId = `clif-expand-${useId().replace(/:/g, '')}`;
  const spec = BUTTON_SIZES[size];
  const parts = BUTTON_STYLES[variant]({
    size,
    spec,
    tone,
    grow,
    center,
    padded: isPadded({
      glyph: glyph !== undefined,
      expand,
      lead: lead !== undefined,
    }),
  });

  const body = (
    <span
      className={cn(
        'clif-button-inner',
        parts.inner.className,
        plateClassName,
      )}
      style={parts.inner.style}
    >
      {lead === undefined ? null : (
        <span
          className={parts.mark.className}
          data-slot="lead"
          style={parts.mark.style}
        >
          {lead}
        </span>
      )}
      {glyph === undefined ? null : (
        <span
          className={parts.glyph.className}
          data-slot="glyph"
          style={parts.glyph.style}
        >
          <Glyph kind={glyph} scale={parts.glyph.scale} />
        </span>
      )}
      <span
        className={parts.label.className}
        data-slot="label"
        style={parts.label.style}
      >
        {children}
      </span>
      {expand ? (
        <ExpandMark
          markId={markId}
          size={spec.expand}
          slot={parts.expand}
        />
      ) : null}
      {trail === undefined ? null : (
        <span
          className={parts.mark.className}
          data-slot="trail"
          style={parts.mark.style}
        >
          {trail}
        </span>
      )}
    </span>
  );

  const shared = {
    'aria-label': ariaLabel,
    className: cn(
      'clif-button',
      RESET,
      parts.wrapper.className,
      className,
    ),
    style: parts.wrapper.style,
    'data-variant': variant,
    'data-size': size,
    'data-tone': tone,
    'data-grow': grow,
    'data-center': center,
    'data-disabled': disabled,
  };

  if (href === undefined) {
    return (
      <button
        disabled={disabled}
        onClick={onClick}
        type="button"
        {...shared}
      >
        {body}
      </button>
    );
  }

  if (isExternal(href)) {
    return (
      <a
        href={href}
        onClick={onClick}
        rel="noopener noreferrer"
        target="_blank"
        {...shared}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} {...shared}>
      {body}
    </Link>
  );
};

export default Button;
