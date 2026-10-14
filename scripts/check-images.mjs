#!/usr/bin/env node
/**
 * Сверяет манифест изображений (src/content/images.ts) с файлами в public/images/
 * и генерирует public/images/README.md — чек-лист: имя, размер, где используется, есть/нет.
 *
 * Запуск: npm run images:check
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'src/content/images.ts');
const publicDir = join(root, 'public');
const manifest = readFileSync(manifestPath, 'utf8');

/** Где используется каждый файл — для чек-листа. */
const USAGE = {
  pillarOrchestrator: 'Главная → «Три направления»',
  pillarSupportAgent: 'Главная → «Три направления»',
  pillarDigitalProcesses: 'Главная → «Три направления»',
  processesInternalSystems: 'Главная → «Цифровые процессы», страница процессов',
  processesMessagingPlatform: 'Главная → «Цифровые процессы», страница процессов',
  processesClientPortal: 'Главная → «Цифровые процессы», страница процессов',
  processesWebApps: 'Главная → «Цифровые процессы», страница процессов',
  aboutGlobe: 'Главная → «О компании»',
  caseNewsFeeder: 'Главная → «Кейсы»',
  caseAiAssistant: 'Главная → «Кейсы»',
  caseEnterpriseSuite: 'Главная → «Кейсы»',
  solutionOrchestratorHero: 'Страница «AI-оркестратор» → первый экран',
  solutionOrchestratorConsole: 'Страница «AI-оркестратор» → «Архитектура»',
  solutionSupportHero: 'Страница «Агент поддержки» → первый экран',
  solutionSupportInbox: 'Страница «Агент поддержки» → «Каналы»',
  solutionDigitalHero: 'Страница «Цифровые процессы» → первый экран',
};

const rows = [];

// Изображения с размерами: key: { src: '/images/x.webp', width: 1200, height: 900 }
const imagePattern = /(\w+):\s*\{\s*src:\s*'([^']+)',\s*width:\s*(\d+),\s*height:\s*(\d+)/g;
for (const [, key, src, width, height] of manifest.matchAll(imagePattern)) {
  rows.push({ src, size: `${width}×${height}`, usage: USAGE[key] ?? key });
}

// Логотипы каналов: telegram: '/images/channel-telegram.svg'
const logoBlock = manifest.slice(
  manifest.indexOf('CHANNEL_LOGOS'),
  manifest.indexOf('ChannelLogoKey'),
);
for (const [, key, src] of logoBlock.matchAll(/(\w+):\s*'([^']+\.svg)'/g)) {
  rows.push({ src, size: 'SVG, квадрат', usage: `Каналы (${key}); без файла — иконка` });
}

// Прочие файлы: og-cover, logo
const extraBlock = manifest.slice(manifest.indexOf('EXTRA_FILES'));
for (const [, src] of extraBlock.matchAll(/'([^']+)'/g)) {
  const isOg = src.includes('og-cover');
  rows.push({
    src,
    size: isOg ? '1200×630' : 'SVG',
    usage: isOg ? 'Превью ссылок (Open Graph)' : 'Логотип (необязательно)',
  });
}

const withStatus = rows.map((row) => ({ ...row, exists: existsSync(join(publicDir, row.src)) }));
const missing = withStatus.filter((row) => !row.exists);

const table = [
  '| Статус | Файл | Размер | Где используется |',
  '|---|---|---|---|',
  ...withStatus.map(
    (row) =>
      `| ${row.exists ? '✅' : '⬜️'} | \`${row.src.replace('/images/', '')}\` | ${row.size} | ${row.usage} |`,
  ),
].join('\n');

const readme = `# Изображения сайта

Все картинки лежат в этой папке. Имена фиксированы манифестом \`src/content/images.ts\` —
достаточно положить файл с нужным именем, и он появится на сайте. Пока файла нет, на его месте
показывается аккуратная заглушка (в dev-режиме — с именем файла и размером).

Стиль: тонкая линейная графика (белый / индиго #6366F1 / циан #06B6D4) на прозрачном фоне или #0A0B14.
Формат — \`.webp\` (конвертация: \`cwebp -q 82 input.png -o output.webp\`).

Готово: ${withStatus.length - missing.length} из ${withStatus.length}.

${table}

> Файл сгенерирован командой \`npm run images:check\` — не редактируйте вручную.
`;

writeFileSync(join(publicDir, 'images/README.md'), readme);

console.log(`Images: ${withStatus.length - missing.length}/${withStatus.length} present.`);
if (missing.length > 0) {
  console.log('Missing:');
  for (const row of missing) console.log(`  - ${row.src} (${row.size}) — ${row.usage}`);
}
