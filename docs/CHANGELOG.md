# CHANGELOG

`rulesVersion` hiện tại: **v1.2.0** (`docs/config/balance.initial.json`). Đổi luật gameplay phải tăng `rulesVersion`, ghi một mục ở đây và kiểm tra các nơi lặp số (pack odds/pity: `ECONOMY.md` + `balance.initial.json`; giới hạn simulator và chính sách quyết định: `MATCH_SIMULATOR.md` + `balance.initial.json` + `tactics.matrix.json`).

## 2026-11-04 — căn chỉnh dữ kiện LMHT Esports (UpdatePack, chỉ copy và nhãn, không đổi luật)

Không đổi `rulesVersion` (v1.5.0): không đổi ID chương, `code`, thể thức, thưởng, pack odds, công thức OVR, seed, `legacyOpponent()`, Gen.G trùm cuối, save.

- Ch10 không còn ghi "Vòng Swiss": **Tứ Kết Worlds (BO5 giả lập)**, giữ BO5; nhãn stage "Tứ kết (giả lập)"; blurb Worlds nói rõ game lược bỏ Play-In và Swiss. Ch11/12 là Bán kết/Chung kết giả lập.
- `src/data/campaignCopy.ts` (mới): copy riêng cho từng chương, thay đoạn `map` từng ghi đè description/subtitle/epilogue Ch6–12 bằng một câu chung. Copy Ch3–12 không nêu tên đối thủ (đối thủ đổi theo seed/mùa).
- Ch5: bỏ "nhà vua GAM" và "vé chính thức tiến vào LCP 2027"; GAM là đội All-Star giả lập, không phải nhà vô địch VCS 2026. Ch3–4 đánh dấu giả lập.
- `rulesBasisYear` 2027 → 2026 cho mọi chương; `realWorldReferenceUrl` trỏ handbook 2026 (Ch1–9) hoặc Worlds 2026 primer (Ch10–12); `adaptationNote` riêng từng chương.
- `Chapter.opponentOrigin` (tùy chọn, dẫn xuất từ code, không lưu save) + nhãn trong Chiến Dịch và báo cáo trinh sát trước trận; mô tả chặng Chiến Dịch ghi "hành trình giả lập".
- Test: `campaignCopy.test.ts` (11 test): khóa ID/code/format/thưởng, Ch10 không Swiss, Ch5 không hứa suất LCP, Ch6–12 copy riêng, không tên đối thủ cố định, nhãn nguồn, metadata, ID edition duy nhất, provenance thẻ 2026, tương thích save/qua mùa.
- **P1 (cùng ngày):** `src/data/esportsReference.ts`, lớp metadata thật/giả (`verified_real_world`, `secondary_confirmed`, `fictional_campaign`, `historical_roster`, `game_derived`, `pending`) với registry nguồn và các fact có `asOf`; giá trị chưa công bố là `null` (nhà vô địch Worlds 2026, số suất LCP 2027). Không đụng simulator, economy hay save, không cần migration.
- Chi tiết thẻ (Bộ Sưu Tập) hiện nhãn nguồn: thẻ Legacy ghi "Roster lịch sử {năm}, không phải mùa 2026"; năm thẻ Team Secret Whales ghi roster 2026, danh hiệu LCP 2026 (metadata, không tạo edition mới) và "chỉ số do game suy ra". Thẻ hand-written của `CURRENT_EDITIONS` không có provenance nên không hiện nhãn.
- Test: `esportsReference.test.ts` (6 test): nguồn đã đăng ký, giá trị chưa công bố là `null`, nguồn thứ cấp không bị gắn nhãn Riot, Worlds thật khác shortcut của game, nhãn thẻ, không có edition danh hiệu bịa.
- **Cố ý không làm:** thẻ First Stand Champion (BLG) và MSI Champion (HLE), vì chưa xác minh roster năm người tại thời điểm nhận cúp; thẻ Worlds 2026 Champion, vì chung kết chưa diễn ra. Không thêm edition TSW "Triple Champion": edition mới vào pool pack và làm đổi cơ cấu pack; danh hiệu được ghi như metadata của năm thẻ hiện có. Qualification 2027, Swiss/Play-In, Fearless Draft, thay roster Legacy vẫn là P2.
- Thư mục `Esports_Manager_UpdatePack_2026-11-04/` đã được xóa sau khi nhập; nguồn và fact nằm trong `esportsReference.ts`, bản copy chương trong `campaignCopy.ts`.

## 2026-11-03 — thiên vị Chovy/Gen.G, Gen.G là trùm cuối (rulesVersion v1.5.0)

