import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge resolves conflicts by utility group and already knows the
// default theme; the custom font family is declared so `font-display`
// conflicts with `font-mono` rather than being taken for a weight.
const twMerge = extendTailwindMerge({
  extend: { theme: { font: ['display'] } },
});

// Joins class names (clsx) and lets a later Tailwind utility override an
// earlier one for the same property (tailwind-merge), so a component can
// list its own classes first and a caller's `className` last.
export const cn = (...inputs: ClassValue[]): string =>
  twMerge(clsx(inputs));
