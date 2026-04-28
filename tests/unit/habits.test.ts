import { describe, it, expect } from 'vitest';
import { toggleHabitCompletion } from '@/lib/habits';
import type { Habit } from '@/types/habit';

const baseHabit: Habit = {
    id: 'h1',
    userId: 'u1',
    name: 'Drink Water',
    description: '',
    frequency: 'daily',
    createdAt: '2025-01-01T00:00:00.000Z',
    completions: ['2025-01-01', '2025-01-02'],
};

describe('toggleHabitCompletion', () => {
    it('adds a completion date when the date is not present', () => {
        const result = toggleHabitCompletion(baseHabit, '2025-01-03');
        expect(result.completions).toContain('2025-01-03');
        expect(result.completions).toHaveLength(3);
    });

    it('removes a completion date when the date already exists', () => {
        const result = toggleHabitCompletion(baseHabit, '2025-01-01');
        expect(result.completions).not.toContain('2025-01-01');
        expect(result.completions).toHaveLength(1);
    });

    it('does not mutate the original habit object', () => {
        const originalCompletions = [...baseHabit.completions];
        toggleHabitCompletion(baseHabit, '2025-01-03');
        expect(baseHabit.completions).toEqual(originalCompletions);
    });

    it('does not return duplicate completion dates', () => {
        const habitWithDupes: Habit = {
            ...baseHabit,
            completions: ['2025-01-01', '2025-01-01', '2025-01-02'],
        };
        const result = toggleHabitCompletion(habitWithDupes, '2025-01-03');
        const unique = new Set(result.completions);
        expect(unique.size).toBe(result.completions.length);
    });
});
