/**
 * Converts a habit name to a URL-safe, lowercase hyphenated slug.
 * - Trims leading/trailing whitespace
 * - Collapses internal spaces to a single hyphen
 * - Removes non-alphanumeric characters (except hyphens)
 */
export function getHabitSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}
