# index.md — Task Tracker

Living checklist for *APAC Rising: Esports Manager*. Derived from `10_ROADMAP_AGENT_WORKFLOW.md`, `09_ACCEPTANCE_QA.md` and `00_START_HERE.md` (v2.2). Dates are dd/mm/2026.

**Deadline:** originally 15/11 (aim 14/11) — **extended by the owner on 03/11, new date not yet recorded** (`DECISIONS.md` Q5) · **Team:** 1 developer + coding agents · **Last updated:** 03/11

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

## Now

- **Build status:** an Architecture-B build exists at the repo root (`src/`, React + TS + Vite). The 03/11 audit found **2 P0** (Welcome Pack never opens after Chapter 1; Recovery Code is a stub) and **13 P1** issues. M3 items below stay unchecked until the fixes have test or E2E evidence.
- **Next action:** run `docs/agents/PROMPT_FIX_AND_GOLDEN_ROAD.md`, starting at Phase 0 (test safety net) and Phase 1 (P0 fixes). Tracked as **M9** below.
- **Answered by the owner on 03/11:** Q1 (the Golden Road ratings may be used and adjusted), Q2 (the Riot email covers everything, no limits), Q3 (no schedule slip; deadline extended).
- **Waiting on the owner:** Q5 (new submission date), Q4 (win-rate targets), Q6 (credit line). Defaults are recorded in `DECISIONS.md`, so work is not blocked.
- **Freeze:** once Q5 is answered, set the feature-freeze date at least 2 working days before the submission date. The dates in M1-M8 below assume the original 15/11 deadline and need re-dating then.

## Open decisions (owner)

| # | Decision | Needed by | Status | Notes |
|---|---|---|---|---|
| G0 | Architecture: **A** server-authoritative (Spring Boot + Neon + Oracle) vs **B** local-first (TS simulator, `localStorage`, static host) | 28/10 | `[~]` | **B** recorded in `DECISIONS.md` on 03/11 from the owner's statement; awaiting the owner's written confirmation |
| D5 | Right to use the rating values in `docs/ref/golden_road/data.js` (`DECISIONS.md` Q1) | — | `[x]` | Answered 03/11: yes, may be used and adjusted. Covers ratings only, not code or UI (DEC-9) |
| D6 | Does the Riot email cover real club names, and use inside a game (`DECISIONS.md` Q2)? | — | `[x]` | Answered 03/11: covers everything, no limits. Real club names allowed (DEC-3). Image/logo files still need an `asset_license` row each |
| D7 | Cut order if the schedule slips (`DECISIONS.md` Q3) | — | `[x]` | Answered 03/11: no slip, deadline extended. Cut order dropped; new date is open (Q5) |
| D8 | New submission date after the extension (`DECISIONS.md` Q5) | now | `[ ]` | Also re-check the current contest terms (`11` §2) |
| D1 | Exact portal parent origin for CSP `frame-ancestors` | before 11/11 | `[ ]` | Don't guess the host (`08` §5). Use a harness hostname until known |
| D2 | Scope of Riot's email grant (names/photos only?) and which assets it covers | before enabling `collection.realAssets` | `[ ]` | Placeholders until `asset_license` rows exist (`11` §1) |
| D3 | Predator side cup: keep behind flag, or rename "APAC Invitational" | P2 | `[ ]` | Depends on Acer brand rights |
| D4 | Game domain / subdomain and backend port on the Oracle VM | 28/10 | `[ ]` | Port must not collide with existing services (`08` §3) |

## Milestones

### M1 — Gate G0 + repo skeleton (27–28/10)
- [x] Spec pack v2.2 delivered (`00`–`14`, `config/`, `agents/`)
- [x] `CLAUDE.md` created
- [x] `DECISIONS.md` written (G0 = B recorded 03/11; owner confirmation pending)
- [ ] Repo created with `docs/` at root; `frontend/`, `backend/`, `infra/`, `tools/` per `08` §2
- [ ] Health endpoint / static page up locally

### M2 — Deploy skeleton (28–30/10) · *Gate: loads inside an iframe on a different hostname*
- [ ] Oracle audit first: `ss -lntp`, `nginx -T`, back up config; don't touch other sites (`08` §7)
- [ ] Real domain on Cloudflare, HTTPS working, Nginx vhost isolated
- [ ] Static FE + `/api/v1/health` (+ Neon connection if A)
- [ ] CSP `frame-ancestors` set; no conflicting `X-Frame-Options`
- [ ] Iframe harness on a second hostname
- [ ] Token save/read test in iframe: Chrome, Safari (iOS), Firefox
- [ ] Recovery-code fallback if storage is blocked (`06` §6)
- [ ] `FLYWAY_URL` (direct) and `DB_URL` split configured (if A)

