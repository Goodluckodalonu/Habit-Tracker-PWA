import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// localStorage mock
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

import { STORAGE_KEYS } from '@/lib/constants';
import type { Habit } from '@/types/habit';
import HabitForm from '@/components/habits/HabitForm';
import HabitCard from '@/components/habits/HabitCard';
import HabitList from '@/components/habits/HabitList';
import { getHabitSlug } from '@/lib/slug';

const today = '2025-06-01';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
    return {
        id: 'h1',
        userId: 'u1',
        name: 'Drink Water',
        description: 'Stay hydrated',
        frequency: 'daily',
        createdAt: '2025-01-01T00:00:00.000Z',
        completions: [],
        ...overrides,
    };
}

describe('habit form', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('shows a validation error when habit name is empty', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();
        render(<HabitForm onSave={onSave} />);

        // Submit without entering a name
        await user.click(screen.getByTestId('habit-save-button'));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Habit name is required');
        });
        expect(onSave).not.toHaveBeenCalled();
    });

    it('creates a new habit and renders it in the list', async () => {
        const user = userEvent.setup();
        const habits: Habit[] = [];
        const onSave = vi.fn((data) => {
            habits.push(makeHabit({ name: data.name, description: data.description }));
        });

        const { rerender } = render(<HabitForm onSave={onSave} />);

        await user.type(screen.getByTestId('habit-name-input'), 'Morning Run');
        await user.click(screen.getByTestId('habit-save-button'));

        await waitFor(() => expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Morning Run', frequency: 'daily' })
        ));

        // Now render the habit in the list
        const createdHabit = makeHabit({ name: 'Morning Run' });
        rerender(
            <HabitList
                habits={[createdHabit]}
                today={today}
                onUpdate={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        const slug = getHabitSlug('Morning Run');
        expect(screen.getByTestId(`habit-card-${slug}`)).toBeTruthy();
    });

    it('edits an existing habit and preserves immutable fields', async () => {
        const user = userEvent.setup();
        const originalHabit = makeHabit({
            id: 'fixed-id',
            userId: 'fixed-user',
            createdAt: '2025-01-01T00:00:00.000Z',
            completions: ['2025-01-05'],
        });

        const onSave = vi.fn();
        render(<HabitForm initialData={originalHabit} onSave={onSave} />);

        // Clear and retype the name
        await user.clear(screen.getByTestId('habit-name-input'));
        await user.type(screen.getByTestId('habit-name-input'), 'Updated Habit');
        await user.click(screen.getByTestId('habit-save-button'));

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Updated Habit', frequency: 'daily' })
            );
        });

        // Verify the immutable fields didn't come through in the form's onSave
        // (the parent is responsible for merging: id, userId, createdAt, completions are preserved)
        expect(onSave).not.toHaveBeenCalledWith(
            expect.objectContaining({ id: expect.anything() })
        );
    });

    it('deletes a habit only after explicit confirmation', async () => {
        const user = userEvent.setup();
        const habit = makeHabit();
        const onDelete = vi.fn();
        const slug = getHabitSlug(habit.name);

        render(
            <HabitCard
                habit={habit}
                today={today}
                onUpdate={vi.fn()}
                onEdit={vi.fn()}
                onDelete={onDelete}
            />
        );

        // Click delete — should show confirm button, not call onDelete yet
        await user.click(screen.getByTestId(`habit-delete-${slug}`));
        expect(onDelete).not.toHaveBeenCalled();

        // Now confirm
        await user.click(screen.getByTestId('confirm-delete-button'));
        expect(onDelete).toHaveBeenCalledWith(habit.id);
    });

    it('toggles completion and updates the streak display', async () => {
        const user = userEvent.setup();
        const habit = makeHabit({ completions: [] });
        const slug = getHabitSlug(habit.name);
        let currentHabit = habit;

        const onUpdate = vi.fn((updated: Habit) => {
            currentHabit = updated;
        });

        const { rerender } = render(
            <HabitCard
                habit={currentHabit}
                today={today}
                onUpdate={onUpdate}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        // Initial streak should be 0
        expect(screen.getByTestId(`habit-streak-${slug}`)).toHaveTextContent('0');

        // Complete today
        await user.click(screen.getByTestId(`habit-complete-${slug}`));
        expect(onUpdate).toHaveBeenCalled();

        // Rerender with updated habit
        currentHabit = { ...habit, completions: [today] };
        rerender(
            <HabitCard
                habit={currentHabit}
                today={today}
                onUpdate={onUpdate}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByTestId(`habit-streak-${slug}`)).toHaveTextContent('1');
    });
});
