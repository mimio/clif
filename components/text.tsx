import { createElement, type ComponentProps, type JSX } from 'react';
import { cn } from 'utils/cn';

// The type scale. Exported as class strings for elements that are not text
// components (a button that reads as a detail line), and as components
// below. Sizes and line heights are separate utilities so a caller's
// `leading-*` override merges cleanly.
const base = 'font-light transition-hue';
const mono = cn(base, 'font-mono text-fg');
const detail = cn(
  mono,
  'text-[14px] leading-[18px] font-extralight text-fg-3 max-tablet:text-[12px] max-tablet:leading-[16px]',
);
const heading2 = cn(
  mono,
  'text-[36px] leading-[1.15] max-desktop:text-[32px] max-tablet:text-[22px]',
);
const body = cn(
  mono,
  'link-underline text-[18px] leading-[28px] font-extralight text-fg-2 max-tablet:text-[14px] max-tablet:leading-[22px] [&>p:not(:last-child)]:mb-4',
);

export const textClass = {
  heading: cn(
    base,
    "font-display [font-feature-settings:'aalt'] text-[52pt] leading-[1.15] wrap-break-word text-accent max-desktop:text-[40pt] max-tablet:text-[28pt]",
  ),
  heading2,
  heading3: cn(heading2, 'font-extralight'),
  detail,
  detail2: cn(detail, 'font-light text-accent'),
  detail3: cn(detail, 'font-light text-fg-4'),
  body,
  body2: cn(body, 'font-light text-accent'),
};

// Each text style renders its semantic element with the treatment above.
// `className` merges in for local overrides; `ref` passes through as a prop.
const text = <Tag extends keyof JSX.IntrinsicElements>(
  tag: Tag,
  className: string,
) => {
  const Text = ({
    className: extra,
    ...props
  }: ComponentProps<Tag>) =>
    createElement(tag, { ...props, className: cn(className, extra) });
  Text.displayName = `Text(${tag})`;
  return Text;
};

export const Heading = text('h1', textClass.heading);
export const Heading2 = text('h2', textClass.heading2);
export const Heading3 = text('h3', textClass.heading3);
export const Detail = text('span', textClass.detail);
export const Detail2 = text('span', textClass.detail2);
export const Detail3 = text('span', textClass.detail3);
export const Body = text('span', textClass.body);
export const Body2 = text('span', textClass.body2);
