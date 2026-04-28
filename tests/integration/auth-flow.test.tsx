import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock next/navigation
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

import SignupForm from '@/components/auth/SignupForm';
import LoginForm from '@/components/auth/LoginForm';
import { STORAGE_KEYS } from '@/lib/constants';

describe('auth flow', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('submits the signup form and creates a session', async () => {
        render(<SignupForm />);

        fireEvent.change(screen.getByTestId('auth-signup-email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByTestId('auth-signup-password'), {
            target: { value: 'password123' },
        });

        await act(async () => {
            fireEvent.submit(screen.getByTestId('auth-signup-submit').closest('form')!);
        });

        await waitFor(() => {
            const session = JSON.parse(localStorageMock.getItem(STORAGE_KEYS.SESSION) ?? 'null');
            expect(session).not.toBeNull();
            expect(session.email).toBe('test@example.com');
        });
    });

    it('shows an error for duplicate signup email', async () => {
        // Pre-seed a user
        localStorageMock.setItem(
            STORAGE_KEYS.USERS,
            JSON.stringify([
                { id: '1', email: 'test@example.com', password: 'pw', createdAt: '' },
            ])
        );

        render(<SignupForm />);

        fireEvent.change(screen.getByTestId('auth-signup-email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByTestId('auth-signup-password'), {
            target: { value: 'password123' },
        });

        await act(async () => {
            fireEvent.submit(screen.getByTestId('auth-signup-submit').closest('form')!);
        });

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('User already exists');
        });
    });

    it('submits the login form and stores the active session', async () => {
        localStorageMock.setItem(
            STORAGE_KEYS.USERS,
            JSON.stringify([
                { id: 'u1', email: 'login@example.com', password: 'pass123', createdAt: '' },
            ])
        );

        render(<LoginForm />);

        fireEvent.change(screen.getByTestId('auth-login-email'), {
            target: { value: 'login@example.com' },
        });
        fireEvent.change(screen.getByTestId('auth-login-password'), {
            target: { value: 'pass123' },
        });

        await act(async () => {
            fireEvent.submit(screen.getByTestId('auth-login-submit').closest('form')!);
        });

        await waitFor(() => {
            const session = JSON.parse(localStorageMock.getItem(STORAGE_KEYS.SESSION) ?? 'null');
            expect(session).not.toBeNull();
            expect(session.email).toBe('login@example.com');
            expect(session.userId).toBe('u1');
        });
    });

    it('shows an error for invalid login credentials', async () => {
        localStorageMock.setItem(
            STORAGE_KEYS.USERS,
            JSON.stringify([
                { id: 'u1', email: 'user@example.com', password: 'correct', createdAt: '' },
            ])
        );

        render(<LoginForm />);

        fireEvent.change(screen.getByTestId('auth-login-email'), {
            target: { value: 'user@example.com' },
        });
        fireEvent.change(screen.getByTestId('auth-login-password'), {
            target: { value: 'wrongpassword' },
        });

        await act(async () => {
            fireEvent.submit(screen.getByTestId('auth-login-submit').closest('form')!);
        });

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
        });
    });
});
