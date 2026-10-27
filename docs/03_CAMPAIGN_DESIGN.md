# 03 — Campaign Design | Campus → World Champion

## 1. Campaign philosophy
Career là **season-state-machine có nhánh**, không phải 20 stage tuyến tính luôn phải thắng. Cấu trúc kể chuyện 3 Acts / 12 Chapters chỉ là **milestone**; engine chạy fixtures, qualification, placement, retry tại grassroots và next split/year khi thua cấp pro.

**Long-term quest:** Lập CLB từ campus ở Việt Nam → đạt danh hiệu VCS → giành suất LCP theo split → đủ điều kiện dự global events → tới Worlds → trở thành World Champion. Nhánh Predator Cup độc lập. LCK/LPL là đối thủ global hoặc manager job offer về sau.

## 2. Three-act / 12-chapter design
| # | Chapter | Story | Opposition | Gameplay lesson | Unlock / reward | Outcome on loss |
|---|---|---|---|---|---|---|
|1|Five Strangers|5 sinh viên lập CLB, scrim đầu|OVR 55–63|role-fit; thay card|welcome Rare pack; Collection|replay tutorial|
|2|Campus Kings|vòng sinh viên địa phương|60–70|synergy + tactic|Training; Campus Cup|thử lại theo bracket campus|
|3|Road to VCS|đối đầu Cyber/Community qualifiers giả lập|65–76|BO3 và draft|NPC Scouting; Credits|tập luyện & mùa qualifier sau|
|4|Pro Debut|lần đầu VCS|72–81|quản lý 1 split, đặt mục tiêu|Club reputation, contract-lite|đóng split; cơ hội sau|
|5|Vietnam's Crown|đua danh hiệu/suất APAC|76–85|BO5, depth|VCS trophy; LCP qualifying route|xem season recap, next split|
|6|Pacific Rivals|đối đầu đại diện PCS/LJL/VCS tại LCP|80–89|counter-style|International Scouting|quay lại domestic next split|
|7|First Stand|global event đầu mùa **nếu đủ vé**|84–92|BO series và adaptation|International prestige|sự kiện bỏ qua, season continues|
|8|Midseason Masters|split giữa mùa & MSI nếu đủ vé|85–94|series stamina|Elite Card pack|còn đường end-season|
|9|Last Ticket|split cuối, kiếm vé Worlds|86–95|fearless-lite, budget|Worlds ticket / epilogue|next career season|
|10|Against the World|Play-In nếu theo seed, hoặc direct Swiss|88–96|scouting đối thủ|Worlds Debut edition|kết thúc Worlds / next season|
|11|Swiss Survival|3 thắng đi tiếp, 3 thua loại (2026-inspired)|90–98|counter-strategy qua vòng|Worlds Top 8|worlds exit report|
|12|Write Your Legacy|QF/SF/Final BO5|93–99|đội hình toàn diện|World Champion Hall of Fame|Worlds exit report|

*OVR trên là dải gợi ý chứ không là rào khóa cứng. Match simulator phải cho phép upset nhưng không bất công.*

## 3. Competition state model
`LOCKED → ELIGIBLE → REGISTERED → ACTIVE → COMPLETED | ELIMINATED | SKIPPED_INELIGIBLE`.
`CareerSeason`: `PRE_SEASON → DOMESTIC_SPLIT_1 → [LCP_STAGE_1] → [FIRST_STAND] → DOMESTIC_SPLIT_2 → [LCP_STAGE_2] → [MSI] → DOMESTIC_FINAL_SPLIT → [LCP_FINAL_STAGE] → [WORLDS] → OFF_SEASON → NEXT_YEAR`.

`[x]` là conditional branch. Lịch là **fictional adaptation of seasonal cadence**, không gán là lịch Riot 2027 chính thức.

### Qualification constraints
- Domestic entry: hoàn tất Road to VCS qualifier trong game → VCS eligibility; không tự động nhận suất từ campus.
- LCP: xét vị trí ở VCS từng split dựa trên `qualificationConfig` **trong game**.
- First Stand/MSI: dựa trên **LCP outcome** kỳ tương ứng và suất giả lập configurable.
- Worlds: đạt đủ điều kiện LCP end-season hoặc suất performance rule fictional; Play-In tùy seeding.
- Predator Cup: eligibility độc lập; không liên thông tới Worlds qualification.

### Result handling
- Grassroots tutorial: retry tự do; thưởng first-clear 1 lần.
- Pro split: mỗi fixture chỉ chốt 1 lần; thua → standings, playoffs nếu đủ điều kiện; loại → kết thúc split + phần thưởng thứ hạng + off-season; tuyệt đối không xoá club/card.
- Global event loss → season summary + Hall of Fame; người chơi được tiếp tục mùa kế hoặc xin quản lý CLB khác (V2).

