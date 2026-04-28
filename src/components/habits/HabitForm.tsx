'use client';

import { useState } from 'react';
import type { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

interface HabitFormProps {
    initialData?: Partial<Habit>;
    onSave: (data: { name: string; description: string; frequency: 'daily' }) => void;
    onCancel?: () => void;
}

export default function HabitForm({ initialData, onSave, onCancel }: HabitFormProps) {
    const [name, setName] = useState(initialData?.name ?? '');
    const [description, setDescription] = useState(initialData?.description ?? '');
    const [frequency] = useState<'daily'>('daily');
    const [nameError, setNameError] = useState<string | null>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const validation = validateHabitName(name);
        if (!validation.valid) {
            setNameError(validation.error);
            return;
        }
        setNameError(null);
        onSave({ name: validation.value, description: description.trim(), frequency });
    }

    return (
        <form data-testid="habit-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="habit-name" className="block text-sm font-medium text-slate-700 mb-1">
                    Habit name <span className="text-red-500">*</span>
                </label>
                <input
                    id="habit-name"
                    data-testid="habit-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameError(null); }}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-slate-900 bg-white"
                    placeholder="e.g. Drink Water"
                    maxLength={61}
                />
                {nameError && (
                    <p role="alert" className="text-red-600 text-sm mt-1">{nameError}</p>
                )}
            </div>

            <div>
                <label htmlFor="habit-description" className="block text-sm font-medium text-slate-700 mb-1">
                    Description <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <textarea
                    id="habit-description"
                    data-testid="habit-description-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-slate-900 bg-white resize-none"
                    placeholder="Why do you want to build this habit?"
                />
            </div>

            <div>
                <label htmlFor="habit-frequency" className="block text-sm font-medium text-slate-700 mb-1">
                    Frequency
                </label>
                <select
                    id="habit-frequency"
                    data-testid="habit-frequency-select"
                    value={frequency}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                >
                    <option value="daily">Daily</option>
                </select>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    data-testid="habit-save-button"
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                >
                    Save habit
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-lg border border-slate-300 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
