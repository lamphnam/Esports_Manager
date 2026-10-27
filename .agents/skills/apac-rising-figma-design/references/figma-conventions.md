# Figma conventions for APAC Rising

Defaults for organizing the Figma file. If the user states a different convention, follow theirs and record the change on the Cover page.

## 1. Pages

| Page | Contents |
|---|---|
| `Cover` | Title, doc version (v2.2), link to `docs/`, **Design decisions** log (text frame), disclaimer text |
| `Foundations` | Variable swatches, type scale, spacing/radius samples |
| `Components` | `Card/Player` set and its children, buttons, badges, bars, dialogs |
| `Flow F0` | The first-playable screens, left to right in flow order |
| `Screens` | Hub, Lineup, Collection, Pack Room, Match Center, Campaign Map, Training, Season Recap |
| `Scratch` | Experiments. Safe to ignore; never referenced by other pages |

Create pages with `use_figma`. Check `get_metadata` first and don't duplicate a page that exists.

## 2. Naming

- Pages: as above. Frames: `<Group>/<NN> <Screen> — <Size>` e.g. `F0/02 Starter Roster — Mobile 390`.
- State frames: suffix with the state, e.g. `… — Loading`, `… — Error`, `… — Empty`.
- Components: `Group/Name`, e.g. `Card/Player`, `Badge/Role`, `Badge/Rarity`, `Bar/Stat`, `Button/Primary`, `Dialog/PackOpening`.
- Variants use Title Case property names (`Rarity`, `Size`, `State`) and values (`Legendary`, `Compact`, `Equipped`).
- Layers inside components are named for their role (`ovr`, `role-badge`, `portrait`, `stat-bars`), not `Frame 12`.

## 3. Variables

Create collections instead of hard-coding values. Bind every fill, stroke, text color, spacing and radius to a variable.

- `Color`: one variable per palette token in `docs/07_FRONTEND_UX_ART.md` §1, named `color/bg`, `color/panel`, `color/panel-2`, `color/primary`, `color/accent`, `color/text`, `color/muted`, `color/danger`. Dark theme only. Copy the hex values from the doc, not from memory.
- `Rarity`: `rarity/common`, `rarity/rare`, `rarity/epic`, `rarity/legendary`. The doc fixes only legendary; choose the other three from the cyan/purple/gold direction and log them. Keep contrast with `color/panel` readable.
- `Space`: a 4-based scale (`space/4`, `8`, `12`, `16`, `24`, `32`). Mobile side gutter 16.
- `Radius`: `radius/sm`, `md`, `lg`.
- Name variables so they map directly to CSS custom properties (`--color-bg`) or Tailwind theme keys; the frontend chooses one later (`07` §9).

## 4. Card component set: `Card/Player`

Anatomy (`07` §4): role badge, edition year + edition code, nickname, OVR, rarity (as text/shape as well as color), portrait slot, playstyle line, three prominent stat bars. Expanded view shows all five stats: MECHANICS, MACRO, TEAMWORK, MENTAL, CHAMPION_POOL (0–100).

| Property | Values |
|---|---|
| `Rarity` | Common, Rare, Epic, Legendary |
| `Size` | Compact (collection grid, 2 per row at 390 wide), Detail (expanded, all 5 stats) |
| `State` | Default, Selected, Equipped, Locked, New |

- `Role` (TOP, JUNGLE, MID, BOT, SUPPORT) is a nested component `Badge/Role` with its own `Role` variant, to avoid a 4 × 5 × … variant explosion. Expose it as an instance-swap property.
- Text content is exposed as text properties (name, OVR, edition label, playstyle).
- `portrait` is a placeholder slot (geometric vector avatar). It must be swappable for a license-cleared image later, and must have a fallback state so there is never a broken thumbnail.
- Compact text must stay legible at 390 px; default minimum text size 12.
- Sample content: the three KAIRO editions in `docs/config/player-card.example.json` (Common 64, Epic 84, Legendary 93). Use a fictional name from `docs/12_CONTENT_BLUEPRINT.md` §2 for Rare. Every sample OVR must sit inside its rarity range in `docs/config/balance.initial.json`.
- Which three stats are the prominent bars is not specified. Default: the card's three highest stats. Log it.

## 5. Frame sizes

- Primary: Mobile 390×844, Desktop 1440×900.
- Iframe checks (Hub and Match Center only): 1024×720, 768×600, 360×640.
- Use auto layout so frames resize. Avoid nested scroll areas on mobile.

## 6. Per-screen verification checklist

- [ ] Content comes from the cited doc section; no invented numbers
- [ ] Loading, empty and error states exist where `07` §3 lists them
- [ ] Tap targets ≥ 44 px; no hover-only affordance
- [ ] All colors, spacing and radius are bound to variables (no raw hex)
- [ ] Components used as instances, none detached
- [ ] Text not clipped at 390 wide; Vietnamese diacritics render
- [ ] Rarity and season shown in text, not only by color
- [ ] No real-person photo/name, team logo or third-party mark
- [ ] Fictional/Demo labels and disclaimer present where required
- [ ] Layers named; frame named per section 2
- [ ] Screenshot taken and checked after the final change

## 7. Tool limits to remember

- Each tool call returns up to 20 KB. Return ids, not full trees.
- `use_figma` can't add new images itself. Use `upload_assets` for approved images; avoid `generate_image` for portraits.
- Importing components that contain images or video isn't supported.
- Fonts must exist in the Figma account.
- `get_screenshot` handles one node per call.
- Output is beta quality: inspect it, don't assume it is correct.

## 8. `docs/design/FIGMA_INDEX.md` format

Create the file if absent; update, don't rewrite.

```markdown
# Figma index

File: https://www.figma.com/design/YxogrZ8VZegrMXynMxrdW4/Untitled

| Frame / component | Figma link | Doc source | Status |
|---|---|---|---|
| Card/Player | <link to selection> | 07 §4, 04 §2 | draft / reviewed / ready for code |
```

A future frontend agent uses these links with `get_design_context`, so every row needs a working link to the selection.
