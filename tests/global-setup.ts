import { chromium } from '@playwright/test';

/**
 * Global setup: pre-warm all Next.js routes before any tests run.
 * This forces the dev server to compile all pages so tests
 * don't hit 10-30s first-compile delays.
 */
async function globalSetup() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const base = 'http://localhost:3000';
    const routes = ['/', '/login', '/signup', '/dashboard'];

    console.log('\n[globalSetup] Pre-warming Next.js routes...');
    for (const route of routes) {
        try {
            await page.goto(`${base}${route}`, { waitUntil: 'load', timeout: 60000 });
            console.log(`[globalSetup] ✓ ${route}`);
        } catch {
            console.log(`[globalSetup] ⚠ ${route} (timed out during warm-up, continuing)`);
        }
    }

    await browser.close();
    console.log('[globalSetup] Routes warm — starting tests.\n');
}

export default globalSetup;
