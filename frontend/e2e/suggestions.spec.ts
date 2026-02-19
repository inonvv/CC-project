import { test, expect } from '@playwright/test';
import { navigateToSuggestions, clearTripState } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearTripState(page);
});

test('displays loading state then 3 suggestion cards', async ({ page }) => {
  await navigateToSuggestions(page, ['Lisbon', 'Paris']);

  // Loading state
  await expect(page.getByText('Building suggestions...')).toBeVisible();

  // Cards appear
  await expect(page.getByText('Budget', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Comfort', { exact: true })).toBeVisible();
  await expect(page.getByText('Premium', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose' })).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Customize Manually' })).toBeVisible();
});

test('choosing Budget pre-fills schedule with dates and durations', async ({ page }) => {
  await navigateToSuggestions(page, ['Lisbon']);
  await page.waitForSelector('text=Budget', { timeout: 15000 });

  // Click first Choose (Budget)
  await page.getByRole('button', { name: 'Choose' }).first().click();
  await expect(page).toHaveURL('/schedule');

  // Verify pre-filled values
  const startDate = page.getByLabel('Start Date');
  await expect(startDate).not.toHaveValue('');

  const dayInputs = page.locator('input[type="number"]');
  await expect(dayInputs.first()).toHaveValue('2');
});

test('choosing Premium pre-fills with most expensive options', async ({ page }) => {
  await navigateToSuggestions(page, ['Lisbon']);
  await page.waitForSelector('text=Premium', { timeout: 15000 });

  // Click third Choose (Premium)
  await page.getByRole('button', { name: 'Choose' }).nth(2).click();
  await expect(page).toHaveURL('/schedule');

  // Schedule should be pre-filled
  const startDate = page.getByLabel('Start Date');
  await expect(startDate).not.toHaveValue('');
});

test('"Customize Manually" navigates without pre-filling store', async ({ page }) => {
  await navigateToSuggestions(page, ['Lisbon']);
  await page.waitForSelector('text=Budget', { timeout: 15000 });

  await page.getByRole('button', { name: 'Customize Manually' }).click();
  await expect(page).toHaveURL('/schedule');

  // Start date should be empty (no pre-fill)
  const startDate = page.getByLabel('Start Date');
  await expect(startDate).toHaveValue('');
});
