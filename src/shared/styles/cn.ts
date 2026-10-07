import { twMerge } from 'tailwind-merge';

/** Merge variants while resolving conflicting utilities (for example two background colors). */
export function cn(...classes: (string | false | null | undefined)[]) {
  return twMerge(classes.filter(Boolean).join(' '));
}
