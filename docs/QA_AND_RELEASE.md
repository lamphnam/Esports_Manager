# QA và Release

Cập nhật 03/11/2026. Cách kiểm thử, bằng chứng đã có, các gate chưa đạt và checklist nộp bài. Đây là QA **local trên Chromium**; chưa phải nghiệm thu public hay đa trình duyệt.

## 1. Lệnh

```text
bun run typecheck                       # tsc --noEmit (strict)
bun run test                            # vitest
bun run build
bun scripts/balance-sim.ts              # win-rate DEC-5 theo chapter, exit != 0 nếu ngoài dải
bun scripts/simulator-bench.ts          # benchmark prototype (10k seed)
bun scripts/import-golden-road.ts --check
bun run audit:release                   # chặn spec/code tham khảo/dependency thừa/màu cấm/emoji/Math.random trong bundle và src
bun scripts/verify-release.ts           # chạy tất cả và ghi docs/evidence/verify-output.txt
bun scripts/generate-manifest.ts [--check]   # checksum tài liệu; sinh lại sau mọi chỉnh sửa docs
```

Test trong `src/lib/__tests__/`: `invariants` (ma trận, sub-seed, pity, xác suất, BO), `audit` (các lỗi P1 đã sửa), `recovery` (save/Recovery Code, input hỏng), `backup` (DEC-12: điểm tiến trình, nhắc sao lưu, meta hỏng, phát hiện nhúng/Safari, mã rút gọn), `legacy` (importer, mapping, pool, market, đối thủ), `draft` (Draft, thưởng, circuit). Mỗi bug mới phải có repro **đỏ** trước khi sửa rồi chạy lại xanh.

## 2. E2E trình duyệt

`scripts/e2e-*.js` là hàm `async (page)` chạy bằng công cụ Playwright (`browser_run_code_unsafe` với `filename`), không thêm Playwright vào dependency dự án. Chúng tạo context test riêng, không xóa storage trình duyệt đang dùng.

| Script | Kiểm |
|---|---|
| `e2e-f0`, `e2e-p0` | F0 đầy đủ 390×844 và 1440×900: 6 thẻ, 1000 credits, Welcome Pack, equip, reload, recovery |
| `e2e-storage` | storage và clipboard bị chặn: banner, nhập từ Onboarding, chọn văn bản thủ công |
| `e2e-reload` | reload giữa trận, kết quả chưa claim, pack reveal; trận hai dùng lineup mạnh hơn, không thưởng trùng |
| `e2e-series`, `e2e-game-recap` | FOCUS_1 và recap BO3/BO5 (thắng và thua), đủ 3 logs, chờ 15000 ms vẫn dừng, reload còn recap, Next mới tiếp |
| `e2e-skip` | Skip pack với fake clock, trạng thái ổn định sau 3000 ms |
| `e2e-state` | equip unique, claim một lần, trần stat, tài trợ ở 0 credits, UUID không trùng |
| `e2e-layout`, `e2e-accessibility` | header 390px không tràn, font, `lang`; Esc, focus trap, touch ≥ 44px, reduced motion |
| `e2e-backup` | DEC-12: không nhắc khi vừa tạo CLB; nhắc sau clear Chapter 1 (banner trong luồng trang); chấm báo trên nút Sao lưu; hết nhắc sau khi sao chép mã; reload không nhắc lại; meta không lọt vào save |
| `e2e-demo` | demo BO5: `localStorage` byte-identical trước/sau |
| `e2e-draft` | Draft (cờ tắt): 6 bracket, thưởng một lần, poster 1080×1350 |
| `e2e-iframe` | production build trong iframe khác origin (`127.0.0.1:4174` → `localhost:4173`) với storage bị chặn |

**Iframe harness:** `bun run build` → `bun run preview -- --host 127.0.0.1 --port 4173` → `bun scripts/harness-server.ts` → mở `http://127.0.0.1:4174` (`tools/iframe-harness.html`). Parent và game khác hostname/origin.

## 3. Kết quả mới nhất (03/11/2026, local)

Output nguyên văn ở `evidence/verify-output.txt`; kết quả browser ở `evidence/e2e-results.json`.