- `favorites.ts`: trọng số chọn thẻ trong cùng độ hiếm (Chovy ×5, Gen.G ×2); odds độ hiếm và pity không đổi. Ngôi sao cạnh tên thẻ; ghi chú ở màn Pack.
- Chapter 12 luôn là Gen.G (`FINAL_BOSS`), loại Gen.G khỏi các chương khác; nhãn "Trùm cuối" ở bracket, Hub và màn trước trận.
- Test: `favorites.test.ts`, `season.test.ts` mở rộng; `progression-sim` vẫn đạt mọi dải (Ch12 Gen.G thắng 46–51%).

## 2026-11-03 — minimap thật và icon vai trò trên bản đồ trận

- `LaneMap` dùng minimap Summoner's Rift (`src/assets/map/summoners-rift-minimap.png`, 512px, 73 KB) làm nền; đường đi và vị trí jungle căn lại theo ảnh. Token hiển thị bằng icon vị trí (`roleIconSrc`) thay cho chữ viết tắt; thiếu icon thì hiện nhãn TOP/JNG/MID/BOT/SUP.
- Đổi tên file bản đồ bỏ dấu nháy. Ghi `asset_license` (Riot, theo email của chủ dự án).

## 2026-11-03 — logo game

- Logo do Gemini tạo (chữ A vàng, đôi cánh xanh, nền navy) thay ô cúp trong navbar; favicon 32/64px và apple-touch-icon 180px trong `public/`. Bản gốc 2048px (3.7 MB) giữ ở `src/assets/brand/logo-master.png` và **không** vào bundle; chỉ bản 128px (33 KB) được đóng gói. Nền logo là navy đặc, chưa có bản nền trong suốt.

## 2026-11-03 — icon vị trí từ LoL Wiki (chờ file)

- `RoleIcon` dùng 5 PNG trong `src/assets/roles/` (top, jungle, mid, bot, support) nếu có, đóng gói cùng build; không có thì dùng SVG cũ nên build không phụ thuộc. Kích thước mặc định 18px. Đã kiểm bằng 5 PNG thử (đã xóa): Hub nạp 10 icon, Training 6 icon, đều tải được.
- Chưa có file thật trong repo: wiki chặn tải tự động, cần lưu tay. Hướng dẫn và bảng `asset_license` ở `CONTEST_AND_RIGHTS.md` §5.

## 2026-11-03 — UI trận kiểu Worlds Mayhem, bracket mùa giải, qua mùa mới (rulesVersion v1.4.0)

- **Màn trận:** hai hàng đội hình (đối thủ trên, đội bạn dưới, chữ viết tắt thay ảnh), bản đồ đường đi SVG có token trượt theo pha, thanh tiến trình M1…M5, tiêu đề giải/vòng (`MatchVisuals.tsx`). Chỗ trống bên trái trước đây đã có đội hình của bạn.
- **Bracket:** `SeasonBracket` gom 12 chương thành 7 giải (Sinh Viên, Road to VCS, VCS, LCP, First Stand, MSI, Worlds với Vòng bảng/Bán kết/Chung kết); hiện ở Hub và Chiến Dịch. Chưa thêm trận mới.
- **Qua mùa (DEC-15):** thắng Ch12 → tổng kết → `startNextSeason`: năm +1, completed `[1, 2]`, chương 3, +1000 credits; đối thủ Ch3–12 là đội lịch sử mạnh hơn (mục tiêu 92→97, +2 mỗi mùa, trần 97). `progression-sim` mô phỏng 3 mùa.
- Test: `season.test.ts`, `narrative.test.ts` mở rộng; E2E `e2e-season.js`; `e2e-layout` chuyển sang "Danh sách chương". `balance.initial.json` v1.3.0 → v1.4.0.

## 2026-11-03 — cân bằng Ch6–12, pool pack, xem đội đối thủ, log màu (rulesVersion v1.3.0)

- **Độ khó Ch6–12 (DEC-14):** đối thủ không còn rút ngẫu nhiên; OVR mục tiêu tăng dần 80→95, đội thật gần mục tiêu, mỗi đội một lần, `difficultyBonus` ≤ 16 hiển thị cho người chơi. `scripts/progression-sim.ts` mô phỏng tiến trình thật (reward + mua pack) và đưa vào CI/`verify-release`. Người chơi engaged thắng ~45–55% thay vì ~90%. DEC-5 (Ch1–5) không đổi.
- **Pool pack (DEC-13):** `PACK_POOL` = 30 CURRENT + 649 LEGACY (trước chỉ 30 thẻ). Odds/pity giữ nguyên. Thay test DEC-2 bằng test đa dạng/odds/đảm bảo.
- **Đội hình đối thủ:** `OpponentRoster` ở Hub, Campaign, Match Center (vai trò, tên, OVR, ghi chú cân chỉnh).
- **Log màu:** `PhaseLog.tsx`, có lợi xanh / bất lợi đỏ, áp cho recap, replay và demo.
- `balance.initial.json` rulesVersion v1.2.0 → v1.3.0. Save cũ giữ nguyên thẻ đã có.