## 4. Competition formats supported
> **v2.2 ưu tiên:** mặc định mọi giải sau VCS (LCP, First Stand, MSI, Worlds) dùng **knockout đơn BO3/BO5 hư cấu có nhãn**. Swiss / double elimination / Play-In là P2, chỉ làm khi đã qua test và còn thời gian. Chapter 6–12 vẫn là dữ liệu cấu hình, không cần engine riêng.

- Single elimination BO1/BO3/BO5, best-of series tracked game-level.
- Mini round-robin 4 hoặc 6 đội dùng 3–5 fixtures đại diện trong MVP (UI giải thích là phiên bản rút gọn).
- Double elimination tùy event (backend configurable; có losers bracket rõ ràng).
- Swiss Worlds-inspired: một nhóm 16 đội, 3 thắng/3 thua; tạo pairings theo record, tránh rematch nếu có thể; win/loss cutoff. Design TDD cho edge cases odd groups/paired rematches. Nếu chưa implement robust Swiss, fallback `Swiss-lite` có nhãn fictional, không tự xưng là thể thức chính thức.
- Knockout 8 đội BO5; seeded bracket; replays read-only.

## 5. 1-year season example (fictional)
| Segment | User decision | Stakes | Story |
|---|---|---|---|
|Preseason|contracts/training/transfer/strategy|sẵn sàng split|đặt mục tiêu ban điều hành|
|Domestic 1|3 fixtures → playoff|suất LCP|underdog vs favorites|
|LCP 1|APAC opponents|First Stand ticket|first international rival|
|First Stand|global invitational conditional|prestige, rewards|first meeting LCK/LPL|
|Domestic 2|form, transfer limited|LCP/MSI ticket|rival comeback|
|LCP 2/MSI|BO5/exhibition|international trophy|strategic mastery|
|Domestic 3|last domestic push|last LCP/Worlds path|qualification drama|
|LCP Finals|regional playoff|Worlds seed|APAC championship|
|Worlds|Play-In if seeded → Swiss → KO|World Champion|Hall of Fame epilogue|
|Offseason|recap, contract renewal, new editions|retain squad|new season begins|

## 6. Narrative episodes & recurring rival
- **Rival Zero**: fictional Campus rival. If player loses first encounter → rivalry comeback; if wins → rival vows revenge. Reappears at Road to VCS, VCS, optional LCP if they qualified; simulate their career independent of player.
- **Press & fan reactions**: flavor text templates grounded in actual match stats, NOT fabricated real-player quotations.
- **Scouting offer** after chapters 2, 5, 8; tension between loyalty, skill and budget.
- **Underdog legacy**: track starter player usage, match MVP and Hall of Fame alumni; no forced dismissal.
- **Signature match** 1 per chapter with named tactic/weakness; failure reports suggest two concrete remedies.

## 7. Campaign rewards table (starter parameters)
| Milestone | Reward (first clear only) | Repeat/season |
|---|---|---|
|Tutorial|Welcome Rare+ x1, credits 500|0|
|Campus win|Scout x1, credits 200|credits only, capped|
|Road to VCS qualification|Elite x1, credits 800|one per cycle|
|VCS playoffs entry|training mats, credits 1200|per split|
|VCS title|Elite x2, reputation +200|per season|
|LCP berth|regional scout ticket x1|per split|
|LCP title|Champion x1, trophy|per title|
|MSI/First Stand appearance|event edition token (non-tradable)|per event|
|Worlds Top 8|Legacy shards|per year|
|Worlds champion|trophy, one Legacy-choice reward|per year|

**Anti-farm:** stage `firstClearClaimed` + unique reward ledger; no infinite pack loops or reward on replaying cached result.

## 8. Side path: Predator Cup
Story beat optional around end of first domestic success, path `VN QUALIFIER → APAC MAIN EVENT → APAC FINAL`; no condition/slot to LCP or Worlds. Early alternate climax to suit contest theme. Feature flag until trademark scope checked; if unavailable call `APAC Invitational` with fictional marks.

## 9. Future: Global Manager Career (V2)
After reputation threshold, offers: academy coaching / challengers / LCK team manager / LPL organization. `CareerSave` holds employer club and salary, `AccountCollection` separate from registered roster; moving manager does not teleport owned real-world contracts into a new club without rules. Not in initial release unless core stable.

## 10. Campaign content authoring schema
`competition_templates`, `competition_instances`, `fixtures`, `standings`, `qualification_rules`, `season_states`, `chapters`, `episode_beats`, `milestone_rewards`. Config-driven, with validation of format/tier/seed/rulesYear and `fictionalAdaptation` metadata.

## 11. demoScenario (v2.2, P1)
Nút "Chung kết thế giới (demo)" ở Hub: BO5 với đội dựng sẵn OVR ~88 vs đối thủ "World Favorite", ~3 phút, dùng chính simulator và UI thật, **không ghi** reward/progress vào career. Mục đích: để người chơi thử 5 phút vẫn thấy cao trào. Gắn nhãn rõ "Demo".
