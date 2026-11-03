# Architecture — local-first, lưu trữ, deploy

Cập nhật 03/11/2026. Mô tả kiến trúc đang chạy (**Architecture B**) và cách nó khớp với điều lệ cuộc thi. Phương án server-authoritative cũ (Java/Spring Boot/Neon/Oracle) đã được loại khỏi bộ tài liệu; bản đầy đủ còn trong lịch sử git (commit `242aa11`, các file `06_DATA_MODEL_API.md` và `08_ARCHITECTURE_DEPLOY.md`).

## 1. Quyết định và lý do

**G0 = B:** simulator TypeScript chạy phía client, save bằng `localStorage`, Recovery Code dự phòng, host tĩnh trên **Vercel** (DEC-10). Trạng thái G0 và DEC-10 xem [DECISIONS.md](DECISIONS.md).

| Điều lệ cuộc thi ([CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md) §1) | Hệ quả kiến trúc |
|---|---|
| Game là website do sinh viên host, nhúng iframe; chi phí do sinh viên chịu | Host tĩnh miễn phí; không server để vận hành hay trả tiền |
| Cấm thu thập dữ liệu người chơi vượt phạm vi công bố, cấm đăng nhập Portal | Không backend, không tài khoản, không gọi mạng ngoài việc tải font |
| Bình chọn do Portal quản lý, điểm trong game không tính vào giải | Không cần chống gian lận save hay bảng xếp hạng |
| Được đổi nội dung nhưng phải báo BTC duyệt lại | URL nộp phải cố định; schema save chỉ đổi kèm migration |
| Nhiều sinh viên vào cùng lúc khi bình chọn | CDN tĩnh chịu tải; không có database hay cold start làm hỏng trải nghiệm |

**Đánh đổi chấp nhận:** client tự quyết kết quả trận, pack và ví nên **không chống được sửa save hay gian lận**. Không ảnh hưởng điểm thi; phải nói rõ trong README. Các bất biến server cũ (idempotency, CHECK >= 0) được thay bằng: mọi mutation qua một reducer duy nhất, ledger chỉ-ghi-thêm, validate save trước khi nạp, và test property.

## 2. Stack và cấu trúc repo

React 19 + TypeScript (strict) + Vite + Tailwind v4, **Bun** cho install/script. Test bằng Vitest. Dependency chạy: `react`, `react-dom`, `lucide-react`, `canvas-confetti` (không dependency server).

```
src/
  App.tsx, main.tsx, index.css
  components/   modal và thành phần UI (MatchCenter, GameRecap, PackOpening, Recovery, Onboarding, WorldDemo, LegacyDraft, PlayerCard, Navbar…)
  views/        Hub, Campaign, Lineup, Collection, Packs, Training, Transfers, Facilities
  context/GameContext.tsx   reducer + saveRef, mọi mutation game
  lib/          simulator, seededRng, tacticsMatrix, economyEngine, saveState, recoveryCode, backupMeta, environment, identity, labels, legacyDraft/, audioSynth, useDialog
  data/         campaignData, cardCatalog, currentCatalog, legacyPool/Opponents, verified2026, demoScenario, featureFlags, generated/ (Legacy sinh bởi importer)
  types/index.ts
scripts/        balance-sim, simulator-bench, import-golden-road, release-audit, verify-release, generate-manifest, clean, harness-server, e2e-*.js
tools/          iframe-harness.html
infra/          nginx.conf.template (phương án self-host dự phòng, không dùng nếu deploy Vercel)
docs/           tài liệu (thư mục này); config/ (JSON cân bằng đọc bởi test); ref/golden_road/data.js (chỉ dữ liệu rating, importer đọc, không vào bundle)
```

## 3. Luồng dữ liệu

Tải trang → `GameContext` đọc `localStorage` → `validateSave` → state. Mỗi action đi qua `commit(patch)` → `saveReducer` → `saveRef` (đồng bộ, để hai action liên tiếp luôn đọc snapshot mới nhất) → `useEffect` ghi lại toàn bộ snapshot vào một key. Simulator, pack và training chạy hoàn toàn trên client. **Không có lời gọi mạng** trong `src/` (chỉ Google Fonts ở `index.html`).

## 4. Mô hình save