- typecheck, build, balance-sim, importer `--check`, release-audit đều exit 0 (`verify-release.ts` chạy lại 03/11 sau DEC-12); **40 test xanh**; **14 kết quả E2E xanh trên Chrome** (gồm `e2e-backup` và `e2e-iframe`).
- DEC-5 (4000 seed/ô) đạt dải: 68.70 / 54.23 / 48.63 / 49.52 / 49.30 %.
- Importer: 649 editions, 374 identities, 73 đội, 129 team-years, checksum khớp.
- Build: JS ~973 kB (gzip ~156 kB), CSS ~53 kB (gzip ~9.5 kB); cảnh báo chunk > 500 kB raw.
- E2E chạy lại 03/11 bằng runner Playwright tạm (Chrome cài sẵn, ngoài repo). Trên **WebKit giả lập** (không phải iOS thật): F0, storage chặn và lời khuyên nhúng xanh; `e2e-reload` và `e2e-storage` chập chờn/timeout, **giống hệt trên bản trước DEC-12** (commit `242aa11`), nên là vấn đề có sẵn, chưa điều tra. `e2e-f0` đã được cập nhật: so sánh round-trip theo tổng ledger vì mã xuất gộp ledger, và chờ khôi phục hoàn tất theo trạng thái storage thay vì theo dialog.

## 4. Gate chưa đạt

- **Public HTTPS và nhúng Portal thật**: chưa deploy lên Vercel; harness local không thay nghiệm thu production.
- **Safari/iOS và Firefox thật**: chưa test trên thiết bị thật (mới có Chrome và WebKit giả lập, xem §3). Gồm kiểm lưu trữ trong iframe ([ARCHITECTURE.md](ARCHITECTURE.md) §7) và điều tra độ chập chờn của `e2e-reload`/`e2e-storage` trên WebKit.
- **Playtest 5–10 người**: chưa làm (kịch bản §5).
- **Balance prototype**: +10 power 76.09% (mục tiêu 60–75), adaptive–random 3.51 điểm % (mục tiêu ≥ 5). DEC-5 campaign vẫn đạt.
- **Campaign nâng cao**: qualification theo split, chuyển split/năm sau pro loss chưa nghiệm thu; mô phỏng ví theo chính sách chưa có.
- **Draft (G3)** vẫn tắt: chỉ bật khi toàn bộ F0/R1, 390×844 và iframe đạt.

## 5. Kịch bản playtest (5–10 sinh viên)

1. Chỉ đưa URL, nói "hãy chơi 5 phút"; không hướng dẫn.
2. Ghi thời gian tới trận đầu, tới lần mở pack, mức hiểu OVR/synergy, CTA kế tiếp có rõ không.
3. Hỏi: "Tại sao vừa thắng/thua?", "Thẻ mới có giá trị gì?", "Có muốn chơi tiếp không?", "Cái gì gây khó hiểu?"
4. Ghi blocker nặng, UI gây nhầm, bấm hụt, lỗi frame, thời gian tải, bỏ ngang. Không thu thập danh tính không cần thiết.
5. Sửa lỗi gameplay trước, không chỉ màu sắc và polish. Nếu câu trả lời cho "vì sao chọn tactic đó?" là "đoán", thông tin preview đối thủ chưa đủ rõ.

## 6. Checklist chấp nhận

**A. F0 (blocking)** — đã có E2E, vẫn phải xác nhận lại trên bản deploy
- [ ] Tạo CLB không thu thập thông tin Portal; có hướng dẫn Recovery Code.
- [ ] 5 thẻ starter đúng 5 role, OVR 55–65, giữ qua reload.
- [ ] Trận Campus có 3 pha, kết quả do engine seeded; hiện "vì sao thắng/thua" và hành động kế tiếp.
- [ ] Welcome Pack đúng một lần, ≥ Rare, reveal + Skip an toàn; equip một chạm; hiệu ứng thấy trên team power và trận hai.
- [ ] Không kẹt state khi reload ở pack/trận/recap.
- [ ] Dùng được ở 390×844 và desktop, chuột và cảm ứng, **trong iframe**.

