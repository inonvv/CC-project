import type { Page } from '@playwright/test';

/** Click "Skip" on onboarding → lands on /destinations */
export async function skipOnboarding(page: Page) {
  await page.goto('/');
  await page.getByText('Skip').click();
  await page.waitForURL('/destinations');
}

/** Type a city name in the search box and click the first matching result */
export async function addCity(page: Page, name: string) {
  const input = page.getByPlaceholder('Search European capitals');
  await input.fill(name);
  await page.getByText(name, { exact: false }).first().click();
  await input.fill('');
}

/** Skip onboarding, add cities, click Next → /suggestions */
export async function navigateToSuggestions(page: Page, cities: string[]) {
  await skipOnboarding(page);
  for (const city of cities) {
    await addCity(page, city);
  }
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForURL('/suggestions');
}

/** Wait for suggestion cards to load, click the nth "Choose" button (0-indexed) */
export async function chooseSuggestion(page: Page, index: number = 0) {
  await page.getByText('Budget', { exact: true }).waitFor({ timeout: 15000 });
  const buttons = page.getByRole('button', { name: 'Choose' });
  await buttons.nth(index).click();
  await page.waitForURL('/schedule');
}

/**
 * On the /schedule page, fill start date, days per city, and select the
 * first flight option for every segment (including return).
 *
 * Flight panels for each city are hidden until you focus that city's days input.
 * The return flight panel is always visible.
 */
export async function fillScheduleManually(page: Page, date: string, days: number) {
  // Wait for flight data to load
  await page.waitForSelector('text=Return Home', { timeout: 10000 });

  await page.getByLabel('Start Date').fill(date);

  const dayInputs = page.locator('input[type="number"]');
  const count = await dayInputs.count();

  // For each destination: fill days, focus to reveal flight panel, pick first flight
  for (let i = 0; i < count; i++) {
    const input = dayInputs.nth(i);
    await input.fill(String(days));
    await input.focus();
    // Wait for the debounce (200ms) + animation
    await page.waitForTimeout(400);

    // Find visible flight buttons (the revealed panel) and pick the first unselected one
    const visibleFlights = page.locator('button:visible').filter({ hasText: /\d{2}:\d{2}/ });
    const flightCount = await visibleFlights.count();
    for (let f = 0; f < flightCount; f++) {
      const btn = visibleFlights.nth(f);
      const classes = await btn.getAttribute('class') || '';
      if (!classes.includes('ring-2')) {
        await btn.click();
        break; // one per segment
      }
    }
  }

  // Select return flight (always visible at the bottom)
  const returnSection = page.locator('text=Return Home').locator('..');
  const returnFlights = returnSection.locator('..').locator('button').filter({ hasText: /\d{2}:\d{2}/ });
  const returnCount = await returnFlights.count();
  for (let f = 0; f < returnCount; f++) {
    const btn = returnFlights.nth(f);
    const classes = await btn.getAttribute('class') || '';
    if (!classes.includes('ring-2')) {
      await btn.click();
      break;
    }
  }
}

/** Select the first hotel card in each city section on /hotels */
export async function selectHotelsForAllCities(page: Page) {
  await page.waitForSelector('text=/night');
  // Each city section: outer div > (header div with h3) + (grid div with cards)
  // Navigate from h3 → parent flex → parent outer div → find cursor-pointer cards
  const sections = page.locator('h3');
  const sectionCount = await sections.count();
  for (let i = 0; i < sectionCount; i++) {
    const outerDiv = sections.nth(i).locator('../..');
    const card = outerDiv.locator('[class*="cursor-pointer"]').first();
    await card.click();
  }
}

/** Select the first attraction card in each city section on /attractions */
export async function selectAttractionsForAllCities(page: Page) {
  await page.waitForSelector('h3');
  const sections = page.locator('h3');
  const sectionCount = await sections.count();
  for (let i = 0; i < sectionCount; i++) {
    const outerDiv = sections.nth(i).locator('../..');
    const card = outerDiv.locator('[class*="cursor-pointer"]').first();
    await card.click();
  }
}

/** Clear localStorage to reset persisted state */
export async function clearTripState(page: Page) {
  await page.evaluate(() => localStorage.removeItem('fly-travel-trip'));
}
