'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/storage';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();

    useEffect(() => {
        const session = getSession();
        if (!session) {
            router.replace('/login');
        }
    }, [router]);

    const session = typeof window !== 'undefined' ? getSession() : null;
    if (!session) return null;

    return <>{children}</>;
}
