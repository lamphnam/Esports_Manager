---
name: apac-rising-figma-design
description: Design the APAC Rising Esports Manager UI and player cards in Figma through the Figma MCP server, driven by the spec in docs/. Use when asked to design, mock up or revise screens, flows, the player card, pack opening, match screens, or design tokens and components in the project's Figma file. Do not use for writing React code, changing game rules or balance, or editing the docs themselves.
---

# APAC Rising — Figma UI & Card Design

You design UI and player cards for *APAC Rising: Esports Manager* in Figma through the Figma MCP server. The docs in `docs/` are the spec: you translate them into design and do not invent product rules.

## Target file

- Figma file: https://www.figma.com/design/YxogrZ8VZegrMXynMxrdW4/Untitled?node-id=0-1 (fileKey `YxogrZ8VZegrMXynMxrdW4`)
- `node-id=0-1` is node `0:1`, normally the first page, not a frame. Pass the full URL to Figma tools. If a tool wants a `nodeId`, convert dashes to colons (`12-34` → `12:34`). To target a frame, use its "Copy link to selection" URL or ids from `get_metadata`.
- Work only in this file. Don't delete, restyle or move nodes you didn't create in this session without asking the user first.

## Preflight

1. Call `whoami`. If the Figma tools are missing or unauthenticated, stop and tell the user to run `codex mcp add figma --url https://mcp.figma.com/mcp` and sign in (or install the Figma plugin in the Codex app). Writing needs edit access and a Full seat outside drafts, and `use_figma` is beta.
2. If Figma's own `figma-use` skill is available, follow it for every `use_figma` call. The plain `codex mcp add` does not install it; the Figma plugin does. If it's missing, follow the workflow below.
3. Read only the docs relevant to the task (table below), not the whole pack. The docs are in Vietnamese.

## Read first, by task

| Task | Read |
|---|---|
| Visual direction, palette tokens, navigation, screen list, card anatomy, pack-opening beat, match watch, responsive + a11y | `docs/07_FRONTEND_UX_ART.md` |
| Onboarding F0 flow, menu, pillars, anti-patterns | `docs/01_PRODUCT_VISION_GDD.md` §3, §4, §8 |
| Card fields, stats, rarity, packs and odds, training, synergy, market, facilities | `docs/04_COLLECTION_PACKS_ECONOMY.md`, `docs/config/balance.initial.json`, `docs/config/player-card.example.json` |
| Match screens: opponent preview, archetypes, tactics, decisions per format, post-match "why" | `docs/13_MATCH_DECISION_SPEC.md`, `docs/05_MATCH_SIMULATOR.md` §5–6, `docs/config/tactics.matrix.json` |
| Campaign map, node states, chapters, demoScenario | `docs/03_CAMPAIGN_DESIGN.md`, `docs/02_CAMPAIGN_RESEARCH_REALITY.md` |
| Fictional names, boss archetypes | `docs/12_CONTENT_BLUEPRINT.md` |
| Rights, disclaimer text | `docs/11_RIGHTS_SOURCES.md` |
| What the UI must satisfy | `docs/09_ACCEPTANCE_QA.md` §A, §B |
| Scope and priority | `docs/00_START_HERE.md`, `docs/index.md` |

Precedence when docs conflict: `00` v2.2 scope cut > `02` > `01` > `03`–`09` > `config`. Say which rule you applied.

## Workflow

1. **Inspect first.** `get_metadata` with no node id lists pages; with an id it outlines that node. Use `get_variable_defs`, `get_libraries` and `search_design_system` to reuse what exists. `get_screenshot` takes one node per call.
2. **Plan in about 10 lines** before building: the pages, frames, components and variables you'll create, and the doc sections that drive each one.
3. **Build in small, verified steps:** variables → base components (**Player Card first**) → screens. One `use_figma` call is one coherent change. Each call returns at most 20 KB, so have your code return only node ids and names. Screenshot after each step and fix problems before moving on. Stay in one conversation for follow-ups on the same file.
4. **Verify** with the checklist in `references/figma-conventions.md`.
5. **Record and report** (see Report).

Conventions for pages, naming, variables, the Card component set and the checklist are in `references/figma-conventions.md`. Read it before the first `use_figma` call.

## Hard rules (from the docs)

1. **Rights** (`11` §1, `07` §4): use only abstract/geometric placeholder portraits and fictional names (sample pool in `12` §2). No real player photos or names, team logos, Riot/League/LCP/VCS/Worlds marks, champion art, or Acer/Predator marks. Don't use `generate_image` for portraits.
2. **No copying** the UI or layout of LoL Esports Manager, Worlds Mayhem or FC Online (`01` §8). Inspiration only.
3. **Cards** show rarity and season (year + edition code) in text or shape, never by color alone (`07` §4).
4. **Fiction is labelled.** LCP, First Stand, MSI and Worlds are fictional single-elimination. The demo scenario is marked "Demo". Include the disclaimer from `11` §5 in the Hub or Settings footer. The Predator cup is behind a flag and named "APAC Invitational" unless cleared.
5. **Server-authoritative UI.** Design loading, pending, retry and error states (pack open pending and retry-safe, match restore after reload). Don't design client-side rerolls, extra draw buttons, or reward choices the server doesn't decide. Pack Room shows odds, a confirm step, a Skip control and a reduced-motion variant, and reveals only after the result.
6. **No pressure mechanics:** no energy timers, countdown urgency, real-money store visuals or casino-style pack opening (`01` §8, `07` §1).
7. **Responsive + accessible:** frames at 390×844 and 1440×900; touch targets ≥ 44 px; no hover-only controls; text + icon status, not color alone; sufficient contrast (`07` §7).
8. **Vietnamese UI copy** with correct diacritics. Use a font that supports Vietnamese and is available in the Figma account (fonts only on this computer are unavailable to the tools).
9. **Don't invent product values.** OVR, odds, costs and stats come from the docs and `config/`. Where the docs are silent (for example Common/Rare/Epic accent colors, which three stats a card highlights), choose, log it under "Design decisions" on the Cover page, and mention it in the report.

## Priority order

1. Player Card component set (everything uses it).
2. F0 flow (`01` §3, `07` §2): Create Club → Starter Roster Reveal → Tutorial Match (opponent preview, phase decision, result with "why") → Welcome Pack opening → one-click Equip → Second Match → Hub.
3. Hub (with the `demoScenario` button), Lineup, Collection, Pack Room, Match Center, Campaign Map (Chapters 1–5 only), Training, Season Recap.
4. P2 only if asked: Market, Facilities, Hall of Fame.

## Report

End each session with:
- Created: name → Figma link (use "Copy link to selection" style URLs with node ids).
- Reused: libraries, components or variables that already existed.
- Decisions and assumptions, and any doc conflict and how you resolved it.
- What you did not do, and any tool limit you hit.
- Suggested next slice.

Also update `docs/design/FIGMA_INDEX.md` (format in the reference file) and append one dated line to the Log table in `docs/index.md`. Do not tick implementation checkboxes there: a design is not a shipped feature.
