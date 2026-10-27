# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this directory is

This is the **documentation/spec pack (v2.2, 2026-10-27)** for *APAC Rising: Esports Manager*, a web MOBA esports-manager game with collectible player cards, packs, a career campaign and a seeded match simulator. It is meant to be dropped in as `docs/` at the root of a future monorepo (`frontend/`, `backend/`, `infra/`, `tools/` — see `08_ARCHITECTURE_DEPLOY.md` §2). **There is no application code, build, lint or test setup here, and the directory is not a git repo.** Don't invent commands for it.

Context: solo developer + coding agents, contest submission deadline **15/11/2026** (aim to submit 14/11). The docs are written in **Vietnamese** with English identifiers; keep that convention when editing them.

## Planned stack and commands (for the future codebase, not runnable here)

From `08_ARCHITECTURE_DEPLOY.md` §4 and `agents/IMPLEMENTATION_PROMPT.md`:
- Frontend: React + TypeScript + Vite, **Bun**. `bun install --frozen-lockfile` → `bun run typecheck` → `bun run test` → `bun run build`.
- Backend: Java 21 + Spring Boot 3.x, Maven wrapper, Flyway, JUnit 5 (+ Testcontainers), Neon PostgreSQL. `./mvnw test` → `./mvnw package`.
- E2E: Playwright (onboarding F0, reload, pack-open retry, deep links via Nginx SPA fallback, cross-origin iframe harness).
- Deploy: Oracle Cloud Ubuntu ARM64 + Nginx + Cloudflare; game is embedded in a third-party contest portal iframe.

## Task tracking

`index.md` is the running task tracker (milestones, open decisions, test invariants, pre-submission checklist). Update its checkboxes and Log table as work completes, and don't mark an item done without evidence.

## Reading order and precedence

`00_START_HERE.md` is the index; read it first. When files conflict, resolve in this order:
1. `00_START_HERE.md` v2.2 scope cut — overrides `03`, `10`, `12`.
2. `02` (reality/constraints) > `01` (game goals) > `03`–`09` (specs) > `config/*.json` (seed values).
3. `agents/IMPLEMENTATION_PROMPT.md` has a "v2.2 amendments" block at the top that overrides everything below it in that file.

Several older passages are superseded by v2.2 additions and were not rewritten, so check before trusting them:
- `01` §6 ("one decision per phase") → `13` §4 caps decisions at 3 / 5 / 7 for BO1 / BO3 / BO5 (full control in game 1, then `FOCUS_1`).
- `04` §3 Scout row ("at most 8 openings without Epic+") → the precise pity definition is in the same file's "Định nghĩa pity chốt" paragraph.
- `01` is titled GDD v2.1.

## Gate G0 — do this before writing gameplay code

The prompt in `agents/IMPLEMENTATION_PROMPT.md` forbids gameplay code until the owner records an architecture choice in **`docs/DECISIONS.md`**: **A** server-authoritative (Spring Boot + Neon) vs **B** local-first (TypeScript simulator, IndexedDB, static host). That file does not exist yet. If it's still missing, stop and ask the owner. If B is chosen, `06` and `08` become reference for optional parts only. The deploy skeleton (HTTPS + iframe harness + CSP + health + token-storage test in Chrome/Safari/Firefox) must be working before F0 gameplay.

## Cross-cutting rules (these span several files)

**Scope (v2.2).** Must be solid: Campus → Road to VCS → VCS (Chapters 1–5) plus pack/training/ledger. LCP, First Stand, MSI and Worlds are **fictional single-elimination, labelled as such**. Swiss, double elimination, Play-In, NPC Transfer, Facilities, full Hall of Fame and the Predator side cup are P2. `demoScenario` ("Chung kết thế giới", a ~3-minute BO5 with a prebuilt team) is P1 and must never write to the real career (`03` §11).

**Server authority (architecture A).** The backend decides packs, rewards, wallet and match results; the frontend only renders event replays. The client never submits scores or winners. `club_id` always comes from the authenticated guest principal, never the request body. `Watch/Fast/Skip` replay the *same persisted* match. All financial mutations need an `Idempotency-Key` (request-hash mismatch → `409 IDEMPOTENCY_CONFLICT`) and a transactional ledger. Wallet balances have `CHECK >= 0`.

