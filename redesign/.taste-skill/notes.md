# Imperium redesign — ROUND 2 (BOLD redo) working notes

## Why round 2 exists
Round 1 (dark-room, seed 320538270) was REJECTED by Dinesh: "total shit" — too
empty, static, sparse. His choice for the redo: "Redo it bold — big type, motion,
rich media" + "maintain standards in ui". His standards outrank the inspector:
websites are EXPERIENCES — sections move/react/journey on scroll, cinematic,
sharp full-res media, 2–3 strong colours, zero generic templates. Benchmarks:
the original Sybiosme site itself, Active Theory, katana. A static page is a
failed page. No deliberate voids anywhere.

## BEFORE (reused from round 1, not re-run)
- inspect.mjs on the current live UI: 12 FAIL, 6 WARN at 1440/768/390
  (.taste-skill/before/report.json + screenshots).
- Hero wordmark "IMPERIUM" 345px/24vw; h1 tagline wraps 4 lines @1440 (FAIL);
  13 font sizes; grey body text 4.9:1 @768; FAILs: headline-lines ×3, numbering,
  gradients ×3, gradient-text ×2, shadows ×4, hairlines ×28, outlined boxes ×4,
  icon-card rows ×2, small text ×10, off-centre frame. Motion: 14 elements;
  real pictures: 7 (the swapped work photos, media/work/*.webp 1328×876).

## ARGUMENT (reused from round 1 — claims → proof, page order)
1. Hero — Imperium is a career agent that runs on your machine and costs $0.
2. Intro / How it works — everything stays local: one SQLite file; Ollama on your
   machine or plain deterministic logic; no cloud, no API keys, no subscription.
3. The locked flow — one fixed sequence an application cannot skip:
   Find Jobs → Generate Resume → ATS Check → Apply → You Submit → Tracked.
   "You Submit" is the only accent state, because only the user can pass it.
4. The agents — six specialists under one Commander, each with its real job.
5. Choose your mode — the brain is the only choice; everything else identical, $0.
   THE LIVE THING: configurator (mode select + add-on toggles, total stays $0,
   readout of what the brain does, mailto action carrying the selection).
6. FAQ — all 23 real questions, verbatim answers (faq.json, from the page's
   FAQPage JSON-LD).
7. CTA — stop paying for your own job search; run it on your machine.
8. Footer — Merugu Dinesh Kumar, dinesh.merugu.kumar@gmail.com, +91 93983 59538,
   Hyderabad. Name returns full width.

## SUBJECT INVENTORY (reused from round 1)
Local-only machine agent · one SQLite file as single source of truth · NO submit
function in the code, not even a disabled one · the locked flow state machine ·
profile = source of truth + guardrail stripping non-profile facts · swappable
brain (Local Logic / Ollama qwen2.5:3b / qwen2.5:7b), $0 each · real jobs from
Remotive, Arbeitnow, Jobicy with a filter report per search · Tracker timeline
by Server-Sent Events the moment the DB changes · blocked fields named (CAPTCHA,
password, OTP, unknown) · stale flagged after 7 days, closed jobs marked closed ·
ATS scored against the exact JD, re-scored per edit · made by one person in
Hyderabad.

## DRAWS THIS ROUND (all recorded)
- Options (tone bold): sentence-as-layout / editorial-report / type-only-statement.
  type-only-statement rejected: type-only first screen = no media field, against
  the brief. sentence-as-layout rejected after full deal: its hero blueprint is
  "about 85% empty" — a composed void, exactly what was rejected in round 1.
- CHOSEN: editorial-report ("The printed annual"), full sheet dealt seed
  1115472750: hero = Two-by-two board; intro = Headline crossing onto a
  photograph; how-it-works = Call and response column; features = Panel with
  margin notes; pricing = Plans as a large table; faq = Answers as reading text;
  cta = Three photographs, then a field; footer = Columns above, wordmark below;
  motion = Shutter image; scenes: none dealt.
- A re-deal of editorial-report (seed 1469107252) dealt a different hero ("View
  with two cards in the corner", headline capped 3.9vw — contradicts the brief's
  wordmark-scale type); its one permitted hero redraw dealt "Void, then statement
  on axis" — a deliberate void, banned by the brief. Both rejected for those
  stated reasons; the first dealt sheet (1115472750) is the adopted record
  (.taste-skill/direction.json).
- App fragments: "Achromatic ledger", seed 936577015 (kind builder, keep
  palette,type). Mapped: chrome achromatic, the one hue = brand accent #fe4701
  on the main data element; figures in the brand's Sybiosme Numerals face
  instead of a monospace (brand-true, avoids the mono tell).

## IDEA
> On this page, **the locked flow — the state machine no application can skip,
> whose one accent-coloured state only the user can pass** — becomes **a printed
> machine record: a two-colour annual whose masthead board carries the name at
> full scale beside its world in photographs, whose flow is stamped down a
> column state by state, and whose accent falls only where the human acts**.

Competitor test (from round 1, still holds): myjobb.ai submits for you — it
cannot print a ledger whose central state it is forbidden to pass.

## Content-governed adjustments (recorded)
- Flow: six exchanges, not the blueprint's three — the real flow has six states
  (round-1 precedent: slider 4→6 stops). The sixth response (Tracked) is the
  breakout "finished result": a wide live-timeline fragment.
- Hero name size: blueprint's 12.5vw cannot fit an 8-letter name in a half-width
  tile; set in vw against the tile and verified in screenshots.
- CTA portrait: no honest portrait of the maker exists; the corner carries his
  initials "MD" set in the brand face on an ink tile (drawn from the subject),
  not a stock face.
- Footer middle row: blueprint leaves it empty; it carries the six-state flow
  line (house rule — no blank stretch over half a screen — outranks blueprints).
- Photographs: the sheet offers a "Water" atmosphere set (picsum) — NOT used.
  The project's own swapped work photographs rank first in the sheet's own
  preference order and are this subject's world on the current live site.
  All photographs get one treatment: greyscale, contrast 1.05 (the direction's
  mosaic treatment; two-colour print discipline — paper, ink, one accent).

## COPY DECK (headlines ≤2 lines at every width)
- Hero board: name tile "IMPERIUM"; dark tile: "A career agent on your own
  machine. It finds real jobs, tailors your resume and fills the forms — for $0."
  accent tile: "Only you can submit. The agent has no submit button."
  Action (top row): "Choose your mode". Links: How it works / The flow /
  The agents / Modes / FAQ.
- Intro H2: "Nothing leaves your machine" — para: "Your profile, your resumes
  and your job history live in one SQLite file on this machine. No cloud, no
  account, no API keys." Practical block: "One SQLite file — profile, resumes,
  applications: a single source of truth you can copy, back up or delete." /
  "A brain on your machine — Ollama qwen2.5:7b, qwen2.5:3b, or plain Local
  Logic when no model is running." / "Nothing to pay, ever — no subscription,
  no API keys, no account. Every capability is in every mode."
- Flow H2: "One flow. No shortcuts." Exchanges (order-word sentences):
  First, it finds real jobs. / Then, it builds the resume. / Then, the score
  is checked. / Then, the form is filled. / Then, you — and only you — submit.
  / Finally, every step is tracked.
- Agents H2: "Six agents, one command" — six margin notes (name + real job),
  Commander console panel between them.
- Pricing H2 (top-left cell): "Choose your mode" — plans Local Logic /
  Ollama 3B / Ollama 7B, $0 each; rows in words; add-on toggles Research Notes /
  ATS Scoring / Form Filling (included, $0); total $0; readout per brain;
  action "Talk to Imperium" (mailto, selection in subject).
- FAQ H2: "Questions, answered straight" — all 23, run-in questions, two
  columns of reading text.
- CTA statement: "Stop paying for your own job search — run it on your machine."
  (the underlined phrase is the mailto link). Lines: "Every mode is $0: no
  subscription, no API keys, nothing to cancel." / contact line.
- Footer: 4 columns (Maker / Contact / Sections / The machine), flow line in
  the middle row, IMPERIUM full width, legal line "© 2026 Merugu Dinesh Kumar ·
  Imperium runs locally. No data leaves your machine."

## TOKENS
--paper:#f4f2ed; --ink:#111111; --ink-2:#1c1c1c; --accent:#fe4701;
--muted-paper:#4d4d48 (on paper); --muted-ink:#b9b9b4 (on ink); radius 0.
Type steps: 12.5vw-class hero name (fitted ~9.4vw), 7vw total figure, 5.6vw
intro H2, 3vw plan names/prices, 32px section H2/CTA statement, 24px hero tile
statements, 20px flow sentences/intro para, 17px body, 15px note text, 13px small.
Faces: Overused Grotesk (Book/Medium); Sybiosme Numerals for figures/states.

## MOTION INVENTORY (planned)
Signature: shutter opening on the intro's tall photograph (clip-path 1.1s,
img 1.12→1) on entry. Hero: board tiles arrive staggered on load; both hero
photographs parallax-drift on scroll (rAF, transform only). Entrances: every
section's parts stagger 60–90ms, rise 24px + opacity, once (IO). Flow: state
chips light in sequence as exchanges enter; wide timeline's fill grows on
entry. Moving picture: scroll-linked drift on hero + intro photographs.
Feedback: press/hover/focus on every control; note↔panel highlight interplay;
mode column selection moves the accent column. Footer: sticky reveal — the CTA
slides away to uncover it. All motion gated on prefers-reduced-motion:
no-preference and on html.js; content fully visible without JS.

## CRITIQUE — round 2 build (own CDP scroll-stop captures, .taste-skill/qa/)

ROUND 1
Seen in one second: a tiled board — giant IMPERIUM, two office photographs, one
orange tile that says only you can submit.
Idea (one sentence): the locked flow becomes a printed machine record — masthead
board, ledger column of states, accent only where the human acts.
Live thing: the Choose-Your-Mode configurator — verified by scripted clicks:
selecting Local Logic moves the accent column, updates the readout and the
mailto (mode + chosen add-ons, total $0); unticking ATS Scoring rewrites the
mailto body; note hover lights the matching Commander console row.
Layout words by section: hero=board / intro=crossing-split / flow=ledger column /
agents=plate with margin notes / modes=large table / faq=reading text /
cta=strip then field / footer=sticky-reveal wordmark. No neighbours share a layout.
Scores: design 8 · usability 8.5 · creativity 8 · content 9 → overall 8.4
Caps applied: none.
Top three problems (most visible first):
1. The intro's tall photograph never appeared (desktop-how capture): the
   shutter's own clip-path zeroed the element's IntersectionObserver ratio, so
   the signature move deadlocked itself. Fix: clip the inner .ph, not the
   observed figure. Re-shot: photo present, dominant, runs below the fold.
2. Phone footer email ran past its column (mobile-bottom capture). Fix:
   overflow-wrap on footer columns at phone width; verified no horizontal
   overflow at 390 afterwards.
3. The breath between the board and the intro heading read as a long empty band
   (desktop-how). Fix: intro margin 150→104px, stage top padding 24svh→15svh.

ROUND 2 (after fixes, final gate)
Gate: lint 0 FAIL; inspect 0 FAIL at 1440/768/390 (before: 12 FAIL, 6 WARN).
WARN defences, one sentence each:
- size-count (12 sizes): five fluid display steps (129/101/81/43/32) plus five
  text steps and two fragment steps — every size is a named token, none is drift.
- no-footage: the open collections were searched in both rounds; no honest clip
  of a local software agent exists, so the moving pictures are the
  parallax-drifting photographs, the shutter opening, the timeline fill and the
  sticky footer reveal.
- off-centre (32px left / 8px right @1440): the intro photograph is dealt flush
  against the right viewport edge by its blueprint; every text edge on the page
  holds the 32px margin.
Still falls short: the flow column's left third is the direction's empty margin
zone — intentional, but the quietest screen on the page; the intro headline
stops just short of literally crossing onto the photograph (a split, not a
crossing); entrances depend on IntersectionObserver, so an instant jump to the
page foot shows sections for a beat mid-fade before they settle.
Motion verified in CDP: parallax variable on the hero photograph moves with
scroll (−6.91% → −10.51% over 300px); shutter opens on entry; timeline fill
grows when the Tracker fragment enters; footer uncovers by sticky reveal.
Sample content to confirm before rollout: the fragments carry one sample
application (Frontend Developer · Remotive, ATS 82; "362 in · 18 matched" are
the real figures from Imperium v4's Step-2 proof run) — same flag as round 1.
