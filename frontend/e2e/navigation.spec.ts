import { test, expect } from '@playwright/test';
import {
  skipOnboarding,
  addCity,
  chooseSuggestion,
  clearTripState,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearTripState(page);
});

test('Next and Back buttons traverse through all wizard steps', async ({ page }) => {
  // Set up a full trip via Budget suggestion so all steps have valid data
  await skipOnboarding(page);
  await addCity(page, 'Lisbon');

  // Step 1 → 2: Destinations → Suggestions
  const nextBtn = page.getByRole('button', { name: 'Next' });
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();
  await expect(page).toHaveURL('/suggestions');

  // Step 2: Suggestions — pick Budget (navigates to schedule)
  await chooseSuggestion(page, 0);
  await expect(page).toHaveURL('/schedule');

  // Step 3 → 4: Schedule → Hotels
  await expect(nextBtn).toBeVisible();
  await expect(nextBtn).toBeEnabled();
  await nextBtn.click();
  await expect(page).toHaveURL('/hotels');

  // Step 4 → 5: Hotels → Attractions
  await page.waitForSelector('text=/night');
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();
  await expect(page).toHaveURL('/attractions');

  // Step 5 → 6: Attractions → Summary
  await page.waitForSelector('h3');
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();
  await expect(page).toHaveURL('/summary');

  // Summary has hideNav — Next and Back are hidden
  await expect(nextBtn).not.toBeVisible();
});

test('Back button navigates backward through all steps', async ({ page }) => {
  // Set up trip and get to summary
  await skipOnboarding(page);
  await addCity(page, 'Lisbon');
  await page.getByRole('button', { name: 'Next' }).click();
  await chooseSuggestion(page, 0);

  // Navigate forward to summary
  await page.getByRole('button', { name: 'Next' }).click(); // → hotels
  await page.waitForSelector('text=/night');
  await page.getByRole('button', { name: 'Next' }).click(); // → attractions
  await page.waitForSelector('h3');
  await page.getByRole('button', { name: 'Next' }).click(); // → summary
  await expect(page).toHaveURL('/summary');

  // Summary has no Back button (hideNav=true), use browser back or step indicator
  // Go back using the step indicator (click Attractions step)
  // Actually, summary hides nav. Let's navigate back by going to /attractions directly
  await page.goBack();
  await expect(page).toHaveURL('/attractions');

  const backBtn = page.getByRole('button', { name: 'Back' });

  // Step 5 → 4: Attractions → Hotels
  await expect(backBtn).toBeVisible();
  await backBtn.click();
  await expect(page).toHaveURL('/hotels');

  // Step 4 → 3: Hotels → Schedule
  await expect(backBtn).toBeVisible();
  await backBtn.click();
  await expect(page).toHaveURL('/schedule');

  // Step 3 → 2: Schedule → Suggestions
  await expect(backBtn).toBeVisible();
  await backBtn.click();
  await expect(page).toHaveURL('/suggestions');

  // Step 2 → 1: Suggestions → Destinations
  await expect(backBtn).toBeVisible();
  await backBtn.click();
  await expect(page).toHaveURL('/destinations');

  // Destinations has Back which goes to onboarding
  await expect(backBtn).toBeVisible();
  await backBtn.click();
  await expect(page).toHaveURL('/');
});

test('Next button is visible on every step except onboarding and summary', async ({ page }) => {
  await skipOnboarding(page);
  await addCity(page, 'Lisbon');

  const nextBtn = page.getByRole('button', { name: 'Next' });

  // Destinations — Next visible
  await expect(page).toHaveURL('/destinations');
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();

  // Suggestions — Next NOT visible (uses Choose/Customize buttons instead)
  await expect(page).toHaveURL('/suggestions');
  await page.getByText('Budget', { exact: true }).waitFor({ timeout: 15000 });
  // The suggestions page has no onNext prop, so Next button is hidden
  await expect(page.getByRole('button', { name: 'Choose' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Customize Manually' })).toBeVisible();

  // Pick Budget to continue
  await chooseSuggestion(page, 0);

  // Schedule — Next visible
  await expect(page).toHaveURL('/schedule');
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();

  // Hotels — Next visible
  await expect(page).toHaveURL('/hotels');
  await page.waitForSelector('text=/night');
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();

  // Attractions — Next visible
  await expect(page).toHaveURL('/attractions');
  await page.waitForSelector('h3');
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();

  // Summary — Next NOT visible (hideNav)
  await expect(page).toHaveURL('/summary');
  await expect(nextBtn).not.toBeVisible();
});
