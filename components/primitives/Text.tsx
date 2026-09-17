import {
  createElement,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { cn } from 'utils/cn';

/*
 * The type scale (design inventory 2.8). Twelve variants, one class string
 * each, and every size is a `var(--type-*)` reference: the numbers live in
 * styles/tokens/typography.css and are written there exactly once. The scale
 * used to be duplicated in this header as a comment -- that copy is gone on
 * purpose, because a comment cannot be wrong loudly.
 *
 * What a variant is allowed to set: family, size, line height, weight,
 * tracking, colour, case. Nothing else. Layout -- margins, widths, max-width,
 * text-wrap -- belongs to the caller, which is why only the headings carry
 * `m-0` (they are h1/h2 and would otherwise inherit a UA margin).
 *
 * Responsive steps come from the tokens' own -tablet/-mobile values. The
 * design bundle's breakpoints are shifted one class against Tailwind's here:
 * the bundle's "tablet" step is <1000px, which is `max-desktop:`, and its
 * "mobile" step is <650px, which is `max-tablet:`. body/detail have no
 * tablet step in the token file, so they hold until 650px and then drop.
 *
 * Weights are set as an arbitrary font-weight property over the --weight
 * tokens rather than with font-light/font-normal, so the three named weights
 * stay a token lookup; `heading` is the one literal 700, which is the
 * display face's only cut. (Spelling one of those classes out in a comment
 * is not free: Tailwind scans comments too, and a wildcard inside one
 * compiles to a rule Lightning CSS then refuses.)
 */
export type TextVariant =
  | 'heading'
  | 'heading2'
  | 'heading3'
  | 'subheader'
  | 'subheader2'
  | 'body'
  | 'body2'
  | 'detail'
  | 'detail2'
  | 'detail3'
  | 'label'
  | 'readout';

const TAGS: Record<TextVariant, ElementType> = {
  heading: 'h1',
  heading2: 'h2',
  heading3: 'h2',
  subheader: 'p',
  subheader2: 'p',
  body: 'span',
  body2: 'span',
  detail: 'span',
  detail2: 'span',
  detail3: 'span',
  label: 'span',
  readout: 'span',
};

/*
 * Colours, in the words of the inventory's table: strong -> text-fg,
 * body -> text-fg-2, secondary -> text-fg-3, muted -> text-fg-4. `label` and
 * `readout` are muted rather than accent on purpose; a caller that wants the
 * 9-11px accent ink passes `text-accent-small` in className.
 *
 * ACCENT INK COMES IN THREE STEPS, by size, and the variant picks one:
 *   heading, subheader2   24px and up   text-accent (full strength; AA asks
 *                                       only 3:1 at that size)
 *   body2 (18), detail2 (14)            --text-accent-body
 *   9-11px, by hand                     text-accent-small
 * --text-accent-body is the full accent on six themes and the darkened step
 * on paper and chalk, whose near-white grounds put the full accent at 3.79:1
 * and 4.41:1 -- both under AA for copy. It cannot be a blanket switch to
 * -small: on rust and pink that token is a pastel lift for a dark ground,
 * and running copy in it would read washed out. It is reached for as an
 * arbitrary value because --text-* is deliberately not mapped into a
 * Tailwind namespace (the names collide); if styles/globals.css ever maps it
 * as --color-accent-body, these two become `text-accent-body`.
 */
const VARIANTS: Record<TextVariant, string> = {
  heading:
    'm-0 font-display text-[length:var(--type-heading-size)] leading-none font-bold break-words text-accent lowercase max-desktop:text-[length:var(--type-heading-size-tablet)] max-tablet:text-[length:var(--type-heading-size-mobile)]',
  heading2:
    'm-0 text-[length:var(--type-heading2-size)] leading-[1.2] [font-weight:var(--weight-bold)] text-fg max-desktop:text-[length:var(--type-heading2-size-tablet)] max-tablet:text-[length:var(--type-heading2-size-mobile)]',
  heading3:
    'm-0 text-[length:var(--type-heading2-size)] leading-[1.2] [font-weight:var(--weight-light)] text-fg max-desktop:text-[length:var(--type-heading2-size-tablet)] max-tablet:text-[length:var(--type-heading2-size-mobile)]',
  subheader:
    'text-[length:var(--type-subheader-size)] leading-[var(--type-subheader-line)] [font-weight:var(--weight-regular)] text-fg max-desktop:text-[length:var(--type-subheader-size-tablet)] max-desktop:leading-[var(--type-subheader-line-tablet)] max-tablet:text-[length:var(--type-subheader-size-mobile)] max-tablet:leading-[var(--type-subheader-line-mobile)]',
  subheader2:
    'text-[length:var(--type-subheader-size)] leading-[var(--type-subheader-line)] [font-weight:var(--weight-regular)] text-accent max-desktop:text-[length:var(--type-subheader-size-tablet)] max-desktop:leading-[var(--type-subheader-line-tablet)] max-tablet:text-[length:var(--type-subheader-size-mobile)] max-tablet:leading-[var(--type-subheader-line-mobile)]',
  body: 'text-[length:var(--type-body-size)] leading-[var(--type-body-line)] [font-weight:var(--weight-light)] text-fg-2 max-tablet:text-[length:var(--type-body-size-mobile)] max-tablet:leading-[var(--type-body-line-mobile)]',
  body2:
    'text-[length:var(--type-body-size)] leading-[var(--type-body-line)] [font-weight:var(--weight-regular)] text-[color:var(--text-accent-body)] max-tablet:text-[length:var(--type-body-size-mobile)] max-tablet:leading-[var(--type-body-line-mobile)]',
  detail:
    'text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] [font-weight:var(--weight-light)] text-fg-3 max-tablet:text-[length:var(--type-detail-size-mobile)] max-tablet:leading-[var(--type-detail-line-mobile)]',
  detail2:
    'text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] [font-weight:var(--weight-regular)] text-[color:var(--text-accent-body)] max-tablet:text-[length:var(--type-detail-size-mobile)] max-tablet:leading-[var(--type-detail-line-mobile)]',
  detail3:
    'text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] [font-weight:var(--weight-regular)] text-fg-4 max-tablet:text-[length:var(--type-detail-size-mobile)] max-tablet:leading-[var(--type-detail-line-mobile)]',
  label:
    'text-[length:var(--type-label-size)] leading-[1.4] [font-weight:var(--weight-regular)] tracking-[var(--type-label-tracking)] text-fg-4 uppercase',
  readout:
    'text-[length:var(--type-readout-size)] leading-[1.5] [font-weight:var(--weight-regular)] tracking-[var(--type-readout-tracking)] text-fg-4',
};

export type TextProps = {
  variant?: TextVariant;
  /** Overrides the variant's default tag. */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export const Text = ({
  variant = 'body',
  as,
  className,
  style,
  children,
}: TextProps) =>
  createElement(
    as ?? TAGS[variant],
    {
      // The variant comes after the base, and className after both, so a
      // caller's `font-display` or `text-accent-small` wins the merge.
      className: cn(
        'font-mono transition-hue',
        VARIANTS[variant],
        className,
      ),
      'data-variant': variant,
      style,
    },
    children,
  );

export default Text;
