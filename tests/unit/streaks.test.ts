import { describe, it, expect } from 'vitest';
import { calculateCurrentStreak } from '@/lib/streaks';

describe('calculateCurrentStreak', () => {
    it('returns 0 when completions is empty', () => {
        expect(calculateCurrentStreak([])).toBe(0);
    });

    it('returns 0 when today is not completed', () => {
        expect(calculateCurrentStreak(['2025-01-01', '2025-01-02'], '2025-01-03')).toBe(0);
    });

    it('returns the correct streak for consecutive completed days', () => {
        expect(calculateCurrentStreak(['2025-01-01', '2025-01-02', '2025-01-03'], '2025-01-03')).toBe(3);
        expect(calculateCurrentStreak(['2025-01-03'], '2025-01-03')).toBe(1);
    });

    it('ignores duplicate completion dates', () => {
        expect(
            calculateCurrentStreak(
                ['2025-01-03', '2025-01-03', '2025-01-02', '2025-01-02'],
                '2025-01-03'
            )
        ).toBe(2);
    });

    it('breaks the streak when a calendar day is missing', () => {
        // today and two days ago — yesterday missing
        expect(
            calculateCurrentStreak(['2025-01-01', '2025-01-03'], '2025-01-03')
        ).toBe(1);
    });
});
