'use client';

import type { Habit } from '@/types/habit';
import HabitCard from './HabitCard';

interface HabitListProps {
    habits: Habit[];
    today: string;
    onUpdate: (updated: Habit) => void;
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
}

export default function HabitList({ habits, today, onUpdate, onEdit, onDelete }: HabitListProps) {
    if (habits.length === 0) {
        return (
            <div data-testid="empty-state" className="text-center py-16 space-y-4">
                <div className="text-5xl">📋</div>
                <h2 className="text-xl font-semibold text-slate-600">No habits yet</h2>
                <p className="text-slate-400 text-sm">Create your first habit to start building your streak</p>
            </div>
        );
    }

    return (
        <ul className="space-y-4" role="list">
            {habits.map((habit) => (
                <li key={habit.id}>
                    <HabitCard
                        habit={habit}
                        today={today}
                        onUpdate={onUpdate}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </li>
            ))}
        </ul>
    );
}
