import { describe, expect, it } from 'vitest';
import { NAMESPACES, SUPPORTED_LOCALES } from '@/i18n/config';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const files = import.meta.glob<Json>('./*/*.json', { eager: true, import: 'default' });

function load(locale: string, namespace: string): Json | undefined {
  return files[`./${locale}/${namespace}.json`];
}

const INTERPOLATION = /{{\s*(\w+)\s*}}/g;

function variables(text: string): string[] {
  return [...text.matchAll(INTERPOLATION)].map((match) => match[1] ?? '').sort();
}

/** Сравнивает структуру с эталоном (en): те же ключи, длины массивов, типы листьев и переменные интерполяции. */
function compare(reference: Json, actual: Json | undefined, path: string, problems: string[]) {
  if (actual === undefined) {
    problems.push(`${path}: missing`);
    return;
  }
  if (typeof reference === 'string') {
    if (typeof actual !== 'string') {
      problems.push(`${path}: expected string`);
      return;
    }
    if (reference.trim() !== '' && actual.trim() === '') problems.push(`${path}: empty string`);
    const expectedVars = variables(reference).join(',');
    const actualVars = variables(actual).join(',');
    if (expectedVars !== actualVars) {
      problems.push(`${path}: interpolation {${actualVars}} ≠ {${expectedVars}}`);
    }
    return;
  }
  if (Array.isArray(reference)) {
    if (!Array.isArray(actual)) {
      problems.push(`${path}: expected array`);
      return;
    }
    if (actual.length !== reference.length) {
      problems.push(`${path}: array length ${actual.length} ≠ ${reference.length}`);
    }
    reference.forEach((item, index) => compare(item, actual[index], `${path}[${index}]`, problems));
    return;
  }
  if (reference !== null && typeof reference === 'object') {
    if (actual === null || typeof actual !== 'object' || Array.isArray(actual)) {
      problems.push(`${path}: expected object`);
      return;
    }
    for (const key of Object.keys(reference)) {
      compare(reference[key] as Json, actual[key], `${path}.${key}`, problems);
    }
    for (const key of Object.keys(actual)) {
      if (!(key in reference)) problems.push(`${path}.${key}: extra key`);
    }
  }
}

describe('locales', () => {
  const others = SUPPORTED_LOCALES.filter((locale) => locale !== 'en');

  for (const locale of others) {
    for (const namespace of NAMESPACES) {
      it(`${locale}/${namespace}.json matches the en structure`, () => {
        const reference = load('en', namespace);
        expect(reference, `en/${namespace}.json`).toBeDefined();
        const problems: string[] = [];
        compare(reference as Json, load(locale, namespace), `${locale}/${namespace}`, problems);
        expect(problems).toEqual([]);
      });
    }
  }
});
