# CLAUDE.md — Бриф для агента: фронтенд сайта Dijex

Этот файл — самодостаточный концентрат для агента, который будет создавать фронтенд
сайта компании **Dijex** в отдельном проекте. Бэкенд (Go REST API) уже существует и
не трогается — фронтенд только потребляет один эндпоинт для приёма заявок.

---

## 1. Контекст

### О компании

**Dijex** — компания, занимающаяся **инновационными цифровыми решениями для среднего
и крупного бизнеса**. Продукт — корпоративный сайт-визитка с лендингом и формой обратной
связи. Сайт должен **визуально и тактильно передавать высокотехнологичный дух компании**:
быть стильным, быстрым, плавным, отзывчивым на всех устройствах.

### Что строим

Одностраничный лендинг с smooth-навигацией между секциями + форма заявки в конце,
которая отправляет данные на бэкенд этого проекта.

### Что НЕ строим

- Никакого админ-интерфейса, личных кабинетов, авторизации.
- Никакой CMS — контент захардкожен или вынесен в JSON.
- Никакого SSR/Next.js — это статический SPA, поставляется через nginx.

---

## 2. Технологический стек (обязателен)

| Категория | Выбор | Версия |
|---|---|---|
| Язык | TypeScript (strict mode, **никаких `any`**) | 5.4+ |
| Framework | React (функциональные компоненты, hooks) | 18+ |
| Сборщик | Vite | 5+ |
| Стили | Tailwind CSS + CSS variables для дизайн-токенов | 3.4+ |
| Анимации | Framer Motion (motion library) | 11+ |
| Формы | React Hook Form + Zod (резолвер `@hookform/resolvers/zod`) | актуальные |
| HTTP | нативный `fetch` (без axios — лишний вес для одного эндпоинта) | — |
| Иконки | lucide-react | актуальная |
| Шрифты | self-hosted через `@fontsource` (без подгрузки с Google) | — |
| Роутинг | React Router v6 (для будущих страниц `/privacy`, `/thanks`) | 6+ |
| Линт | ESLint (`@typescript-eslint`, `eslint-plugin-react`) + Prettier | актуальные |
| Тесты | Vitest + React Testing Library (минимум для формы) | актуальные |

**Запрещено:** CRA, webpack, jQuery, Bootstrap, MUI/Ant Design (тяжёлые UI-киты ломают
авторский визуальный язык — компоненты пишем сами на Tailwind).

---

## 3. Структура проекта

Проект живёт в **отдельной папке/репозитории** (название — `dijex-web`). Структура:

```
dijex-web/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/                  # Button, Input, Textarea, Field, Toast — переиспользуемые примитивы
│   │   ├── layout/              # Header, Footer, Container
│   │   ├── sections/            # Hero, About, Services, Cases, Process, ContactForm
│   │   └── motion/              # FadeIn, ScrollReveal — обёртки над Framer Motion
│   ├── hooks/                   # useScrollSpy, useReducedMotion, etc.
│   ├── lib/
│   │   ├── api.ts               # клиент к бэкенду
│   │   └── cn.ts                # утилита class merge (clsx + tailwind-merge)
│   ├── schemas/
│   │   └── feedback.ts          # Zod-схема формы (совпадает с бэкендом)
│   ├── styles/
│   │   └── globals.css          # Tailwind directives + CSS variables
│   ├── content/
│   │   └── landing.ts           # текстовый контент секций (i18n-ready)
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── Dockerfile
├── nginx.conf
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
└── README.md
```

**Принципы:**
- Один компонент — один файл. Файл = `PascalCase.tsx`.
- Локальные стили — Tailwind utilities. Если набор повторяется — выносим в `@layer components` или в отдельный компонент.
- Никаких `default export` для компонентов — только именованные. Кроме `App.tsx`/`main.tsx`.

---

## 4. Дизайн-язык

