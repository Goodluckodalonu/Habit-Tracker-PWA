import type { Habit } from '@/types/habit';

/**
 * Toggles a completion date on a habit.
 * - If the date is not present, adds it.
 * - If the date is already present, removes it.
 * - Never mutates the original habit.
 * - Never returns duplicate dates.
 */
export function toggleHabitCompletion(habit: Habit, date: string): Habit {
    const currentCompletions = Array.from(new Set(habit.completions));

    const updatedCompletions = currentCompletions.includes(date)
        ? currentCompletions.filter((d) => d !== date)
        : [...currentCompletions, date];

    return {
        ...habit,
        completions: updatedCompletions,
    };
}
