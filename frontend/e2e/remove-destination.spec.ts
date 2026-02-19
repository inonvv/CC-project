import { test, expect } from '@playwright/test';
import { skipOnboarding, addCity, clearTripState } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearTripState(page);
});

test('removing a destination updates the list correctly', async ({ page }) => {
  await skipOnboarding(page);

  await addCity(page, 'Lisbon');
  await addCity(page, 'Vienna');
  await addCity(page, 'Paris');

  // All 3 visible
  await expect(page.getByText('Lisbon').first()).toBeVisible();
  await expect(page.getByText('Vienna').first()).toBeVisible();
  await expect(page.getByText('Paris').first()).toBeVisible();

  // Remove Vienna (second X button)
  const removeButtons = page.getByRole('button', { name: 'Remove' });
  await removeButtons.nth(1).click();

  // Vienna gone, others remain
  await expect(page.getByText('Lisbon').first()).toBeVisible();
  await expect(page.getByText('Paris').first()).toBeVisible();
  // Vienna should not be in the selected list anymore
  const selectedList = page.locator('[class*="flex"][class*="flex-col"]').first();
  await expect(selectedList.getByText('Vienna')).not.toBeVisible();
});

test('removing only destination disables Next', async ({ page }) => {
  await skipOnboarding(page);

  await addCity(page, 'Lisbon');
  const next = page.getByRole('button', { name: 'Next' });
  await expect(next).toBeEnabled();

  // Remove the only city
  await page.getByRole('button', { name: 'Remove' }).first().click();
  await expect(next).toBeDisabled();
});
