import { getUsers, saveUsers, saveSession, clearSession } from '@/lib/storage';
import type { User, Session } from '@/types/auth';

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type AuthResult =
    | { success: true; session: Session }
    | { success: false; error: string };

export function signup(email: string, password: string): AuthResult {
    const users = getUsers();
    const existing = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
        return { success: false, error: 'User already exists' };
    }

    const newUser: User = {
        id: generateId(),
        email,
        password,
        createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);

    const session: Session = { userId: newUser.id, email: newUser.email };
    saveSession(session);

    return { success: true, session };
}

export function login(email: string, password: string): AuthResult {
    const users = getUsers();
    const user = users.find(
        (u) =>
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
        return { success: false, error: 'Invalid email or password' };
    }

    const session: Session = { userId: user.id, email: user.email };
    saveSession(session);

    return { success: true, session };
}

export function logout(): void {
    clearSession();
}
