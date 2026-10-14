# zh (Simplified Chinese) — review checklist

Items a native zh-Hans reviewer should double-check.

## Claims / legal

- `home:security.items.compliance.text` — Mentions 《个人信息保护法》（PIPL） first, then GDPR. Legal should confirm that we can actually claim PIPL-aware design (cross-border transfer rules, data localisation).
- `home:hero.stats[1]`, `home:support.stickers.languages`, `home:results.rows.languages.after`, `home:faq.items.languages.a`, `solutions:supportAgent.capabilities.items.languages.title` — "30+ 种语言" is an unverified product claim.
- `home:support.stickers.response`, `home:results.metrics.reply`, `solutions:supportAgent.metrics.reply` — "< 5 秒" / suffix " 秒" response time is an unverified claim; check how the metric renders (number + " 秒").
- `home:cases.items.aiAssistant.result` — "60%" figure kept from en; confirm it can be published.
- `home:hero.stats[2]` — "10+ 个渠道" unverified claim.
- `legal:privacy.paragraphs` — Placeholder text; the final privacy policy for China needs PIPL-compliant wording reviewed by legal.
- `form:privacyNotice` — "同意我们处理您的个人信息" — under PIPL, separate consent may be required; legal review.

## Terminology

- `common:solutions.aiOrchestrator.title` (and everywhere) — "AI 编排器" chosen for "AI orchestrator"; alternative "AI 调度中枢". Confirm brand preference.
- `common:solutions.supportAgent.title` (and everywhere) — "智能体" for "agent"; "坐席" for "operator". Confirm consistency with market usage.
- `home:orchestrator.features.security.description`, `home:security.items.perimeter.*`, `home:faq.items.data.a`, `solutions:digitalProcesses.*` — "内网环境" for "your perimeter"; alternative "私有化部署环境".
- `home:orchestrator.columns.core.items.guardrails`, `solutions:aiOrchestrator.capabilities.items.guardrails.title` — "护栏" for "guardrails"; check it reads naturally to B2B buyers.
- `home:orchestrator.columns.systems.items.erp` — "ERP / 1C" kept as in en; 1C is barely known in China — consider replacing with "ERP / 用友 / 金蝶" (requires product decision).
- `home:orchestrator.columns.systems.items.helpdesk`, `home:integrations.groups.crm` — "工单系统" used for "Helpdesk".
- `common:solutions.digitalProcesses.title`, `form:subjects.digitalProcesses` — "数字化流程优化".
- `form:subjects.turnkey`, `home:engagement.items.turnkey.title` — "交钥匙实施"; alternative "一站式实施".
- `home:about.metrics.*` — Labels rendered after a number ("年行业经验", "个已交付项目", "家合作客户", "项技术栈"); check the layout reads well, e.g. "5+ 年行业经验".
- `home:cases.items.newsFeeder.metrics.languages`, `home:cases.items.aiAssistant.metrics.automated` — Same: label follows a number; verify grammar in context.
- `home:results.metrics.*.label`, `solutions:supportAgent.metrics.*.label` — Labels like "的请求无需人工即可解决" follow "60%"; verify the rendered phrase.
- `home:support.chat.via` — "来自 {{channel}}"; check in context.
- `home:faq.items.channels.a` — "WeChat（微信）"; VK, Viber, LINE, Facebook Messenger, Instagram, WhatsApp, Telegram are not widely available in mainland China — consider whether to reorder or add domestic channels (product decision).
- `home:faq.items.teamLanguages.a` — "中文" — confirm whether Traditional Chinese is also offered.
- `solutions:supportAgent.cta.title` — "a couple of weeks" rendered as "两三周内".
- `home:hero.badge` — Kept in English per instructions; confirm this is desired for zh users.
