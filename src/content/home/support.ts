import type { IconKey } from '@/components/ui/iconMap';
import type { Resources } from '@/i18n/resources';
import type { ChannelLogoKey } from '../images';

type SupportContent = Resources['home']['support'];

export type ChannelItem =
  | { kind: 'brand'; name: string; logo: ChannelLogoKey; icon: IconKey }
  | { kind: 'generic'; key: keyof SupportContent['channels']['items']; icon: IconKey };

export const CHANNEL_GROUPS: readonly {
  key: keyof SupportContent['channels']['groups'];
  items: readonly ChannelItem[];
}[] = [
  {
    key: 'messengers',
    items: [
      { kind: 'brand', name: 'Telegram', logo: 'telegram', icon: 'send' },
      { kind: 'brand', name: 'WhatsApp', logo: 'whatsapp', icon: 'messageCircle' },
      { kind: 'brand', name: 'Viber', logo: 'viber', icon: 'messageCircle' },
      { kind: 'brand', name: 'WeChat', logo: 'wechat', icon: 'messagesSquare' },
      {
        kind: 'brand',
        name: 'Facebook Messenger',
        logo: 'facebookMessenger',
        icon: 'messageCircle',
      },
      { kind: 'brand', name: 'LINE', logo: 'line', icon: 'messageCircle' },
    ],
  },
  {
    key: 'social',
    items: [
      { kind: 'brand', name: 'Instagram', logo: 'instagram', icon: 'globe' },
      { kind: 'brand', name: 'VK', logo: 'vk', icon: 'globe' },
      { kind: 'brand', name: 'Facebook', logo: 'facebookMessenger', icon: 'globe' },
    ],
  },
  {
    key: 'apps',
    items: [
      { kind: 'generic', key: 'webWidget', icon: 'globe' },
      { kind: 'generic', key: 'sdk', icon: 'smartphone' },
      { kind: 'generic', key: 'email', icon: 'mail' },
      { kind: 'generic', key: 'api', icon: 'code' },
    ],
  },
];

export const SUPPORT_FEATURES: readonly { key: keyof SupportContent['features']; icon: IconKey }[] =
  [
    { key: 'instant', icon: 'clock' },
    { key: 'language', icon: 'languages' },
    { key: 'inbox', icon: 'messagesSquare' },
    { key: 'handoff', icon: 'userCheck' },
    { key: 'actions', icon: 'zap' },
    { key: 'brandVoice', icon: 'sparkles' },
    { key: 'proactive', icon: 'bell' },
    { key: 'analytics', icon: 'chartLine' },
  ];

export type ChatMessage = { from: 'customer' | 'agent'; text: string };

export type ChatScenario = {
  id: string;
  /** Язык диалога — для атрибута lang и бейджа. */
  lang: string;
  badge: string;
  channel: string;
  channelIcon: IconKey;
  messages: readonly ChatMessage[];
  /** Показать плашку «диалог передан оператору» после последнего сообщения. */
  handoff?: boolean;
};

/**
 * Реплики демо-диалогов — демонстрация мультиязычности. Они НЕ переводятся вместе с сайтом:
 * переводятся только подписи интерфейса чата (home.json → support.chat).
 */
export const CHAT_SCENARIOS: readonly ChatScenario[] = [
  {
    id: 'order-es',
    lang: 'es',
    badge: 'ES',
    channel: 'WhatsApp',
    channelIcon: 'messageCircle',
    messages: [
      { from: 'customer', text: 'Hola, ¿dónde está mi pedido #4821?' },
      {
        from: 'agent',
        text: '¡Hola! Tu pedido salió del almacén hoy y llegará mañana entre 10:00 y 14:00. ¿Te envío el enlace de seguimiento?',
      },
      { from: 'customer', text: 'Sí, gracias' },
      { from: 'agent', text: 'Aquí está: dijex.track/4821 ✅' },
    ],
  },
  {
    id: 'booking-ru',
    lang: 'ru',
    badge: 'RU',
    channel: 'Telegram',
    channelIcon: 'send',
    messages: [
      { from: 'customer', text: 'Можно записаться на консультацию в четверг после обеда?' },
      { from: 'agent', text: 'Конечно! Свободно в 14:00, 15:30 и 17:00. Какое время удобно?' },
      { from: 'customer', text: '15:30' },
      {
        from: 'agent',
        text: 'Готово, записала вас на четверг 15:30. Напоминание придёт за час 🙌',
      },
    ],
  },
  {
    id: 'billing-en',
    lang: 'en',
    badge: 'EN',
    channel: 'Instagram',
    channelIcon: 'globe',
    messages: [
      { from: 'customer', text: 'I was charged twice for my subscription' },
      {
        from: 'agent',
        text: "Sorry about that! I've checked: there are two payments on 12 Oct. I'm passing this to our billing team with all details — they'll reply within 15 minutes.",
      },
    ],
    handoff: true,
  },
  {
    // Вычитано агентом-переводчиком; желательна финальная проверка носителем
    id: 'hotel-ja',
    lang: 'ja',
    badge: 'JA',
    channel: 'LINE',
    channelIcon: 'messageCircle',
    messages: [
      { from: 'customer', text: '今週の土曜日、2名で1泊の空室はありますか？' },
      {
        from: 'agent',
        text: 'はい、空室がございます。ダブルルームとツインルームをご用意できます。朝食付きプランもご案内いたしましょうか？',
      },
      { from: 'customer', text: 'ツインで、朝食付きでお願いします。' },
      {
        from: 'agent',
        text: 'かしこまりました。ツインルーム・朝食付きでご予約を承りました。確認メールをお送りいたします😊',
      },
    ],
  },
];

/** Приветствия агента на языках сайта — для блока «Языки агента» (не переводятся). */
export const AGENT_GREETINGS: Readonly<Record<string, string>> = {
  en: 'Hi! I’m the Dijex AI agent. How can I help?',
  ru: 'Здравствуйте! Я AI-агент Dijex. Чем могу помочь?',
  fr: 'Bonjour ! Je suis l’agent IA de Dijex. Comment puis-je vous aider ?',
  de: 'Hallo! Ich bin der KI-Agent von Dijex. Wie kann ich Ihnen helfen?',
  ja: 'こんにちは！DijexのAIエージェントです。本日はどのようなご用件でしょうか？',
  zh: '您好！我是 Dijex AI 智能体，请问有什么可以帮您？',
  th: 'สวัสดีค่ะ AI เอเจนต์ของ Dijex ยินดีให้บริการค่ะ มีอะไรให้ช่วยไหมคะ',
};
