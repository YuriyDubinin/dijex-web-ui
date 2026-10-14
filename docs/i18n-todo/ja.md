# Japanese (ja): items for native review

## Claims and wording to check

- `home:security.items.compliance.text`: confirm that the APPI wording is legally acceptable ("日本の個人情報保護法（APPI）、GDPR、各国のデータ保護法を考慮して設計"). It says "designed with … in mind", not "compliant with". Legal should approve this before launch.
- `home:hero.stats[1]`, `home:support.stickers.languages`, `home:solutions.cards.supportAgent.bullets[1]`, `solutions:supportAgent.capabilities.items.languages.title`: "30+言語" is an unverified claim. The FAQ (`home:faq.items.languages.a`) says "30以上の言語" instead. Check that the two forms are consistent and that the claim is accurate.
- `home:support.stickers.response`, `home:results.metrics.reply`, `solutions:supportAgent.metrics.reply`: "5秒以内に返信" and "<" + "秒" (suffix changed from " s" to "秒"). The claim is unverified. Also check how "<5秒" looks when rendered.
- `home:results.metrics.always.label`, `solutions:supportAgent.metrics.always.label`: these render after "24/7" ("サポート対応" / "対応"). Check that they read naturally under the number.
- `home:about.metrics.*`: rewritten as standalone labels shown under "4+", "57+" and so on: 事業年数, 完了したプロジェクト, ポートフォリオの取引社数, 技術スタックの技術数. Check the tone. "取引社数" could also be "導入企業数".
- `home:cases.items.aiAssistant.result`: "60%" is a client case claim. Make sure it can be stated publicly in Japan, where 景品表示法 applies to claims like this.
- `home:hero.stats[0]`: "24時間365日、休みなし" might be redundant; "年中無休" is an alternative.
- `home:engagement.popular`: "人気No.1" is a superlative claim. If it isn't backed by data, "おすすめ" is safer.
- `form:privacyNotice`, `legal:privacy.paragraphs[1]`: "個人情報の取り扱いに同意したものとみなされます". Check this against the APPI consent requirements and the final privacy policy.

## Terminology choices

- `common:solutions.supportAgent.title` (and the related titles in meta and form): "24時間365日対応サポートエージェント" is long, so check it in the header and menu. A shorter option is "24/7サポートエージェント".
- `common:solutions.digitalProcesses.title`, `meta:digitalProcesses.title`: "業務プロセスのデジタル最適化". "業務DX" is an alternative that's common in the Japanese market.
- `common:nav.process`, `home:process.*`: "進め方" for Process. "導入の流れ" is an alternative.
- `home:process.steps.audit.title`: "現状分析" for Audit. "アセスメント" or "業務診断" are alternatives.
- `home:orchestrator.columns.agents.title`: "実行者" for Executors is a bit stiff. "実行エージェント" is an alternative.
- `home:orchestrator.columns.systems.items.erp`: "ERP / 1C" is kept from en. 1C is a Russian ERP that Japanese readers won't recognize. Consider changing the en/ja source content.
- `home:orchestrator.features.humanInLoop.title`, `solutions:aiOrchestrator.capabilities.items.human.title`: "Human-in-the-loop" is left in English. Decide whether to add "（人による確認）".
- `home:support.scenarios[3]`, `home:industries.items.realEstate.tasks[0]`: "リードの選別" for lead qualification. "見込み顧客の選別" is an alternative.
- `home:processes.tabs.portals.*`: "マイページ" is used for personal account or client account. Check that it is consistent with "顧客ポータル".
- `common:images.processesMessagingPlatform` and others: "統合受信箱" for unified inbox. "統合インボックス" is an alternative.
- `home:integrations.lead`: "技術スタックはタスクに合わせて選びます。その逆ではありません。" is close to the English and may read as a calque.
- `solutions:supportAgent.cta.title`: "2週間ほどで" is used for "a couple of weeks". Check that it is consistent with the 2–4 week pilot claims.
- `home:faq.items.teamLanguages.a`: lists the languages of the site and communication. Check that Japanese communication is actually staffed.
- `common:footer.copyright`: "All rights reserved." is left in English, which is common on Japanese corporate sites.

## Demo chat in `src/content/home/support.ts` (not edited)

- `support.ts:hotel-ja` (LINE scenario): the Japanese is natural overall. Suggested polish:
  - Customer: "今週の土曜日、2名で1泊の空室はありますか？" is fine.
  - Agent: "はい、ございます！…" → "はい、空室がございます。ダブルルームとツインルームをご用意できます。朝食付きプランもご案内いたしましょうか？" The bare "ございます！" with an exclamation mark is a little abrupt for hotel keigo, and "空いております" is a bit colloquial.
  - Customer: "ツインで、朝食付きでお願いします" is natural. A "。" could be added at the end.
  - Agent: "かしこまりました。ご予約を確定しました。確認メールをお送りします 😊" → "かしこまりました。ツインルーム・朝食付きでご予約を承りました。確認メールをお送りいたします😊" This is more polite (承りました / いたします), and Japanese usually has no space before an emoji.
- `support.ts:AGENT_GREETINGS.ja`: "こんにちは！ユカです。ご用件をお聞かせください。" is natural, but it writes the name in katakana as "ユカ" while the UI uses "Yuka" (`home:support.chat.agentName`). Pick one form. Suggested: "こんにちは！Yukaです。本日はどのようなご用件でしょうか？" This is softer than "お聞かせください".
