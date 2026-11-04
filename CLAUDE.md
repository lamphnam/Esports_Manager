# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

*APAC Rising: Esports Manager*: a web MOBA esports-manager game (collectible player cards, packs, 12-chapter career campaign, seeded match simulator) built for the **Road to Predator League 2027** technology contest. Solo developer + coding agents. Submission deadline **end of 15/11/2026**, voting until 22/11/2026 (confirmed by the owner 03/11/2026). Docs are written in **Vietnamese with English identifiers**; keep that when editing them.

**Architecture B (decided):** React 19 + TypeScript (strict) + Vite + Tailwind v4, **Bun**. The simulator runs in the client, the save is one `localStorage` snapshot, hosting is static on **Vercel** (`dist/`). There is **no backend** and no network call in `src/` (only Google Fonts in `index.html`). The game is embedded in the contest Portal through a cross-origin iframe.

## Commands (repository root)

```text
bun install --frozen-lockfile
bun run dev            # http://localhost:3000
bun run typecheck && bun run test && bun run build
bun scripts/balance-sim.ts          # DEC-5 win-rate bands, non-zero exit if outside
bun scripts/import-golden-road.ts --check
bun run audit:release               # public bundle and src checks
bun scripts/verify-release.ts       # runs everything, writes docs/evidence/verify-output.txt
bun scripts/generate-manifest.ts    # regenerate docs/FILE_MANIFEST.json after editing docs
```

E2E scripts in `scripts/e2e-*.js` are `async (page)` functions run through the Playwright tool; they are not part of `package.json` (see `docs/QA_AND_RELEASE.md`).

## Where things are

- `src/lib/simulator.ts`, `seededRng.ts`, `tacticsMatrix.ts`: pure engine. `economyEngine.ts`: packs, pity, training cost, market. `saveState.ts` + `recoveryCode.ts`: save validation and `AR1` Recovery Code. `src/context/GameContext.tsx`: reducer + `saveRef`, every game mutation.
- `src/data/`: campaign, catalog (30 current + 649 `LEGACY` editions; packs draw from both, `PACK_POOL`), `legacyOpponents.ts` (Ch6-12 difficulty curve, calibrated by `scripts/progression-sim.ts`), `generated/` (importer output, never hand-edit), `featureFlags.ts`.
- `src/data/campaignCopy.ts` (copy từng chương, nhãn nguồn đối thủ) và `esportsReference.ts` (fact thật, nguồn, `asOf`, `null` khi chưa công bố): metadata thuần, không vào save. Copy Ch3–12 không nêu tên đối thủ cố định.
- `src/lib/backupMeta.ts` + `environment.ts`: DEC-12 backup nudges and storage-context advice (state wired in `GameContext`, UI in `Navbar`, `App`, `RecoveryModal`). The exported Recovery Code folds the ledger (`compactSave`).
- `docs/config/balance.initial.json` and `tactics.matrix.json` are read by tests. `docs/ref/golden_road/data.js` is the only file kept there: rating data read by the importer, never bundled.

## Docs (read `docs/PROJECT_STATUS.md` first, then the one you need)

`PROJECT_STATUS` (tracker, gates, plan) · `DECISIONS` (decision log) · `GAME_DESIGN` · `ECONOMY` · `MATCH_SIMULATOR` · `UX_AND_ART` · `ARCHITECTURE` · `QA_AND_RELEASE` · `CONTEST_AND_RIGHTS` · `CHANGELOG`. Entries marked **[Đã có]** run in the build; **[Đích]** are designs not yet accepted: do not describe them as done. Update the checkboxes and Log in `PROJECT_STATUS.md` when work completes, and never tick one without evidence (commands run, output observed).

## Rules that span files

