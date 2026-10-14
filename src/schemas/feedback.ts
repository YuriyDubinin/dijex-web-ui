import { z } from 'zod';
import type { Resources } from '@/i18n/resources';

/** Ключ сообщения об ошибке — form.json → errors. Текст подставляется при рендере, поэтому ошибки переводятся вместе с сайтом. */
export type FeedbackErrorKey = keyof Resources['form']['errors'];

const message = (key: FeedbackErrorKey) => ({ message: key });

export const feedbackSchema = z.object({
  name: z.string().trim().min(2, message('nameMin')).max(255, message('nameMax')),
  email: z.string().trim().email(message('emailInvalid')).max(255, message('emailMax')),
  phone: z.string().trim().max(50, message('phoneMax')).optional().or(z.literal('')),
  subject: z.string().trim().max(500, message('subjectMax')).optional().or(z.literal('')),
  message: z.string().trim().min(10, message('messageMin')).max(5000, message('messageMax')),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
