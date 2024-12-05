import { test, expect } from '@playwright/test';

test('fusionauth-admin-check', async ({ page }) => {
  await page.goto('http://localhost:9011/admin/');
  await page.getByPlaceholder('Email').click();
  await page.getByPlaceholder('Email').fill('admin@example.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('link', { name: ' Applications' }).click();
  await page.getByRole('row', { name: 'Example app ' }).getByRole('button').click();
  await page.getByRole('link', { name: ' Edit' }).click();
  expect(await page.textContent('body')).toContain('http://localhost:3000');
  await page.getByRole('link', { name: ' Users' }).click();
  await page.getByRole('link', { name: 'Advanced ' }).click();
  await page.getByLabel('Application').selectOption('Example app');
  await page.getByRole('button', { name: 'Search' }).click();
  expect(await page.textContent('body')).toContain('richard@example.com');
  await page.getByRole('link', { name: ' Logout' }).click();
});
