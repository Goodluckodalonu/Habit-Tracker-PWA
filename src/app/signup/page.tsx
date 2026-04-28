import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';

export const metadata = {
    title: 'Sign Up | Habit Tracker',
};

export default function SignupPage() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
                    <p className="text-slate-500 mt-1 text-sm">Start building better habits today</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <SignupForm />
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
