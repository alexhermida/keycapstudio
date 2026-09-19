import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { strFromU8, unzipSync } from 'fflate';

const artwork =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 20 40 40"><path fill="#559966" d="M12 22H25V35H12Z M35 45H48V58H35Z"/></svg>';

test('loads the actual worker, uploads SVG, edits, changes view and downloads a multipart 3MF', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const external: string[] = [];
  page.on('request', (request) => {
    if (!new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))
      external.push(request.url());
  });
  await page.goto('/');
  const download = page.getByRole('button', { name: 'Download 3MF' });
  await expect(download).toBeEnabled({ timeout: 45000 });
  await page.getByLabel('Upload SVG').setInputFiles({
    name: 'two-islands.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(artwork),
  });
  await expect(page.getByText('two-islands.svg')).toBeVisible();
  await expect(download).toBeEnabled({ timeout: 45000 });
  await page.getByLabel('Legend size', { exact: true }).fill('10');
  await expect(download).toBeEnabled({ timeout: 45000 });
  await page.getByLabel('Body color', { exact: true }).fill('#203040');
  await page.getByRole('button', { name: 'Underside', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Underside', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Top', exact: true }).click();
  const downloadEvent = page.waitForEvent('download');
  await download.click();
  const file = await downloadEvent;
  expect(file.suggestedFilename()).toBe('custom-keycap.3mf');
  const archive = unzipSync(new Uint8Array(await readFile((await file.path())!)));
  const xml = strFromU8(archive['3D/3dmodel.model']);
  expect(xml).toContain('name="Custom Keycap"');
  expect(xml).toContain('name="Body"');
  expect(xml).toContain('name="Legend"');
  expect(xml).toContain('#203040FF');
  expect(xml.match(/<component /g)).toHaveLength(2);
  const vertices = [...xml.matchAll(/<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"\/>/g)];
  const span = (axis: number) => {
    const values = vertices.map((vertex) => Number(vertex[axis]));
    return Math.max(...values) - Math.min(...values);
  };
  expect(span(1)).toBeCloseTo(17.45, 1);
  expect(span(2)).toBeCloseTo(17.61, 1);
  expect(Object.keys(archive).some((name) => /gcode|project_settings|slice_info/.test(name))).toBe(
    false,
  );
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('rejects unsupported artwork and recovers without stale export', async ({ page }) => {
  await page.goto('/');
  const download = page.getByRole('button', { name: 'Download 3MF' });
  await expect(download).toBeEnabled({ timeout: 45000 });
  await page.getByLabel('Upload SVG').setInputFiles({
    name: 'outline.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><path stroke="red" d="M0 0H20"/></svg>',
    ),
  });
  await expect(page.getByRole('alert')).toContainText('Convert strokes');
  await expect(download).toBeDisabled();
  await page.getByRole('button', { name: 'Orbit', exact: true }).click();
  await expect(download).toBeEnabled({ timeout: 45000 });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Spark · example')).toBeVisible();
});
