# 04 — Collection, Pack, Economy & Club Systems

## 1. Card domain glossary
- `PlayerIdentity`: playerId, displayName, region, primaryRole, secondaryRole?, biography, age-appropriate content, licensing data.
- `PlayerCardEdition`: editionId, playerId, editionYear, editionCode (ACADEMY/BREAKOUT/CHAMPION/LEGACY), baseStats, baseOVR, rarity, styleTraits, artAssetId, eligibilityFlags.
- `OwnedCard`: ownedCardId, ownerClubId, editionId, level, trainingXP, enhancementRank, acquiredFrom, acquiredAt, version. Two copies of same edition are separate instances.
- `LineupSlot`: TOP/JUNGLE/MID/BOT/SUPPORT -> ownedCardId; unique per lineup (can't equip same physical card twice).
- `CareerSeason`: season counter for CLUB competition **not equal** editionYear for collectibles.

## 2. Stats and OVR
`MECHANICS`, `MACRO`, `TEAMWORK`, `MENTAL`, `CHAMPION_POOL`; all 0–100. `baseOVR` is a derived/curated value based on a documented weight table; *simulation uses attributes + role fit*, not single OVR. 2024/2026 edition of one pro may prefer different tactical phase. Display `effectiveOVR` from base + bounded training and enhancements; **rarity remains card property**.

### Example archetypes
- Lane Dominator: early laning and mechanical edge.
- Playmaker: objective/gank initiation.
- Late Carry: scaling performance.
- Shotcaller: macro/teamwork bonus.
- Clutch: resilience in high-stakes rounds.
- Flexible: better Fearless-lite champion pool across BO5.

## 3. Pack opening: server authoritative
| Pack | Default distribution | Earn method | Protection |
|---|---|---|---|
|Welcome|0 Common / 100% Rare+ with 80 Rare, 18 Epic, 2 Legendary|tutorial only|guaranteed upgrade|
|Scout|55 Common / 35 Rare / 9 Epic / 1 Legendary|campaign/credits|at most 8 openings without Epic+ if same pack family|
|Elite|0 Common / 55 Rare / 40 Epic / 5 Legendary|boss/season|Rare+|
|Champion|0 Common / 0 Rare / 85 Epic / 15 Legendary|major trophy|Epic+|

All probabilities are **prototype balancing**, visible to players and may change only with `packTableVersion` and explicit note. `pity` increases progress only for qualifying pack family and resets when Epic+ received.

**Định nghĩa pity chốt (v2.2):** `misses` = số lần mở liên tiếp của cùng pack family không ra Epic+. `pityEpicPlusAt = 8` nghĩa là **tối đa 7 lần liên tiếp không Epic+**; khi `misses == 7`, **lần mở thứ 8 buộc ra Epic+** (loại Common/Rare khỏi bảng trọng số của lần đó). Test biên bắt buộc: lần 7 vẫn có thể hụt, lần 8 không bao giờ hụt, `misses` reset về 0 sau Epic+ (kể cả Epic+ tự nhiên), và chạy 100k lần mở không bao giờ có chuỗi hụt > 7.

**Chất lượng Common (v2.2):** Common rơi từ Scout pack có `baseOvr >= scoutCommonMinOvr (62)` để tránh pack "hụt hoàn toàn" so với starter 55–65. Giá trị là giả thuyết cân bằng, hiệu chỉnh bằng mô phỏng. Avoid any real-money purchase, withdrawal or secondary market value.

### Open pack transaction
- Client sends `packInstanceId` + idempotency key.
- Server locks row (or atomic state transition) and validates ownership, status, card pool, table version.
- Choose outcome via server CSPRNG for pack draws (not frontend). Weighted result from eligible pool; guarantee minimum/ pity; persist selection **within same transaction** as mark pack OPENED, create OwnedCard, update pity, append immutable ledger.
- Return persisted reveal token/result. If timeout + retry with same idempotency key, return **same** card; never mint twice.
- If an edition has no cleared visual asset, use licensed placeholder asset until metadata is complete.

## 4. Economy
Wallet: Credits, TrainingMaterials, ScoutTickets. No real money / crypto / conversion. All modifications in ledger; balance is cached derived or stored atomically. Credit sinks: pack (Scout 800), training level (100–700 escalating), NPC direct signing (1,200–10,000), facilities (1,000+). Sources: first clear, split placement, daily optional, club goals. Avoid exponential inflation.

**Critical equation:** median first 3-match gains must purchase at least one **meaningful** improvement without requiring rare RNG; player without Epic for 8 Scout packs can still clear next chapter via strategy/training. Sinks may not soft-lock at zero: friendly practice available, scripted chapter sponsorship small funding on fail, or conservative refresh.

## 5. Training / enhancement
- `Level` 1–10: spend Credits + materials; gain +0–2 to selected stat per level (cap total progression). Deterministic, no failure for core training.
- `Enhancement` +0→+5: use duplicate/shards (future), should be unlocked at VCS chapter; no destruction/loss mechanic in MVP.
- `Potential` of starter allows meaningful progress (e.g. Common 62→80 effective), to preserve emotional attachment; must not trivialize 90+ legendary.
- Training cannot move card into incorrect role; training cost transparent before confirmation.

## 6. Synergy & roster
- Role fit exact +0, secondary -3, off-role -10 to 20 effective power points (balance required).
- Pair trait synergy: predefined data-driven pair tags and counter synergies, cap additive team synergy bonus ±8 effective points. Do not give country-based stats bonuses based on stereotypes.
- Five starters 55–65, all five roles filled, starter IDs immutable in Hall of Fame history.
- Bench supports replacements (no discard forced). Card sold/equipped validation atomic.

## 7. NPC Transfer Market
- Six offers rotate by career week/split; listings generated/persisted server-side, valid expiry and price. Not a player-to-player auction.
- On purchase validate funds, market item remaining and expiring/version, write transfer and wallet ledger in transaction. `UNIQUE(offer_id,club_id?)` per rule and idempotency key.
- Selling owned card to NPC allowed only if not in lineup and not protected starter; floor pricing does not enable buy/sell arbitrage.
- Real-life active contracts do **not** control collectibility (fictional cards), but Career Mode can restrict lineup registration through game-specific rules clearly disclosed.

## 8. Club facilities
Training Center: discount/material efficiency; Scout Office: unlock larger NPC offer set (not covert pay-to-win odds manipulation); Strategy Lab: extra scouting analysis. Max tier 3 in initial build. Effects data-driven and capped, no countdown waiting.

## 9. Fairness / privacy
No Portal login, no real-money microtransactions, clear rates, no exploitable refresh exploit; avoid designs that pressure excessive engagement. Allow immediate opt-out of audio and fast-skipping reveals.
