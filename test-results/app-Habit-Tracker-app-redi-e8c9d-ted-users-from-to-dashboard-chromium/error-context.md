# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Habit Tracker app >> redirects authenticated users from / to /dashboard
- Location: tests/e2e/app.spec.ts:46:9

# Error details

```
TimeoutError: page.waitForURL: Timeout 60000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Create your account" [level=1] [ref=e5]
      - paragraph [ref=e6]: Start building better habits today
    - generic [ref=e8]:
      - generic [ref=e9]:
        - text: Email address
        - textbox "Email address" [ref=e10]:
          - /placeholder: you@example.com
      - generic [ref=e11]:
        - text: Password
        - textbox "Password" [ref=e12]:
          - /placeholder: Create a password
      - button "Create account" [ref=e13]
    - paragraph [ref=e14]:
      - text: Already have an account?
      - link "Sign in" [ref=e15] [cursor=pointer]:
        - /url: /login
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | const TEST_EMAIL = `e2e-${Date.now()}@example.com`;
  4   | const TEST_PASSWORD = 'testpass123';
  5   | const HABIT_NAME = 'Morning Run';
  6   | const HABIT_NAME_2 = 'Evening Walk';
  7   | 
  8   | // Helper: sign up a user programmatically via the UI and return to a ready state
  9   | async function signUp(page: Page, email: string, password: string) {
  10  |     await page.goto('/signup');
  11  |     await page.getByTestId('auth-signup-email').fill(email);
  12  |     await page.getByTestId('auth-signup-password').fill(password);
  13  |     await page.getByTestId('auth-signup-submit').click();
> 14  |     await page.waitForURL('/dashboard');
      |                ^ TimeoutError: page.waitForURL: Timeout 60000ms exceeded.
  15  | }
  16  | 
  17  | async function logOut(page: Page) {
  18  |     await page.getByTestId('auth-logout-button').click();
  19  |     await page.waitForURL('/login');
  20  | }
  21  | 
  22  | async function clearLocalStorage(page: Page) {
  23  |     await page.evaluate(() => {
  24  |         localStorage.removeItem('habit-tracker-session');
  25  |         localStorage.removeItem('habit-tracker-users');
  26  |         localStorage.removeItem('habit-tracker-habits');
  27  |     });
  28  | }
  29  | 
  30  | test.describe('Habit Tracker app', () => {
  31  |     test.beforeEach(async ({ page }) => {
  32  |         // Start fresh for most tests
  33  |         await page.goto('/');
  34  |         await clearLocalStorage(page);
  35  |     });
  36  | 
  37  |     test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
  38  |         await page.goto('/');
  39  |         // Splash should be immediately visible
  40  |         await expect(page.getByTestId('splash-screen')).toBeVisible();
  41  |         // Then redirected to /login
  42  |         await page.waitForURL('/login', { timeout: 5000 });
  43  |         await expect(page).toHaveURL('/login');
  44  |     });
  45  | 
  46  |     test('redirects authenticated users from / to /dashboard', async ({ page }) => {
  47  |         await signUp(page, `redir-${Date.now()}@example.com`, TEST_PASSWORD);
  48  |         await page.goto('/');
  49  |         await page.waitForURL('/dashboard', { timeout: 5000 });
  50  |         await expect(page).toHaveURL('/dashboard');
  51  |     });
  52  | 
  53  |     test('prevents unauthenticated access to /dashboard', async ({ page }) => {
  54  |         await page.goto('/dashboard');
  55  |         await page.waitForURL('/login', { timeout: 5000 });
  56  |         await expect(page).toHaveURL('/login');
  57  |     });
  58  | 
  59  |     test('signs up a new user and lands on the dashboard', async ({ page }) => {
  60  |         const email = `signup-${Date.now()}@example.com`;
  61  |         await page.goto('/signup');
  62  |         await page.getByTestId('auth-signup-email').fill(email);
  63  |         await page.getByTestId('auth-signup-password').fill(TEST_PASSWORD);
  64  |         await page.getByTestId('auth-signup-submit').click();
  65  |         await page.waitForURL('/dashboard');
  66  |         await expect(page.getByTestId('dashboard-page')).toBeVisible();
  67  |     });
  68  | 
  69  |     test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
  70  |         const userAEmail = `usera-${Date.now()}@example.com`;
  71  |         const userBEmail = `userb-${Date.now()}@example.com`;
  72  | 
  73  |         // Sign up user A and create a habit
  74  |         await signUp(page, userAEmail, TEST_PASSWORD);
  75  |         await page.getByTestId('create-habit-button').click();
  76  |         await page.getByTestId('habit-name-input').fill('User A Habit');
  77  |         await page.getByTestId('habit-save-button').click();
  78  |         await logOut(page);
  79  | 
  80  |         // Sign up user B
  81  |         await signUp(page, userBEmail, TEST_PASSWORD);
  82  |         await logOut(page);
  83  | 
  84  |         // Log back in as user A
  85  |         await page.goto('/login');
  86  |         await page.getByTestId('auth-login-email').fill(userAEmail);
  87  |         await page.getByTestId('auth-login-password').fill(TEST_PASSWORD);
  88  |         await page.getByTestId('auth-login-submit').click();
  89  |         await page.waitForURL('/dashboard');
  90  | 
  91  |         // Should see only User A's habit
  92  |         await expect(page.getByTestId('habit-card-user-a-habit')).toBeVisible();
  93  |         await expect(page.getByTestId('habit-card-user-b-habit')).not.toBeVisible();
  94  |     });
  95  | 
  96  |     test('creates a habit from the dashboard', async ({ page }) => {
  97  |         await signUp(page, `create-${Date.now()}@example.com`, TEST_PASSWORD);
  98  | 
  99  |         await page.getByTestId('create-habit-button').click();
  100 |         await page.getByTestId('habit-name-input').fill(HABIT_NAME);
  101 |         await page.getByTestId('habit-description-input').fill('Run every morning');
  102 |         await page.getByTestId('habit-save-button').click();
  103 | 
  104 |         await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();
  105 |     });
  106 | 
  107 |     test('completes a habit for today and updates the streak', async ({ page }) => {
  108 |         await signUp(page, `streak-${Date.now()}@example.com`, TEST_PASSWORD);
  109 | 
  110 |         // Create a habit
  111 |         await page.getByTestId('create-habit-button').click();
  112 |         await page.getByTestId('habit-name-input').fill(HABIT_NAME);
  113 |         await page.getByTestId('habit-save-button').click();
  114 | 
```