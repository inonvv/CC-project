import { test, expect } from '@playwright/test';

test('cannot proceed from destinations with fewer than 2 cities', async ({ page }) => {
  await page.goto('/destinations');
  const nextButton = page.getByText('Next');
  await expect(nextButton).toBeDisabled();

  // Add only 1 city
  await page.getByPlaceholder('Search European capitals').fill('Paris');
  await page.getByText('Paris').first().click();
  await expect(nextButton).toBeDisabled();
});

test('cannot proceed from schedule without start date', async ({ page }) => {
  // Set up state by navigating through
  await page.goto('/');
  await page.getByText('Start Planning').click();
  await page.getByPlaceholder('Search European capitals').fill('Lisbon');
  await page.getByText('Lisbon').first().click();
  await page.getByPlaceholder('Search European capitals').fill('Vienna');
  await page.getByText('Vienna').first().click();
  await page.getByText('Next').click();

  await expect(page).toHaveURL('/schedule');
  const nextButton = page.getByText('Next');
  await expect(nextButton).toBeDisabled();
});

test('cannot proceed from flights without selecting all segments', async ({ page }) => {
  await page.goto('/flights');
  const nextButton = page.getByText('Next');
  await expect(nextButton).toBeDisabled();
});
