import { flatStanley, type StyleKey } from './theme';

export const getStyle = (key: StyleKey): string => flatStanley[key];

// Returns one of two CSS fragments depending on a prop's truthiness. `keyof P`
// makes an empty or misspelled key a compile error rather than a silent false
// branch. Interpolated, `P` is the component's whole prop surface, so any real
// attribute name passes -- `theme` compiles to a permanently true branch -- and
// what this catches is invented names, not a rename onto a real one. Named
// explicitly, the check is exactly the type named. Do not constrain the key to
// boolean-valued props: `aria-current` is declared wider than `boolean` and
// would be rejected.
//
// `NoInfer` is load-bearing. Without it the key alone infers `P` as
// `{ key: any }`, which reports against the props argument instead of the key,
// and is why a call supplying its own props must name `P`, as Button's do;
// interpolated calls get `P` contextually and need no type argument.
export const getBool =
  <P extends object>(
    key: keyof NoInfer<P>,
    ifTrue = '',
    ifFalse = '',
  ) =>
  (props: P): string =>
    props[key] ? ifTrue : ifFalse;
