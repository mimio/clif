import {
  createElement,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { cn } from 'utils/cn';

/*
 * The type scale. Sizes, weights and colours are design tokens and belong to
 * the stylesheet, not to this file: the component's whole job is to pick the
 * right tag and stamp the variant onto the element so CSS can reach it.
 *
 * Scale (design inventory §2.8), for whoever writes the CSS:
 *   heading    52pt/1   w700 display, lowercase   accent
 *   heading2   36px/1.2 w400                      strong
 *   heading3   36px/1.2 w200                      strong
 *   subheader  22pt/24pt w300                     strong
 *   subheader2 22pt/24pt w300                     accent
 *   body       18px/28px w200                     body
 *   body2      18px/28px w300                     accent
 *   detail     14px/18px w200                     secondary
 *   detail2    14px/18px w300                     accent
 *   detail3    14px/18px w300                     muted
 *   label      12px/1.4 w300 .2em uppercase       muted
 *   readout    11px/1.5 w300 .18em                muted
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
      className: cn('clif-text', className),
      'data-variant': variant,
      style,
    },
    children,
  );

export default Text;