Цель — **dark-first hi-tech эстетика**: глубокий фон, яркие акцентные градиенты,
тонкая типографика, мягкие свечения, аккуратные анимации.

### Цветовая палитра (CSS variables)

```
--bg-base:        #0A0B14   /* основной фон */
--bg-surface:    #11131F   /* карточки, поверхности */
--bg-elevated:   #181B2C   /* модалки, поповеры */
--border:         #232742
--text-primary:   #F5F6FB
--text-secondary: #A7ADC6
--text-muted:     #6B7290

--accent-primary: #6366F1   /* индиго */
--accent-secondary: #06B6D4 /* циан */
--accent-glow:    #8B5CF6   /* фиолетовый для подсветок */

--success: #10B981
--danger:  #EF4444
--warning: #F59E0B
```

Все эти токены экспонировать в `tailwind.config.ts` через `theme.extend.colors`,
чтобы можно было писать `bg-bg-base text-text-primary`.

### Светлая тема

Не делать в первой итерации. Все цветовые переменные сразу описывать через CSS var
с дефолтом тёмной темы — это даст возможность ввести светлую без переписывания.

### Типографика

- **Sans (основной):** Inter (или Geist Sans) — `@fontsource/inter` (weights 400, 500, 600, 700).
- **Display (заголовки секций):** Sora — `@fontsource/sora` (weights 600, 700).
- Масштаб (rem):
  - `text-display`: clamp(2.5rem, 5vw, 4.5rem) — H1 в hero
  - `text-h1`: clamp(2rem, 3.5vw, 3rem)
  - `text-h2`: clamp(1.5rem, 2.5vw, 2.25rem)
  - `text-h3`: 1.5rem
  - `text-body`: 1rem (16px), line-height 1.6
  - `text-small`: 0.875rem

### Скруления и тени

- Радиус карточек: `rounded-2xl` (16px). Кнопки: `rounded-xl` (12px). Инпуты: `rounded-lg` (10px).
- Тени — мягкие, с цветным glow: `shadow-[0_0_60px_-15px_rgba(99,102,241,0.45)]` на hover'ах.

### Графические приёмы

- Анимированный фон в Hero: тонкая mesh-gradient + субтильные дрейфующие шарики (canvas, чистый CSS-keyframes, или Framer Motion). Никаких тяжёлых WebGL/Three.js — это перебор для лендинга.
- Сетка-«паттерн» (`bg-grid`) на больших секциях — SVG, тонкие линии 1px, opacity 0.05–0.08.
- Свечения за карточками (radial-gradient через `::before`) — добавляют глубины.
- Скруглённые блоки с тонкой обводкой `border-border` + полупрозрачный фон `bg-bg-surface/60` + `backdrop-blur-sm`.

---

## 5. Структура лендинга (секции по порядку)

1. **Header** (sticky, прозрачный → blur при скролле)
   - Логотип «Dijex» слева
   - Якорная навигация: О компании / Услуги / Кейсы / Процесс / Контакты
   - CTA-кнопка «Связаться» — скроллит к форме

2. **Hero** (100vh)
   - H1: «Цифровые решения, которые двигают бизнес» (или вариант от агента в духе бренда)
   - Подзаголовок: 1–2 предложения о Dijex
   - Две CTA: «Обсудить проект» (primary) и «Узнать о услугах» (ghost) — обе скроллят к нужной секции
   - Анимированный фон, плавное появление текста (stagger через Framer Motion)
   - Маленький badge сверху, например «🚀 Innovative digital solutions»

3. **About** — кто такие
   - Большой заголовок, абзац текста (миссия)
   - Три-четыре метрики (years, projects, clients, технологий) — числа с count-up при появлении в viewport
   - Слева/справа — место под изображение/иллюстрацию (`<img>` с placeholder, заглушка из `/public`)

