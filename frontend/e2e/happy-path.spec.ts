import { test, expect } from '@playwright/test';
import {
  skipOnboarding,
  addCity,
  chooseSuggestion,
  fillScheduleManually,
  selectHotelsForAllCities,
  selectAttractionsForAllCities,
  clearTripState,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearTripState(page);
});

test('full flow via Budget suggestion — onboarding through confirmation', async ({ page }) => {
  // Step 0: Onboarding — click through all slides
  await expect(page.getByText('Fly & Travel')).toBeVisible();
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: 'Next' }).click();
  }
  await page.getByRole('button', { name: "Let's Go" }).click();
  await expect(page).toHaveURL('/destinations');

  // Step 1: Destinations — add 2 cities
  await addCity(page, 'Lisbon');
  await addCity(page, 'Paris');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL('/suggestions');

  // Step 2: Suggestions — pick Budget
  await chooseSuggestion(page, 0);
  await expect(page).toHaveURL('/schedule');

  // Step 3: Schedule — verify pre-filled, then proceed
  const startDate = page.getByLabel('Start Date');
  await expect(startDate).not.toHaveValue('');
  const dayInputs = page.locator('input[type="number"]');
  await expect(dayInputs.first()).toHaveValue('2');
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 4: Hotels — pre-selected from suggestion
  await expect(page).toHaveURL('/hotels');
  await page.waitForSelector('text=/night');
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 5: Attractions — pre-selected from suggestion
  await expect(page).toHaveURL('/attractions');
  await page.waitForSelector('h3');
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 6: Summary — confirm
  await expect(page).toHaveURL('/summary');
  await expect(page.getByText('Trip Summary')).toBeVisible();
  await page.getByRole('button', { name: 'Fly Me A Travel' }).click();
  await expect(page.getByText('Trip Confirmed!')).toBeVisible();
});

test('full manual flow — skip suggestions and configure everything', async ({ page }) => {
  // Skip onboarding
  await skipOnboarding(page);

  // Add 1 city
  await addCity(page, 'Vienna');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL('/suggestions');

  // Skip suggestions
  await page.waitForSelector('text=Budget');
  await page.getByRole('button', { name: 'Customize Manually' }).click();
  await expect(page).toHaveURL('/schedule');

  // Fill schedule manually
  await fillScheduleManually(page, '2026-08-01', 3);
  await page.getByRole('button', { name: 'Next' }).click();

  // Hotels
  await expect(page).toHaveURL('/hotels');
  await selectHotelsForAllCities(page);
  await page.getByRole('button', { name: 'Next' }).click();

  // Attractions
  await expect(page).toHaveURL('/attractions');
  await selectAttractionsForAllCities(page);
  await page.getByRole('button', { name: 'Next' }).click();

  // Summary
  await expect(page).toHaveURL('/summary');
  await page.getByRole('button', { name: 'Fly Me A Travel' }).click();
  await expect(page.getByText('Trip Confirmed!')).toBeVisible();
});
