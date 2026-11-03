# 12 — Content Blueprint: Card Catalog, Competition, Rival & Dialog

## 0. Snapshot nội dung đã triển khai — 03/11/2026

Catalog thực tế: **399 identities, 684 editions**, gồm 30 current pack editions, 649 `LEGACY` lịch sử và 5 bản 2026 TSW có nguồn/confidence/retrievedAt. Legacy có 374 identities, 73 teams, 129 team-years; importer và checksum ở `scripts/import-golden-road.ts`/`src/data/generated/legacyManifest.json`. Các nhóm identity có giao nhau nên không cộng số identity từng nguồn. `CURRENT_EDITIONS` là pool pack cố định; Legacy không vào pack (DEC-2).

Golden Road chỉ cung cấp dữ kiện/ratings được phép; mã, text, CSS, icon, UI và bố cục share-card không sao chép. Stats/ratings là cân bằng game, không phải đánh giá khách quan cá nhân. Dữ kiện 2026 chỉ lấy hàng đủ độ tin cậy; không dùng Low từ research. Toàn bộ hình vẫn là placeholder; chưa thêm ảnh/logo thật có asset_license.

Demo BO5 dùng đội lịch sử, không ghi career. Đối thủ Ch6–12/daily market dùng Legacy với seed/provenance, knockout có nhãn hư cấu. Draft clean-room có triển khai nhưng `FEATURE_GOLDEN_ROAD=false`. Các khối lượng/nhân vật/template ở §1 trở đi là mục tiêu và ví dụ thiết kế, không phải danh sách tính năng đã có; đặc biệt Rival Zero, Swiss, nhánh job LCK/LPL và Hall of Fame đầy đủ chưa được nghiệm thu. Bằng chứng: [Phase 3](evidence/PHASE_3.md), [Phase 4](evidence/PHASE_4.md).

## 1. Content volumes
Launch target: 30 player identities (6/role) × 2–3 editions ≈ 75 card editions; 5 starter academy identities can be fictional; licensed pro identities appended when asset approvals recorded. 12 major chapter milestones; 20–40 unique matchup fixtures via templates per split; 5 recurring rival archetypes + 1 named multi-season rival.

These quantities are **content goals**, not distinct code modules. Generate via structured JSON/DB seeds and validators.

## 2. Card identity authoring
For each identity: unique `slug`, primary role, region, playerName, `actualPerson`, `portraitAssetId`, bios (3 sentences max), 1 style preference, 1 weakness. For each edition: `year`, edition kind, base5 stats 0–100, `baseOVR`, rarity, trait codes, evidence/scouting tags, asset scope and sources. Don't claim objective comparative ability of a real player; ratings are game balance.

Sample fictional pool to seed: `RAVEN TOP`, `VEX JUNGLE`, `KAIRO MID`, `NOVA BOT`, `MINT SUPPORT` (starter), and `EMBER TOP`, `FLUX JUNGLE`, `SOL MID`, `HAZE BOT`, `LILY SUPPORT` (recruits). Names require uniqueness check/trademark search for public release if needed.

## 3. Competition templates
- `CAMPUS_FRIENDLY_BO1`
- `CAMPUS_CUP_SEMIFINAL_BO3`, `CAMPUS_CUP_FINAL_BO3`
- `ROAD_TO_VCS_QUALIFIER_BO3`, `ROAD_TO_VCS_FINAL_BO5`
- `VCS_REGULAR_FICTIONAL_MINI_ROUND_ROBIN`, `VCS_PLAYOFF_BO5`
- `LCP_STAGE_PER_SPLIT_FICTIONAL`, `LCP_FINAL_BO5`
- `FIRST_STAND_EVENT_IF_QUALIFIED`, `MSI_EVENT_IF_QUALIFIED`
- `WORLDS_2026_INSPIRED_PLAYIN`, `WORLDS_2026_INSPIRED_SWISS`, `WORLDS_2026_INSPIRED_KNOCKOUT`
- `PREDATOR_SIDE_INVITATIONAL` behind rights flag.

## 4. Boss opponent design
| Archetype | Weakness | Reward clue | Story |
|---|---|---|---|
|Campus Rivals|high mechanics, low cohesion|synergy tutorial|first local rivalry|
|Cyber Veterans|discipline, low late-scaling|flex training|old guard tests newcomers|
|VCS Dark Horse|explosive early, exposed late|counter aggression|underdog mirror|
|Pacific Strategists|objective control, weaker solo lanes|split tactic|APAC chess match|
|World Favorite|elite balanced roster, narrower champion pool|fearless-lite|Worlds titan|
|Rival Zero|adapts to player roster choices|counter-play/strategy lab|reappears over seasons|

Avoid generalizations about real countries; attach these traits to **specific fictional squads or concrete playstyle source data**, not nationality.

## 5. Narrative event examples
- `RIVAL_REMATCH`: if losing record > wins, flavor comeback; else rival vows revenge.
- `SCOUT_RECOMMENDATION`: offers a rare role patch for biggest team deficit.
- `ACADEMY_BREAKTHROUGH`: one starter has bounded stat boost after a training milestone.
- `BOARD_EXPECTATIONS`: short-term season goals and reputation bonus, not irreversible game over.
- `INTERNATIONAL_INVITE`: global event admission only after qualification.
- `SEASON_EPILOGUE`: recap wins/losses, best players, next split CTA.

Every event needs data-driven prerequisites, deterministic effect if any, once-per-season guard and localization. No AI generation in runtime required.

## 6. Content generation workflow for agent
1. Author JSON schema for identity, edition, chapter, rivalry, event and reward.
2. Generate candidate data with AI, using real player names only from rights-approved list; never use unverified image URLs.
3. Run JSON schema validation and referential integrity checks (roles, no missing assets, ordered states, branch dead-ends, reward first-clear).
4. Run simulation balance across all chapter opponents, audit difficulty jumps and currency flow.
5. Curate names, copy, stat variety; import via Flyway or stable content seed script with versioning.
6. Produce export for reproducible demo and QA.

## 7. Content balance targets
- 1st encounter tutorial win rate >80% for engaged new players; first 5min always provides a Rare+ pack.
- Typical chapter boss with average appropriately trained roster ~50–65% chance; lower and upper bounds tuned via tests.
- At no chapter does success require one unique Legendary; at least two viable strategies and one earnable non-RNG upgrade.
- Time to first meaningful lineup upgrade <5min target; first VCS trophy in ~30–60min accumulated play (playtest); Worlds achievement is longer-term aspirational and can be shortened for contest demo via `demoScenario` that doesn't contaminate real career.

## 8. Cắt nội dung v2.2
Mục tiêu thực tế cho bản nộp: **~30 card edition** (6 identity/role × 1–2 edition; phần còn lại là stretch), 5 chapter chơi đầy đủ, chapter 6–12 dạng cấu hình + `demoScenario`. Đầu tư vào khung thẻ/hiệu ứng reveal (CSS/procedural) thay vì ảnh chân dung.
