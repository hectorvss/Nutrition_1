// Capture screenshots of the manager portal for the landing page.
// Run with: node scripts/capture-landing-screenshots.mjs
//
// Requirements:
//   - Dev server running on http://localhost:3000 (`npm run dev:all`).
//   - Playwright + chromium installed (already added once via
//     `npm i -D playwright && npx playwright install chromium`).
//
// Outputs into public/landing/*.png. Wired by LandingPage.tsx via
// `imageSrc` on each FeatureSequenceSection.

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'landing');
const BASE = process.env.LANDING_BASE || 'http://localhost:3000';
const EMAIL = process.env.LANDING_EMAIL || 'hectorvidal0411@gmail.com';
const PASSWORD = process.env.LANDING_PASSWORD || 'Hector0411';

// 1920×1080 emulates a desktop screenshot; the chrome browser frame
// in FeatureSequenceSection has aspect-video so any 16:9 capture fits.
const VIEWPORT = { width: 1600, height: 1000 };

const TARGETS = [
  { view: 'dashboard',   file: 'feature-dashboard.png',   waitMs: 6000 },
  { view: 'clients',     file: 'feature-clients.png',     waitMs: 3500 },
  { view: 'nutrition',   file: 'feature-nutrition.png',   waitMs: 3500 },
  { view: 'analytics',   file: 'feature-progress.png',    waitMs: 6000 },
  { view: 'automations', file: 'feature-automations.png', waitMs: 3500 },
  { view: 'check-ins',   file: 'feature-checkins.png',    waitMs: 3500 },
];

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  // 1. Login
  console.log(`[landing] navegando a ${BASE}`);
  await page.goto(BASE, { waitUntil: 'networkidle' });

  // The landing renders first; click "Iniciar sesión" or "Log in".
  // The button is rendered in the floating nav of LandingPage.tsx.
  const loginBtn = page.getByRole('button', { name: /(Iniciar sesión|Log in)/i });
  if (await loginBtn.count()) {
    await loginBtn.first().click();
  }

  // Fill email + password and submit
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /(Iniciar sesión|Log in|Sign in)/i }).click();

  // Wait for the post-login dashboard. The app sets `currentView` to
  // 'dashboard' after auth resolves.
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500); // let charts & data finish hydrating
  console.log('[landing] login OK');

  // 2. For each view, dispatch the custom event the app listens for and screenshot.
  for (const t of TARGETS) {
    console.log(`[landing] capturando vista ${t.view} → ${t.file}`);
    await page.evaluate((view) => {
      window.dispatchEvent(new CustomEvent('app:navigate', { detail: view }));
    }, t.view);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(t.waitMs || 3000);

    // Wait for skeleton loaders to disappear — the manager portal renders
    // skeleton blocks until each fetch resolves. Best-effort: if no
    // skeletons match, continue without blocking.
    await page
      .waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, {
        timeout: 8000,
      })
      .catch(() => console.log(`[landing]   (aún quedaban skeletons en ${t.view}, sigo)`));

    const outPath = path.join(OUT_DIR, t.file);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`[landing]   guardado en ${outPath}`);
  }

  await browser.close();
  console.log('[landing] hecho.');
}

run().catch((err) => {
  console.error('[landing] fallo:', err);
  process.exit(1);
});
