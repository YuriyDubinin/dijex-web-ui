import { describe, expect, it } from 'vitest';
import { detectLocale, toSupportedLocale } from './detectLocale';

describe('toSupportedLocale', () => {
  it.each([
    ['th-TH', 'th'],
    ['zh-CN', 'zh'],
    ['zh-TW', 'zh'],
    ['zh_HK', 'zh'],
    ['de-AT', 'de'],
    ['fr-CA', 'fr'],
    ['EN-us', 'en'],
    ['pt-BR', null],
    ['', null],
  ])('%s → %s', (tag, expected) => {
    expect(toSupportedLocale(tag)).toBe(expected);
  });
});

describe('detectLocale', () => {
  it('uses the browser region language', () => {
    expect(detectLocale({ languages: ['th-TH'] })).toEqual({ locale: 'th', source: 'browser' });
  });

  it('skips unsupported browser languages and takes the next supported one', () => {
    expect(detectLocale({ languages: ['pt-BR', 'en-US'] })).toEqual({
      locale: 'en',
      source: 'browser',
    });
  });

  it('maps traditional Chinese to the supported Chinese locale', () => {
    expect(detectLocale({ languages: ['zh-TW'] }).locale).toBe('zh');
  });

  it('falls back to the time zone region when the browser gives nothing usable', () => {
    expect(detectLocale({ languages: [], timeZone: 'Asia/Tokyo' })).toEqual({
      locale: 'ja',
      source: 'timezone',
    });
  });

  it('uses the time zone when browser languages are all unsupported', () => {
    expect(detectLocale({ languages: ['vi-VN'], timeZone: 'Asia/Bangkok' }).locale).toBe('th');
  });

  it('does not guess from an unrelated time zone', () => {
    expect(detectLocale({ languages: ['pt-BR'], timeZone: 'America/Sao_Paulo' })).toEqual({
      locale: 'en',
      source: 'default',
    });
  });

  it('prefers the stored choice over the browser language', () => {
    expect(detectLocale({ stored: 'de', languages: ['ru-RU'] })).toEqual({
      locale: 'de',
      source: 'stored',
    });
  });

  it('ignores an invalid stored value', () => {
    expect(detectLocale({ stored: 'xx', languages: ['fr-FR'] }).locale).toBe('fr');
  });

  it('applies ?lang over the browser language', () => {
    expect(detectLocale({ query: 'ja', languages: ['ru-RU'] })).toEqual({
      locale: 'ja',
      source: 'query',
    });
  });

  it('falls back to English when nothing is available', () => {
    expect(detectLocale({})).toEqual({ locale: 'en', source: 'default' });
  });
});
