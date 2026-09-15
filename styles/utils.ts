import { flatStanley, type StyleKey } from './theme';

export const getStyle = (key: StyleKey): string => flatStanley[key];

// Returns one of two CSS fragments depending on a prop's truthiness. Keying
// off `P` makes an empty or misspelled key a compile error. Interpolated, `P`
// is the component's whole prop surface, so a name already on it passes --
// `theme` compiles to a permanently true branch. Named explicitly, the check
// is exactly the type named. Do not constrain the key to boolean-valued
// props: `aria-current` is declared wider than `boolean` and would be
// rejected.
//
// `NoInfer` is load-bearing: without it the key alone infers `P` as
// `{ key: any }`, reporting against the props argument instead of the key.
// With it, a call supplying its own props must name `P`, as Button's do;
// interpolated calls get `P` contextually and need no type argument.
export const getBool =
  <P extends object>(
    key: keyof NoInfer<P>,
    ifTrue = '',
    ifFalse = '',
  ) =>
  (props: P): string =>
    props[key] ? ifTrue : ifFalse;
