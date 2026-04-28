'use client';

export default function SplashScreen() {
    return (
        <div
            data-testid="splash-screen"
            className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 z-50"
        >
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white tracking-tight">
                    Habit Tracker
                </h1>
                <p className="text-indigo-200 text-lg">Build lasting habits, one day at a time</p>
                <div className="mt-8 flex justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        </div>
    );
}
