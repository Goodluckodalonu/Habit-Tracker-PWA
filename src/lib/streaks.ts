/**
 * Calculates the current consecutive daily completion streak.
 * - Deduplicates completions
 * - Sorts by date
 * - Returns 0 if today is not completed
 * - Counts consecutive calendar days backwards from today
 */
export function calculateCurrentStreak(
    completions: string[],
    today?: string
): number {
    const todayDate = today ?? new Date().toISOString().split('T')[0];

    // Deduplicate
    const unique = Array.from(new Set(completions));

    if (unique.length === 0) return 0;

    // Sort descending
    unique.sort((a, b) => (a > b ? -1 : 1));

    // If today is not in the list, streak is 0
    if (!unique.includes(todayDate)) return 0;

    let streak = 0;
    let cursor = new Date(todayDate);

    for (let i = 0; i < unique.length; i++) {
        const expected = cursor.toISOString().split('T')[0];
        if (unique[i] === expected) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        } else if (unique[i] < expected) {
            // There's a gap — streak is broken
            break;
        }
        // unique[i] > expected means duplicate or future; skip (shouldn't happen after dedup+sort)
    }

    return streak;
}