## 2026-11-03 — log trận khớp kết quả ván, sửa Navbar màn rất rộng (không đổi rulesVersion)

- `simulateGame`: ván thắng khi thắng ≥ 2/3 pha, nhưng lời kể pha LATE trước đây theo kết quả riêng của pha đó (thắng pha = "phá Nexus đối phương", thua pha = "đối phương tràn vào căn cứ") nên có thể kể ngược kết quả ván. Nay khi pha LATE trái chiều với ván, chỉ lời kể (`events`, `keyMoment`) được viết lại để dẫn tới đúng người thắng. Người thắng pha, xác suất, vàng và mọi lần rút RNG giữ nguyên: balance-sim y nguyên (68.70 / 54.23 / 48.63 / 49.52 / 49.30 %).
- Test: `narrative.test.ts` (3000 seed: dòng cuối khớp người thắng ván, cả hai trường hợp trái chiều đều xuất hiện; lời kể chỉ là lớp trình bày). Test golden sub-seed so sánh phần rút ngẫu nhiên, bỏ qua lời kể LATE vì giờ phụ thuộc kết quả ván. Save cũ giữ lời kể cũ.
- Navbar: bỏ tab inline từ `2xl` (cột nội dung giới hạn 1280px nên ví bị ép còn icon); tab luôn nằm ở hàng riêng từ `md`, ví không co. Lưới "Hoạt động khác" ở Dashboard về 2×2.

## 2026-11-03 — đánh bóng UI/UX (không đổi luật, kinh tế, công thức)

- Token ngữ nghĩa trong `index.css` thay ~790 chỗ màu hex/`slate-*`/`amber-*`… rải rác; thang chữ, lớp `.panel/.btn/.badge/.option`, một hệ rarity.
- Component dùng chung mới trong `ui.tsx`; viết lại `PlayerCard` (tên + OVR trước, thuộc tính phụ), `Navbar` (ưu tiên mục, menu di động), `TrainingView`, `HubView`; áp `PageHeader`/`SegmentedControl` cho Bộ Sưu Tập và Đội Hình.
- Sửa: nhãn role tràn avatar, thanh lọc bị bẻ chữ, header chồng nhau, `holo-card-shine` 200% gây tràn, bỏ `overflow-x:hidden` toàn body, chữ trắng trên nền sáng thiếu tương phản, mã thô `EARLY_AGGRO` ở Campaign.
- E2E: `e2e-layout` mở menu di động, `e2e-demo` tìm nút theo `Demo BO5`.

## 2026-11-03 — DEC-12: lưu trữ chịu được storage không bền (không đổi rulesVersion, không đổi luật)

- Thêm `src/lib/backupMeta.ts` (điểm tiến trình, chấm báo/nhắc sao lưu, key `apac_backup_meta`) và `src/lib/environment.ts` (phát hiện nhúng iframe và Safari/iOS để chọn lời khuyên).
- `GameContext`: đọc lại sau mỗi lần ghi save và trong probe lúc tải, `navigator.storage.persist()` best-effort, theo dõi sao lưu; Navbar có chấm báo; banner nhắc không chặn; màn Sao lưu hiện lần sao lưu gần nhất và lời khuyên theo ngữ cảnh.
- Mã Recovery Code xuất ra gộp ledger nóng vào `ledgerArchive` (`compactSave`); `encodeSave` mặc định vẫn nguyên bản.
- Test: `backup.test.ts` (9 test, tổng 40); thêm `scripts/e2e-backup.js`; `e2e-f0.js` cập nhật phép so sánh round-trip.
- Dọn `docs/ref/golden_road/`: xóa `engine.js`, `game.js`, `style.css`, `index.html` (mã bên thứ ba không dùng) và cấu hình công cụ cục bộ; giữ `data.js` (importer, checksum không đổi).

## 2026-11-03 — gộp tài liệu (không đổi rulesVersion, không đổi gameplay)