**Simulator determinism (`05` §3, `13`).** The domain engine is pure Java with no DB calls and no `Math.random()`. Every random draw uses a sub-seed `hash(seed, gameIndex, phase, eventSlot)`, never a shared sequential stream. This is what makes the post-match counterfactual explanation honest. Golden test: changing the EARLY decision must not change the MID/LATE draws. Win probability comes from attributes, synergy (±8), tacticFit (±5), decisionFit (±6) and form (±2), **not** from displayed OVR.

**Tactic matrix.** The `decisionFit` table is duplicated in `13_MATCH_DECISION_SPEC.md` §3 (human) and `config/tactics.matrix.json` (machine). Keep them identical. CI must enforce four properties: no dominated tactic in a phase; every tactic is best against at least one archetype; per-phase tactic means differ by ≤ 1.5; all values in [-6, 6].

**Pity (v2.2).** For the Scout family, at most 7 consecutive non-Epic+ opens; the 8th open is forced Epic+; `misses` resets on any Epic+. Scout Commons have `baseOvr >= 62`. Pack odds are displayed to players and change only with a new `packTableVersion`. No real-money mechanics.

**Anti-duplication schema details.** `milestone_claim.career_year` is `NOT NULL DEFAULT 0` because PostgreSQL's UNIQUE doesn't block NULL duplicates. Flyway runs against Neon's **direct** (non-pooled) endpoint via `FLYWAY_URL`, separate from runtime `DB_URL`. `06` §2 is a *logical* schema; the agent is expected to write the real DDL, not copy it.

**Numbers that live in more than one place.** Pack odds/pity: `04`, `config/balance.initial.json`, `CHANGELOG`, IMPLEMENTATION_PROMPT. Simulator caps and decision policy: `05`, `13`, `balance.initial.json`. Credit sources and sinks: `03` §7, `04` §4, `14`. When changing one, grep for the others, add a `CHANGELOG.md` entry, and bump `rulesVersion` in the config if gameplay changes. `FILE_MANIFEST.json` holds sha256/byte sizes and goes stale after any edit; regenerate it rather than hand-editing.

## Real-world facts vs. game fiction (do not blur)

- Pro axis is **Campus → Road to VCS → VCS → LCP → global events**. Never LCP → LCK; LCK/LPL are only opponents or a V2 manager-job path.
- LCP qualification is re-earned **each split**. Slot counts and the 2027 Worlds format are **not published or verified**. Keep them as `qualificationConfig` data with `isOfficialFormat: false` and an `adaptationNote`, and don't fill in numbers.
- Predator League is a separate Acer event, **not** a qualifier for LCP or Worlds. Behind a feature flag; rename to "APAC Invitational" if brand rights aren't confirmed.
- The "verified facts" in `02`/`11` were **not re-verified** in v2.2 (see `CHANGELOG`). Check them against the official links in `research/LINKS_AND_FACT_CHECK.md` before submission.
- A pro-level loss never deletes the club or cards; it moves to the next split/year. Grassroots chapters allow free retries.
- Provenance fields on competition data: `rulesBasisYear`, `adaptationNote`, `isOfficialFormat` (default false), `realWorldReferenceUrl`.

## Rights and contest constraints

The owner says Riot approved use of **player names and photos** by email. That doesn't cover team logos, Riot/League/LCP/VCS marks, champion art, or Acer/Predator marks. Use fictional flat-art placeholders unless an `asset_license` record exists per asset (`11` §1). No Portal login/credential collection, camera, microphone or external redirects. Guest identity is a random bearer token (stored hashed) plus a recovery code if iframe storage is blocked, and it must never appear in URLs or logs. `frame-ancestors` must list only the verified portal origin and the owned domain; don't guess the portal host. The contest's current terms at submission time override the snapshot in `11` §2.

## Definition of first playable (F0, non-negotiable)

Club name → 5 starter cards (one per role, OVR 55–65) → Campus match with 3 decisions → guaranteed Rare+ Welcome Pack → animated open (skippable) → one-click lineup swap → stronger second match → reload loses nothing. Acceptance and block-release lists are in `09_ACCEPTANCE_QA.md`. Features that aren't QA-ready go behind feature flags (`01` §9) rather than risking F0. Each agent step must end with commands run, observed output and blockers, never a bare "done" (`10` §3).
