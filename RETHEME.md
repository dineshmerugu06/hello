# RETHEME — Sybiosme → IMPERIUM (mirror-sybiosme clone)

Method (Dinesh's rule, same as CKI → Auction): UI, layout, sections, section order, CSS and JS logic are 100% unchanged. Only content changed: visible text (HTML + JS string-literal/data values) and images swapped in place (same filename, format, exact pixel dimensions). Two local commits, no push.

- Commit 1 `3fbd3cd` — EN homepage (index.html + en.html, media, pricing chunk).
- Commit 2 — everything else: all EN + FR pages, guides, legal identity, meta, JSON-LD, runtime data chunks.
- Baseline: origin HEAD `94a4aba`. Diff vs baseline: **126 files changed** (incl. this file + 3 screenshots). **0 .css files changed. boot.js, fonts/, audio/ untouched.**

## Brand / identity map

| Sybiosme | Imperium |
|---|---|
| SYBIOSME / Sybiosme | IMPERIUM / Imperium |
| Adrien Robert (EI), founder | Merugu Dinesh Kumar, Creator |
| Agathe Leduc, co-founder | Imperium (product) / Imperium Team |
| adrien@ / contact@sybiosme.com | dinesh.merugu.kumar@gmail.com |
| +33 6 86 00 93 66 | +91 93983 59538 |
| Paris | Hyderabad, India |
| SIREN 941 780 165 / SIRET / NAF | removed (fields blanked, never invented) |
| LinkedIn (company + 2 personal profiles) | neutralised to https://www.linkedin.com/ root (+ #imperium / #team anchors to keep list keys unique) — Dinesh's real profile URLs were not in the brief |
| People photos media/team/*.webp | PIL monograms "MD" / "IM" at exact 128×128 (no stock person — would misrepresent) |

## Homepage map (EN + FR)

- Hero: "Your custom website, live in 10 days. A team behind your growth." → "Your career agent, live on your machine. An agent behind your job search." FR: "Votre agent de carrière, sur votre machine. Un agent derrière votre recherche d'emploi." (The giant hero wordmark and tagline render from a JS brand-config object — `wordmark`, `tagline`, `description` mapped in `chunks/C-vTNV__.js` + `assets/reading-7IIZYNPO.js`; timezone Europe/Paris → Asia/Kolkata; origin `url` left as-is, see flags.)
- Our approach → "How Imperium works": local only, no cloud/API keys, tailored resumes, your data yours from day one.
- Our process, in 10 days → "The locked flow": Find Jobs → Generate Resume → ATS Check → Apply → You Submit → Tracked.
- Our work gallery → "The agents": Commander, Job Agent, Resume Studio, Research Agent, Automation Agent, Tracker, Imperium local (captions + alt text).
- Choose. Your plan. — Presence $119 / Growth $249 / Partner $499 per month → **Choose. Your mode.** — **Local Logic / Ollama 3B (qwen2.5:3b) / Ollama 7B (qwen2.5:7b)**, all $0, local, no subscription, no API keys. Every plan/option `amounts:{…}` value in the pricing catalogue chunk (`chunks/DarcP-vb.js`) zeroed for all currencies; configurator verified working in a browser (selecting Ollama 3B shows "Total cost $0"; toggling ATS Scoring keeps $0). Stripe `price_*` IDs are data IDs and cannot be zeroed — see flags.
- Make it yours. Your add-ons. → Research Notes / ATS Scoring / Form Filling — all "Included" / $0.
- Finalise. Your subscription. → Finalise. Your setup.
- FAQ (23 items, categories kept) → Imperium truths: local only, SQLite, Ollama qwen2.5:7b, no cloud, no auto-submit (no submit function exists — the user clicks Submit), real jobs from Remotive / Arbeitnow / Jobicy, profile = single source of truth, guardrail never invents facts, Tracker timeline via SSE. FAQ answers exist in three places and all three were mapped to the same texts: static HTML, the i18n dictionary (`DarcP-vb.js`), the FR source data chunk (`chunks/Ds4jHZlJ.js` — approach/process/gallery/FAQ data, 23 FAQ items + 8 gallery alts + section strings rewritten in French), and the FAQPage JSON-LD (rebuilt from the new pairs). OfferCatalog JSON-LD likewise: modes + add-ons, all prices 0.
- Footer / contact → Merugu Dinesh Kumar, email and phone above, Hyderabad.

## Articles (resources) map

EN guides rewritten in place, structure identical: diy-ai-website-builder → apply-yourself-vs-agent guide; website-subscription-vs-purchase → local-vs-cloud; small-business-website-brief → the profile brief (single source of truth; the interactive brief form and the downloadable brief .txt became the profile brief); switch-website-provider → boards-to-referrals handover; monthly-website-review-checklist → weekly job-search review. Sources re-pointed to real references (Ollama docs, Remotive/Arbeitnow/Jobicy APIs, SQLite docs, Workday). FR articles: same mapping in French — chrome, headings, intros, closers, TOCs, tool tables (Wix→Naukri, WordPress→Workday, Lovable→Greenhouse) and downloads fully mapped; deep mid-body paragraphs are partially mapped (see per-page status).

## Legal pages

Publisher / data controller → Merugu Dinesh Kumar, Hyderabad, India; phone/email above; plan-scope definitions → mode definitions; privacy data list → local-SQLite version. **Full legal rewrite FLAGGED**: clauses inherited from a French website-subscription business (hosting, SIREN-rendered templates in the legal JS chunk `CYmEbMHA`, ICANN/ICO references) were brand/identity-mapped only. Real Imperium legal text must come from Dinesh — no legal facts were invented.

## Images swapped in place (33 files, exact dimensions verified)

- `media/work/1–7.webp` + `1–7-m.webp` and their 14 `.avif` twins (converted from the swapped WebPs): dark office/tech Unsplash photos — photo IDs 1497366216548-37526070297c, 1522071820081-009f0129c71c, 1486312338219-ce68d2c6f44d, 1454165804606-c3d57bc86b40, 1504384308090-c894fdcc538d, 1551434678-e076c223a692, 1519389950473-47ba0277781c (https://images.unsplash.com/photo-<id>).
- `media/options/` 3 × 320×320 WebP: Unsplash 1434030216411-0b793f4b4173, 1484480974693-6ca0a78fb36b, 1517842645767-c639042777db.
- `media/team/adrien.webp`, `media/team/agathe.webp` (128×128): PIL monograms MD / IM.
- NOT swapped (flagged): `media/hero-sphere.webp/.avif` — sprite sheet feeding the WebGL hero (glass spheres, no text; swapping risks breaking the effect). `media/og/sybiosme-*.jpg` — referenced from the origin but the files do not exist in the clone (origin gap).

## Verification (all numbers real, this clone)

- **Site-wide visible-text sweep, all 55 HTML files: 0 hits** for Sybiosme/SYBIOSME/Presence/Growth/Partner/Présence/Croissance/Partenaire/"live in 10 days"/$119/$249/$499/Wix/WordPress/Lovable/Adrien/Agathe. Remaining "subscription/abonnement" words occur only inside the new Imperium text as negations ("no subscription"). Meta-description/og sweep: 0 (excluding sybiosme.com URLs, see flags). JSON-LD sweep: clean (names, phone, SIREN/SIRET, OfferCatalog prices, knowsAbout).
- **Structure proof**: tag totals, per-tag counts, section ids and full id sets of index.html identical to baseline (2,018 opening tags; section ids top/approach/options/checkout); spot-proofs match on fr.html, en/terms, en brief article, fr creer article, en/book. `index.html` and `en.html` byte-identical after every pass.
- **JS discipline**: 36 JS files changed vs baseline, all pass `node --check`. All JS edits were exact string-literal/data-value swaps (an early plain-substring pass corrupted identifiers — `Logotype`, font name `SYBIOSME-Numerals` — and was fully reverted/fixed; font requests verified back to the origin names at runtime). One runtime regression was caught and fixed during verification: identical LinkedIn hrefs in the footer team data crashed a Svelte keyed each (`each_key_duplicate`) — hrefs made unique with inert anchors.
- **Browser (local serve + headless Chromium, rethemed vs pristine baseline)**: homepage, book, brief article, FR homepage load 200; H1 correct; configurator works ($0 totals); runtime DOM in EN and FR shows the new approach text, agent gallery alts, FAQ answers and nav/footer labels, with no visible "Sybiosme" in rendered elements; FAQ pairing visually confirmed from a screenshot. Error profile matches the pristine baseline (pre-existing `import.meta` pageerror from boot.js under this serving setup; contact-form POST returns 501 on a static server — mirror limitation; one pre-existing missing `media/og/` file on the origin).
- **Assets**: homepage's 73 local references resolve; the only "missing" two (`en%3Flanguage=set.html`, `fr%3Flanguage=set.html`) are identical in the pristine mirror (pre-existing quirk).
- Screenshots: `retheme-homepage.png` (hero), `retheme-inner.png` (brief article), `retheme-faq.png` (FAQ + contact card).

## Per-page status

| Page | Status |
|---|---|
| index.html / en.html (EN home) | Done — text, images, runtime data, JSON-LD |
| fr.html (FR home) | Done — same, in French |
| en/fr about, book, login, 404, sitemap | Done (labels/content; login & account pages are non-functional shells in the mirror) |
| en resources index + 5 articles | Done — full rewrite to Imperium guides |
| fr resources index + 5 articles | Done with flag — chrome/headings/intros/closers/tables/downloads mapped; some deep mid-body paragraphs still discuss websites in French (brand/plans/prices/tools are 0) |
| en/fr privacy, terms, legal notice, cookies | Done with flag — identity/contact/scope mapped; full legal rewrite needs Dinesh's own legal text |
| Account-area runtime chunks (nodes 3, 5, 8, 12, 17, 27…) | Partially mapped — client-area strings ("Your website is live", questionnaire prompts) remain in a non-functional area of the mirror |

## Unresolved / flagged (plainly)

1. Stripe `price_*` IDs in the pricing catalogue are data IDs and cannot be zeroed; the static mirror has no checkout backend (forms render, cannot submit — same limitation as the Auction mirror's forms).
2. `media/hero-sphere.webp/.avif` not swapped (WebGL sprite sheet).
3. `media/og/` cover files missing from the clone itself (origin gap); og:image/canonical/og:url and font URLs remain absolute `www.sybiosme.com` URLs — the mirror's own convention; no Imperium domain exists in the brief to point them at. Internal identifiers left by design: font name `SYBIOSME-Numerals`, file names (`media/team/adrien.webp`), plan ids (`plan-presence` etc.), the `sybiosme_measure` analytics key.
4. Legal pages: full rewrite needs Dinesh's own legal text (see Legal pages).
5. FR article deep bodies partially mapped; EN subscription article standfirst keeps a generic purchase-vs-subscription framing sentence (no brand/plan words).
6. Social links neutralised to linkedin.com root — Dinesh's real profile URLs were not supplied.
7. FAQ answers in the JS data chunk are single-paragraph (the origin used multi-paragraph breaks); content identical, paragraph breaks flattened.