- **Do not change** pack odds, the pity definition, or `DECISION_FIT_MATRIX` unless a test shows a bug. The matrix exists twice (`docs/MATCH_SIMULATOR.md` §6 and `docs/config/tactics.matrix.json`) and must stay identical; four properties are enforced by tests (no dominated tactic per phase, each tactic best vs at least one archetype, per-phase means within 1.5, values in [-6, 6]).
- **Pity:** Scout allows at most 7 consecutive non-Epic+ opens; the 8th is forced Epic+; `misses` resets on any Epic+. Scout Commons have `baseOvr >= 62`. Odds change only with a new `packTableVersion`. No real-money mechanics.
- **Determinism:** no `Math.random()` in `src/lib/` (release-audit enforces). Every draw uses a sub-seed `hash(seed, gameIndex, phase, eventSlot)`, never a shared stream. Player win probability uses attributes, synergy (±8), tacticFit (±5), decisionFit (±6), form (±2), not displayed OVR.
- **BO3/BO5 flow:** stop at `GAME_RECAP` after every game (including the last); only explicit "Ván Tiếp Theo" / "Xem Tổng Kết Chuỗi" advances. Watch/Fast/Skip never bypass it. Career reload restores the same recap; the demo is component-local and must leave `localStorage` byte-identical.
- **Numbers in several places:** pack odds (`ECONOMY.md`, `balance.initial.json`), simulator caps (`MATCH_SIMULATOR.md`, `balance.initial.json`), chapter rewards (`GAME_DESIGN.md` §3, `campaignData.ts`). When one changes, grep the others, add a `CHANGELOG.md` entry, bump `rulesVersion`.
- **Bug fixing:** reproduce red first (test or script), fix, rerun green. Report commands and observed output, not "done".
- **Enforced by release-audit:** no `purple/indigo/violet` classes, no emoji in UI source, no known-unused dependencies (`@google/genai`, `express`, `dotenv`, `motion`, `tsx`), no internal docs or `docs/ref` code in `dist/`. Do not add dependencies beyond what exists (Vitest is the only test tool).
- **Decisions:** agents never change a `DECISIONS.md` status from "Đề xuất" to "Đã chốt"; only the owner does. Open questions get a recorded default and work continues.

## Real world vs fiction

Pro axis is **Campus → Road to VCS → VCS → LCP → global events**; never LCP → LCK. LCP slots and the 2027 Worlds format are unpublished: keep them as fictional `qualificationConfig` data with `isOfficialFormat: false`, `rulesBasisYear`, `adaptationNote`, `realWorldReferenceUrl`, and never fill gaps from memory. LCP/First Stand/MSI/Worlds in the game are labelled single-elimination fiction. Predator League is a separate Acer event, never a qualifier for LCP/Worlds. Do not promote a **Low** confidence row in `docs/CONTEST_AND_RIGHTS.md` §6 into game data.

## Contest and rights constraints

No Portal login or credential collection, no camera/microphone, no external redirects, no third-party scripts or tracking. The owner states the Riot email covers everything including real club names (`DECISIONS.md` Q2) and the Golden Road grant covers **ratings only** (Q1): never copy its code, UI text, CSS, icons or share-card layout, never bundle `docs/ref` (it holds only `data.js`; the third-party engine/UI files were deleted). Apart from the five role icons, the Summoner's Rift minimap (`src/assets/map`, owner-requested, Riot) and the AI-generated game logo (`src/assets/brand`, declared as AI content), no cleared image or logo files are committed: keep geometric placeholders unless an `asset_license` record exists for the asset. The five role icons (`src/assets/roles/*.png`, owner-requested, see `docs/CONTEST_AND_RIGHTS.md` §5) are optional: `RoleIcon.tsx` falls back to SVG without them, and they must be bundled, never hotlinked. Recovery Codes are save copies: never put one in a URL or log. Do not set `frame-ancestors` until the Portal's embedding origin is confirmed by the organisers. After submission any content change must be reported to the organisers (`docs/CONTEST_AND_RIGHTS.md` §1). The contest's current terms at submission time override any snapshot in the docs.

## Working tree notes

Branch `fix/audit-and-golden-road`. Do not push or commit unless asked. Three files under `.agents/skills/apac-rising-figma-design/` show as deleted in the working tree; leave them alone unless asked.
