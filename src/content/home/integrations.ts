import type { IconKey } from '@/components/ui/iconMap';
import type { Resources } from '@/i18n/resources';

type IntegrationItemKey = keyof Resources['home']['integrations']['items'];

/** Элемент группы: название бренда (не переводится) или ключ перевода. */
export type IntegrationItem = string | { key: IntegrationItemKey };

// TODO: уточнить — владелец подтверждает список реально поддерживаемых систем
export const INTEGRATION_GROUPS: readonly {
  key: keyof Resources['home']['integrations']['groups'];
  icon: IconKey;
  items: readonly IntegrationItem[];
}[] = [
  {
    key: 'channels',
    icon: 'plug',
    items: [
      'Telegram',
      'WhatsApp',
      'LINE',
      'WeChat',
      'Instagram',
      'VK',
      'Viber',
      'Email',
      { key: 'webWidget' },
    ],
  },
  {
    key: 'crm',
    icon: 'users',
    items: [
      'amoCRM',
      'Bitrix24',
      'HubSpot',
      'Salesforce',
      'Zendesk',
      'Usedesk',
      'Jira Service Management',
    ],
  },
  { key: 'erp', icon: 'database', items: ['1C', 'SAP', 'MoySklad', { key: 'customApi' }] },
  {
    key: 'ai',
    icon: 'brain',
    items: ['OpenAI', 'Anthropic Claude', 'Qwen', 'Grok', 'Llama', 'Mistral'],
  },
  {
    key: 'infra',
    icon: 'cloud',
    items: [
      'Kubernetes',
      'Docker',
      'AWS',
      'GCP',
      'Yandex Cloud',
      'Terraform',
      'PostgreSQL',
      'Kafka',
      'Redis',
      'NATS',
      'Elasticsearch',
    ],
  },
];

/** Бегущая строка технологий (первый ряд). */
export const MARQUEE_ITEMS: readonly string[] = [
  'React',
  'TypeScript',
  'Next.js',
  'Go',
  'Python',
  'PostgreSQL',
  'Kafka',
  'Kubernetes',
  'AWS',
  'GCP',
  'Terraform',
  'OpenAI',
  'Anthropic',
  'Qwen',
  'C++',
  'Elasticsearch',
  'Redis',
  'NATS',
];

/** Второй ряд бегущей строки — движется навстречу первому. */
export const MARQUEE_ITEMS_ALT: readonly string[] = [
  'LangChain',
  'pgvector',
  'Llama',
  'Mistral',
  'Grok',
  'Docker',
  'Yandex Cloud',
  'React Native',
  'Swift',
  'Kotlin',
  'Telegram API',
  'WhatsApp API',
  'WebSocket',
  'gRPC',
  'GraphQL',
  'ClickHouse',
];