- `GameSave` schema `version: 1`, một key **`apac_rising_save_v3`** (số phiên bản schema và hậu tố key không đồng nghĩa). Lần đầu tự migrate ba key v2 cũ.
- Trường: `club` (ví, lineup, packs, pity, tiến trình chapter, facilities), `ownedCards`, `ledger` (+ `ledgerArchive`), `transferOffers`, `marketDay`, `purchasedOfferIds`, `draftRewards`, `activeMatch` (seed, snapshot hai đội, selections, result/replay, `matchState` gồm `GAME_RECAP`), `pendingReveal` (trỏ tới thẻ đã mint).
- `validateSave` kiểm cấu trúc, tham chiếu (lineup phải trỏ tới thẻ có thật, thẻ phải khớp edition trong catalog), ranh giới (mảng ≤ 10k, ledger ≤ 10k…) trước khi nạp hoặc nhập.
- Demo BO5 không ghi vào save.

## 5. Recovery Code

`AR1.<base64url(deflate(JSON save))>.<CRC32 hex>` qua `CompressionStream`/`DecompressionStream`. Giới hạn: mã ≤ 500.000 ký tự, dữ liệu giải nén ≤ 2 MB; `validateSave` chạy trước khi thay save; không nhúng đệ quy mã cũ (`recoveryCode` rỗng khi xuất). CRC chỉ phát hiện hỏng dữ liệu, **không phải chữ ký chống gian lận**. Mã là **bản sao save tại lúc xuất**, không phải token tra cứu server: phải xuất mã mới sau khi chơi. Không đưa mã vào URL hay log.

UI (`RecoveryModal`): xuất/nhập, báo lỗi, ô văn bản chọn sẵn khi clipboard bị chặn. `OnboardingModal` có đường nhập khi chưa có CLB. Banner khi `localStorage` không ghi được.

## 6. Giới hạn đã biết

- Không chống sửa save (kể cả Recovery Code tự dựng).
- Thời gian dùng đồng hồ client (`vietnamDay()` cho tài trợ và Market): đổi giờ máy có thể lệch ngày.
- Bundle ~973 kB raw / ~156 kB gzip (một chunk), dưới mục tiêu 500 kB gzip cho JS quan trọng.

## 7. Lưu trữ trong iframe cross-origin — rủi ro và thiết kế (DEC-12, **Đã chốt**, đã triển khai 03/11)

Game nhúng trong iframe của Portal nhưng chạy ở origin khác (Vercel). Portal không truyền danh tính người dùng cho game và điều lệ cấm đòi đăng nhập Portal, nên **không có định danh nào để một backend dùng thay cho `localStorage`**: token guest cũng sẽ nằm trong chính storage đó. Vì vậy backend không giải quyết "mất save"; cái cần là chịu được storage không bền và làm cho bản sao lưu dễ giữ.

### 7.1 Các tình huống

| Tình huống | Hiện tượng | Hiện trạng |
|---|---|---|
| Chrome/Edge desktop bình thường | Storage bị chia theo trang cha (partition), vẫn bền | Hoạt động |
| Storage bị chặn hoặc iframe có `sandbox` thiếu `allow-same-origin` | `localStorage` ném lỗi | Đã xử lý: banner + Recovery Code, vẫn chơi được |
| Safari/iOS (ITP), Firefox chế độ chặn chặt, webview trong app, chế độ riêng tư | Có thể ghi được nhưng bị xóa hoặc không giữ giữa các phiên, **không báo lỗi** | **Giảm nhẹ:** không phát hiện được việc xóa, nhưng chip/nhắc sao lưu và thông điệp Safari/iOS làm người chơi có bản sao trong tay (§7.3) |
| Mở game trực tiếp bằng URL và mở qua Portal | Hai kho lưu khác nhau (partition theo trang cha) | Không chuyển được, chỉ qua Recovery Code |
| URL đổi (preview deployment, đổi domain) | Origin mới = save mới | Tránh bằng URL production cố định |

Các hành vi trình duyệt trên là hiểu biết chung về storage partitioning và ITP, **chưa kiểm chứng trên thiết bị thật** trong dự án này (gate cross-browser còn mở, [PROJECT_STATUS.md](PROJECT_STATUS.md)).

