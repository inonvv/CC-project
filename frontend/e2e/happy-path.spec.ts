import { test, expect } from '@playwright/test';

test('full happy path: onboarding through confirmation', async ({ page }) => {
  // Step 1: Onboarding
  await page.goto('/');
  await expect(page.getByText('Fly & Travel')).toBeVisible();
  await page.getByText('Start Planning').click();

  // Step 2: Destinations - add 2 cities
  await expect(page).toHaveURL('/destinations');
  await page.getByPlaceholder('Search European capitals').fill('Lisbon');
  await page.getByText('Lisbon').first().click();
  await page.getByPlaceholder('Search European capitals').fill('Vienna');
  await page.getByText('Vienna').first().click();
  await page.getByText('Next').click();

  // Step 3: Schedule
  await expect(page).toHaveURL('/schedule');
  await page.getByLabel('Start Date').fill('2026-07-01');
  // Fill days for each destination
  const dayInputs = page.locator('input[type="number"]');
  await dayInputs.nth(0).fill('3');
  await dayInputs.nth(1).fill('2');
  await page.getByText('Next').click();

  // Step 4: Flights - select first option for each segment
  await expect(page).toHaveURL('/flights');
  await page.waitForSelector('text=06:00');
  const flightButtons = page.locator('text=06:00');
  const count = await flightButtons.count();
  for (let i = 0; i < count; i++) {
    await flightButtons.nth(i).click();
  }
  await page.getByText('Next').click();

  // Step 5: Hotels - select first hotel for each city
  await expect(page).toHaveURL('/hotels');
  await page.waitForSelector('text=/night');
  const hotelCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: '/night' });
  // Select first hotel for each destination section
  const sections = page.locator('h3');
  const sectionCount = await sections.count();
  for (let i = 0; i < sectionCount; i++) {
    const section = sections.nth(i);
    const sectionParent = section.locator('..');
    await sectionParent.locator('[class*="cursor-pointer"]').first().click();
  }
  await page.getByText('Next').click();

  // Step 6: Attractions - select first attraction for each city
  await expect(page).toHaveURL('/attractions');
  await page.waitForSelector('text=Museum');
  const attrSections = page.locator('h3');
  const attrCount = await attrSections.count();
  for (let i = 0; i < attrCount; i++) {
    const section = attrSections.nth(i);
    const sectionParent = section.locator('..');
    await sectionParent.locator('[class*="cursor-pointer"]').first().click();
  }
  await page.getByText('Next').click();

  // Step 7: Summary
  await expect(page).toHaveURL('/summary');
  await expect(page.getByText('Trip Summary')).toBeVisible();
  await expect(page.getByText('Fly Me A Travel')).toBeVisible();

  // Confirm
  await page.getByText('Fly Me A Travel').click();
  await expect(page.getByText('Trip Confirmed!')).toBeVisible();
});