### M3 — F0 first playable (29/10–01/11) · *Gate: 31/10 two or three people play it*
Acceptance (`09` §A):
- [ ] Club created with no Portal credentials; recovery guidance shown
- [ ] 5 starter cards, one per role, OVR 55–65, survive reload
- [ ] Campus match with 3 decisions; winner resolved server-side
- [ ] Post-match "why" breakdown (roster / synergy / tactic / decisions) plus next action
- [ ] Welcome Pack granted once, guaranteed Rare+; reveal animation with safe Skip
- [ ] One-click equip from the pack when the role matches; effect visible in team power
- [ ] Second, stronger match uses updated lineup
- [ ] Refresh mid-match / mid-pack / on recap leaves no stuck state
- [ ] Works at 390×844 and desktop, mouse and touch, inside the iframe
- [ ] FE tests, BE tests, migration, and one E2E happy path (`IMPLEMENTATION_PROMPT` Step 1)

### M4 — Economy (01–03/11)
- [ ] Multiple pack types with visible odds; pity (7 misses max, 8th forced Epic+) with boundary tests
- [ ] Training (deterministic, cost preview) and wallet ledger
- [ ] Idempotency on every financial mutation; concurrent pack-open yields exactly one card
- [ ] `14_ECONOMY_SIM_TABLE.md` simulation script (3 policies × Ch1–5) and checks 1–4 pass
- [ ] No soft-lock at 0 credits (friendly match or sponsorship)

### M5 — Campaign Ch1–5 + demoScenario (04–07/11) · *Gate: VCS path playable; demo runs ~3 min*
- [ ] Campus → Road to VCS → VCS as config-driven competition templates
- [ ] Node states (`LOCKED → ELIGIBLE → … → ELIMINATED`); a pro loss moves to the next split, never wipes the save
- [ ] First-clear rewards claimed once (`milestone_claim` unique)
- [ ] Rival Zero encounters (adaptive archetype, labelled "adapting")
- [ ] `demoScenario` "Chung kết thế giới" BO5 from the Hub; no career writes; labelled Demo

### M6 — Expand & polish (08–10/11)
- [ ] LCP / First Stand / MSI / Worlds as fictional single-elimination, labelled
- [ ] Card frames and reveal effects (CSS/procedural) instead of portraits
- [ ] ~30 card editions seeded (`12` §8)
- [ ] Balance benchmark run; no assets outside rights scope

### M7 — Production hardening (11–12/11)
- [ ] Security pass: IDOR/BOLA, token rate limiting, no token in logs/URLs, club-name injection
- [ ] Observability; systemd unit with memory limits; log rotation
- [ ] Public E2E against the real domain; other Oracle sites untouched
- [ ] Test inside the real portal if available

### M8 — Playtest & freeze (13–14/11)
- [ ] 5–10 playtesters, URL only, "play for 5 minutes" (`09` §D script)
- [ ] No open P0/P1 issues
- [ ] Screenshots / video, logo, README listing fictional adaptations
- [ ] **Submit 14/11** (15/11 is for emergencies only)

### M9 — Audit fixes + legacy data (from 03/11; dates follow the new deadline) · *Source: `agents/PROMPT_FIX_AND_GOLDEN_ROAD.md`*
Phase 0
- [ ] `vitest` + `strict` TypeScript; tests for matrix, sub-seed golden, pity boundary, probability bounds; `scripts/balance-sim.ts`

Phase 1 — P0 · *Gate: the full F0 loop passes in an E2E at 390×844*
- [ ] P0-1 Welcome Pack opens right after the Chapter 1 win (state moved to a reducer; no `setTimeout` orchestration)
- [ ] P0-2 Recovery Code carries a compressed save; import UI; storage-blocked banner (`DECISIONS.md` DEC-1)

Phase 2 — P1 and polish
- [ ] `equipCard` cannot put one card in two slots
- [ ] TRADE_MAP operator precedence fixed; `getTacticRosterFit` clamped to [-5, 5]
- [ ] Opponent receives synergy; opponent OVRs recalibrated to the win-rate targets (`DECISIONS.md` DEC-5)
- [ ] Training Center discount applied; unimplemented facility perks hidden or described honestly
- [ ] BO3/BO5 played game by game with the `FOCUS_1` policy; off-script and key-moment data shown
- [ ] Live score no longer spoils the result; counterfactual picks the largest-gap alternative
- [ ] Pack Skip cancels its timers; header fits 390 px; replay of a cleared chapter no longer promises a reward
- [ ] Training: displayed OVR equals simulated OVR; stat cap respected; no soft-lock at 0 credits

Phase 3 — legacy data (starts only after Phase 1 and 2 are green)
- [ ] G0 importer: Golden Road facts + ratings (`ratingSource`: `golden_road` / `adjusted` / `derived`); `LEGACY` editions generated with provenance
- [ ] G1 `demoScenario` rebuilt from historical rosters; symmetric opponent; no career writes (localStorage snapshot identical before and after)
- [ ] G2 opponents and market generated deterministically from the legacy pool
- [ ] G3 Draft mode behind `FEATURE_GOLDEN_ROAD`: built with the flag off, switched on for submission only if F0/R1 acceptance and 390×844 + iframe QA are green

Phase 4 — release
- [ ] Typecheck, test, build and `balance-sim` outputs captured; Playwright F0 + reload + iframe harness
- [ ] Internal specs removed from the public bundle; unused deps removed; README rewritten
- [ ] `CHANGELOG.md` entry and `FILE_MANIFEST.json` regenerated

