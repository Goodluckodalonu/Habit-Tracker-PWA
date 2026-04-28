'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = login(email, password);
        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email address
                </label>
                <input
                    id="login-email"
                    data-testid="auth-login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-slate-900 bg-white"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                </label>
                <input
                    id="login-password"
                    data-testid="auth-login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-slate-900 bg-white"
                    placeholder="Your password"
                />
            </div>

            <button
                data-testid="auth-login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
            >
                {loading ? 'Signing in…' : 'Sign in'}
            </button>
        </form>
    );
}
