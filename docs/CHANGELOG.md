# CHANGELOG

`rulesVersion` hiện tại: **v1.2.0** (`docs/config/balance.initial.json`). Đổi luật gameplay phải tăng `rulesVersion`, ghi một mục ở đây và kiểm tra các nơi lặp số (pack odds/pity: `ECONOMY.md` + `balance.initial.json`; giới hạn simulator và chính sách quyết định: `MATCH_SIMULATOR.md` + `balance.initial.json` + `tactics.matrix.json`).

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
