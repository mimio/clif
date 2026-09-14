import { flatStanley, type StyleKey } from './theme';

export const getStyle = (key: StyleKey): string => flatStanley[key];

// Reads a boolean-ish prop inside a styled template and returns one of two
// CSS fragments. Typed against `object` so it fits any component's props.
export const getBool =
  (key: string, ifTrue = '', ifFalse = '') =>
  (props: object): string =>
    (props as Record<string, unknown>)[key] ? ifTrue : ifFalse;
