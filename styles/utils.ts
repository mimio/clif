import { flatStanley, type StyleKey } from './theme';

export const getStyle = (key: StyleKey): string => flatStanley[key];

// Reads a prop for truthiness inside a styled template and returns one of two
// CSS fragments. Keying off `P` rather than a bare string is what makes an
// empty or misspelled key a compile error instead of a silent false branch.
// The check is only ever as narrow as the component's props, though: for a DOM
// element that means every HTML and ARIA attribute it accepts, so it catches
// invented names, not a rename that lands on a real attribute.
//
// `NoInfer` stops the key from standing in as the source of `P`. Without it a
// call that passes its own props -- rather than being interpolated, which is
// how Emotion supplies `P` -- infers `P` from the key alone and checks nothing
// against the component; it now fails until the props type is named, as in
// `getBool<Props>('key', ...)(props)`.
//
// Keys are deliberately not restricted to boolean-valued props: the ARIA
// attributes worth reading this way are string unions rather than booleans.
export const getBool =
  <P extends object>(
    key: keyof NoInfer<P>,
    ifTrue = '',
    ifFalse = '',
  ) =>
  (props: P): string =>
    props[key] ? ifTrue : ifFalse;
