#!/usr/bin/env node
/**
 * Сводка аудита вёрстки: собирает test-results/layout/problems/*.json и печатает таблицу
 * «страница · язык · ширина · проблема · селектор · текст». Код выхода 1, если проблемы есть.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'test-results/layout/problems');

if (!existsSync(dir)) {
  console.error('No audit results — run `npm run audit:layout` first.');
  process.exit(1);
}

const reports = readdirSync(dir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(readFileSync(join(dir, file), 'utf8')));

const rows = reports.flatMap((report) =>
  report.problems.map((problem) => ({
    page: report.page,
    locale: report.locale,
    viewport: report.viewport,
    ...problem,
  })),
);

const byKind = rows.reduce((acc, row) => ({ ...acc, [row.kind]: (acc[row.kind] ?? 0) + 1 }), {});

console.log(`\nLayout audit: ${reports.length} combinations checked, ${rows.length} problems.`);
for (const [kind, count] of Object.entries(byKind)) console.log(`  ${kind}: ${count}`);

if (rows.length > 0) {
  console.log('');
  console.table(
    rows.map((row) => ({
      page: row.page,
      lang: row.locale,
      width: row.viewport,
      problem: row.kind,
      selector: row.selector.slice(0, 70),
      text: row.text.slice(0, 40),
      detail: row.detail.slice(0, 50),
    })),
  );
  process.exit(1);
}
