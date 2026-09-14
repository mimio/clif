import { flatStanley, type StyleKey } from './theme';

export const getStyle = (key: StyleKey): string => flatStanley[key];

// Reads a prop for truthiness inside a styled template and returns one of two
// CSS fragments. Keying off `P` is what makes an empty or misspelled key a
// compile error rather than a silent false branch -- though a loose one: `P`
// is the whole prop surface (HTML and ARIA attributes, Emotion's `theme` and
// `as`, a wrapped component's own props), so it catches invented names, not a
// rename onto one of those. Nor are keys restricted to boolean-valued props;
// the ones worth reading this way, `aria-current` among them, are unions
// wider than `boolean`.
//
// `NoInfer` keeps the key from doubling as the source of `P`. Without it a
// call supplying its own props inferred `P` from the key as `{ key: any }`,
// which still checked the key but reported against the props argument, and
// rejected a correct key whose prop was optional -- so whether a site needed
// an explicit type argument turned on optionality, which is invisible at the
// call site. Every such site needs one now.
export const getBool =
  <P extends object>(
    key: keyof NoInfer<P>,
    ifTrue = '',
    ifFalse = '',
  ) =>
  (props: P): string =>
    props[key] ? ifTrue : ifFalse;
