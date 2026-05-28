// One-off: capture the visual Workflow Builder (a complex workflow) for
// the landing. Run with: node scripts/capture-workflow.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'landing', 'feature-workflow.png');
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
console.log('[wf] login OK');

// Go to automations list
await page.evaluate(() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'automations' })));
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(2500);

// Open the first advanced workflow. The row name sits in an <h3> inside a
// cursor-pointer div; try a few known seed names, fall back to the first
// workflow icon row.
const candidates = ['Churn Radar', 'Quarterly Review', 'Smart Inbox', 'Radar', 'Workflow'];
let opened = false;
for (const name of candidates) {
  const el = page.getByText(new RegExp(name, 'i')).first();
  if (await el.count()) {
    try {
      await el.click({ timeout: 3000 });
      opened = true;
      console.log(`[wf] abierto workflow via "${name}"`);
      break;
    } catch { /* try next */ }
  }
}
if (!opened) console.log('[wf] no encontre workflow por nombre; capturo lo que haya');

await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(3000);
// Wait for skeletons to clear
await page.waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, { timeout: 6000 }).catch(() => {});

await page.screenshot({ path: OUT, fullPage: false });
console.log(`[wf] guardado en ${OUT}`);
await browser.close();