### 7.2 Nguyên tắc

1. Phiên chơi đầu tiên phải trọn vẹn dù storage hỏng (người bình chọn thường chỉ chơi một lần).
2. Lưu bền chỉ là best-effort; **bản sao lưu do người chơi giữ là nguồn sự thật cuối cùng**.
3. Không backend, không cookie (cùng chịu partition), không Storage Access API (cần cử chỉ, không đáng tin giữa các trình duyệt, vướng sandbox).

### 7.3 Thiết kế đã triển khai (không backend)

1. **Chỉ báo sao lưu** (`src/lib/backupMeta.ts`): key riêng `apac_backup_meta` (`lastBackupAt`, `scoreAtBackup`, `lastNudgeAt`), tách khỏi save để mã xuất không tự chứa số đếm cũ. "Điểm tiến trình" đơn điệu = 5×chapter đã clear + 2×thẻ + tổng (level−1) + 3×tier facility. Chưa sao lưu ≥ 4 điểm (một lần clear chapter, hai thẻ mới…) thì nút Sao lưu trên Navbar hiện chấm vàng và `aria-label` báo "có tiến trình chưa sao lưu"; `title` giữ cố định (các E2E tìm nút theo title).
2. **Nhắc nhẹ không chặn:** banner nằm trong luồng trang dưới header (không phủ lên nút nào), chỉ hiện khi điểm vừa tăng, đang dirty và lần nhắc trước cách ≥ 10 phút; có "Sao lưu ngay" và "Để sau". Không nhắc ngay sau khi tạo CLB (đội starter không tính), không nhắc lại khi tải trang.
3. **Đánh dấu đã sao lưu:** khi sao chép mã thành công (nút Sao Chép, `execCommand` dự phòng, hoặc Ctrl+C trên ô mã) hoặc khi nhập mã thành công; reset game xóa meta.
4. **Thông điệp theo ngữ cảnh** (`src/lib/environment.ts`, chỉ chọn lời khuyên, không chặn gameplay): trong iframe hiện "bản nhúng và bản mở trực tiếp không chia sẻ save"; Safari/iOS (mọi trình duyệt iOS, hay Safari desktop) hiện lời nhắc xuất mã sau mỗi buổi chơi. Màn Sao lưu hiện thời điểm sao lưu gần nhất và số thay đổi chưa sao lưu.
5. **Đọc lại sau ghi:** mỗi lần ghi save, và khi probe lúc tải, đọc lại để phát hiện storage "ghi được nhưng không đọc lại được" (bật banner "Không thể lưu"). Gọi `navigator.storage.persist()` một lần, best-effort, không phụ thuộc kết quả.
6. **Mã ngắn hơn:** khi xuất, ledger nóng được gộp vào `ledgerArchive` (`compactSave`); ví và tiến trình không đổi, `transferOffers` giữ nguyên để Market nhất quán với `purchasedOfferIds`. Chỉ lịch sử giao dịch chi tiết không còn sau khi khôi phục. `encodeSave(save)` mặc định vẫn không rút gọn.
7. **Bất biến sau khi nộp** (quy ước, không phải code): URL production cố định; đổi schema save chỉ kèm migration và test nạp save cũ.

**Kiểm chứng:** 9 unit test (`backup.test.ts`), E2E `e2e-backup.js` (5/5 lần liên tiếp trên Chrome), E2E iframe cross-origin và kiểm tra lời khuyên chỉ hiện khi nhúng. Trên WebKit (engine của Safari, chạy bằng Playwright, **không phải thiết bị iOS thật**) F0, storage chặn và lời khuyên nhúng chạy đúng; `e2e-reload` và `e2e-storage` chập chờn/timeout **cả trên bản trước DEC-12** nên là vấn đề có sẵn cần điều tra trong gate Safari ([PROJECT_STATUS.md](PROJECT_STATUS.md)), không do thay đổi này.

**Không làm bây giờ:** cloud save qua serverless/KV (thêm thu thập dữ liệu cần khai báo, thêm điểm hỏng, vẫn không có danh tính). Nếu playtest cho thấy mất save là vấn đề thật, phương án V2 là "mã lưu ngắn" qua Vercel Function + KV, khai báo trong UI.

