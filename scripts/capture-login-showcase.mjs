// Captura las pantallas de "Asignar plan de nutrición" y "Asignar plan de
// entrenamiento" del SaaS en ESPAÑOL e INGLÉS, para el carrusel del login.
// Fuerza el idioma interceptando la respuesta de /manager/profile.
// Run (con el dev server en :3000): node scripts/capture-login-showcase.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'landing');
const BASE = 'http://localhost:3000';
const EMAIL = 'hectorvidal0411@gmail.com';
const PASSWORD = 'Hector0411';

const browser = await chromium.launch({ headless: true });

for (const lang of ['es', 'en']) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });

  // Forzar el idioma de la UI: reescribimos data.language en /manager/profile.
  await ctx.route('**/manager/profile', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    try {
      const resp = await route.fetch();
      const json = await resp.json();
      json.language = lang;
      await route.fulfill({ response: resp, json });
    } catch {
      await route.continue();
    }
  });

  const page = await ctx.newPage();
  await page.addInitScript((l) => {
    try { localStorage.setItem('app_language_cache', l); } catch {}
  }, lang);

  await page.goto(BASE, { waitUntil: 'networkidle' });
  const loginBtn = page.getByRole('button', { name: /(Iniciar sesión|Log in)/i });
  if (await loginBtn.count()) await loginBtn.first().click();
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /(Iniciar sesión|Log in|Sign in)/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2800);
  console.log(`[showcase:${lang}] login OK`);

  const go = async (view) => {
    await page.evaluate((v) => window.dispatchEvent(new CustomEvent('app:navigate', { detail: v })), view);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2600);
    await page.waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, { timeout: 6000 }).catch(() => {});
  };

  for (const [view, file] of [
    ['nutrition', `feature-nutrition-${lang}.png`],
    ['training', `feature-training-${lang}.png`],
  ]) {
    await go(view);
    await page.screenshot({ path: path.join(OUT, file), fullPage: false });
    console.log(`[showcase:${lang}] ${file}`);
  }

  await ctx.close();
}

await browser.close();
console.log('[showcase] done.');
