// Captura las pantallas del SaaS para el carrusel del login, en ESPAÑOL e
// INGLÉS. Hace UN SOLO login (para no chocar con el rate-limit de /auth/login)
// y cambia de idioma recargando con la respuesta de /manager/profile
// interceptada. Run (con el dev server en :3000):
//   node scripts/capture-login-showcase.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'landing');
const BASE = 'http://localhost:3000';
const EMAIL = 'hectorvidal0411@gmail.com';
const PASSWORD = 'Hector0411';

// [view de app:navigate, sufijo de fichero]
const VIEWS = [
  ['nutrition', 'nutrition'],
  ['training', 'training'],
  ['dashboard', 'dashboard'],
  ['clients', 'clients'],
  ['check-ins', 'checkins'],
  ['planning', 'planning'],
  ['calendar', 'calendar'],
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });

// Idioma forzado (mutable) que se inyecta en cada GET /manager/profile.
let currentLang = 'es';
await ctx.route('**/manager/profile', async (route) => {
  if (route.request().method() !== 'GET') return route.continue();
  try {
    const resp = await route.fetch();
    const json = await resp.json();
    json.language = currentLang;
    await route.fulfill({ response: resp, json });
  } catch {
    await route.continue();
  }
});

const page = await ctx.newPage();

const go = async (view) => {
  await page.evaluate((v) => window.dispatchEvent(new CustomEvent('app:navigate', { detail: v })), view);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2600);
  await page.waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, { timeout: 6000 }).catch(() => {});
};

// ── Login UNA sola vez ──────────────────────────────────────────────────────
await page.goto(BASE, { waitUntil: 'networkidle' });
const loginBtn = page.getByRole('button', { name: /(Iniciar sesión|Log in)/i });
if (await loginBtn.count()) await loginBtn.first().click();
await page.locator('input[type="email"]').fill(EMAIL);
await page.locator('input[type="password"]').fill(PASSWORD);
await page.getByRole('button', { name: /(Iniciar sesión|Log in|Sign in)/i }).click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);

// Guard: si seguimos en la pantalla de login (p.ej. rate-limit 429), abortar
// en vez de generar capturas inválidas.
const stillLogin = await page.evaluate(() =>
  /Bienvenido de nuevo|Welcome back/i.test(document.body.innerText) &&
  !!document.querySelector('input[type="password"]')
);
if (stillLogin) {
  console.error('[showcase] LOGIN FAILED (¿rate-limit de /auth/login?). Aborta sin sobrescribir capturas.');
  await browser.close();
  process.exit(1);
}
console.log('[showcase] login OK (una sola vez)');

// ── Capturar en cada idioma recargando (sin re-login) ───────────────────────
for (const lang of ['es', 'en']) {
  currentLang = lang;
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2800);
  for (const [view, suffix] of VIEWS) {
    await go(view);
    const file = `feature-${suffix}-${lang}.png`;
    await page.screenshot({ path: path.join(OUT, file), fullPage: false });
    console.log(`[showcase:${lang}] ${file}`);
  }
}

await browser.close();
console.log('[showcase] done.');
