# Imperium redesign — working notes

## BEFORE (redesign special case, step 1)
- inspect.mjs on live-clone homepage (served locally, CHROME_PATH wrapper for root sandbox):
  12 FAIL, 6 WARN at 1440/768/390 (.taste-skill/before/report.json)
- Hero headline (wordmark): "IMPERIUM" 345px / 24vw, Overused Grotesk, leading 0.72
- h1 tagline: "Your career agent, live on your machine…" wraps 4 lines @1440, 3 @768, 3 @390 (FAIL headline-lines)
- 13 font sizes in use (12–345px); body 17px/1.2; grey body text 4.9:1 @768 (WARN)
- FAILs: headline-lines ×3 widths, numbering ("01.", "Step 01"…), gradient ×3 fills, gradient-text ×2,
  shadow ×4, hairline ×28, outlined-box ×4, icon-cards ×2 rows, small-text ×10 blocks <13px, off-centre frame
- Motion: 14 elements moved (still-page WARN); 0 videos; real pictures 7 (the swapped work photos)
- Lint of current source (../index.html): 1 FAIL (gradient), 1 WARN (outlined box)
- Before screenshots read: hero = giant wordmark over grey WebGL sphere field, tagline pushed right,
  $0 total + two pill buttons left; phone: same composition squeezed, huge empty grey middle.
  Top problems: (1) the h1 is a 4-line paragraph, not a title; (2) ornament tells everywhere
  (numbering, hairlines, icon cards, gradients, shadows); (3) frame off-centre, content huddled,
  vast empty fields — the design is Sybiosme's portfolio costume, nothing says "local agent that
  cannot submit for you".

## ARGUMENT (claims → proof), in page order
1. Hero — Imperium is a career agent that runs on your machine and costs $0.
   → the name at full width; the locked flow drawn as the page's spine under it; one action: "Choose your mode".
2. How it works — everything stays local: profile, resumes and history live in one SQLite file;
   the brain is Ollama on your machine or plain deterministic logic; no cloud, no API keys, no subscription.
   → three plain statements + a real photo of a desk/machine world.
3. The locked flow — every application moves through one fixed sequence and cannot skip:
   Find Jobs → Generate Resume → ATS Check → Apply → You Submit → Tracked.
   → the sequence itself, set as the page's device: a track of states the reader travels down;
   the "You Submit" state is the only one in the accent, because only the user can pass it.
4. The agents — six specialists do the work under one Commander.
   → each agent named with its real job (from FAQ 1): Commander, Job Agent, Resume Studio,
   Research Agent, Automation Agent, Tracker. No icons, no cards: a list set in large type with photos.
5. Choose your mode — the brain is the only choice; everything else is identical and $0.
   → THE LIVE THING: pick Local Logic / Ollama 3B / Ollama 7B and toggle Research Notes /
   ATS Scoring / Form Filling; the total stays $0 and the panel states what the chosen brain does.
   Plain fallback: all modes listed with $0 in static HTML.
