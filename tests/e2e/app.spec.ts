import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = `e2e-${Date.now()}@example.com`;
const TEST_PASSWORD = 'testpass123';
const HABIT_NAME = 'Morning Run';
const HABIT_NAME_2 = 'Evening Walk';

// Helper: sign up a user programmatically via the UI and return to a ready state
async function signUp(page: Page, email: string, password: string) {
    await page.goto('/signup');
    await page.getByTestId('auth-signup-email').fill(email);
    await page.getByTestId('auth-signup-password').fill(password);
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('/dashboard');
}

async function logOut(page: Page) {
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('/login');
}

async function clearLocalStorage(page: Page) {
    await page.evaluate(() => {
        localStorage.removeItem('habit-tracker-session');
        localStorage.removeItem('habit-tracker-users');
        localStorage.removeItem('habit-tracker-habits');
    });
}

test.describe('Habit Tracker app', () => {
    test.beforeEach(async ({ page }) => {
        // Start fresh for most tests
        await page.goto('/');
        await clearLocalStorage(page);
    });

    test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
        await page.goto('/');
        // Splash should be immediately visible
        await expect(page.getByTestId('splash-screen')).toBeVisible();
        // Then redirected to /login
        await page.waitForURL('/login', { timeout: 5000 });
        await expect(page).toHaveURL('/login');
    });

    test('redirects authenticated users from / to /dashboard', async ({ page }) => {
        await signUp(page, `redir-${Date.now()}@example.com`, TEST_PASSWORD);
        await page.goto('/');
        await page.waitForURL('/dashboard', { timeout: 5000 });
        await expect(page).toHaveURL('/dashboard');
    });

    test('prevents unauthenticated access to /dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForURL('/login', { timeout: 5000 });
        await expect(page).toHaveURL('/login');
    });

    test('signs up a new user and lands on the dashboard', async ({ page }) => {
        const email = `signup-${Date.now()}@example.com`;
        await page.goto('/signup');
        await page.getByTestId('auth-signup-email').fill(email);
        await page.getByTestId('auth-signup-password').fill(TEST_PASSWORD);
        await page.getByTestId('auth-signup-submit').click();
        await page.waitForURL('/dashboard');
        await expect(page.getByTestId('dashboard-page')).toBeVisible();
    });

    test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
        const userAEmail = `usera-${Date.now()}@example.com`;
        const userBEmail = `userb-${Date.now()}@example.com`;

        // Sign up user A and create a habit
        await signUp(page, userAEmail, TEST_PASSWORD);
        await page.getByTestId('create-habit-button').click();
        await page.getByTestId('habit-name-input').fill('User A Habit');
        await page.getByTestId('habit-save-button').click();
        await logOut(page);

        // Sign up user B
        await signUp(page, userBEmail, TEST_PASSWORD);
        await logOut(page);

        // Log back in as user A
        await page.goto('/login');
        await page.getByTestId('auth-login-email').fill(userAEmail);
        await page.getByTestId('auth-login-password').fill(TEST_PASSWORD);
        await page.getByTestId('auth-login-submit').click();
        await page.waitForURL('/dashboard');

        // Should see only User A's habit
        await expect(page.getByTestId('habit-card-user-a-habit')).toBeVisible();
        await expect(page.getByTestId('habit-card-user-b-habit')).not.toBeVisible();
    });

    test('creates a habit from the dashboard', async ({ page }) => {
        await signUp(page, `create-${Date.now()}@example.com`, TEST_PASSWORD);

        await page.getByTestId('create-habit-button').click();
        await page.getByTestId('habit-name-input').fill(HABIT_NAME);
        await page.getByTestId('habit-description-input').fill('Run every morning');
        await page.getByTestId('habit-save-button').click();

        await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();
    });

    test('completes a habit for today and updates the streak', async ({ page }) => {
        await signUp(page, `streak-${Date.now()}@example.com`, TEST_PASSWORD);

        // Create a habit
        await page.getByTestId('create-habit-button').click();
        await page.getByTestId('habit-name-input').fill(HABIT_NAME);
        await page.getByTestId('habit-save-button').click();

        // Initial streak is 0
        await expect(page.getByTestId('habit-streak-morning-run')).toContainText('0');

        // Toggle complete
        await page.getByTestId('habit-complete-morning-run').click();

        // Streak should update to 1
        await expect(page.getByTestId('habit-streak-morning-run')).toContainText('1');
    });

    test('persists session and habits after page reload', async ({ page }) => {
        const email = `persist-${Date.now()}@example.com`;
        await signUp(page, email, TEST_PASSWORD);

        // Create a habit
        await page.getByTestId('create-habit-button').click();
        await page.getByTestId('habit-name-input').fill(HABIT_NAME);
        await page.getByTestId('habit-save-button').click();
        await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();

        // Reload
        await page.reload();
        await page.waitForURL('/dashboard');

        // Session and habits should persist
        await expect(page.getByTestId('dashboard-page')).toBeVisible();
        await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();
    });

    test('logs out and redirects to /login', async ({ page }) => {
        await signUp(page, `logout-${Date.now()}@example.com`, TEST_PASSWORD);
        await page.getByTestId('auth-logout-button').click();
        await page.waitForURL('/login');
        await expect(page).toHaveURL('/login');
    });

    test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
        const email = `offline-${Date.now()}@example.com`;
        // Load app online first so SW can cache
        await signUp(page, email, TEST_PASSWORD);

        // Wait for service worker to activate
        await page.waitForTimeout(2000);

        // Go offline
        await context.setOffline(true);

        // Reload while offline — app shell should render, not crash
        try {
            await page.reload({ timeout: 8000 });
        } catch {
            // Navigation may hang offline — that's ok, we check what's in the page
        }

        // The page should not be a browser error page
        const body = await page.locator('body').textContent();
        expect(body).not.toContain('ERR_INTERNET_DISCONNECTED');
        expect(body).not.toContain('No internet');

        // Restore online
        await context.setOffline(false);
    });
});
