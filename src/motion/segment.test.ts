import { describe, expect, it } from 'vitest';
import { segmentWords, supportsCharEffects } from './segment';

const words = (text: string, locale: string) =>
  segmentWords(text, locale)
    .filter((segment) => segment.kind === 'word')
    .map((segment) => segment.text);

describe('segmentWords', () => {
  it('splits spaced languages by whitespace and keeps punctuation with words', () => {
    expect(words('AI that works, 24/7', 'en')).toEqual(['AI', 'that', 'works,', '24/7']);
  });

  it('keeps spaces as separate segments so lines can wrap', () => {
    const segments = segmentWords('one two', 'ru');
    expect(segments.map((segment) => segment.kind)).toEqual(['word', 'space', 'word']);
  });

  it('splits Thai into several words, not one block', () => {
    expect(words('ระบบดิจิทัลสำหรับธุรกิจ', 'th').length).toBeGreaterThanOrEqual(2);
  });

  it('does not split Japanese into single characters', () => {
    const result = words('デジタルプロセスを自動化します', 'ja');
    expect(result.length).toBeGreaterThan(1);
    expect(result.length).toBeLessThan('デジタルプロセスを自動化します'.length);
  });

  it('segments Chinese into words and glues punctuation', () => {
    const result = words('全天候为您的业务工作。', 'zh');
    expect(result.length).toBeGreaterThan(1);
    expect(result.join('')).toBe('全天候为您的业务工作。');
    expect(result.some((word) => word === '。')).toBe(false);
  });

  it('allows char effects only for spaced scripts', () => {
    expect(supportsCharEffects('en')).toBe(true);
    expect(supportsCharEffects('ru')).toBe(true);
    expect(supportsCharEffects('zh-Hans')).toBe(false);
    expect(supportsCharEffects('th')).toBe(false);
  });
});
