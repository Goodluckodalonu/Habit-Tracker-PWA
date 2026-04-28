'use client';

import { useState } from 'react';
import type { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';
import { toggleHabitCompletion } from '@/lib/habits';

interface HabitCardProps {
    habit: Habit;
    today: string;
    onUpdate: (updated: Habit) => void;
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
}

export default function HabitCard({ habit, today, onUpdate, onEdit, onDelete }: HabitCardProps) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const slug = getHabitSlug(habit.name);
    const streak = calculateCurrentStreak(habit.completions, today);
    const isCompletedToday = habit.completions.includes(today);

    function handleToggle() {
        const updated = toggleHabitCompletion(habit, today);
        onUpdate(updated);
    }

    function handleDeleteClick() {
        setConfirmingDelete(true);
    }

    function handleConfirmDelete() {
        onDelete(habit.id);
        setConfirmingDelete(false);
    }

    function handleCancelDelete() {
        setConfirmingDelete(false);
    }

    return (
        <article
            data-testid={`habit-card-${slug}`}
            className={`rounded-xl p-5 border-2 transition-all duration-200 ${isCompletedToday
                    ? 'bg-green-50 border-green-300'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-lg truncate">{habit.name}</h3>
                    {habit.description && (
                        <p className="text-slate-500 text-sm mt-1 line-clamp-2">{habit.description}</p>
                    )}
                    <div
                        data-testid={`habit-streak-${slug}`}
                        className="mt-2 flex items-center gap-1.5"
                    >
                        <span className="text-sm font-medium text-slate-600">
                            {streak} day{streak !== 1 ? 's' : ''} streak
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                        data-testid={`habit-complete-${slug}`}
                        onClick={handleToggle}
                        aria-label={isCompletedToday ? `Unmark ${habit.name} as complete` : `Mark ${habit.name} as complete`}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isCompletedToday
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-white border-slate-300 hover:border-green-400 text-transparent hover:text-green-400'
                            }`}
                    >
                        ✓
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                    data-testid={`habit-edit-${slug}`}
                    onClick={() => onEdit(habit)}
                    className="flex-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                    Edit
                </button>
                {!confirmingDelete ? (
                    <button
                        data-testid={`habit-delete-${slug}`}
                        onClick={handleDeleteClick}
                        className="flex-1 text-sm text-red-500 hover:text-red-700 font-medium py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        Delete
                    </button>
                ) : (
                    <div className="flex-1 flex gap-2">
                        <button
                            data-testid="confirm-delete-button"
                            onClick={handleConfirmDelete}
                            className="flex-1 text-sm bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 rounded-lg transition-colors"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={handleCancelDelete}
                            className="flex-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}
