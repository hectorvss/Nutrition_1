// Captura adicional de pantallas del manager para enriquecer los
// artículos de Recursos. Run: node scripts/capture-more.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'landing');
const BASE = 'http://localhost:3000';
const EMAIL = 'hectorvidal0411@gmail.com';
const PASSWORD = 'Hector0411';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();

await page.goto(BASE, { waitUntil: 'networkidle' });
const loginBtn = page.getByRole('button', { name: /(Iniciar sesión|Log in)/i });
if (await loginBtn.count()) await loginBtn.first().click();
await page.locator('input[type="email"]').fill(EMAIL);
await page.locator('input[type="password"]').fill(PASSWORD);
await page.getByRole('button', { name: /(Iniciar sesión|Log in|Sign in)/i }).click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2500);
console.log('[more] login OK');

const go = async (view) => {
  await page.evaluate((v) => window.dispatchEvent(new CustomEvent('app:navigate', { detail: v })), view);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2600);
  await page.waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, { timeout: 6000 }).catch(() => {});
};
const shot = async (file) => {
  await page.screenshot({ path: path.join(OUT, file), fullPage: false });
  console.log(`[more] ${file}`);
};

// Vistas accesibles directamente por app:navigate
for (const [view, file] of [
  ['onboarding',  'feature-onboarding.png'],
  ['calendar',    'feature-calendar.png'],
  ['messages',    'feature-messages.png'],
  ['library',     'feature-library.png'],
  ['training',    'feature-training.png'],
  ['settings',    'feature-settings.png'],
]) {
  await go(view);
  await shot(file);
}

// Detalle de cliente: ir a clientes y abrir el primero.
await go('clients');
try {
  // La fila de cliente lleva el nombre como texto clicable. Abrimos la primera.
  const firstRow = page.locator('[onclick], button, tr, div').filter({ hasText: /juliogarcia|jorgeralvarez|laurasanchez|emmavidal|cliente/i }).first();
  if (await firstRow.count()) {
    await firstRow.click({ timeout: 4000 }).catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);
    await page.waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, { timeout: 6000 }).catch(() => {});
    await shot('feature-client-detail.png');
  }
} catch (e) { console.log('[more] client-detail skip:', e.message); }

// Analytics: pestañas Nutrición y Entrenamiento.
await go('analytics');
for (const [tab, file] of [
  [/Nutrición|Nutrition/i, 'feature-analytics-nutrition.png'],
  [/Entrenamiento|Training/i, 'feature-analytics-training.png'],
]) {
  try {
    const btn = page.getByRole('button', { name: tab }).first();
    if (await btn.count()) {
      await btn.click({ timeout: 3000 });
      await page.waitForTimeout(2500);
      await page.waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, { timeout: 6000 }).catch(() => {});
      await shot(file);
    }
  } catch (e) { console.log('[more] analytics tab skip:', e.message); }
}

await browser.close();
console.log('[more] done.');
