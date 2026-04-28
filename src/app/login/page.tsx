import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
    title: 'Login | Habit Tracker',
};

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
                    <p className="text-slate-500 mt-1 text-sm">Sign in to continue your streak</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <LoginForm />
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                    No account yet?{' '}
                    <Link href="/signup" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    );
}