4. **Services / Что мы делаем**
   - Сетка карточек (3–4 штуки), каждая: иконка из lucide-react, заголовок, описание, ссылка-стрелка «Узнать больше» (anchor, или просто декор)
   - Примеры услуг: «Веб-разработка», «Мобильные приложения», «AI-интеграции», «DevOps & Cloud»
   - Карточки hover: лёгкий lift + glow

5. **Cases / Кейсы**
   - 2–3 крупные карточки с placeholder-изображением, названием клиента/проекта, кратким описанием и тегами-технологиями
   - Изображения: места под `<img>` с фиксированным aspect-ratio, alt-текст обязательно
   - На больших экранах — alternate layout (карточка 1 — текст слева/изобр. справа, карточка 2 — наоборот)

6. **Process / Как мы работаем**
   - 4–5 шагов в горизонтальной линии (на mobile — вертикально): «Brief → Design → Build → Launch → Support»
   - Каждый шаг — номер, заголовок, краткое описание
   - Между шагами — анимированная разделительная линия, прорисовывающаяся при скролле

7. **TechStack** (опционально, можно объединить с About)
   - Полоса логотипов технологий (React, Go, AWS, Kubernetes, PostgreSQL и т.п.) — SVG иконки
   - Slow horizontal scroll/marquee — эффект «мы знаем всё»

8. **ContactForm / Заявка** — основная функциональная секция (см. раздел 7)

9. **Footer**
   - Логотип, короткая фраза
   - Колонки: Навигация / Контакты / Соцсети
   - Копирайт, ссылка на политику конфиденциальности (страница пока заглушкой)

---

## 6. Навигация и motion

- **Якорная навигация** + плавный скролл (`scroll-behavior: smooth` или Framer Motion).
- **ScrollSpy** — активный пункт меню подсвечивается, когда соответствующая секция в viewport.
- **Reveal-анимации** при появлении секций (Framer Motion `whileInView`, `viewport={{ once: true, amount: 0.2 }}`).
- **Stagger** для списков карточек (`staggerChildren: 0.08`).
- **Header** меняет внешний вид при скролле (компактнее, фон становится `bg-bg-base/80 backdrop-blur-md`).
- **prefers-reduced-motion**: при включённой системной настройке отключать reveal-анимации и фоновое движение. Использовать `useReducedMotion()` из Framer Motion.

Движение должно быть **тонким**: ease-out, длительности 0.3–0.6s. Никаких прыжков,
тряски, гипертрофированных bounce'ов. Стиль — Apple, Linear, Vercel.

---

## 7. Форма заявки — интеграция с бэкендом

### Эндпоинт

```
POST {VITE_API_BASE_URL}/api/feedbacks/requests
Content-Type: application/json
```

`VITE_API_BASE_URL` — переменная окружения. В dev: `http://localhost:18080`.
В проде — реальный домен API.

### Поля формы (точно совпадают с бэкендом)

| Поле | Тип | Обязательное | Ограничения | UI |
|---|---|---|---|---|
| `name` | string | да | 2–255 символов | Input |
| `email` | string | да | формат email, ≤ 255 | Input type=email |
| `phone` | string | нет | ≤ 50 символов | Input type=tel |
| `subject` | string | нет | ≤ 500 символов | Input |
| `message` | string | да | 10–5000 символов | Textarea, авто-рост |

### Zod-схема (src/schemas/feedback.ts)

Должна быть **единственным источником правды** для клиентской валидации:

```ts
import { z } from 'zod';

export const feedbackSchema = z.object({
  name: z.string().trim().min(2, 'Минимум 2 символа').max(255),
  email: z.string().trim().email('Невалидный email').max(255),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  subject: z.string().trim().max(500).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Минимум 10 символов').max(5000),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
```

### Поведение формы

1. **Inline валидация** на `onBlur` и при submit. Ошибки — под полем, красным цветом
   `text-danger`, размер `text-small`.
2. **Visual states** инпута: idle, focus (рамка `accent-primary`), error (рамка `danger`),
   disabled. Лейблы float-style или вверху с явным `<label htmlFor>`.
