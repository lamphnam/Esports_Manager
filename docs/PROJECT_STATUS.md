# Project Status — tracker và kế hoạch tới hạn nộp

Cập nhật 04/11/2026. Tracker sống: cập nhật checkbox và Log khi có việc xong, **không tick nếu thiếu bằng chứng** (lệnh đã chạy, output quan sát được).

**Hạn nộp: hết ngày 15/11/2026 (Chủ nhật). Bình chọn đến hết 22/11/2026.** Chủ dự án xác nhận 03/11 là không giãn hạn; khớp với trang điều lệ. Một người làm + coding agent.

## 1. Hiện trạng

- Kiến trúc B (client-only, `localStorage`, host tĩnh) đã chạy; audit P0/P1 đã sửa; Phase 0–4 có bằng chứng local ([QA_AND_RELEASE.md](QA_AND_RELEASE.md) §3 và §7): 48 test, 15 E2E trên Chrome, DEC-5 đạt dải, release-audit PASS.
- **DEC-12 (lưu trữ chịu được storage không bền) đã triển khai** 03/11: chỉ báo và nhắc sao lưu, lời khuyên theo ngữ cảnh nhúng/Safari, đọc lại sau ghi, `storage.persist()`, mã xuất ngắn hơn ([ARCHITECTURE.md](ARCHITECTURE.md) §7).
- Bản chơi được: Onboarding F0 → Campaign 12 chapter (Ch1–5 chuẩn hóa, Ch6–12 đối thủ Legacy) → pack/training/market/facilities → demo BO5 → recap từng ván → Recovery Code.
- **Chưa deploy.** Chưa kiểm tra nhúng Portal, Safari/iOS, Firefox, playtest. Draft (G3) tắt. Chưa phải submission-ready.

### Định nghĩa

- **F0 (first playable, không được bỏ):** tên CLB → 5 thẻ → trận Campus 3 quyết định → Welcome Pack ≥ Rare → mở pack → thay tuyển thủ → trận hai mạnh hơn → reload không mất tiến trình.
- **R1 (ứng viên thi đấu):** F0 ổn định + Campaign tới VCS và hành trình LCP/Worlds dạng dữ liệu + pack/training/market + chạy trên domain thật trong iframe. Tính năng chưa đủ ổn định tắt bằng feature flag, không để phá F0.
- **V2 (living game):** nhiều career season, manager career LCK/LPL, mùa thẻ mới, daily challenge. Ngoài phạm vi nộp.

### Phạm vi nộp

| Mức | Nội dung |
|---|---|
| Phải xong tốt | Campus → Road to VCS → VCS (Ch1–5), pack/training/ledger, `demoScenario` |
| Dạng dữ liệu | LCP, First Stand, MSI, Worlds: knockout đơn BO5 hư cấu có nhãn; thẻ LEGACY (nay cũng nằm trong pack, DEC-13) |
| Chỉ khi còn thời gian (P2) | Swiss, double elimination, Play-In, Hall of Fame đầy đủ, Predator side cup, bật Draft |

## 2. Kế hoạch tới 15/11 (đề xuất, chờ chủ dự án duyệt)

Lý do nộp sớm: game phải được BTC duyệt mới lên trang bình chọn, nên nộp sớm = nhiều ngày bình chọn hơn; 14–15/11 chỉ để dành cho sự cố.

| Ngày | Việc |
|---|---|
| T3 03/11 – T5 05/11 | Deploy Vercel production (URL cố định, tắt bảo vệ đăng nhập cho domain production); thử harness iframe với URL thật; kiểm nhanh trên một iPhone thật ngay khi có URL (~15 phút) để biết rủi ro lưu trữ sớm. (DEC-12 đã xong.) |
| T6 06/11 – T2 09/11 | Playtest 5–10 người, sửa blocker; quyết định bật hay giữ tắt Draft; (tùy chọn) cân bằng hai chỉ tiêu prototype |
| **T3 10/11** | **Đóng băng tính năng** |
| T4 11/11 – T5 12/11 | QA đầy đủ iOS Safari, Firefox, nhúng Portal thật; chỉ sửa P0/P1 |
| **T6 13/11** | **Nộp** (kèm khai AI ở ô riêng); chụp màn hình/video nếu form yêu cầu |
| T7 14/11 – CN 15/11 | Đệm sự cố; 15/11 là hạn chót |

Sau khi nộp: chỉ sửa lỗi nghiêm trọng, và **báo BTC duyệt lại** nếu đổi nội dung ([CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md) §1).

## 3. Gate chưa đạt

- [ ] **Deploy Vercel production** với URL ổn định (D4) và test người ngoài mở được
- [ ] **Nhúng iframe thật**: harness trên URL deploy, sau đó Portal thật (D1: origin trang nhúng, thuộc tính iframe)
- [ ] **Safari/iOS và Firefox** thật, gồm kiểm lưu trữ trong iframe. Ghi chú 03/11: trên WebKit giả lập (Playwright, không phải iOS thật) `e2e-reload` ("Mid-match reload changed outcome" hoặc timeout) và `e2e-storage` (timeout) chập chờn, **cả trên bản trước DEC-12**; Chrome thì xanh ổn định. Cần điều tra xem là lỗi script hay lỗi game trước khi nộp
- [ ] **Playtest 5–10 người** theo kịch bản [QA_AND_RELEASE.md](QA_AND_RELEASE.md) §5
- [ ] **Balance prototype:** +10 power 76.09% (mục tiêu 60–75); adaptive–random gap 3.51 điểm % (mục tiêu ≥ 5). Không đổi ma trận hay odds để ép số
- [ ] **Quyết định Draft (G3):** giữ tắt trừ khi F0/R1, 390×844 và iframe đạt
- [ ] Rà lần cuối copy (không bạo lực/chính trị), disclaimer, README trước khi nộp

