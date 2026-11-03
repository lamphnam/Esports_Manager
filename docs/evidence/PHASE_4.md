# Phase 4 — nghiệm thu local, 03/11/2026

Trạng thái: code và QA local hoàn tất; **chưa xác nhận bản phát hành public/portal**. Không push. Q4–Q6 giữ mở, dùng các mặc định đã ghi. G3 tiếp tục tắt.

## 1. Thay đổi (file:dòng)

- `src/components/GameRecap.tsx:16`, `MatchCenterModal.tsx:113`/`:555`, `WorldDemoModal.tsx:29`/`:56`: theo phản hồi chủ dự án, BO3/BO5 dừng ở kết quả từng ván. Hiện thắng/thua, kills, MVP, tỷ số chuỗi, logs cả ba pha. Chỉ chuyển khi bấm **Ván Tiếp Theo** hoặc **Xem Tổng Kết Chuỗi** ở ván cuối. Watch/Fast/Skip đều tới cùng recap. BO1 giữ luồng F0.
- `src/types/index.ts:169`, `src/lib/saveState.ts:14`/`:48`, `GameContext.tsx:312`/`:652`, `App.tsx:40`, `MatchCenterModal.tsx:95`: lưu snapshot/seed/replay/recap, selections và pending reveal. Reload không đổi kết quả hoặc thẻ đã mở. Validation từ chối snapshot trận hỏng. `GAME_RECAP` cũng được lưu và khôi phục.
- `MatchCenterModal.tsx:178`, `WorldDemoModal.tsx:46`: đổi pha FOCUS_1 hoặc tắt manualAll trả các pha tự động về gợi ý; không giữ nhiều lựa chọn thủ công ẩn. `GameContext.tsx:227`/`:540`: role chính lấy theo edition lịch sử trước identity hiện tại.
- `src/lib/useDialog.ts:3`, các modal/`CollectionView.tsx:15`, `src/index.css:30`: dialog semantics, aria-label, Esc, focus trap/restore, stack modal, khóa scroll nền, nút >=44px, focus-visible, reduced motion. Onboarding Esc về bước đặt tên. `PackOpeningModal.tsx:42`: reduced motion bỏ reveal động/confetti.
- `src/components/RoleIcon.tsx:1`, `PlayerCard.tsx:23`, `OnboardingModal.tsx:150`: thay emoji bằng SVG hình học tự vẽ và chữ. `src/App.tsx:117` thêm disclaimer/credit, README được viết lại.
- `public/assets/aistudio/`: xóa các bản tài liệu nội bộ và manifest công khai; xóa `.env.example`, `metadata.json`. `package.json:1`, `bun.lock`: gỡ 8 dependency không dùng (@google/genai/express/dotenv/motion/tsx/@types/express/autoprefixer/esbuild), không thêm dependency ngoài vitest.
- `scripts/clean.ts:1`: clean Windows chỉ xóa dist sau kiểm tra đường dẫn; `vite.config.ts:3` bỏ __dirname warning. `scripts/release-audit.ts:1`, `verify-release.ts:1`, `generate-manifest.ts:1`: kiểm tra bundle và lưu output; tái sinh FILE_MANIFEST bằng script. Importer có checksum từng output và chế độ --check.
- `scripts/release-audit.ts:12` xử lý public không tồn tại sau checkout (đã xóa hết tài liệu); `.gitattributes:1` giữ EOL nguồn/checksum generated giống nhau trên Windows/Linux. Kiểm chứng Git source với EOL đã khai báo khớp SHA256 manifest.
- `tools/iframe-harness.html:1`, `scripts/harness-server.ts:1`, `infra/nginx.conf.template:1`: harness khác hostname, mẫu HTTPS/CSP/SPA fallback/health, không đoán portal host. `.github/workflows/verify.yml:1` nối các kiểm tra vào CI (chưa chạy remote vì không push).
- `docs/config/balance.initial.json:3`: rulesVersion v1.2.0 cho các thay đổi gameplay Phase 2/3; odds/pity và decision matrix không đổi.

## 2. Repro đỏ trước sửa

```text
bun scripts/release-audit.ts:
emoji in Onboarding/PlayerCard; internal documents exposed in public and dist;
unused @google/genai/express/dotenv/motion/tsx; unused .env.example/metadata.json (exit1).
e2e-accessibility: Onboarding is missing dialog semantics.
e2e-series: FOCUS_1 retained a manual MID choice after switching to EARLY.
e2e-state: edition primary role has no secondary penalty=false.
e2e-reload: Reload lost the resolved match and unclaimed reward.
recovery.test.ts malformed persisted match: expected function to throw (failed).
e2e-game-recap: BO3 game result was skipped; advanced directly to tactics.
release-audit khi bỏ các thư mục public rỗng (như checkout mới): ENOENT scandir public.
```

Tất cả được sửa rồi chạy lại xanh. Một lượt Skip harness cũ timeout do inject component/provider sau Vite HMR; đã đổi test sang luồng F0 UI thật và fake clock, không đổi production code để né lỗi test.

## 3. Lệnh và output cuối