3. **Submit-кнопка**:
   - Disabled, пока форма не прошла валидацию + при отправке.
   - В loading: spinner + текст «Отправляем…».
   - После успеха: показать success-карточку (анимированно, через Framer Motion), скрыть форму. Кнопка «Отправить ещё» для возврата.
4. **Серверные ошибки 422** — мерджить в форму через `setError`:
   ```ts
   const data = await response.json();
   if (response.status === 422 && data?.error?.details) {
     data.error.details.forEach(d => setError(d.field, { message: d.message }));
   }
   ```
5. **Серверные ошибки 500 / сетевые** — показывать общий toast «Что-то пошло не так, попробуйте позже».
6. **Honeypot** — скрытое поле `website` (display:none, tabIndex=-1). Если оно заполнено — submit не отправляем, делаем вид что всё ок (это бот).
7. **Privacy notice** под кнопкой: «Отправляя форму, вы соглашаетесь с обработкой персональных данных» + ссылка на /privacy.

### API-клиент (src/lib/api.ts)

```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export type FeedbackResponse = { id: string; status: string; created_at: string };
export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
};

export async function submitFeedback(input: FeedbackInput): Promise<FeedbackResponse> {
  const res = await fetch(`${API_BASE}/api/feedbacks/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as { error?: ApiErrorPayload } | null;
    throw new ApiError(res.status, payload?.error);
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, public payload?: ApiErrorPayload) {
    super(payload?.message ?? `HTTP ${status}`);
  }
}
```

---

## 8. Сборка в Docker

Двухстадийный билд, рантайм — `nginx:alpine`. Конфиг nginx раздаёт `dist/` со всеми
правильными MIME, gzip, кэшем для статики и fallback на `index.html` для SPA-роутинга.

### Dockerfile (схема)

```dockerfile
# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# VITE_API_BASE_URL должен прийти как build arg, иначе фронт не узнает куда стучать
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- runtime ----
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
```

### nginx.conf (минимум)

```
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
  gzip_min_length 1024;

  location ~* \.(?:js|css|woff2?|svg|png|jpg|jpeg|webp|avif)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Запуск

```
docker build --build-arg VITE_API_BASE_URL=http://localhost:18080 -t dijex-web .
docker run -d --name dijex-web -p 3000:80 dijex-web
```

Открывается на `http://localhost:3000`. Заявки уходят на бэкенд по URL из build arg.

### CORS — важно

Бэкенд (этот проект) уже отдаёт CORS-заголовки `Access-Control-Allow-Origin: *` через
middleware. При смене origin фронта (например, продакшен-домен) ничего на бэке менять
не нужно — но проверить, что preflight (`OPTIONS`) проходит.

---

## 9. Стандарты качества

### Производительность

- **Lighthouse**: ≥ 90 по Performance, Accessibility, Best Practices, SEO.
- Все изображения — формат WebP/AVIF, с явным `width`/`height` (избегать CLS).
- Шрифты — `font-display: swap`.
- Critical CSS inline'ить (Vite делает это сам через CSS code splitting).
- Code splitting по route (когда роуты появятся).
- Никаких блокирующих скриптов в `<head>`.

### Доступность (a11y)

- Семантический HTML: `<header> <main> <section> <footer>`, заголовки идут по иерархии без пропусков.
- Все интерактивы достижимы клавиатурой (`tab` order логичный), `:focus-visible` стили видимы и контрастны.
- Иконочные кнопки — с `aria-label`.
- Контраст текста ≥ AA (WCAG 2.1).
- Формы: каждое поле имеет `<label>`, ошибки связаны через `aria-describedby`, инвалидные поля помечены `aria-invalid`.
- Reduced motion соблюдается.

### Адаптивность

