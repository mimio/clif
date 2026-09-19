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
 * WEIGHTS ARE WRITTEN AS `font-` UTILITIES OVER THE --weight TOKENS, with
 * the `number:` hint that tells Tailwind this is the weight and not a
 * family. They used to be arbitrary *properties* instead, which compiled to
 * the same declaration but merged differently: tailwind-merge files an
 * arbitrary property under its own property name, so a caller's own weight
 * class landed in a different group, both survived `cn()`, and the compiled
 * sheet -- which sorts arbitrary-property rules after named ones -- handed
 * the win to the variant. A caller asking for a lighter heading got the
 * variant's weight and no warning. With the hint, weight merges the way
 * size and colour already do. (`heading` is the one literal 700, which is
 * the display face's only cut.)
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
 *   body2 (18), detail2 (14)            text-accent-body
 *   9-11px, by hand                     text-accent-small
 * subheader2 is the one variant that crosses the line mid-scale and so takes
 * two of them -- see its entry below.
 * The copy step is the full accent on six themes and the darkened one on
 * paper and chalk, whose near-white grounds put the full accent at 3.79:1
 * and 4.41:1 -- both under AA for copy. It cannot be a blanket switch to
 * the small step: on rust and pink that one is a pastel lift for a dark
 * ground, and running copy in it would read washed out. All three steps are
 * mapped as utilities in styles/globals.css, so they are reached for by
 * name rather than as arbitrary values.
 */
const VARIANTS: Record<TextVariant, string> = {
  heading:
    'm-0 font-display text-[length:var(--type-heading-size)] leading-none font-bold break-words text-accent lowercase max-desktop:text-[length:var(--type-heading-size-tablet)] max-tablet:text-[length:var(--type-heading-size-mobile)]',
  heading2:
    'm-0 text-[length:var(--type-heading2-size)] leading-[1.2] font-[number:var(--weight-bold)] text-fg max-desktop:text-[length:var(--type-heading2-size-tablet)] max-tablet:text-[length:var(--type-heading2-size-mobile)]',
  heading3:
    'm-0 text-[length:var(--type-heading2-size)] leading-[1.2] font-[number:var(--weight-light)] text-fg max-desktop:text-[length:var(--type-heading2-size-tablet)] max-tablet:text-[length:var(--type-heading2-size-mobile)]',
  subheader:
    'text-[length:var(--type-subheader-size)] leading-[var(--type-subheader-line)] font-[number:var(--weight-regular)] text-fg max-desktop:text-[length:var(--type-subheader-size-tablet)] max-desktop:leading-[var(--type-subheader-line-tablet)] max-tablet:text-[length:var(--type-subheader-size-mobile)] max-tablet:leading-[var(--type-subheader-line-mobile)]',
  /*
   * The ink steps here because the SIZE steps past a threshold, not because
   * anyone wanted two colours. WCAG lets large text -- 24px and up -- sit at
   * 3:1, and this variant is 29.3px by default and 24px at max-desktop, so
   * full-strength accent is fine on both. Its max-tablet step is 18.7px,
   * which is no longer large text and so owes the full 4.5:1, and on paper
   * and chalk full strength only reaches 3.79:1 and 4.41:1. So the last
   * breakpoint -- and only the last -- hands the colour to the copy ink.
   */
  subheader2:
    'text-[length:var(--type-subheader-size)] leading-[var(--type-subheader-line)] font-[number:var(--weight-regular)] text-accent max-desktop:text-[length:var(--type-subheader-size-tablet)] max-desktop:leading-[var(--type-subheader-line-tablet)] max-tablet:text-[length:var(--type-subheader-size-mobile)] max-tablet:leading-[var(--type-subheader-line-mobile)] max-tablet:text-accent-body',
  body: 'text-[length:var(--type-body-size)] leading-[var(--type-body-line)] font-[number:var(--weight-light)] text-fg-2 max-tablet:text-[length:var(--type-body-size-mobile)] max-tablet:leading-[var(--type-body-line-mobile)]',
  body2:
    'text-[length:var(--type-body-size)] leading-[var(--type-body-line)] font-[number:var(--weight-regular)] text-accent-body max-tablet:text-[length:var(--type-body-size-mobile)] max-tablet:leading-[var(--type-body-line-mobile)]',
  detail:
    'text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] font-[number:var(--weight-light)] text-fg-3 max-tablet:text-[length:var(--type-detail-size-mobile)] max-tablet:leading-[var(--type-detail-line-mobile)]',
  detail2:
    'text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] font-[number:var(--weight-regular)] text-accent-body max-tablet:text-[length:var(--type-detail-size-mobile)] max-tablet:leading-[var(--type-detail-line-mobile)]',
  detail3:
    'text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] font-[number:var(--weight-regular)] text-fg-4 max-tablet:text-[length:var(--type-detail-size-mobile)] max-tablet:leading-[var(--type-detail-line-mobile)]',
  label:
    'text-[length:var(--type-label-size)] leading-[1.4] font-[number:var(--weight-regular)] tracking-[var(--type-label-tracking)] text-fg-4 uppercase',
  readout:
    'text-[length:var(--type-readout-size)] leading-[1.5] font-[number:var(--weight-regular)] tracking-[var(--type-readout-tracking)] text-fg-4',
};

/*
 * THE BREAKPOINT TRAP, AND HOW IT IS CLOSED HERE.
 *
 * tailwind-merge only ever merges two classes that carry the SAME modifier
 * set, which is right: a plain utility and a `max-tablet:` one are two
 * declarations, not one, and dropping either would be wrong in general. But
 * a variant here is a scale, not a set of independent declarations -- its
 * steps exist only to restate the same property at narrower widths. So a
 * caller writing a plain size or colour got it above 1000px and watched the
 * variant snap back underneath, which is precisely the opposite of what
 * "className wins" is supposed to mean.
 *
 * `applicable` therefore drops a step whose own property the caller has
 * already claimed unprefixed. The test for "has claimed" is tailwind-merge
 * itself rather than a table of groups kept in step by hand: run the step's
 * bare utility through `cn()` ahead of the caller's classes and see whether
 * it survives. A caller who writes their own `max-tablet:` step is not
 * affected -- theirs carries a modifier, so it merges with the variant's in
 * the ordinary way.
 */
const splitModifiers = (
  name: string,
): { modified: boolean; utility: string } => {
  let depth = 0;
  let cut = -1;
  for (let at = 0; at < name.length; at += 1) {
    const char = name[at];
    if (char === '[' || char === '(') depth += 1;
    else if (char === ']' || char === ')') depth -= 1;
    // Only a colon outside brackets separates a modifier; the ones inside
    // belong to `length:`, `color:` and `number:` hints.
    else if (char === ':' && depth === 0) cut = at;
  }
  return cut < 0
    ? { modified: false, utility: name }
    : { modified: true, utility: name.slice(cut + 1) };
};

const applicable = (name: string, className: string): boolean => {
  const { modified, utility } = splitModifiers(name);
  if (!modified) return true;
  return cn(utility, className).split(' ').includes(utility);
};

const scaleFor = (
  variant: TextVariant,
  className: string | undefined,
): string =>
  className === undefined
    ? VARIANTS[variant]
    : VARIANTS[variant]
        .split(' ')
        .filter((name) => applicable(name, className))
        .join(' ');

export type TextProps = {
  variant?: TextVariant;
  /** Overrides the variant's default tag. */
  as?: ElementType;
  /**
   * Utilities layered over the variant. They win: size, line height,
   * weight, tracking, colour, family and case all merge, and a plain
   * override also switches off the variant's own narrower steps for that
   * property, so it holds at every width rather than only above 1000px.
   */
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
        scaleFor(variant, className),
        className,
      ),
      'data-variant': variant,
      style,
    },
    children,
  );

export default Text;