6. FAQ — the real 23 questions, real answers (extracted verbatim from the page's FAQPage JSON-LD).
7. Final setup / CTA — stop paying for your own job search; run it on your machine.
   → one action (mailto to the maker with mode in the subject — no backend exists).
8. Footer — Merugu Dinesh Kumar, dinesh.merugu.kumar@gmail.com, +91 93983 59538, Hyderabad. Name returns full width.

## SUBJECT INVENTORY (only Imperium has these)
1. It runs entirely on the user's own machine — no cloud, no account, no API keys.
2. One SQLite file is the single source of truth for profile, resumes, applications.
3. There is NO submit function in the code — not even a disabled one; only the user clicks Submit.
4. The locked flow: a state machine with fixed states an application cannot skip or fake.
5. Profile = single source of truth, with a guardrail that strips any resume line not in the profile.
6. The brain is swappable: deterministic Local Logic / Ollama qwen2.5:3b / qwen2.5:7b — same agents, $0 each.
7. Real jobs only, from named public sources: Remotive, Arbeitnow, Jobicy; every search shows a filter report.
8. Tracker timeline updates by Server-Sent Events the moment the database changes — never on a timer.
9. Blocked fields are named and stopped at: CAPTCHA, password, OTP, unknown fields.
10. Stale applications are flagged after 7 days with no real change; closed jobs are marked closed honestly.
11. ATS scoring against the exact job description, re-scored after every edit.
12. Made by one person in Hyderabad: Merugu Dinesh Kumar.

## IDEA
> On this page, **the locked flow — the state machine no application can skip, whose one
> accent-coloured state only the user can pass** — becomes **the page's spine: a track the
> reader travels from the hero to the footer, with each section arriving as the next state**.

Competitor test: myjobb.ai (cloud, auto-applies for you, paid) cannot use this sentence —
its whole pitch is that it submits for you. A generic AI resume tool has no state machine
and no user-only gate. The device belongs to Imperium alone.

Live thing: the Mode configurator in "Choose your mode" — real selection, real $0 total,
per-mode description of the brain; keyboard accessible; static $0 list as no-JS fallback.

## COPY DECK (headlines ≤2 lines; ~32 chars safe at phone)
- H1: "IMPERIUM" (the name, full width) — supporting line: "A career agent that runs on your
  machine. It finds real jobs, tailors your resume and fills the forms. You click Submit."
  Primary action: "Choose your mode". Fact line: "Local only · $0 · No subscription"
- How: "Everything stays on your machine" — body: SQLite file, Ollama or plain logic, no cloud.
- Flow: "One flow. No shortcuts." — the six states named in full.
- Agents: "Six agents, one command" — each agent + its real job in one sentence.
- Mode: "Choose your mode" — configurator; every mode $0, every capability included.
- FAQ: "Questions, answered straight" — the real 23.
- CTA: "Your search, on your machine" — action: "Talk to Imperium" (mailto).
- Footer: contact block + IMPERIUM full width.

## DRAW — choice
Options dealt: colour-chapters / dark-room / dense-tiles.
Chosen: **dark-room**. Reason: the idea is a journey through locked states; on one
continuous ink ground the flow can run as a single lit track from hero to footer, each
state lighting as the reader arrives, "You Submit" the only accent-lit station — a lit
path in a dark room is exactly a machine working locally, in the dark, on your desk.
colour-chapters would fragment the journey into posters; dense-tiles reads as a card
board and cannot carry a sequence. Brand maps cleanly: ground = ink #111, lit type =
paper white, accent #fe4701 used once per idea (the gate state + primary action).

## DIRECTION SHEET — dark-room, seed 320538270
- Hero: "Control that reads the page" — two-tone split (left #111 / right #1c1c1c, the brand's
  own tone step), small headline bottom-left, a working product fragment centred in the right
  half. Fragment = the Tracker gate panel: one application's timeline ending at "Filled —
  awaiting you" with the user's own Submit button; its readout prints the real local time,
  and clicking Submit stamps "Submitted by you at HH:MM:SS" and unlocks Tracked. That is
  Imperium's defining control, and it reads the visitor's real clock.
- intro: Pinned sentence, photographs pass — sentence (statement size 34px, ≤3 lines):
  "Your profile, your resumes and your job history never leave this machine." (13 words)
  Photos: media/work 1, 3, 5 (dark office Unsplash, brightness .85 per sheet treatment).
  Section closes with the practical block: h2 "How Imperium works" + local facts in two
  columns (SQLite file / Ollama or Local Logic / no cloud, no keys, no subscription) + photo 4.
- how-it-works: Drag through the stages = THE LOCKED FLOW. Adjustment: six stops, not four —
  the real flow has six states and content governs (blueprint geometry kept: 50/50 split,
  clause left, data-ui fragment right, range slider across the seam, stage names under).
  "You Submit" clause and fragment in the accent — the only accent-lit state on the page.
- features: Close-ups on a board = THE AGENTS. 8 tiles (heading 6×2, Commander 6×4,
  Job Agent 3×2, Resume Studio 3×2, Research 3×4, Automation 3×4, Tracker 6×2, the Gate 6×2).
  Each tile holds that agent's interface element enlarged 300–400% and cropped. The Gate tile
  is the one accent field (ink text on #fe4701 for contrast): a giant Submit the agent
  cannot press — "There is no submit function in Imperium."
- pricing: The price, very large = CHOOSE YOUR MODE. Figure "$0" at 16vw, photo (work/2)
  overlapping its top-right. The blueprint's "included lines" become the live configurator:
  three mode radios + three included add-on toggles; total stays $0; a readout states what
  the chosen brain does (aria-live). Button = mailto with the chosen mode in the subject.
- faq: Large questions, answers beside. 12 of the 23 real questions (task-sanctioned subset),
  verbatim from the page's FAQPage JSON-LD, + a closing note naming the full set.
- cta: A plain sentence, one action. Sentence: "Imperium runs on your machine, costs
  nothing, and never applies without you." Button: Talk to Imperium (mailto).
- footer: A single quiet line carrying the contact facts: left "Merugu Dinesh Kumar ·
  Hyderabad, India", centre email + phone links, right "© 2026".
- Motion: Masked headline (signature). Section entrances staggered per part; intro photos
  drift ±4% on a view timeline; control feedback on every control. All hidden states inside
  html.js + prefers-reduced-motion: no-preference.
- App fragments: app sheet dealt (Framed sheet, builder, seed 2025154395) — fragments follow
  its discipline (real data, one tone step, no shadow, small radii) mapped onto the dark
  brand ground; roots carry data-ui.
- House-rule overrides of blueprint numbers: CTA/footer empty ground trimmed (20svh + ~10svh)
  so no blank stretch passes half a screen; hero headline set at the blueprint's 32px ceiling
  so the first-screen title clears the frame rule.

## CRITIQUE — final round (after fix rounds 1–2)
ROUND 2
Seen in one second: an orange Submit waiting in a lit panel in a dark room; "A career agent on your machine".
Idea (one sentence): the locked flow — the state machine no application can skip, whose one
accent state only the user can pass — becomes the page's device: gate panel in the hero,
a draggable track for the flow section, one accent tile among the agents.
Live thing: the Choose-Your-Mode configurator (mode + add-ons, total stays $0, readout and
mailto action update; static $0 list without JS). Working fragments: hero gate (real clock,
user's Submit stamps the time), flow slider (clause + fragment + fill per state).
Layout words by section: hero=split / intro=pinned / flow=split-with-track / agents=mosaic /
modes=split-figure / faq=table / cta=stack / footer=strip. No neighbours share a layout.
Scores: design 7.5 · usability 8 · creativity 7.5 · content 8.5 → overall 7.8
Caps applied: none. (0 inspector FAILs; 5 real pictures; idea fails the competitor test for
myjobb.ai, whose pitch is the opposite — it submits for you.)
Top problems fixed across rounds: (1) tile captions colliding with enlarged fragment text —
tiles rebuilt as flex columns, captions in flow; (2) phone/tablet tile middles reading as
blank bands — tablet spans and zoom sizes corrected (a CSS order bug: the tablet block sat
before the phone block and was overridden); (3) the pinned sentence crossing a bright photo
floor on the phone — photo darkened to the room's light, sentence re-seated.
Still falls short: the hero's left half is the blueprint's deliberate void and some readers
will call it empty; Research/Automation tile zooms are thinner than Commander's; the FAQ
answers are long (they are the site's real answers, verbatim); no video — assets.mjs --video
was searched ("dark office night working laptop") and returned nothing usable, and no honest
clip of this product exists; the tablet CTA keeps the blueprint's one-sided rest (WARN).

## WARN defences (one sentence each)
- card-rows: the "rows" are the dealt mosaic blueprint and a real form's field rows.
- no-footage: searched; nothing honest exists for a local software agent; the moving pictures
  are the drifting photographs and the gate's live clock.
- hero-void: the dark-room hero holds its copy at the foot of the left half; the void is the
  room, closed on the far side by the lit fragment.
- lopsided CTA @768: the dealt CTA is one sentence and one action on the text edge — the
  page's single deliberate rest.
- lint cta-copy "Submit": the gate button carries the product's real control name.
- lint em-dash count: most are inside the site's verbatim FAQ answers.

## Sample content to confirm before any rollout
- The hero/flow fragments show one sample application ("Frontend Developer · via Remotive",
  ATS 82, "362 in · 18 matched" — the last two are the real figures from Imperium v4's own
  Step-2 proof run) and one sample resume line in the Resume Studio tile.
- FAQ shows 12 of the real 23 questions, verbatim; the head row says so on the page.
