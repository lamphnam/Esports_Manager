# 11 — Rights, Contest Compliance & Sources

## 1. User-supplied rights information
Project owner stated: **Riot has granted permission via email to use player names and photographs**. Treat this as a granted project constraint; do not dismiss it. However, do **not** infer that such permission automatically covers every image source, club logos, Riot trademarks, champ art, UI, broadcast footage, likeness modification, derivative designs, or Acer Predator League marks.

**Update 03/11/2026:** the owner now states that the Riot email covers everything with no limits (`DECISIONS.md` Q2). Treat that as the project constraint and do not add limits of your own. The asset-level checklist below still applies to any image or logo file that is added, and Acer/Predator League marks are not Riot's to grant.

### Asset-level rights checklist
Record for each asset: `assetId`, `athleteName`, `sourceURI`, `copyrightOwner`, `licenseEmailRef`, `permittedUses`, `allowedDerivativeEdits`, `commercialOrContestScope`, `territory`, `expiry`, `attribution`, `approvedAt`, `fileHash`. Don't store private email content in public repo; keep redacted evidence/review note privately. If not covered, use original flat-art placeholder.

### Before enabling real assets
- Verify email applies to **this game, contest, hosting and distribution**, and permits portrait/card transformation if used.
- Check photos: esports organization/team/photographer may hold copyright independently of person name/likeness.
- Real club names are allowed (owner, 03/11/2026, `DECISIONS.md` Q2). For logo files confirm who holds the copyright and record an `asset_license`; use placeholders until then.
- Confirm use of League/Worlds/LCK/LPL/VCS/LCP marks, event branding and 'Predator League' mark separately if visualized.
- Never claim game is official Riot/Acer title without explicit authorization.
- Maintain data source and last-updated dates; invented ratings are **game balance**, not objective assessment of real individuals.

## 2. Contest rules snapshot
Official terms: https://predatorleague.acervietnam.com.vn/terms?tab=technology
- Submission deadline in supplied rules: 15/11/2026; vote end 22/11/2026.
- web iframe embedding hosted by contestant, avoid extra permissions/camera/mic, Portal credential collection, redirects and copied commercial game assets.
- AI-assisted development permitted subject to actual rules; retain Git history and AI logs when possible.
- Teams max five students same university; this project is solo.
- Portal voting is platform-managed and never simulated by in-game interactions.

**Note:** Terms may change; use current terms over this snapshot at submission. Vote-point values differed across discussions/versions; not used in design/economy.

## 3. Primary sources & what they substantiate
1. **Riot 2027 LCP ecosystem (Sep 21, 2026)**: VCS/PCS/LJL domestic each split → LCP (APAC top teams) → global qualification; future format details not fully specified.  
   https://lolesports.com/en-SG/lolesports/news/a-more-open-lcp-ecosystem-in-2027
2. **Riot VCS 2026 announcement**: grassroots Road to VCS domestic qualification and VCS format for 2026.  
   https://lolesports.com/vi-VN/news/gioi-thieu-vcs-
3. **Riot Worlds 2026 primer**: Play-In 4 team BO5 double elimination → Swiss 16 / 3 wins or losses → KO 8. **This is 2026, not authoritative for 2027.**  
   https://lolesports.com/en-GB/news/worlds-2026-primer
4. **Acer Predator League official overview**: Jan 2027 Vietnam, League of Legends and Valorant, 14 regions. Separate esports tournament.  
   https://www.predator-league.com/about
5. **Contest tech rules**: hosting via iframe, student eligibility, use of AI and conduct restrictions.  
   https://predatorleague.acervietnam.com.vn/terms?tab=technology

## 4. Confidence / interpretation
| Assertion | Status | Design usage |
|---|---|---|
|LCP 2027 receives qualifiers from VCS/PCS/LJL per split|official announcement|hard world-model rule|
|Exact LCP split slots and bracket in 2027|not yet confirmed in cited announcement|parameterized fiction; never label official|
|Road to VCS grassroots track in 2026|official reference|inspiration; not universal eligibility claim|
|Worlds 2026 Swiss 3W/3L|official 2026|2026-inspired template|
|Worlds 2027 exact tournament format|not established here|future rules version pending|
|Player images and names licensed by Riot|user representation, agreement text not inspected|apply with per-asset verification|
|Game card OVR, pack probabilities, stage boss ratings|invented gameplay parameters|not historical truth|
|Predator APAC cup qualifies for Worlds|false relationship|never implement|

## 5. UI disclaimer suggestion
"Trò chơi mô phỏng sự nghiệp esports, sử dụng quy tắc và chỉ số mang tính giải trí. Lịch/điều kiện tham dự có thể được giản lược và không phản ánh đầy đủ hệ thống thi đấu chính thức."

## 6. Third-party datasets and fan-project policy (added 03/11/2026)
- **`docs/ref/golden_road/`** is the source of a fan game (goldenroadlol.com) that carries ads consent and a Ko-fi button. Treat it as a third-party commercial work. Do not copy its code, UI text, CSS, share-card layout, role icons or any string. Its **rating values** are the author's own judgement; the owner states (03/11/2026, `DECISIONS.md` Q1) that permission to reference, use and adjust them has been obtained. That permission covers ratings only. Keep the grant message outside the public repo, and keep `ratingSource` (`golden_road` / `adjusted` / `derived`) and `datasetVersion` on every generated edition. Whether a credit line is required is open (Q6).
- **Riot "Legal Jibber Jabber"** (https://www.riotgames.com/en/legal, last updated August 2018, read 03/11/2026): noncommercial fan projects only, a conspicuous disclaimer is required, no logos or trademarks without a written license, and "We prohibit the use of our IP in games and apps." The owner states (03/11/2026, `DECISIONS.md` Q2) that the Riot email covers everything with no limits; treat that as the project constraint and this public policy page as reference only. The email text itself has not been inspected by the agents. Keep the §5 simulation disclaimer and never present the game as an official Riot/Acer title.
- **Real club names**: allowed (`ENABLE_REAL_CLUB_NAMES` defaults to `true`, `teamAlias` is the fallback); see `DECISIONS.md` DEC-3. **Image and logo files**: still record an `asset_license` row per asset (§1 checklist), because the copyright in a photo or a logo can sit with a club or a photographer; no cleared files exist in the repo yet, so placeholders stay.
- **Player biographies**: real personal details (full legal names, career claims) without a cited source are not allowed in card text; see `DECISIONS.md` DEC-6.
- **Fact snapshots** for LCP/MSI/First Stand/Worlds 2026 live in `research/LINKS_AND_FACT_CHECK.md` with a confidence per row.

Addition to §4:

| Assertion | Status | Design usage |
|---|---|---|
|Rating values in the Golden Road dataset may be reused and adjusted|owner states permission obtained (Q1, 03/11/2026); grant text not inspected|use as starting values with `ratingSource`; ratings only, not code or UI|
|Riot's email covers everything, including real club names|owner states no limits (Q2, 03/11/2026); email text not inspected; Riot's public policy page is stricter|real club names on; per-asset `asset_license` for any image or logo file; keep the email evidence privately|
|Worlds 2026 slots and format from a blog|third-party, unconfirmed|do not hard-code; check the official primer|