- Gộp 22 file markdown đánh số (`00`–`14`, `index`, `CLAUDE`), hai prompt agent, ba file `research/`, `evidence/PHASE_*.md` và `DOC_SYNC.md` thành 9 tài liệu có tên: `GAME_DESIGN`, `ECONOMY`, `MATCH_SIMULATOR`, `UX_AND_ART`, `ARCHITECTURE`, `QA_AND_RELEASE`, `CONTEST_AND_RIGHTS`, `PROJECT_STATUS`, `DECISIONS`. `CLAUDE.md` chuyển ra thư mục gốc và viết lại ngắn.
- Loại nội dung Architecture A (Java/Spring Boot/Neon/Oracle, schema/API/idempotency) và deploy Oracle/Nginx; deploy chuyển sang Vercel. Bản cũ còn trong git (commit `242aa11`).
- Xóa `docs/config/competition.domestic.example.json` và `player-card.example.json` (ví dụ cho API cũ, không được dùng). Giữ `balance.initial.json` và `tactics.matrix.json` (test đọc), `ref/golden_road/` (importer đọc).
- Đổi tên artifact kiểm chứng: `evidence/phase-4-commands.txt` → `verify-output.txt` (do `scripts/verify-release.ts` ghi), `phase-4-e2e.json` → `e2e-results.json`; bỏ các file xuất của Phase 0–1 (đã tóm tắt trong `QA_AND_RELEASE.md` §7).
- Cập nhật theo chủ dự án: hạn nộp 15/11/2026 không giãn, bình chọn đến 22/11; host Vercel; khai AI ở form nộp (`DECISIONS.md` DEC-10, DEC-11). Thêm đề xuất lưu trữ DEC-12.
- Ghi điều lệ phần thi Công nghệ đọc ngày 03/11 vào `CONTEST_AND_RIGHTS.md`; `/portal/technology` cần đăng nhập nên chưa đọc.

## v2.2.3 — 2026-11-03 (Phase 3/4, rulesVersion v1.2.0)

- Importer Legacy có provenance/checksum, demo lịch sử không ghi career, đối thủ Ch6–12 và market hằng ngày; nguồn Team Secret Whales 2026 có confidence, không dùng Low. Draft clean-room sau cờ tắt, có cap thưởng và poster canvas.
- Reload giữa trận/recap/pack bằng persisted snapshot và reveal; FOCUS_1 giữ lựa chọn pha cũ đã sửa; role chính theo edition; validation save.
- Theo phản hồi chủ dự án: kết quả từng ván BO3/BO5, tỷ số chuỗi và logs, dừng tới khi bấm Next (career và demo). Recap career sống sót qua reload.
- Modal semantics/Esc/focus trap/reduced motion, touch ≥ 44px, SVG role thay emoji. Gỡ spec nội bộ khỏi public, gỡ dependency không dùng, clean tương thích Windows, README/CI/harness/scripts kiểm chứng.
- 31 test, 14 E2E xanh; DEC-5 đủ dải. Public HTTPS/Portal/browser thật/playtest và hai mục prototype phụ chưa hoàn tất.

## v2.2.2 — 2026-11-03 (Phase 0–2, rulesVersion v1.1.0)

- Thêm strict TypeScript, Vitest, test bất biến/property, `balance-sim`.
- Sửa Welcome Pack, Recovery Code nén và lưu một snapshot; F0 390×844/reload xanh.
- Sửa 14 mục P1: equip unique, tactic fit, synergy đối thủ và cân bằng Ch1–5, discount, từng ván FOCUS_1, scoreboard, Skip timer, header mobile, giao hữu, counterfactual, training OVR/cap, tài trợ phục hồi/UUID/ledger archive, font/lang.
- Không đổi odds, pity hay decision matrix.

## v2.2.1 — 2026-11-03 (chỉ tài liệu)

- Thêm `DECISIONS.md` (G0 = B, DEC-1..9, Q1..Q4) sau audit bản build B và phân tích dataset Golden Road.
- Chủ dự án xác nhận: có quyền dùng/điều chỉnh rating (Q1), email Riot bao phủ mọi thứ (Q2), tên CLB thật được phép (`ENABLE_REAL_CLUB_NAMES=true`).
- Thêm bảng kiểm tra thực tế 2026 (LCP, MSI, First Stand, Worlds) kèm độ tin cậy; roster VCS chưa xác minh (Liquipedia và Leaguepedia chặn công cụ fetch).

## v2.2 — 2026-10-27

- Cắt phạm vi: ưu tiên Campus → VCS (Ch1–5); LCP/First Stand/MSI/Worlds mặc định knockout đơn hư cấu; Swiss/double elimination là P2. Thêm `demoScenario` "Chung kết thế giới".
- Thêm đặc tả quyết định trong trận và `tactics.matrix.json` (ma trận không có tactic thống trị, đối thủ off-script 20%, số quyết định BO3/BO5 là 5/7).
- Sub-seed RNG theo `(seed, gameIndex, phase, eventSlot)` để counterfactual trung thực.
- Pity chốt: tối đa 7 lần hụt, lần 8 buộc Epic+; Common từ Scout có OVR ≥ 62.
- Bảng kinh tế nguồn/sink và chỉ tiêu kiểm chứng (giả thuyết, chưa mô phỏng ví).
