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

test('back navigation preserves state', async ({ page }) => {
  // Get to schedule via suggestion
  await navigateToSuggestions(page, ['Lisbon', 'Paris']);
  await chooseSuggestion(page, 0);
  await expect(page).toHaveURL('/schedule');

  // Go back to suggestions
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL('/suggestions');
  // Cards should still be visible (cached, no re-fetch)
  await expect(page.getByText('Budget', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Comfort', { exact: true })).toBeVisible();

  // Go back to destinations
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL('/destinations');
  // Cities still in the list
  await expect(page.getByText('Lisbon').first()).toBeVisible();
  await expect(page.getByText('Paris').first()).toBeVisible();
});

test('Start Over resets entire trip', async ({ page }) => {
  await navigateToSuggestions(page, ['Lisbon']);
  await chooseSuggestion(page, 0);
  await expect(page).toHaveURL('/schedule');

  // Click Start Over
  await page.getByRole('button', { name: 'Start Over' }).click();
  // Confirm the reset dialog
  await page.getByRole('button', { name: 'Reset' }).click();

  // Should be back at onboarding
  await expect(page).toHaveURL('/');
});

test('direct URL access to /schedule with no state shows empty form', async ({ page }) => {
  await page.goto('/schedule');

  // Should still render the page (no crash)
  await expect(page.getByText('Set Your Schedule')).toBeVisible();
});

test('localStorage persistence survives page reload', async ({ page }) => {
  await skipOnboarding(page);
  await addCity(page, 'Lisbon');
  await addCity(page, 'Paris');

  // Verify cities visible
  await expect(page.getByText('Lisbon').first()).toBeVisible();
  await expect(page.getByText('Paris').first()).toBeVisible();

  // Reload the page
  await page.reload();

  // Cities should survive (Zustand persist)
  await expect(page.getByText('Lisbon').first()).toBeVisible();
  await expect(page.getByText('Paris').first()).toBeVisible();
});

test('single destination trip works end-to-end', async ({ page }) => {
  await skipOnboarding(page);

  // Add only 1 city
  await addCity(page, 'Vienna');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL('/suggestions');

  // Pick Budget
  await page.waitForSelector('text=Budget', { timeout: 15000 });
  await page.getByRole('button', { name: 'Choose' }).first().click();
  await expect(page).toHaveURL('/schedule');

  // Proceed through rest of flow
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL('/hotels');
  await page.waitForSelector('text=/night');
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page).toHaveURL('/attractions');
  await page.waitForSelector('h3');
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page).toHaveURL('/summary');
  await page.getByRole('button', { name: 'Fly Me A Travel' }).click();
  await expect(page.getByText('Trip Confirmed!')).toBeVisible();
});
