'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getHabits, saveHabits } from '@/lib/storage';
import { logout } from '@/lib/auth';
import type { Session } from '@/types/auth';
import type { Habit } from '@/types/habit';
import HabitList from '@/components/habits/HabitList';
import HabitForm from '@/components/habits/HabitForm';

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

export default function DashboardPage() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [today] = useState(getTodayDate());

    // Route protection
    useEffect(() => {
        const s = getSession();
        if (!s) {
            router.replace('/login');
            return;
        }
        setSession(s);
        // Load only this user's habits
        const allHabits = getHabits();
        setHabits(allHabits.filter((h) => h.userId === s.userId));
    }, [router]);

    const persistAndSetHabits = useCallback(
        (userHabits: Habit[]) => {
            if (!session) return;
            const allHabits = getHabits();
            // Replace all this user's habits in the global list
            const otherUsersHabits = allHabits.filter((h) => h.userId !== session.userId);
            saveHabits([...otherUsersHabits, ...userHabits]);
            setHabits(userHabits);
        },
        [session]
    );

    function handleCreateHabit(data: { name: string; description: string; frequency: 'daily' }) {
        if (!session) return;
        const newHabit: Habit = {
            id: generateId(),
            userId: session.userId,
            name: data.name,
            description: data.description,
            frequency: data.frequency,
            createdAt: new Date().toISOString(),
            completions: [],
        };
        const updated = [...habits, newHabit];
        persistAndSetHabits(updated);
        setShowForm(false);
    }

    function handleEditHabit(data: { name: string; description: string; frequency: 'daily' }) {
        if (!editingHabit) return;
        const updated = habits.map((h) =>
            h.id === editingHabit.id
                ? {
                    ...editingHabit,
                    name: data.name,
                    description: data.description,
                    frequency: data.frequency,
                }
                : h
        );
        persistAndSetHabits(updated);
        setEditingHabit(null);
    }

    function handleUpdateHabit(updated: Habit) {
        const updatedList = habits.map((h) => (h.id === updated.id ? updated : h));
        persistAndSetHabits(updatedList);
    }

    function handleDeleteHabit(id: string) {
        const updated = habits.filter((h) => h.id !== id); 
        persistAndSetHabits(updated);
    }

    function handleLogout() {
        logout();
        router.replace('/login'); 
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50" data-testid="dashboard-page" >
            {/* Header */} 
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="font-bold text-slate-800 text-lg">Habit Tracker</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 hidden sm:block">{session.email}</span>
                        <button
                            data-testid="auth-logout-button"
                            onClick={handleLogout}
                            className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Create habit button / form */ }
                {!showForm && (
                    <button
                        data-testid="create-habit-button"
                        onClick={() => setShowForm(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <span className="text-xl">+</span>
                        New habit
                    </button>
                )}

                {/* Create form  */}
                {showForm && (
                    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Create a new habit</h2>
                        <HabitForm
                            onSave={handleCreateHabit}
                            onCancel={() => setShowForm(false)}
                        />
                    </section>
                )}

                {/* Edit modal */}
                {editingHabit && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Edit habit"
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                            onClick={() => setEditingHabit(null)}
                        />
                        {/* Panel */}
                        <section className="relative w-full max-w-md bg-white rounded-2xl border border-indigo-200 p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Edit habit</h2>
                            <HabitForm
                                initialData={editingHabit}
                                onSave={handleEditHabit}
                                onCancel={() => setEditingHabit(null)}
                            />
                        </section>
                    </div>
                )}

                {/* Habits */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-700">
                            Your habits{' '}
                            <span className="text-slate-400 font-normal text-sm">({habits.length})</span>
                        </h2>
                        <span className="text-sm text-slate-400">
                            {new Date(today).toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                            })}
                        </span>
                    </div>
                    <HabitList
                        habits={habits}
                        today={today}
                        onUpdate={handleUpdateHabit}
                        onEdit={(habit) => { setShowForm(false); setEditingHabit(habit); }}
                        onDelete={handleDeleteHabit}
                    />
                </section>
            </main>
        </div>
    );
}