Không chặn nộp (ghi rõ ở README/UI là bản rút gọn): qualification theo split và pro loss sang split kế (vòng lặp mùa sau Worlds đã có), thêm trận mới vào từng bracket, mô phỏng ví theo chính sách, Rival Zero, Hall of Fame, ảnh/logo thật.

## 4. Việc cần chủ dự án quyết

Danh sách đầy đủ và mặc định ở [DECISIONS.md](DECISIONS.md). Đang chờ: xác nhận G0 = B thành "Đã chốt"; Q4 (bảng win-rate DEC-5 có hợp cảm giác chơi); Q6 (dòng ghi công Golden Road, mặc định đã áp dụng ở footer); D1 (origin Portal); D3 (Predator side cup); D2 (khi có asset ảnh/logo được duyệt).

## 5. Cổng dừng khi trễ (stop-and-fix)

| Nếu | Thì |
|---|---|
| 05/11 chưa có URL deploy chạy được trong harness iframe | Dừng làm tính năng mới; sửa deploy/CSP/storage |
| 10/11 F0 hoặc recap còn lỗi | Đóng băng cosmetics và nội dung; sửa vòng chơi 5 phút đầu |
| 12/11 nhúng Portal thật hoặc tải public lỗi | Ưu tiên khả năng tham gia cuộc thi hơn tính năng thêm; tắt flag tính năng chưa ổn |
| Phát hiện mất tiến trình, thưởng trùng, iframe trắng | Chặn phát hành ([QA_AND_RELEASE.md](QA_AND_RELEASE.md) §6D) |

## 6. Log

| Ngày | Mục |
|---|---|
| 04/11 | UpdatePack dữ kiện LMHT Esports, P0 xong: Ch10 thành Tứ kết Worlds BO5 giả lập (hết nhãn Swiss), copy riêng Ch3–12 (`campaignCopy.ts`), Ch5 không còn "nhà vua GAM"/"LCP 2027", `rulesBasisYear` 2026, nhãn `opponentOrigin`. Chạy: `bun run typecheck` PASS; `bun run test` 63 test PASS (10 file, thêm `campaignCopy.test.ts` 11 test, 6 test đỏ trên code cũ); `bun run build` PASS; `bun run audit:release` PASS. Chưa chạy `balance`/`progression` (simulator và `legacyOpponent()` không đổi, có test khẳng định). Chưa kiểm bằng mắt UI 390×844 hay E2E Playwright. P1 đã làm trong ngày: lớp tham chiếu `esportsReference.ts` + nhãn nguồn trên chi tiết thẻ; 69 test PASS. Không làm thẻ BLG/HLE (chưa xác minh roster), Worlds 2026 vẫn `null` (xem CHANGELOG 04/11) |
| 03/11 | UI trận kiểu Worlds Mayhem, bracket mùa giải (Hub, Chiến Dịch), hiển thị đội hình hai bên, qua mùa mới sau Worlds (DEC-15); 48 test, 14 E2E Chrome xanh |
| 03/11 | DEC-12 triển khai (chỉ báo/nhắc sao lưu, lời khuyên nhúng/Safari, đọc lại sau ghi, `storage.persist()`, mã xuất rút gọn); 40 test, 14 E2E Chrome xanh, iframe xanh. Dọn `docs/ref/golden_road/` chỉ còn `data.js` |
| 03/11 | Gộp tài liệu từ 22 file md đánh số + prompt agent + evidence còn 9 file có tên: GAME_DESIGN, ECONOMY, MATCH_SIMULATOR, UX_AND_ART, ARCHITECTURE, QA_AND_RELEASE, CONTEST_AND_RIGHTS, PROJECT_STATUS, DECISIONS (+ CHANGELOG). Loại bỏ nội dung kiến trúc A. `CLAUDE.md` chuyển ra thư mục gốc |
| 03/11 | Chủ dự án chốt: hạn 15/11, bình chọn 22/11; host Vercel (DEC-10); khai AI ở ô riêng khi nộp (DEC-11); test iframe/iOS làm sau. Đọc điều lệ Technology (tab Technology); `/portal/technology` cần đăng nhập |
| 03/11 | Phase 4: 31 test, 14 E2E; recap từng ván BO3/BO5 theo yêu cầu chủ dự án; release-audit PASS |
| 03/11 | Phase 3: Legacy 649 editions, demo lịch sử, market và đối thủ Ch6–12, dữ liệu 2026 có nguồn, Draft sau cờ tắt |
| 03/11 | Phase 2: sửa 14 mục P1, cân bằng DEC-5 đạt dải. Phase 1: sửa 2 mục P0 (Welcome Pack, Recovery Code). Phase 0: nền kiểm thử |
| 03/11 | Audit mã nguồn B: 2 P0, 13 P1; nghiên cứu dataset Golden Road (73 đội, 649 player-seasons) và dữ kiện 2026 |
| 27/10 | Bộ spec v2.2 được rà soát; G0 chờ quyết định |
