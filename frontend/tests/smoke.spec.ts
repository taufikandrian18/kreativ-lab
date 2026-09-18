import { test, expect } from '@playwright/test';

const routes = [
  '/',
  '/about',
  '/product-lab',
  '/creative-lab',
  '/archive',
  '/archive/n8n-collective',
  '/contact',
];

for (const route of routes) {
  test(`${route} renders without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const response = await page.goto(route);
    expect(response?.status()).toBeLessThan(400);
    expect(errors).toEqual([]);
  });
}