## 8. Deploy trên Vercel

Chỉ deploy nội dung `dist/`; không bao giờ để `docs/` hay `.md/.map/.env` lên public (`bun scripts/release-audit.ts` kiểm).

1. Import repo vào Vercel, preset **Vite**: Install `bun install --frozen-lockfile`, Build `bun run build`, Output `dist`. Kiểm tra Vercel nhận `bun.lock`; nếu không, đặt Install Command thủ công.
2. **URL nộp = domain production ổn định** (`<project>.vercel.app` hoặc domain riêng), **không** dùng URL riêng từng deployment (mỗi bản deploy một URL, và preview khác origin sẽ có save khác).
3. Tắt chế độ bảo vệ đăng nhập cho domain production (Deployment Protection/Vercel Authentication) và **thử mở bằng cửa sổ ẩn danh**; nếu bị chặn đăng nhập thì Portal sẽ hiện trang trắng.
4. Vercel mặc định không gửi `X-Frame-Options`; giữ nguyên. **Không đặt `frame-ancestors`** cho tới khi BTC xác nhận origin trang nhúng: đặt sai thì game trắng trong Portal, còn bỏ trống rủi ro thấp (game không có hành động nhạy cảm hay đăng nhập). Host Portal đã biết là `predatorleague.acervietnam.com.vn`, nhưng trang nhúng game có thể ở origin khác; khi đã xác nhận mới thêm qua `vercel.json` → `headers` → `Content-Security-Policy: frame-ancestors 'self' <origin Portal>`.
5. Không có router URL nên không cần rewrite SPA. Ảnh/asset lazy-load, không video lớn.
6. **Dự phòng:** Vercel có Instant Rollback về deployment trước; giữ một bản build ổn định đã nộp để quay lại nếu bản mới lỗi. `infra/nginx.conf.template` (Nginx + Let's Encrypt + CSP `frame-ancestors`) chỉ là phương án self-host nếu Vercel gặp sự cố; phải điền host và origin đã xác minh trước khi dùng.
7. Test nhúng thật bằng `tools/iframe-harness.html` + `bun scripts/harness-server.ts` (parent và game khác origin), sau đó trong Portal thật khi BTC cho thử. Danh sách kiểm: [QA_AND_RELEASE.md](QA_AND_RELEASE.md).

## 9. Bảo mật và quyền riêng tư (ràng buộc từ điều lệ)

- Không thu thập mật khẩu hoặc dữ liệu Portal, không camera/microphone, không chuyển hướng ngoài, không tải mã độc, không script bên thứ ba, không tracking.
- Không đưa Recovery Code vào URL hay log. Tên CLB người dùng nhập luôn được escape khi render.
- Một yêu cầu bên thứ ba duy nhất: Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) làm lộ IP người chơi cho Google. Tự host font nếu muốn bỏ hoàn toàn (không bắt buộc).
- Sao chép nguyên vẹn game thương mại, tài sản có bản quyền chưa được phép bị cấm; xem [CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md).

## 10. Lệnh

```text
bun install --frozen-lockfile
bun run dev              # http://localhost:3000
bun run typecheck && bun run test && bun run build
bun scripts/balance-sim.ts
bun scripts/import-golden-road.ts --check
bun run audit:release
bun scripts/verify-release.ts   # chạy toàn bộ và ghi docs/evidence/verify-output.txt
```

CI (`.github/workflows/verify.yml`, Bun 1.4.3): install → typecheck → test → build → balance-sim → importer `--check` → release-audit. Chưa chạy trên remote.

## 11. Nếu sau này cần backend

Giữ nguyên các nguyên tắc đã chọn lọc từ thiết kế cũ: server quyết định mọi kết quả trận/pack/ví, client không gửi điểm hay người thắng; `club_id` luôn lấy từ principal đã xác thực, không từ body; mọi mutation tài chính có `Idempotency-Key` và ledger giao dịch với `CHECK >= 0`; guest token ngẫu nhiên 256 bit chỉ lưu hash; `Watch/Fast/Skip` phát lại **cùng một** trận đã lưu; engine chạy một nơi duy nhất (không duy trì hai bộ luật). Bản đặc tả đầy đủ có trong git history.
