import type { Metadata } from 'next';
import './globals.css';
import ServiceWorkerRegistration from '@/components/shared/ServiceWorkerRegistration';

export const metadata: Metadata = {
    title: 'Habit Tracker',
    description: 'Track your daily habits and build streaks',
    manifest: '/manifest.json',
    themeColor: '#6366f1',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ServiceWorkerRegistration />
                {children}
            </body>
        </html>
    );
}
