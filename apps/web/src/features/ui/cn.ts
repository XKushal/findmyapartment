/**
 * Minimal className combiner. Joins truthy class fragments with a space.
 * Avoids pulling in a dependency for the small amount of conditional
 * styling the UI layer needs.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
