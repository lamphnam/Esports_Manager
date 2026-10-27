# 07 — Frontend UX, UI Flow, Animation and Art

## 1. Visual direction
Professional esports dashboard **with collectible card excitement** (FC Online-inspired, NOT copied), dark navy base with vibrant cyan/purple/gold rarity accents, tasteful cartoon/flat illustrations. Avoid a visually noisy 'casino' pack opening. Typography high contrast and Vietnamese localization. User selects **MOBA manager**, not an isometric live MOBA.

### Palette (initial tokens, configurable)
`bg #0B1220`, `panel #162033`, `panel2 #1E2A41`, `primary #19D3CF`, `accent #FFCB69`, `text #F7FAFF`, `muted #AAB7CB`, `danger #FB7185`, `legendary #F59E0B`.

## 2. Navigation IA
- First-time: Loading → Create Club → Starter Roster Reveal → Tutorial Match → Welcome Pack → One-click Equip → Second Match → Hub.
- Returning: Hub → Campaign (primary CTA), Team/Lineup, Collection, Packs, Training, NPC Transfer, Facilities, History, Settings.
- Match: Opponent Preview → strategy → series intro → phase decision → result/games summary → rewards → hub.
- Contextual tooltips and progressive reveal of features in Chapter 1–5.

## 3. Screen definitions
| Screen | Essentials | Empty/error/loading states |
|---|---|---|
|Hub|career stage, upcoming match, team rating, currency, pack count, quick rewards|API error with Retry; guest restore|
|Campaign Map|3 Act timeline, current split, locked/eligible/failed nodes, opponent preview, qualification explanation|no phantom unlocked stages|
|Lineup|five role slots + bench, effective stats, synergy breakdown, auto-compare|invalid roster highlighted|
|Collection|responsive player-card grid, filter role/year/rarity, card details and edition history|0 cards allowed only dev|
|Pack Room|odds view, pack count, deterministic reveal, Skip animation|opening pending and retry same idempotency|
|Training|cost preview, before/after stats, clear confirmation|disabled insufficient funds|
|Market|6 NPC offers, countdown based on server persisted expiry|expired offer refreshed|
|Match Center|scoreboard, game number, timeline, phase choices, report and speed controls|restore match after reload|
|Season Recap|rank, titles, card of MVP, upcoming split, upgrade suggestions|0 trophies valid|
|Hall of Fame|medal timeline, signature roster, rival history, share summary|new club empty state|

## 4. Player card anatomy
Role badge, edition year and code, nickname/full display per rights, OVR, rarity, license-cleared portrait, playstyle and 3 prominent stat bars; hover/tap expand 5 stats. Must show rarity and season in text/color-independently. Use responsive CSS grid; avoid scroll lock on mobile.

**Source asset rules**: use placeholder geometrical avatars/abstract portraits in dev. Real player pictures/real names only where user-supplied license scope covers use; do not download third-party photos from search and assume license. Team logos/skins/League champion splash art require separate rights.

## 5. Pack opening (design beat)
1. Confirm press (not forced accidental purchase); UI displays disclosed rates.
2. API open first; show animation only after canonical result or while awaiting result with retry-safe state.
3. 0.8s silhouette → rarity color bloom → 1.5s card reveal → comparison panel; reduced-motion skips animation entirely.
4. CTA `Thêm vào đội hình` (role eligible) and `Đóng`; no hidden additional draws from UI.
5. Reopened same pack displays previously minted card rather than drawing again.

## 6. Match watch experience
Each game 3 phase cards with actionable prompts. User can choose `Watch` (5–15 seconds/phase by UI), `Fast` or `Skip presentation`; outcome fixed. A scoreboard + compact timeline events, status badge, player impact. BO3/BO5 display game wins; no confusing 'game win' with 'series win'.

## 7. Responsive + iframe
- Primary targets desktop 1440×900 and mobile 390×844; test iframe sizes 1024×720, 768×600, 360×640.
- No mandatory keyboard or hover; buttons >=44px touch targets; scrollable layout (avoid nested scroll traps).
- Browser autoplay restrictions: unlock sounds after explicit user gesture; volume and mute stored locally when possible.
- `prefers-reduced-motion`, accessible text, keyboard focus, ARIA labels, contrast, icon+text status.
- Loading asset skeletons; route lazy loading; no large video downloads; avoid remote image failures via fallbacks and cached optimized WebP/AVIF.

## 8. Sharing
Generate **image of season recap / roster / championship** via canvas if desired but do not require sharing for gameplay, vote, rewards. Never impersonate official League/Acer logos unless permissions established. Avoid external popup/redirects from embedded iframe.

## 9. Component tree sketch
`AppShell` → `AuthBootstrap` → `CareerStateProvider` → `Router` → `ClubHub` / `CampaignMap` / `SquadBuilder` / `CollectionGrid` / `PackOpeningDialog` / `MatchViewer` / `FacilityView` / `SeasonRecap`.

State: TanStack Query for API/cache; Zustand optional for transient UI only. Don't duplicate server wallet/pack state in writable local store. Zod validate responses if used consistently. CSS modules/Tailwind either okay, choose once based on repo.
