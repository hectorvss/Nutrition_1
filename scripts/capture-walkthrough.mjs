// Capturas granulares "clic a clic" para las guías de Recursos: formularios,
// editores y modales que aparecen al interactuar, no sólo las vistas de lista.
// Run: node scripts/capture-walkthrough.mjs
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

const settle = async (ms = 2200) => {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
  await page.waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, { timeout: 6000 }).catch(() => {});
};
const go = async (view) => {
  await page.evaluate((v) => window.dispatchEvent(new CustomEvent('app:navigate', { detail: v })), view);
  await settle();
};
const shot = async (file) => { await page.screenshot({ path: path.join(OUT, file), fullPage: false }); console.log('  ✓', file); };
const clickText = async (re, timeout = 4000) => {
  const el = page.getByText(re).first();
  if (await el.count()) { await el.click({ timeout }).catch(() => {}); return true; }
  return false;
};
const clickRole = async (re, timeout = 4000) => {
  const el = page.getByRole('button', { name: re }).first();
  if (await el.count()) { await el.click({ timeout }).catch(() => {}); return true; }
  return false;
};
const step = async (label, fn) => {
  try { console.log('▶', label); await fn(); }
  catch (e) { console.log('  ⚠ skip', label, '-', e.message); }
};

// Login
await page.goto(BASE, { waitUntil: 'networkidle' });
const lb = page.getByRole('button', { name: /(Iniciar sesión|Log in)/i });
if (await lb.count()) await lb.first().click();
await page.locator('input[type="email"]').fill(EMAIL);
await page.locator('input[type="password"]').fill(PASSWORD);
await page.getByRole('button', { name: /(Iniciar sesión|Log in|Sign in)/i }).click();
await settle(2600);
console.log('login OK');

// 1. Crear cliente: Clientes → Nuevo Cliente (formulario)
await step('clientes/nuevo-cliente', async () => {
  await go('clients');
  if (await clickRole(/Nuevo Cliente|New Client/i)) { await settle(1800); await shot('wt-new-client.png'); }
});

// 2. Onboarding → Plantillas de Onboarding
await step('onboarding/plantillas', async () => {
  await go('onboarding');
  if (await clickText(/Plantillas de Onboarding|Onboarding Templates/i)) { await settle(1800); await shot('wt-onboarding-templates.png'); }
});

// 3. Nutrición → primer "Ver Plan"/"Asignar Plan" (editor de plan)
await step('nutricion/plan-detail', async () => {
  await go('nutrition');
  if (await clickText(/Ver Plan|Asignar Plan|View Plan|Assign Plan/i)) { await settle(2400); await shot('wt-nutrition-plan.png'); }
});

// 4. Nutrición → Plantillas de Nutrición
await step('nutricion/plantillas', async () => {
  await go('nutrition');
  if (await clickText(/Plantillas de Nutrición|Nutrition Templates/i)) { await settle(2000); await shot('wt-nutrition-templates.png'); }
});

// 5. Entrenamiento → Plantillas de Entrenamiento
await step('entreno/plantillas', async () => {
  await go('training');
  if (await clickText(/Plantillas de Entrenamiento|Training Templates/i)) { await settle(2000); await shot('wt-training-templates.png'); }
});

// 6. Check-ins → Plantillas de Check-in (editor)
await step('checkins/plantillas', async () => {
  await go('check-ins');
  if (await clickText(/Plantillas de Check-?in|Check-?in Templates/i)) { await settle(2000); await shot('wt-checkin-templates.png'); }
});

// 7. Check-ins → primer "Revisar"/fila (detalle de check-in)
await step('checkins/detalle', async () => {
  await go('check-ins');
  if (await clickText(/Revisar|Review/i)) { await settle(2200); await shot('wt-checkin-review.png'); }
});

// 8. Automatizaciones → Nueva Automatización (menú/creación)
await step('automatizaciones/nueva', async () => {
  await go('automations');
  if (await clickText(/Nueva Automatización|New Automation/i)) { await settle(1800); await shot('wt-new-automation.png'); }
});

// 9. Biblioteca → Nueva Receta (formulario)
await step('biblioteca/nueva-receta', async () => {
  await go('library');
  if (await clickText(/Nueva Receta|New Recipe/i)) { await settle(2000); await shot('wt-new-recipe.png'); }
});

// 10. Biblioteca → abrir una receta (detalle)
await step('biblioteca/receta-detalle', async () => {
  await go('library');
  if (await clickText(/Bowl de açaí|Salmón teriyaki|Gazpacho|açaí|teriyaki/i)) { await settle(2000); await shot('wt-recipe-detail.png'); }
});

await browser.close();
console.log('done.');
