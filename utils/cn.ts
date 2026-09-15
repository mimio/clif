import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Joins class names (clsx) and lets a later Tailwind utility override an
// earlier one for the same property (tailwind-merge), so a component can
// list its own classes first and a caller's `className` last. tailwind-merge
// takes its groups from Tailwind's default theme and treats any font-* name
// outside the weight list as a family, so the custom `font-display` already
// conflicts with `font-mono` without configuration.
export const cn = (...inputs: ClassValue[]): string =>
  twMerge(clsx(inputs));
