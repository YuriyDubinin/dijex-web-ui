import { describe, expect, it } from 'vitest';
import { feedbackSchema } from './feedback';

const VALID_BASE = {
  name: 'Иван Иванов',
  email: 'ivan@example.com',
  message: 'Это тестовое сообщение достаточной длины.',
};

describe('feedbackSchema', () => {
  describe('valid cases', () => {
    it('accepts required fields only', () => {
      expect(feedbackSchema.safeParse(VALID_BASE).success).toBe(true);
    });

    it('accepts all fields filled', () => {
      const result = feedbackSchema.safeParse({
        ...VALID_BASE,
        phone: '+7 999 000-00-00',
        subject: 'Разработка сайта',
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty string for optional phone', () => {
      expect(feedbackSchema.safeParse({ ...VALID_BASE, phone: '' }).success).toBe(true);
    });

    it('accepts empty string for optional subject', () => {
      expect(feedbackSchema.safeParse({ ...VALID_BASE, subject: '' }).success).toBe(true);
    });

    it('trims whitespace from name', () => {
      const result = feedbackSchema.safeParse({ ...VALID_BASE, name: '  Иван  ' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.name).toBe('Иван');
    });
  });

  describe('invalid cases', () => {
    it('rejects missing name', () => {
      const { name: _n, ...rest } = VALID_BASE;
      expect(feedbackSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects name shorter than 2 chars', () => {
      const result = feedbackSchema.safeParse({ ...VALID_BASE, name: 'И' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('nameMin');
      }
    });

    it('rejects name longer than 255 chars', () => {
      expect(feedbackSchema.safeParse({ ...VALID_BASE, name: 'A'.repeat(256) }).success).toBe(
        false,
      );
    });

    it('rejects invalid email', () => {
      const result = feedbackSchema.safeParse({ ...VALID_BASE, email: 'not-an-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('emailInvalid');
      }
    });

    it('rejects missing message', () => {
      const { message: _m, ...rest } = VALID_BASE;
      expect(feedbackSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects message shorter than 10 chars', () => {
      const result = feedbackSchema.safeParse({ ...VALID_BASE, message: 'Привет' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('messageMin');
      }
    });

    it('rejects message longer than 5000 chars', () => {
      expect(feedbackSchema.safeParse({ ...VALID_BASE, message: 'x'.repeat(5001) }).success).toBe(
        false,
      );
    });

    it('rejects phone longer than 50 chars', () => {
      expect(feedbackSchema.safeParse({ ...VALID_BASE, phone: '7'.repeat(51) }).success).toBe(
        false,
      );
    });
  });
});
