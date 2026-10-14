# Thai (th): items for native review

Have a native Thai speaker review all six files (`src/locales/th/*.json`). This is a machine-assisted translation. The items below are the specific points that need checking.

## Claims and legal wording

- `home:security.items.compliance.text` — "ออกแบบโดยคำนึงถึง PDPA ของไทย, GDPR และกฎหมายคุ้มครองข้อมูลในแต่ละประเทศ". The meaning is "designed with … in mind", not "compliant with". Legal should confirm it, and decide whether to spell out "พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA)".
- `form:privacyNotice`, `legal:privacy.paragraphs[1]` — the consent wording ("ยินยอมให้ประมวลผลข้อมูลส่วนบุคคล"). Check it against PDPA consent requirements and the final privacy policy.
- `home:hero.stats[1]`, `home:support.stickers.languages`, `home:solutions.cards.supportAgent.bullets[1]`, `home:results.rows.languages.after`, `solutions:supportAgent.capabilities.items.languages.title` — "30+ ภาษา" is an unverified claim. The FAQ (`home:faq.items.languages.a`) says "มากกว่า 30 ภาษา". Check that the two are consistent.
- `home:support.stickers.response` — "ตอบภายใน < 5 วินาที". The "< 5 s" claim is unverified. "ภายใน" combined with "<" is slightly redundant, so consider "ตอบภายใน 5 วินาที".
- `home:results.metrics.reply`, `solutions:supportAgent.metrics.reply` — suffix " s" became " วินาที". Check how "<5 วินาที" renders in the metric tile and whether the count-up layout fits.
- `home:results.metrics.always.label`, `solutions:supportAgent.metrics.always.label` — these labels render under "24/7". Check that they read naturally.
- `home:results.metrics.automated.label`, `solutions:supportAgent.metrics.automated.label`, `home:cases.items.aiAssistant.metrics.automated` — these labels start with "ของ…" to follow a "NN%" number. Check that they read naturally under the number.
- `home:cases.items.aiAssistant.result` — "60%" is a client case claim. Confirm it can be stated publicly.
- `home:about.metrics.*` — short labels shown under numbers ("ปีในตลาด", "ลูกค้าในพอร์ตโฟลิโอ", and so on). Check the tone.
- `home:faq.items.teamLanguages.a` — check that communication in Thai is actually staffed.

## Terminology choices

- Global: "messengers" is translated as "แอปแชท", and "messaging platform" as "แพลตฟอร์มแชท". "แมสเซนเจอร์" or "แพลตฟอร์มส่งข้อความ" are alternatives.
- Global: "operator" is translated as "โอเปอเรเตอร์". Consider "เจ้าหน้าที่" instead, which is more common in Thai customer service.
- Global: "perimeter" is translated as "โครงสร้างพื้นฐานของคุณ" (your infrastructure). Check that this is acceptable or whether you prefer "ภายในเครือข่ายขององค์กร".
- Global: "scenario" is translated as "สถานการณ์ใช้งาน" or "สถานการณ์". Consider "ยูสเคส" or "กรณีใช้งาน".
- Global: "lead qualification" is translated as "คัดกรองลีด". Check that this is common enough for B2B readers.
- `common:solutions.digitalProcesses.title`, `meta:digitalProcesses.title`, `form:subjects.digitalProcesses` — "ยกระดับกระบวนการดิจิทัล" for Digital Process Optimisation. "เพิ่มประสิทธิภาพกระบวนการด้วยดิจิทัล" is an alternative.
- `common:solutions.aiOrchestrator.title`, `meta:aiOrchestrator.title` — the "AI Orchestrator" product name is kept in English. "AI orchestrator" and "orchestrator" also appear in English inside Thai sentences. Decide whether to transliterate it as "ออร์เคสเตรเตอร์".
- `home:hero.badge` — kept in English (required).
- `home:orchestrator.features.humanInLoop.title`, `solutions:aiOrchestrator.capabilities.items.human.title`, `solutions:aiOrchestrator.capabilities.items.observability.title`, "Guardrails" — left in English. Decide whether to add a Thai gloss.
- `home:orchestrator.columns.agents.title` — "ผู้ดำเนินการ" for Executors. This is a little stiff.
- `home:orchestrator.columns.systems.items.erp` — "ERP / 1C" is kept from en. Thai readers won't know 1C, so consider changing the source content.
- `common:nav.cases`, `home:cases.*` — "ผลงาน" for Cases. "กรณีศึกษา" is an alternative.
- `common:breadcrumbs.label` — "เบรดครัมบ์" is screen-reader-only text. "เส้นทางนำทาง" may be clearer.
- `common:language.hint` — "เราตั้งค่าภาษาเป็น {{name}} ตามภูมิภาคของคุณ". This was reworded so it reads well whatever language name is substituted.
- `common:footer.tagline`, `meta:home.title` — "AI orchestration" is left in English mid-sentence.
- `home:security.deployment.options.cloud.text` — "แบบ managed" is a loanword mix.
- `solutions:labels.painsTitle` — "คุ้น ๆ ไหม?" is casual. Check that it fits the brand tone.
- `solutions:supportAgent.cta.title` — "ภายในไม่กี่สัปดาห์" for "in a couple of weeks". Check that it is consistent with the 2–4 week pilot claims.
- `form:fields.*.placeholder` — Thai name, email and phone samples ("สมชาย ใจดี", "somchai@company.co.th", "+66 81 234 5678").
- `common:footer.copyright` — "© {{year}} Dijex สงวนลิขสิทธิ์".

## Typography

- Check line breaking: Thai has no spaces between words, so long headings (for example `home:hero.titleAlt` and `solutions:supportAgent.hero.title`) may wrap badly. Consider `word-break`/ICU segmentation or adding `<wbr>`.
- The questions in `faq` end with "?". Thai often omits the question mark when the question uses ไหม/อย่างไร. Check the preferred style.
