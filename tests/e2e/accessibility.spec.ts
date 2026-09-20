import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('editor has no detected WCAG A/AA violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Download 3MF' })).toBeEnabled({ timeout: 45000 });
  await page.getByText('Customize measurements', { exact: true }).click();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({ rule: v.id, elements: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
});
