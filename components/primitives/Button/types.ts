import type { CSSProperties, ReactNode } from 'react';
import type { GlyphKind } from 'components/primitives/Glyph';

/*
 * The button's shared vocabulary. Both treatments -- the keycap and the flat
 * pill -- are the same component with the same prop surface; the `variant`
 * axis picks which style module dresses it. Adding a third treatment is a new
 * file implementing ButtonStyle plus a member on ButtonVariant, nothing else.
 */
export type ButtonVariant = 'keycap' | 'flat';
export type ButtonSize = 'md' | 'sm' | 'xs';
export type ButtonTone = 'primary' | 'secondary';

/**
 * One row of the design system's SIZES table (inventory §2.1), verbatim.
 * `pad` is used whenever there is a glyph, an expand mark or a lead -- note
 * that a trail alone does NOT trigger the asymmetric padding. `reserve` is
 * padding on the wrapper that absorbs the hover lift so layout never shifts,
 * and `glyph` is the rest scale of the 34px glyph box.
 */
export type ButtonSizeSpec = {
  pad: string;
  padPlain: string;
  radius: number;
  gap: number;
  fontSize: number;
  lineHeight: number;
  tracking: string;
  textTransform: 'none' | 'uppercase';
  reserve: number;
  skirt: number;
  edge: number;
  amb: number;
  ambBlur: number;
  glyph: number;
  glyphMargin: number;
  expand: number;
};

export type ButtonProps = {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  /** Renders the 3D glyph in the cap's left slot. */
  glyph?: GlyphKind;
  /** A mark before the label, e.g. the pager's arrows. */
  lead?: ReactNode;
  /** A mark after the label. Does not widen the left padding. */
  trail?: ReactNode;
  /** The four-corner registration mark, for "browse all" and "all 14". */
  expand?: boolean;
  /** Takes the full width of its row. */
  grow?: boolean;
  /** Centres the label even when the cap is not growing. */
  center?: boolean;
  disabled?: boolean;
  /** An internal path routes through next/link; an absolute URL does not. */
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
};

/**
 * A style object that may also carry custom properties. The physics of both
 * treatments is a handful of inherited --k-* / --g-* variables that the state
 * utilities flip, so every slot has to be able to declare them.
 */
export type ButtonVars = CSSProperties &
  Record<`--${string}`, string>;

/** One slot's dressing: utilities for the states, values for the numbers. */
export type ButtonSlotStyle = {
  className: string;
  style: ButtonVars;
};

/** Everything a style module is told about the button it is dressing. */
export type ButtonStyleInput = {
  size: ButtonSize;
  spec: ButtonSizeSpec;
  tone: ButtonTone;
  grow: boolean;
  center: boolean;
  /** A glyph, an expand mark or a lead is present. A trail alone is not. */
  padded: boolean;
};

/** Everything it answers with, one bundle per slot. */
export type ButtonStyleParts = {
  /** The interactive element: button, a, or next/link. */
  wrapper: ButtonSlotStyle;
  /** The plate itself -- the thing that lifts, travels and holds the ink. */
  inner: ButtonSlotStyle;
  glyph: ButtonSlotStyle;
  expand: ButtonSlotStyle;
  /** The lead and trail marks, which share one dressing. */
  mark: ButtonSlotStyle;
  label: ButtonSlotStyle;
};

export type ButtonStyle = (
  input: ButtonStyleInput,
) => ButtonStyleParts;
