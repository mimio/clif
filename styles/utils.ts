import { flatStanley, type StyleKey } from './theme';

export const getStyle = (key: StyleKey): string => flatStanley[key];

// Reads a boolean-ish prop inside a styled template and returns one of two
// CSS fragments. `P` is the props type of the styled component the fragment
// lands in, so a key that is not one of that component's props is a compile
// error instead of a silently emitted false branch.
//
// `P` is normally inferred from the interpolation's contextual type, which
// Emotion supplies only when the result is interpolated directly:
// `${getBool('isDone', ...)}`. A call site that applies it to props by hand
// has no contextual type to infer from and must name the props type itself:
// `getBool<StyleProps>('disabled', ...)(props)`.
//
// The key is deliberately not constrained to boolean-valued props: callers
// such as Navigation key off `aria-current`, which is `'page' | undefined`
// and is meant to be read for truthiness.
export const getBool =
  <P extends object>(
    key: keyof P & string,
    ifTrue = '',
    ifFalse = '',
  ) =>
  (props: P): string =>
    props[key] ? ifTrue : ifFalse;