Output nguyên văn tại `phase-4-commands.txt` (do `bun scripts/verify-release.ts` ghi):

```text
bun install --frozen-lockfile
Checked 61 installs across 122 packages (no changes); exit=0
bun run typecheck
$ tsc --noEmit; exit=0
bun run test
Test Files 5 passed (5); Tests 31 passed (31); exit=0
bun run build
1705 modules transformed; built successfully; exit=0
JS 973.26 kB / gzip 156.33 kB; CSS 53.17 kB / gzip 9.54 kB
bun scripts/balance-sim.ts
Ch1 68.70%, Ch2 54.23%, Ch3 48.63%, Ch4 49.52%, Ch5 49.30%: all DEC-5 PASS; exit=0
bun scripts/import-golden-road.ts --check
649 editions, 374 identities, 73 teams, 129 team-years; checksum match; exit=0
bun scripts/release-audit.ts
PASS: no internal specs/reference code, unused runtime dependencies,
forbidden colours, emoji or Math.random in src/lib; exit=0
bun run clean
Removed build directory: D:\BachKhoa\hk261\APAC_Rising_Esports_Manager_Docs_v2_2\dist
bun scripts/generate-manifest.ts
Generated documentation entries (script, not hand edited)
bun scripts/generate-manifest.ts --check
PASS: documentation bytes/sha256 match
git diff --check
exit0
```

Build có warning chunk raw >500KB; gzip ~156KB nằm dưới mục tiêu critical JS 500KB gzip của `08`. Đây là số đo build, chưa phải số đo mạng trên public host.

## 4. Bằng chứng E2E

`phase-4-e2e.json`: **14 kết quả xanh** (13 scripts/variants ban đầu và regression recap mới), dùng context test riêng.

- F0 touch 390×844 và mouse 1440×900: 6 cards, 1000 credits, completed=[1], equip/reload/recovery=true, pageErrors=[].
- BO3: live score ván đầu 0-0, FOCUS_1 chỉ 3 tactic buttons tương ứng một pha; đổi focus không giữ lựa chọn pha cũ.
- **Recap BO3/BO5:** lần lượt mẫu Thắng Ván 1 / 1-0 và Thua Ván 1 / 0-1; đủ 3 logs; fake clock 15000ms vẫn dừng, reload vẫn recap, Next mới vào FOCUS_1. Demo BO5 cũng chờ Next và localStorage byte-identical trước/sau toàn series.
- Skip fake clock qua F0 thật: trạng thái ổn định sau 3000ms.
- Reload giữa trận giữ nguyên persisted result, recap còn claim, pack reveal cùng instance; trận thứ hai dùng lineup mạnh hơn, không thưởng trùng.
- 0 credits có tài trợ, không claim lặp; equip unique; đúng discount/cap; UUID không trùng dưới clock cố định; edition role không bị phạt sai.
- Header 390: scrollWidth=clientWidth=384, controls nằm trong viewport; font Be Vietnam Pro, lang vi. Accessibility: Esc/focus trap/touch targets/reduced motion xanh.
- Draft QA trực tiếp component với flag=false: 6 brackets, thưởng một lần, PNG 1080×1350.
- Production iframe: `http://127.0.0.1:4174` → `http://localhost:4173`, F0/reload/recovery với storage bị chặn đều xanh; header 369/369px.

## 5. Blocker, giới hạn và phần không làm

- **Chưa deploy public HTTPS hoặc test portal thật:** D1 (portal origin), D4 (domain/VM) chưa có; chỉ chuẩn bị template, không thay máy chủ hay giả định host. Harness local không thay thế nghiệm thu production.
- **Chưa QA Safari/iOS và Firefox thật:** tool hiện tại chỉ có Chromium; thử truy cập engine khác báo không có dynamic import callback. Không cài thêm dependency/binary. Chưa có playtest 5–10 người; không tự ghi ngày freeze khi Q5 chưa có ngày mới.
- **Mục tiêu prototype rộng hơn chưa đủ xanh:** `bun scripts/simulator-bench.ts`, 10k seed BO1, fixture mọi stat65/no synergy, archetype đổi vòng: adaptive55.27%, random51.76%, fixed51.76%, gap3.51pp (<5); +10 power76.09% (mục tiêu60–75), BO5 p95 khoảng0.09ms (<200ms). Giữ các mục tracker liên quan mở và G3 off; không gắn nhãn R1/submission-ready. DEC-5 campaign vẫn đủ dải. Chưa tinh chỉnh thêm các mục tiêu này trong lượt audit; cần cân bằng/playtest tiếp theo, không đổi matrix hoặc odds để ép số.
- Không bật G3 cho bản nộp, không thêm ảnh/logo thật (chưa có asset_license), không đưa dữ kiện Low vào game, không làm các phần P2 ngoài work order. Không tự trả lời Q4–Q6 hoặc đổi trạng thái Đề xuất thành Đã chốt.
- Không chạy remote CI hoặc push. Thư mục untracked `docs/ref/golden_road/.claude/` được giữ nguyên, không stage; `docs/ref` không đổi so với baseline và không vào bundle.
