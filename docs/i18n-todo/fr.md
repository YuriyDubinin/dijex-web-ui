# FR — points to review

Typography: U+202F (narrow no-break space) before ; : ! ? % and inside « », typographic apostrophe ’ throughout.

## Claims to verify (kept as in EN)
- `home:hero.stats[1]`, `home:support.stickers.languages`, `home:results.rows.languages.after`, `solutions:supportAgent.capabilities.items.languages.title` — « 30+ langues » : confirm the real number of supported languages.
- `solutions:supportAgent.languagesDemo.more` — « et 20+ autres » : consistent with 30+ only if the demo shows ~10 languages.
- `home:hero.stats[2]` — « 10+ canaux » : confirm.
- `home:support.stickers.response`, `home:results.metrics.reply` — « < 5 s » first response time: confirm.
- `home:cases.items.aiAssistant.result` — « 60 % » of first-line requests automated: confirm with the client case.
- `home:security.items.compliance.text` — mentions RGPD and local data-protection laws; « Conçu dans le respect du RGPD » should not be read as a certification — legal review recommended.
- `home:faq.items.teamLanguages.a` — lists EN, RU, FR, DE, JA, ZH, TH: confirm it matches the locales actually shipped.

## Wording choices
- `home:hero.stats[0]` — EN “24/7, no days off” rendered as « 24/7, sans interruption » (avoids the anglicism « jour off »).
- `solutions:supportAgent.cta.title` — EN “in a couple of weeks” rendered as « en quelques semaines » (less committal than « deux semaines »); adjust if a firm timeline is wanted.
- `common:footer.tagline`, `meta:home.description`, `home:about.lead` — “mid-sized and large businesses” rendered as « ETI et grands comptes » (standard French B2B segments); alternative: « entreprises de taille moyenne et grandes entreprises ».
- `common:nav.cases`, `home:cases.eyebrow` — “Cases” → « Réalisations » (alternative: « Cas clients »).
- `common:nav.process`, `home:process.eyebrow` — “Process” → « Méthode ».
- `common:solutions.digitalProcesses.title`, `meta:digitalProcesses.title` — shortened to « Optimisation des processus » (without « numériques ») for layout; check it still reads clearly.
- `home:processes.tabs.messaging.tab` — shortened to « Messageries » for the tab width.
- `home:orchestrator.columns.agents.title` — “Executors” → « Exécutants »; alternative « Agents ».
- `home:orchestrator.columns.systems.items.erp` — « ERP / 1C » kept from EN; 1C is little known in France, consider replacing (e.g. « ERP / SAP »).
- `home:orchestrator.features.humanInLoop.title`, `solutions:aiOrchestrator.capabilities.items.human.title` — « Humain dans la boucle » (literal of human-in-the-loop); acceptable in tech French, could keep the English term.
- `solutions:aiOrchestrator.pains.hallucinations` — “off the top of their head” → « au hasard »; alternative « à l’aveugle » / « hallucinent ».
- `solutions:labels.painsTitle` — « Ça vous parle ? » is informal-friendly; alternative « Vous vous reconnaissez ? ».
- `home:engagement.items.turnkey.title` — « Clés en main » (EN “Turnkey implementation”), shortened for card width; `form:subjects.turnkey` uses the full « Déploiement clés en main ».
- `home:results.metrics.*.label`, `solutions:supportAgent.metrics.*.label` — labels start with « des / de » so they read after the number (« 60 % des demandes… », « 24/7 de disponibilité ») — check the rendered result.
- `home:results.metrics.automated.suffix`, `solutions:supportAgent.metrics.automated.suffix` — "%" → " %" (French style); revert to "%" if the counter layout breaks.
- `home:about.metrics.technologies` — “technologies in the stack” → « technologies maîtrisées ».
- `legal:privacy.paragraphs` — placeholder text; the final privacy policy must be drafted by a lawyer to comply with RGPD/CNIL requirements.
