import { test, expect } from '@playwright/test';

test('should display link to russian version on the main page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Русская версия')).toBeVisible();
});
