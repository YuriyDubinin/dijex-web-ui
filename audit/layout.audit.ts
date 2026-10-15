import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test, type Page } from '@playwright/test';
import { runLayoutChecks, type LayoutProblem } from './checks';

/**
 * Матрица «страница × язык × ширина»: на каждом сочетании ищем горизонтальную прокрутку, текст за краем,
 * обрезанный и наложенный текст, мелкие тач-цели. Движение выключено (?motion=off) — контент в финальном
 * состоянии. Проблемы пишутся в test-results/layout/problems/*.json, сводку печатает scripts/layout-summary.mjs.
 *
 * Сузить прогон: AUDIT_LOCALES=de,th AUDIT_WIDTHS=360,1280 AUDIT_PAGES=/ npm run audit:layout
 * Без скриншотов: AUDIT_SCREENSHOTS=0.
 */

const list = (value: string | undefined, fallback: readonly string[]) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [...fallback];

const LOCALES = list(process.env.AUDIT_LOCALES, ['en', 'ru', 'de', 'fr', 'ja', 'zh', 'th']);
const VIEWPORTS = list(process.env.AUDIT_WIDTHS, [
  '360',
  '390',
  '768',
  '1024',
  '1280',
  '1280x720',
  '1440',
  '1920',
]).map((value) => {
  const [width, height] = value.split('x').map(Number);
  return { label: value, width: width ?? 1280, height: height ?? 900 };
});
const PAGES = list(process.env.AUDIT_PAGES, [
  '/',
  '/solutions/ai-orchestrator',
  '/solutions/support-agent',
  '/solutions/digital-processes',
  '/privacy',
  '/404-check',
]);
const SCREENSHOTS = process.env.AUDIT_SCREENSHOTS !== '0';
const OUT = join(process.cwd(), 'test-results', 'layout');

const slug = (path: string) =>
  path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '_');

/** Прокрутка до конца и обратно: подгружаются ленивые визуалы и секции, срабатывают once-эффекты. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
}

for (const path of PAGES) {
  for (const locale of LOCALES) {
    for (const viewport of VIEWPORTS) {
      test(`${path} · ${locale} · ${viewport.label}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.addInitScript((value) => {
          window.localStorage.setItem('dijex.locale', value);
        }, locale);
        await page.goto(`${path}?motion=off`, { waitUntil: 'networkidle' });
        await settle(page);

        const problems: LayoutProblem[] = await page.evaluate(runLayoutChecks, {
          checkTargets: viewport.width < 768,
        });

        const name = `${slug(path)}__${locale}__${viewport.label}`;
        const file = join(OUT, 'problems', `${name}.json`);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(
          file,
          JSON.stringify({ page: path, locale, viewport: viewport.label, problems }, null, 2),
        );

        if (SCREENSHOTS) {
          const shot = join(OUT, slug(path), `${locale}-${viewport.label}.png`);
          mkdirSync(dirname(shot), { recursive: true });
          await page.screenshot({ path: shot, fullPage: true });
        }

        test.info().annotations.push({ type: 'problems', description: String(problems.length) });
        if (problems.length > 0) {
          throw new Error(
            problems
              .map(
                (problem) =>
                  `${problem.kind}: ${problem.selector} «${problem.text}» — ${problem.detail}`,
              )
              .join('\n'),
          );
        }
      });
    }
  }
}
