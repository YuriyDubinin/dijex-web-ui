#!/usr/bin/env node
/**
 * Генерация превью ссылок (og:image) из кода: поднимает dev-сервер, снимает /dev/og для каждого языка
 * установленным Chrome (Playwright, channel: 'chrome') и кладёт JPEG 1200×630 в public/og/og-<lang>.jpg (JPEG: градиенты в PNG весят втрое больше).
 *
 * Запуск: npm run og:generate — после смены текстов hero (home.json) или дизайна превью.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'og');
const PORT = 5199;
const LOCALES = ['en', 'ru', 'th', 'zh', 'ja', 'fr', 'de'];
const MAX_BYTES = 200 * 1024;

async function waitForServer(url, timeoutMs = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // сервер ещё стартует
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Dev server did not start on ${url}`);
}

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
  cwd: root,
  stdio: 'ignore',
});

let failed = false;
try {
  await waitForServer(`http://localhost:${PORT}/`);
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  for (const locale of LOCALES) {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    await context.addInitScript((value) => {
      window.localStorage.setItem('dijex.locale', value);
    }, locale);
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/dev/og?motion=off`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const cover = page.locator('[data-og-cover]');
    await cover.waitFor();
    const file = join(outDir, `og-${locale}.jpg`);
    await cover.screenshot({ path: file, type: 'jpeg', quality: 88 });
    const bytes = statSync(file).size;
    const ok = bytes <= MAX_BYTES;
    if (!ok) failed = true;
    console.log(`${ok ? '✓' : '✗'} og-${locale}.jpg — ${Math.round(bytes / 1024)} KB`);
    await context.close();
  }

  await browser.close();
} finally {
  server.kill();
}

if (failed) {
  console.error(`Some previews exceed ${MAX_BYTES / 1024} KB.`);
  process.exit(1);
}
