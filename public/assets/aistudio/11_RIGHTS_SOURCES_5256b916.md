# 11 — Rights, Contest Compliance & Sources

## 1. User-supplied rights information
Project owner stated: **Riot has granted permission via email to use player names and photographs**. Treat this as a granted project constraint; do not dismiss it. However, do **not** infer that such permission automatically covers every image source, club logos, Riot trademarks, champ art, UI, broadcast footage, likeness modification, derivative designs, or Acer Predator League marks.

### Asset-level rights checklist
Record for each asset: `assetId`, `athleteName`, `sourceURI`, `copyrightOwner`, `licenseEmailRef`, `permittedUses`, `allowedDerivativeEdits`, `commercialOrContestScope`, `territory`, `expiry`, `attribution`, `approvedAt`, `fileHash`. Don't store private email content in public repo; keep redacted evidence/review note privately. If not covered, use original flat-art placeholder.

### Before enabling real assets
- Verify email applies to **this game, contest, hosting and distribution**, and permits portrait/card transformation if used.
- Check photos: esports organization/team/photographer may hold copyright independently of person name/likeness.
- Confirm who may use real club names and logos; use fictional names/marks until verified.
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
