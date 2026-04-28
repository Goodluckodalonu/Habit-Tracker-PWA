import { STORAGE_KEYS } from '@/lib/constants';
import type { User, Session } from '@/types/auth';
import type { Habit } from '@/types/habit';

// ----- Users -----
export function getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) ?? '[]');
    } catch {
        return [];
    }
}

export function saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// ----- Session -----
export function getSession(): Session | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveSession(session: Session | null): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function clearSession(): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(null));
}

// ----- Habits -----
export function getHabits(): Habit[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) ?? '[]');
    } catch {
        return [];
    }
}

export function saveHabits(habits: Habit[]): void {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
}
