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

test('switches language and opens privacy and printing help without changing the design', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Download 3MF' })).toBeEnabled({ timeout: 45000 });
  await page.getByLabel('Language').selectOption('es');
  await expect(page.getByRole('button', { name: 'Descargar 3MF' })).toBeEnabled();
  await expect(
    page.getByText('Procesado en tu navegador. Los diseños no se guardan.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Ayuda', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Privacidad');
  await expect(dialog).toContainText(
    'Tu SVG y la configuración de la tecla se procesan en tu navegador.',
  );
  await page.getByRole('button', { name: 'Cerrar' }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: 'Ayuda de impresión' }).click();
  await expect(page.getByRole('dialog')).toContainText('Importa el 3MF como un solo ensamblaje.');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Descargar 3MF' })).toBeEnabled();
  expect(
    await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
  ).toEqual({
    local: 0,
    session: 0,
  });
});

test('keeps the localized header and help dialog within a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Download 3MF' })).toBeEnabled({ timeout: 45000 });
  await page.getByLabel('Language').selectOption('es');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const help = page.getByRole('button', { name: 'Ayuda', exact: true });
  await expect(help).toBeInViewport();
  await help.click();
  expect(
    await page.getByRole('dialog').evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return {
        top: bounds.top,
        bottom: bounds.bottom,
        overflow: getComputedStyle(node).overflowY,
      };
    }),
  ).toEqual({ top: expect.any(Number), bottom: expect.any(Number), overflow: 'auto' });
  const bounds = await page.getByRole('dialog').boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
});

test('selects an OEM row and width independently of the artwork', async ({ page }) => {
  await page.goto('/');
  const download = page.getByRole('button', { name: 'Download 3MF' });
  await expect(download).toBeEnabled({ timeout: 45000 });
  await page.getByLabel('Upload SVG').setInputFiles({
    name: 'two-islands.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(artwork),
  });
  await expect(page.getByText('two-islands.svg')).toBeVisible();
  await page.getByLabel('OEM row').selectOption('3');
  await expect(download).toBeEnabled({ timeout: 45000 });
  await expect(page.getByLabel('Key width')).toHaveValue('oem-r3-1u');
  await page.getByLabel('OEM row').selectOption('5');
  await page.getByLabel('Key width').selectOption('oem-r5-1_5u');
  await page.getByLabel('Corner radius').fill('0.75');
  await page.getByLabel('Height adjustment').fill('-0.25');
  await expect(page.getByText('OEM derived height')).toBeVisible();
  await expect(page.getByText('two-islands.svg')).toBeVisible();
  await expect(page.getByText(/Experimental size/)).toBeVisible();
  await expect(download).toBeEnabled({ timeout: 45000 });
  const downloadEvent = page.waitForEvent('download');
  await download.click();
  const file = await downloadEvent;
  const archive = unzipSync(new Uint8Array(await readFile((await file.path())!)));
  const xml = strFromU8(archive['3D/3dmodel.model']);
  const x = [...xml.matchAll(/<vertex x="([^"]+)"/g)].map((match) => Number(match[1]));
  expect(Math.max(...x) - Math.min(...x)).toBeCloseTo(26.977, 1);
  expect(xml).toContain('name="Body"');
  expect(xml).toContain('name="Legend"');
});

test('customizes OEM corner radius and derived height, then resets to the original', async ({
  page,
}) => {
  await page.goto('/');
  const download = page.getByRole('button', { name: 'Download 3MF' });
  await expect(download).toBeEnabled({ timeout: 45000 });
  const original = page.waitForEvent('download');
  await download.click();
  const originalFile = await original;
  const originalBytes = await readFile((await originalFile.path())!);

  await page.getByLabel('Corner radius').fill('1.5');
  await page.getByLabel('Height adjustment').fill('0.5');
  await expect(page.getByText('OEM derived height')).toBeVisible();
  await expect(download).toBeEnabled({ timeout: 45000 });
  const changed = page.waitForEvent('download');
  await download.click();
  const changedFile = await changed;
  const changedBytes = await readFile((await changedFile.path())!);
  const modelXml = strFromU8(unzipSync(new Uint8Array(changedBytes))['3D/3dmodel.model']);
  expect(modelXml).toContain('name="Body"');
  expect(modelXml).toContain('name="Legend"');
  expect(changedBytes.equals(originalBytes)).toBe(false);

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByLabel('Corner radius')).toHaveValue('1');
  await expect(page.getByLabel('Height adjustment')).toHaveValue('0');
  await expect(download).toBeEnabled({ timeout: 45000 });
  const restored = page.waitForEvent('download');
  await download.click();
  const restoredFile = await restored;
  const restoredBytes = await readFile((await restoredFile.path())!);
  expect(restoredBytes.equals(originalBytes)).toBe(true);
});
