import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('keeps custom font size together with a text colour token', () => {
    expect(cn('text-small text-text-secondary')).toBe('text-small text-text-secondary');
  });

  it('lets a later font size override an earlier one', () => {
    expect(cn('text-small', 'text-body')).toBe('text-body');
  });

  it('lets a later colour override an earlier one', () => {
    expect(cn('text-text-muted', 'text-text-primary')).toBe('text-text-primary');
  });
});