**B. Ứng viên thi đấu**
- [ ] Odds pack hiển thị, pity có test biên, không cơ chế tiền thật.
- [ ] Không equip trùng, không overspend, không thưởng trùng, không mở lại pack đã dùng.
- [ ] `Watch/Fast/Skip` cùng kết quả; BO3/BO5 dừng ở `GAME_RECAP` từng ván (kể cả ván cuối); career reload giữ recap; demo không ghi save.
- [ ] Điều khiển mobile, reduced motion và bàn phím dùng được.
- [ ] Predator side cup không bị coi là vòng loại Worlds.

**C. Tuân thủ trước khi nộp** (đối chiếu [CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md) §1–§2)
- [ ] Người ngoài xác nhận URL HTTPS công khai tải được (cửa sổ ẩn danh, không bị Vercel chặn đăng nhập).
- [ ] Nhúng được trong iframe khác origin, không đăng nhập Portal, không chuyển hướng ngoài.
- [ ] Không camera/mic, không thu thập dữ liệu Portal, không tracking.
- [ ] Mọi hình và tên có metadata quyền hoặc là placeholder; README giải thích phần hư cấu; footer có disclaimer.
- [ ] Đọc lại **điều lệ hiện hành** tại tab Technology và đối chiếu `/portal/technology` sau khi đăng nhập.
- [ ] Đã khai sử dụng AI ở ô riêng trên form nộp; giữ prompt log và Git history.
- [ ] Bản build ổn định đã đánh dấu để rollback (Vercel Instant Rollback).
- [ ] `bun scripts/generate-manifest.ts` nếu docs đổi.

**D. Chặn phát hành**
Mất tiến trình · pack nhận sai · trùng thưởng/kinh tế · iframe trắng · không bấm được trên mobile · chuyển hướng ngoài tự động · tài sản không có quyền · state campaign hỏng · lộ dữ liệu hay quyền camera/mic.

## 7. Lịch sử nghiệm thu theo phase (03/11/2026, nhánh `fix/audit-and-golden-road`)

Mỗi phase có repro đỏ trước khi sửa, rồi xanh. Chi tiết từng dòng code có trong git history.

| Phase | Nội dung | Kết quả |
|---|---|---|
| 0 | Strict TS, Vitest, test bất biến (ma trận, sub-seed, pity, xác suất), `balance-sim` | 6 test; baseline win-rate đội starter Ch1–5: 68.78 / 45.63 / 25.20 / 19.80 / 3.60 % |
| 1 (P0) | Welcome Pack không mở sau Ch1 (state chuyển sang reducer, bỏ `setTimeout`); Recovery Code từ "hàng trưng bày" thành bản save nén `AR1` có CRC và UI nhập/xuất; banner storage chặn | 11 test; F0 390×844, reload, storage/clipboard chặn đều xanh |
| 2 (P1) | 14 mục: equip unique, TRADE_MAP precedence, clamp tacticFit, synergy đối thủ + cân bằng Ch1–5, discount Training Center, từng ván BO3/BO5 với FOCUS_1, scoreboard không lộ kết quả, Skip pack, header 390px, giao hữu, counterfactual, training OVR/cap, tài trợ phục hồi và ledger archive, font/lang | 19 test; DEC-5 đạt dải; OVR đối thủ Ch1–5 = 55/62/66/72/77 |
| 3 | Importer Legacy có provenance và checksum (649 editions); demo lịch sử không ghi career; đối thủ Ch6–12 và market hằng ngày; lớp dữ liệu 2026 có nguồn; Draft clean-room sau cờ tắt | 30 test; demo `localStorage` byte-identical; Draft 1000 seed đủ 5 người chơi duy nhất |
| 4 | Reload giữa trận/recap/pack; recap từng ván theo yêu cầu chủ dự án; modal accessibility; gỡ spec nội bộ và 8 dependency thừa khỏi bản public; harness iframe; CI và scripts kiểm chứng | 31 test, 14 E2E; release-audit PASS |

Lỗi chính được bắt bởi repro đỏ: Welcome Pack không mở, `restoreFromRecoveryCode` luôn trả `true`, TRADE_MAP sai độ ưu tiên toán tử (`a ?? 60 + (b ?? 60)`), một thẻ nằm hai slot, reload mất trận chưa claim, FOCUS_1 giữ lựa chọn MID cũ, validator giới hạn timestamp 1e12 quá thấp cho năm 2026, release-audit lỗi khi thư mục `public/` không tồn tại sau checkout.