- Mobile-first вёрстка.
- Breakpoints (Tailwind дефолтные): `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`.
- Тестировать на 360px (минимум), 768px, 1280px.
- Touch targets ≥ 44×44px.

### Код

- **TypeScript strict** в `tsconfig.json` (`strict: true`, `noUncheckedIndexedAccess: true`).
- **ESLint**: ошибки = красный pre-commit. Никаких `// @ts-ignore`, `any`, `as unknown as` без комментария-причины.
- **Prettier** настроен, форматирование автоматическое.
- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
- Компоненты с пропсами — типы через `type Props = { ... }`, не `interface`.
- Никаких `React.FC` — просто функции с типизированными пропсами.

### Тесты (минимум)

- Unit-тесты на Zod-схему (валидные/невалидные значения).
- Один интеграционный тест на форму: рендерится, валидируется, отправляет fetch, обрабатывает 422 / 500.

---

## 10. Переменные окружения (.env.example)

```
VITE_API_BASE_URL=http://localhost:18080
```

Никаких секретов на фронте — в `.env*` файлах только URL'ы и публичные ключи.
`.env*.local` — в `.gitignore`. В Docker значение приходит через `--build-arg`.

---

## 11. Чеклист готовности

Агент считает работу завершённой только если выполнены все пункты:

- [ ] Проект собирается локально: `npm install && npm run dev` запускает Vite, страница открывается без ошибок в консоли.
- [ ] `npm run build` создаёт `dist/` без warnings и type-errors.
- [ ] `npm run lint` проходит чисто.
- [ ] `npm run test` (Vitest) — все тесты зелёные.
- [ ] `docker build -t dijex-web .` собирается; `docker run -p 3000:80 dijex-web` поднимает сайт на 3000.
- [ ] При запущенном бэкенде (`http://localhost:18080`) форма отправляет заявку, в БД появляется запись (проверка через adminer), пользователь видит success-состояние.
- [ ] Невалидные данные в форме блокируют submit с inline-ошибками.
- [ ] Сервер вернул 422 с `details` — ошибки распределены по полям формы.
- [ ] Lighthouse в Chrome DevTools (Incognito, mobile preset) ≥ 90 по всем категориям.
- [ ] На 360px ширине нет горизонтального скролла, всё читаемо.
- [ ] Клавиатурная навигация — пройти всё `tab`'ом, focus-стили видны.
- [ ] При `prefers-reduced-motion: reduce` все анимации редуцированы или отключены.
- [ ] README в проекте фронтенда описывает: stack, как запустить, как собрать в Docker, какие env-переменные нужны.

---

## 12. Что НЕ делать (anti-patterns)

- ❌ Не использовать `<a href="#section">` без `event.preventDefault()` + плавный скролл — будут резкие переходы.
- ❌ Не размещать тяжёлые видео/3D в hero без lazy-load.
- ❌ Не хардкодить URL бэкенда — только через `import.meta.env.VITE_API_BASE_URL`.
- ❌ Не отправлять форму, если идёт уже один запрос (двойной клик).
- ❌ Не использовать `alert()` / `confirm()` для UX-сообщений — только кастомные тосты/модалки.
- ❌ Не складывать всю логику в `App.tsx` — каждая секция должна быть отдельным компонентом.
- ❌ Не подключать сторонние шрифты с CDN Google — только self-hosted через `@fontsource`.
- ❌ Не использовать inline-стили (`style={{...}}`), кроме случаев с динамическими значениями (например, `transform: translateY(${y}px)`).
- ❌ Не оставлять `console.log` в коде после отладки.

---

## 13. Полезные ссылки

- Бэкенд этого проекта: `https://github.com/YuriyDubinin/dijex-api`
- Эндпоинт заявок: `POST /api/feedbacks/requests` (детали — в README бэкенда).
- Health: `GET /api/ping` — можно использовать для проверки доступности API в дев-режиме.

---

**Версия документа:** 1.0
**Целевая аудитория:** AI-агент или разработчик, начинающий фронтенд Dijex с нуля.

