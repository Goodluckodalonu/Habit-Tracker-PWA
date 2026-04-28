import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'node',
        include: ['tests/unit/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: [
                'src/lib/slug.ts',
                'src/lib/validators.ts',
                'src/lib/streaks.ts',
                'src/lib/habits.ts',
            ],
            thresholds: {
                lines: 80,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
