// Captura pantallas PROFUNDAS y características del SaaS (no las listas de nivel
// superior) para el carrusel del login, en ES e EN. UN solo login.
//   node scripts/capture-login-deep.mjs
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

let currentLang = 'es';
await ctx.route('**/manager/profile', async (route) => {
  if (route.request().method() !== 'GET') return route.continue();
  try {
    const resp = await route.fetch();
    const json = await resp.json();
    json.language = currentLang;
    await route.fulfill({ response: resp, json });
  } catch { await route.continue(); }
});

const page = await ctx.newPage();

const settle = async (ms = 2600) => {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
  await page.waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, { timeout: 6000 }).catch(() => {});
};
const go = async (view) => {
  await page.evaluate((v) => window.dispatchEvent(new CustomEvent('app:navigate', { detail: v })), view);
  await settle();
};
const clickFirst = async (re, opts = {}) => {
  const btn = page.getByRole('button', { name: re }).first();
  if (await btn.count()) { await btn.click({ timeout: 4000 }).catch(() => {}); return true; }
  const txt = page.getByText(re).first();
  if (await txt.count()) { await txt.click({ timeout: 4000 }).catch(() => {}); return true; }
  return false;
};
const shot = (file) => page.screenshot({ path: path.join(OUT, file), fullPage: false }).then(() => console.log(`  ${file}`));

// ── Login una vez ───────────────────────────────────────────────────────────
await page.goto(BASE, { waitUntil: 'networkidle' });
const loginBtn = page.getByRole('button', { name: /(Iniciar sesión|Log in)/i });
if (await loginBtn.count()) await loginBtn.first().click();
await page.locator('input[type="email"]').fill(EMAIL);
await page.locator('input[type="password"]').fill(PASSWORD);
await page.getByRole('button', { name: /(Iniciar sesión|Log in|Sign in)/i }).click();
await page.waitForTimeout(3000);
const stillLogin = await page.evaluate(() =>
  /Bienvenido de nuevo|Welcome back/i.test(document.body.innerText) && !!document.querySelector('input[type="password"]'));
if (stillLogin) { console.error('LOGIN FAILED (rate-limit?). Abort.'); await browser.close(); process.exit(1); }
console.log('login OK');

for (const lang of ['es', 'en']) {
  currentLang = lang;
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await settle(2800);
  console.log(`== ${lang} ==`);

  // 1. Detalle de plan de NUTRICIÓN (macros + comidas)
  await go('nutrition');
  await clickFirst(/Ver Plan|View Plan/i);
  await settle(3500);
  await shot(`deep-nutrition-plan-${lang}.png`);

  // 2. Detalle de entrenamiento (vista semanal de un cliente con plan)
  await go('training');
  await clickFirst(/Ver Plan|View Plan/i);
  await settle(3500);
  await shot(`deep-training-${lang}.png`);

  // 3. Detalle de cliente
  await go('clients');
  await clickFirst(/juliogarcia/i);
  await settle(3500);
  await shot(`deep-client-${lang}.png`);

  // 4. Analytics — vista por defecto (gráficas). NO clicamos pestaña: el regex
  //    chocaba con el item "Nutrición" del sidebar y navegaba a la lista.
  await go('analytics');
  await settle(3500);
  await shot(`deep-analytics-${lang}.png`);

  // 5. Workflow builder con un flujo REAL ya creado (grafo de nodos poblado),
  //    no un lienzo vacío. Abrimos el workflow "Churn Radar".
  await go('automations');
  await clickFirst(/Churn Radar/i);
  await settle(4000);
  await shot(`deep-workflow-${lang}.png`);
}

await browser.close();
console.log('done.');