---

## 14. Актуальная архитектура (после расширения контента и мультиязычности)

> Разделы выше — исходный бриф. Этот раздел описывает, как проект устроен сейчас; при расхождении верен он.

- **Языки:** en (fallback и эталон), ru, th, zh (упрощённый), ja, fr, de. Определение: выбор пользователя
  (localStorage `dijex.locale`) → `?lang=` → языки браузера → регион по часовому поясу → en (`src/i18n/detectLocale.ts`).
- **Тексты — только в JSON:** `src/locales/<lang>/{common,home,solutions,form,meta,legal}.json`. В компонентах и
  `src/content/*` пользовательского текста нет. Поддерево секции читается через `useContent(ns, key)`, строки — через `t()`.
- **Структура контента** (id, порядок, иконки, картинки, числа) — `src/content/**`. Иконки по ключу — `components/ui/iconMap.ts`.
- **Новый текст** добавляется во все 7 локалей с одинаковыми ключами — это проверяет `src/locales/locales.test.ts`.
- **Картинки** — только через `<ImageSlot image="…">` с ключом из `src/content/images.ts`; файлы — в `public/images/`.
  Чек-лист: `npm run images:check`.
- **Цвета** — RGB-каналы в CSS-переменных (`--accent-primary: 99 102 241`), поэтому работают `bg-accent-primary/10`.
- **`cn()`** знает кастомную шкалу шрифтов (`text-small`, `text-body`, …) — не заменять на голый `twMerge`.
- Шрифты Noto (th/zh/ja) грузятся динамически только для этих языков (`src/i18n/fonts.ts`).
- Что нужно уточнить у владельца и вычитать носителям — `docs/i18n-todo/`.

---

## 15. Движение (анимации и эффекты)

- **Токены** — `src/motion/tokens.ts`: `DURATION`, `EASE`, `SPRING`, `STAGGER`, `DISTANCE`, `gridWaveDelay` / `gridRadialDelay`.
  Никаких «магических» длительностей и кривых в компонентах.
- **Уровни** — `useMotionTier()`: `full` (всё), `lite` (без WebGL, параллакса, курсорных эффектов, sticky-сцен),
  `off` (prefers-reduced-motion или `?motion=off` — контент сразу виден). Слабое устройство / экономия трафика /
  тач < 768px → `lite`. Шейдер сам понижает уровень, если не держит FPS (`downgradeMotionTier`).
  Для QA: `?motion=full|lite|off` (запоминается на сессию), в dev — бейдж уровня в углу.
- **Примитивы** (`src/motion/`): `Reveal` (fade-up / blur-up / clip-up / scale-in), `SplitText` (слова из маски,
  сегментация через `Intl.Segmenter` для th/ja/zh), `ScrambleText`, `Odometer`, `DrawCheck`, `Tilt`, `SpotlightGroup`
  (карточкам — `data-spotlight` + класс `.spotlight`), `useMagnetic` (кнопки `size="lg"` — автоматически),
  `BrandIntro` (интро, 1 раз за сессию).
- **Правила**: анимировать только transform / opacity / clip-path / filter; бесконечные анимации — только пока элемент
  в viewport (`useActiveInViewport`) и вкладка видима; курсорные эффекты — только `(pointer: fine)`;
  заголовок hero не стартует с opacity 0 (маска), чтобы не ухудшать LCP; SVG-атрибуты (`width`, `y1`…) не анимировать —
  только `scale` / `pathLength`.
- **Переходы**: между страницами — View Transitions (data-роутер, `Link viewTransition`); общие элементы —
  `view-transition-name: solution-icon-*` / `solution-visual-*`. Смена языка — View Transition с размытием
  и сохранением позиции прокрутки (`useLocale`).
- **Отладка**: `window.__motionDebug.activeLoops` (dev) — сколько бесконечных циклов сейчас крутится.
