'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/shared/SplashScreen';
import { getSession } from '@/lib/storage';

export default function HomePage() {
    const router = useRouter();
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Show splash for at least 1200ms, then redirect
        const timer = setTimeout(() => {
            setShowSplash(false);
            const session = getSession();
            if (session) {
                router.replace('/dashboard');
            } else {
                router.replace('/login');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    if (showSplash) {
        return <SplashScreen />;
    }

    return null;
}