## Scope priority

| Tier | Item |
|---|---|
| P1 (must) | Ch1–5 (Campus → Road to VCS → VCS), packs/training/ledger, `demoScenario` |
| Data-only | LCP, First Stand, MSI, Worlds: single-elim BO3/BO5, fictional labels |
| Data-only (03/11) | `LEGACY` card editions from historical rosters; not in the current pack tables (`DECISIONS.md` DEC-2) |
| P2 (only if time) | Swiss, double elimination, Play-In, NPC Transfer, Facilities, full Hall of Fame, Predator side cup, Golden Road Draft mode (flag, default off) |

## Required test invariants (track as they get written)

**Simulator** (`05` §8, `13` §6)
- [ ] Same seed → same output over ≥ 1,000 runs; golden vectors for `SeededRng`
- [ ] Golden test: changing the EARLY decision doesn't change MID/LATE draws
- [ ] 10k seeds: +10 team power wins 60–75% (calibrate); optimal vs random decisions ≥ 5 pts apart
- [ ] 10k seeds: a "always same tactic" policy doesn't beat the adaptive policy
- [ ] Tactic matrix property tests in CI (no dominant tactic, each tactic best somewhere, means within 1.5, values in ±6)
- [ ] BO3/BO5 terminate at the right wins; no NaN or negative ratings; BO5 p95 < 200 ms

**Economy / data** (`06` §9, `04`)
- [ ] 100k pack opens: no miss streak > 7; `misses` resets after Epic+
- [ ] Replayed `claim` writes one ledger row; insufficient funds rolls everything back
- [ ] One card can't hold two slots; equipped cards can't be sold; a match needs 5 valid roles
- [ ] Idempotency-key reuse with a different body → `409 IDEMPOTENCY_CONFLICT`
- [ ] Fresh-DB Flyway migration on a Neon-compatible Postgres

**Campaign**
- [ ] No LCP→LCK path; qualification re-checked per split; Predator never feeds Worlds
- [ ] A pro loss leaves club and cards intact

## Pre-submission checklist (`09` §E)

- [ ] Outsider confirms the public HTTPS URL loads
- [ ] Embeds in a cross-origin iframe with no Portal login or redirects
- [ ] No camera/mic requests, no Portal data collection, no external redirects
- [ ] Every image/name has rights metadata or is a placeholder (`11` §1 checklist)
- [ ] Re-read the **current** contest terms: https://predatorleague.acervietnam.com.vn/terms?tab=technology
- [ ] Re-verify the "verified facts" in `02` / `11` against the official links (not re-checked in v2.2)
- [ ] Git history and AI logs retained
- [ ] README explains fictional adaptations; UI shows the simulation disclaimer (`11` §5)
- [ ] Staging / backup build ready in case Oracle or Neon is down
- [ ] Regenerate `FILE_MANIFEST.json` if any doc changed

## Scope gates (stop-and-fix triggers, `10` §5)

| If | Then |
|---|---|
| 30/10 skeleton not running in the iframe harness | Stop new gameplay; fix CSP / Cloudflare / storage |
| 31/10 F0 not playable | Pause cosmetics and content; fix the first 5-minute loop |
| 07/11 LCP/Worlds engine unstable | Ship simplified, labelled formats; keep VCS and the career |
| 11/11 economy dupe or authz issue | Disable the affected pack/transfer feature; never bypass server checks |
| 13/11 iframe or public load breaks | Prioritise contest viability over extra seasons |

## Block-release issues (`09` §F)

Authz bypass · economy dupe · lost progress · unrecoverable login · pack reward mismatch · blank iframe · unusable mobile taps · auto external redirect · unlicensed assets · broken campaign state.

## Log

| Date | Entry |
|---|---|
| 27/10 | Spec pack v2.2 reviewed; `CLAUDE.md` and `index.md` created. G0 pending. |
| 03/11 | Code audit of the existing build (Architecture B): 2 P0, 13 P1. Checked by simulation: sub-seed independence, matrix properties, pity boundary, probability bounds all pass. Starter-team win rates measured: Ch1 66-69%, Ch2 46%, Ch3 26%, Ch4 20%, Ch5 5%. |
| 03/11 | `docs/ref/golden_road/` analysed (73 teams, 649 player-seasons, 374 players, 2011-2025; VCS only GAM 2017, no LCP). Web research on LCP 2026, MSI 2026 and Worlds 2026 added to `research/LINKS_AND_FACT_CHECK.md`. Liquipedia and Leaguepedia blocked the fetch tool, so VCS rosters are **not** verified. |
| 03/11 | Created `DECISIONS.md` (G0 = B recorded; DEC-1..9, Q1..Q4) and `agents/PROMPT_FIX_AND_GOLDEN_ROAD.md`. Added M9. No M3/M4 item checked: none has test evidence yet. |
| 03/11 | Owner answered Q1-Q3: may use and adjust the Golden Road ratings; Riot email covers everything with no limits; no schedule slip and the deadline is extended. Updated DEC-3, DEC-4, DEC-7, D5-D7; opened D8/Q5 (new date) and Q6 (credit line). |
