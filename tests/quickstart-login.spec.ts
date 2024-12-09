import { expect, Page, test } from '@playwright/test';

function loginButtonLocator(page: Page) {
  const logoHeader = page.locator('#logo-header').or(page.locator('#navbar-top'));

  return logoHeader.locator('button', { hasText: /Log ?in/i })
    .or(logoHeader.locator('a', { hasText: /Log ?in/i }))
    .first();
}

function logoutButtonLocator(page: Page) {
  const logoHeader = page.locator('#logo-header').or(page.locator('#navbar-top'));

  return logoHeader.locator('button', { hasText: /Log ?out/i })
    .or(logoHeader.locator('a', { hasText: /Log ?out/i }))
    .first();
}

async function initLogin(page: Page, username: string, password: string) {
  await loginButtonLocator(page).click();

  await page.waitForTimeout(1_000);

  // Next.js / Wordpress / Drupal have an extra step before navigating to FusionAuth
  if (page.url().includes('/api/auth/signin')) {
    await page.click('role=button[name="Sign in with FusionAuth"]');
    await page.waitForLoadState();
  } else if (page.url().includes('/wp-login.php')) {
    await page.click('role=link[name="Login with OpenID Connect"]');
    await page.waitForLoadState();
  } else if (page.url().includes('/user/login')) {
    await page.click('role=button[name="Log in with generic"]');
    await page.waitForLoadState();
  }

  // Wait for FusionAuth Login page
  expect(page.url()).toMatch(/^https?:\/\/[.\w]*:9011\/oauth2\/authorize\?(.*)$/ig);
  await page.getByPlaceholder('Email').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.click('role=button[name="Submit"]');
}

test.describe('Quick-Start Login', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.QUICKSTART_URL ?? 'http://localhost:3000/');
  });

  test('should successfully login an existing user', async ({ page }) => {
    await initLogin(page, 'richard@example.com', 'password');

    // Wait for page to be settled
    await page.waitForLoadState();
    // Check that user is logged in
    // TODO we have to also check for admin@ because Drupal shows a different email
    await expect(page.getByText('richard@example.com').or(page.getByText('admin@example.com'))).toBeVisible();

    // Click Log out button
    await logoutButtonLocator(page).click();

    await page.waitForTimeout(1_000);

    // Wordpress has an extra step before logging out
    if (page.url().includes('/wp-login.php?action=logout')) {
      await page.click('role=link[name="log out"]');
      await page.waitForLoadState();

      await page.click('role=link[name="← Go to Change Bank"]');
      await page.waitForLoadState();
    }

    // Check that user is logged out
    await expect(loginButtonLocator(page)).toBeVisible();
  });

  test('should fail to login unknown user', async ({ page }) => {
    await initLogin(page, 'unknown@example.com', 'password');

    await expect(page.getByText('Invalid login credentials.')).toBeVisible();
  });

});
