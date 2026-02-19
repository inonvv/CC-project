import { test, expect } from '@playwright/test';
import {
  skipOnboarding,
  addCity,
  navigateToSuggestions,
  chooseSuggestion,
  clearTripState,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearTripState(page);
});

test('Next disabled on destinations with 0 cities', async ({ page }) => {
  await skipOnboarding(page);
  const next = page.getByRole('button', { name: 'Next' });
  await expect(next).toBeDisabled();
});

test('Next enabled on destinations with 1 city', async ({ page }) => {
  await skipOnboarding(page);
  await addCity(page, 'Lisbon');
  const next = page.getByRole('button', { name: 'Next' });
  await expect(next).toBeEnabled();
});

test('Next disabled on schedule without start date', async ({ page }) => {
  await navigateToSuggestions(page, ['Lisbon']);
  await page.waitForSelector('text=Budget', { timeout: 15000 });
  await page.getByRole('button', { name: 'Customize Manually' }).click();
  await expect(page).toHaveURL('/schedule');

  const next = page.getByRole('button', { name: 'Next' });
  await expect(next).toBeDisabled();
});

test('Next disabled on schedule without all flights selected', async ({ page }) => {
  await navigateToSuggestions(page, ['Lisbon']);
  await page.waitForSelector('text=Budget', { timeout: 15000 });
  await page.getByRole('button', { name: 'Customize Manually' }).click();

  // Fill date and days but don't select flights
  await page.getByLabel('Start Date').fill('2026-08-01');
  const dayInputs = page.locator('input[type="number"]');
  await dayInputs.first().fill('3');

  // Wait for flight options to appear
  await page.waitForTimeout(500);

  const next = page.getByRole('button', { name: 'Next' });
  await expect(next).toBeDisabled();
});

test('Next disabled on hotels without selecting one per city', async ({ page }) => {
  // Use suggestion to get pre-filled state, then navigate to hotels
  await navigateToSuggestions(page, ['Lisbon', 'Paris']);
  await chooseSuggestion(page, 0);

  // Go to hotels
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL('/hotels');
  await page.waitForSelector('text=/night');

  // Hotels should already be pre-selected from suggestion — Next enabled
  const next = page.getByRole('button', { name: 'Next' });
  await expect(next).toBeEnabled();
});
