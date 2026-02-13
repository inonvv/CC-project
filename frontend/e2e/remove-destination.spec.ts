import { test, expect } from '@playwright/test';

test('removing a destination clears dependent state', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Start Planning').click();

  // Add 3 cities
  await page.getByPlaceholder('Search European capitals').fill('Lisbon');
  await page.getByText('Lisbon').first().click();
  await page.getByPlaceholder('Search European capitals').fill('Vienna');
  await page.getByText('Vienna').first().click();
  await page.getByPlaceholder('Search European capitals').fill('Paris');
  await page.getByText('Paris').first().click();

  // Verify all 3 are listed
  await expect(page.getByText('Lisbon').first()).toBeVisible();
  await expect(page.getByText('Vienna').first()).toBeVisible();
  await expect(page.getByText('Paris').first()).toBeVisible();

  // Remove Vienna (second city)
  const removeButtons = page.getByText('X');
  await removeButtons.nth(1).click();

  // Verify Vienna is gone
  const cityList = page.locator('[class*="space-y-2"]').first();
  await expect(cityList.getByText('Vienna')).not.toBeVisible();
  await expect(page.getByText('Lisbon').first()).toBeVisible();
  await expect(page.getByText('Paris').first()).toBeVisible();
});
