# DECISIONS.md — Nhật ký quyết định

Cập nhật lần cuối: 03/11/2026. Điều kiện của Gate G0.
Quy ước trạng thái: **Đã ghi nhận** (chủ dự án đã nêu, chờ xác nhận bằng văn bản) · **Đề xuất** (agent đề xuất, chưa ai duyệt) · **Đã chốt** (chủ dự án đã quyết rõ ràng, trong phiên làm việc hoặc bằng văn bản) · **Mở** (cần chủ dự án quyết).
Agent không được tự đổi trạng thái "Đề xuất" thành "Đã chốt"; chỉ chủ dự án làm việc đó.

---

## G0. Kiến trúc

| Mục | Nội dung |
|---|---|
| Lựa chọn | **B: local-first** (simulator TypeScript chạy phía client, lưu bền bằng `localStorage`, Recovery Code dự phòng, host tĩnh) |
| Trạng thái | **Đã ghi nhận** theo lời chủ dự án trong phiên làm việc 03/11/2026. Chủ dự án xác nhận bằng cách đổi trạng thái này thành "Đã chốt". |
| Bằng chứng trong repo | `package.json`, `vite.config.ts`, `src/context/GameContext.tsx`, `src/lib/simulator.ts` (không có thư mục `backend/`) |
| Hệ quả | Phương án server-authoritative (Java/Spring Boot/Neon/Oracle) đã bị loại khỏi bộ tài liệu; nguyên tắc cần giữ nếu sau này có backend nằm ở [ARCHITECTURE.md](ARCHITECTURE.md) §11. Deploy skeleton (HTTPS + iframe + nhúng thật) vẫn bắt buộc. |
| Hạn chế đã biết | Client tự quyết định kết quả trận, pack và ví, nên **không chống được gian lận**. Chấp nhận cho bản contest vì điểm thi do Portal bình chọn, không lấy từ game; phải nói rõ trong README. Các bất biến phía server được thay bằng: mọi mutation đi qua một reducer duy nhất, ledger chỉ ghi thêm, và test property. |

---

## Quyết định đã chốt bởi chủ dự án

| ID | Quyết định | Lý do | Trạng thái |
|---|---|---|---|
| DEC-3 | **Được hiển thị tên CLB thật.** Cờ `ENABLE_REAL_CLUB_NAMES` mặc định `true`; giữ `teamAlias` (tên hư cấu) làm phương án tắt nhanh. Logo và ảnh được phép về nguyên tắc nhưng chưa có file asset được duyệt: dùng placeholder cho đến khi có `asset_license` từng asset. | Chủ dự án khẳng định email Riot bao phủ mọi thứ, không giới hạn (Q2). | **Đã chốt** (chủ dự án, 03/11/2026, trong phiên làm việc) |
| DEC-4 (nguồn) | Được dùng điểm rating của Golden Road làm giá trị khởi đầu và được điều chỉnh (Q1). Mỗi edition mang `ratingSource` = `golden_road` / `adjusted` / `derived`. Người không có trong dataset dùng `deriveRating()`. | Q1. Quyền chỉ bao phủ rating, không bao phủ mã hay UI. | **Đã chốt** (chủ dự án, 03/11/2026) |
| DEC-10 | **Host game trên Vercel** (static, từ `dist/`). URL nộp là domain production ổn định. Thay cho Oracle + Nginx + Cloudflare. | Đơn giản, miễn phí, có CDN và Instant Rollback; không có server để vận hành. Chi tiết [ARCHITECTURE.md](ARCHITECTURE.md) §8. | **Đã chốt** (chủ dự án, 03/11/2026, trong phiên làm việc) |
| DEC-11 | **Không thêm đánh dấu dùng AI trong game**: chủ dự án khai ở **ô riêng khi nộp bài** trên Portal. | Điều lệ yêu cầu "game phải có đánh dấu sử dụng AI"; chủ dự án xác nhận form nộp có ô khai báo riêng. Nếu BTC yêu cầu hiển thị trong game, thêm một dòng ở footer `App.tsx`. | **Đã chốt** (chủ dự án, 03/11/2026, trong phiên làm việc) |
| DEC-12 | **Kiến trúc lưu trữ chịu được storage không bền, không backend:** chỉ báo sao lưu (`apac_backup_meta`), nhắc nhẹ không chặn, thông điệp theo ngữ cảnh nhúng/Safari, đọc lại sau ghi, `storage.persist()` best-effort, mã xuất ngắn hơn (ledger gộp vào archive), URL production cố định và schema save chỉ đổi kèm migration. Không cloud save, không Storage Access API. | Portal không truyền danh tính nên backend không giải quyết mất save; storage trong iframe cross-origin có thể bị xóa mà không báo lỗi. Đã triển khai 03/11 (chi tiết [ARCHITECTURE.md](ARCHITECTURE.md) §7). | **Đã chốt** (chủ dự án, 03/11/2026, yêu cầu triển khai trong phiên làm việc) |

---

## Quyết định đề xuất (chờ chủ dự án duyệt)

| ID | Đề xuất | Lý do | Trạng thái |
|---|---|---|---|
| DEC-1 | **Recovery Code = bản save nén** có version và checksum, dạng `AR1.<base64url>.<crc>`, kèm UI nhập mã và banner khi `localStorage` bị chặn. | Kiến trúc B không có server để tra mã. Bản cũ chỉ sinh mã ngẫu nhiên và `restoreFromRecoveryCode` luôn trả `true` (audit 03/11, P0-2). Đã triển khai ở Phase 1. | Đề xuất |
| DEC-2 | Thẻ **LEGACY** **không** vào bảng pack hiện tại: không đổi `packTableVersion`, không đổi pity. Chỉ nhận qua market, thưởng hoặc Draft. | Giữ nguyên các bất biến pack đã kiểm chứng; tránh làm hỏng F0. | Đề xuất |
| DEC-4 (mapping) | **Mapping `rating -> baseOvr`** đơn điệu, từng khúc: 76-80 -> 55-69, 80-86 -> 70-79, 86-91 -> 80-89, 91-98 -> 90-96. Triển khai theo neo integer 76→55, 80→69, 81→70, 86→79, 87→80, 91→89, 92→90, 98→96 (đơn điệu cả input thập phân). | Rating gốc 76-98 (TB 84.8): dùng thẳng sẽ cho 535/649 thẻ Epic và 80 Legendary. Mapping cho 81 Common, 365 Rare, 166 Epic, 37 Legendary. | Đề xuất |
| DEC-5 | Bảng win-rate mục tiêu với chiến thuật mặc định: Ch1 BO1 65-72% (đội khởi đầu), Ch2 BO3 50-60% (+1 Rare), Ch3 BO3 45-55% (2 Rare), Ch4 BO3 45-55% (3 Rare), Ch5 BO5 45-55% (toàn Rare + 1 Epic). | Đo trước khi sửa: 66-69% / 46% / 26% / 20% / 5%. Chương 3-5 quá khó. Sau Phase 2: OVR đối thủ Ch1–5 = 55/62/66/72/77, win-rate 68.70 / 54.23 / 48.63 / 49.52 / 49.30 % (4000 seed/ô), đủ dải. | Đề xuất |
| DEC-6 | Tiểu sử tuyển thủ trong `cardCatalog.ts`: **mỗi câu phải có nguồn** ([CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md) §6), nếu không thì thay bằng mô tả lối chơi trung tính. Không đưa họ tên đời thực, tuổi, quê quán. | Trước đó có họ tên đầy đủ và thành tích người thật không dẫn nguồn. | Đề xuất |
| DEC-7 | Chế độ "Golden Road Draft" là **P2, sau cờ `FEATURE_GOLDEN_ROAD`** (hiện `false`). Chỉ **bật trong bản nộp** nếu toàn bộ acceptance F0/R1 đã xanh và QA 390x844 + iframe đạt. | Tính năng chưa QA-ready phải nằm sau cờ. Đã phát triển và QA trực tiếp component. | Đề xuất |
| DEC-8 | Facilities (P2): perk nào chưa có code thì **sửa mô tả UI cho đúng** hoặc ẩn cấp đó, không làm thêm tính năng. | Perk giảm 10% chi phí huấn luyện từng chỉ hiển thị, chưa trừ tiền. Đã áp dụng ở Phase 2. | Đề xuất |
| DEC-9 | **Engine Golden Road phải viết lại từ đầu (clean-room)** theo luật đã mô tả, không port mã nguồn. UI, văn bản, ảnh chia sẻ, CSS, icon đều làm mới. Quyền ở Q1 **chỉ bao phủ điểm rating**. | Điều lệ cuộc thi cấm sao chép game thương mại ([CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md) §1); Golden Road có Ko-fi và banner đồng ý quảng cáo. | Đề xuất |

---

## Câu hỏi đã được chủ dự án trả lời

Các câu trả lời dưới đây là lời chủ dự án trong phiên làm việc 03/11/2026. Bằng chứng gốc (email, tin nhắn cấp quyền) giữ **ngoài repo công khai**.

| ID | Câu hỏi | Trả lời | Hệ quả |
|---|---|---|---|
| Q1 | Có quyền dùng điểm rating trong `docs/ref/golden_road/data.js` không? | **Có.** Đã xin được quyền tham khảo, dùng và điều chỉnh. | DEC-4. Quyền **chỉ bao phủ điểm rating**; mã và giao diện vẫn clean-room (DEC-9). |
| Q2 | Email của Riot có bao phủ tên CLB thật và việc dùng trong game không? | **Có, bao phủ tất cả, không giới hạn.** | DEC-3. Ảnh/logo thật vẫn lập `asset_license` từng asset vì bên giữ bản quyền có thể là CLB hoặc nhiếp ảnh gia. |
| Q3 | Có chấp nhận cắt G3 nếu trễ lịch? | Trả lời lúc đó: không trễ lịch, hạn đã được giãn. **Thay thế bởi Q5.** | G3 nằm trong kế hoạch chính (DEC-7), vẫn chỉ bật khi đạt gate. |
| Q5 | Ngày nộp mới sau khi giãn hạn là khi nào? | **Không có giãn hạn: nộp hết 15/11/2026, bình chọn đến hết 22/11/2026** (chủ dự án xác nhận 03/11, khớp trang điều lệ). | Lịch tuyệt đối ở [PROJECT_STATUS.md](PROJECT_STATUS.md) §2: đóng băng tính năng 10/11, mục tiêu nộp 13/11. |

## Câu hỏi còn mở cho chủ dự án

| ID | Câu hỏi | Mặc định nếu chưa có trả lời | Chặn việc gì |
|---|---|---|---|
| Q4 | Bảng win-rate DEC-5 có phù hợp với cảm giác chơi bạn muốn? | Dùng DEC-5; chỉnh sau playtest. | Hiệu chỉnh đối thủ |
| Q6 | Bên cấp quyền rating Golden Road có yêu cầu **ghi công** không? | Đã thêm một dòng ghi nguồn dữ liệu ở footer game và README, không ảnh hưởng gameplay. | Màn hình Credits |

Việc cần xác nhận với BTC (origin trang nhúng, thuộc tính iframe, thời gian duyệt) ghi ở [CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md) §3. Quyết định liên quan tới deploy: domain production (D4) và `frame-ancestors` (D1) chờ có URL và xác nhận BTC.

---

## Ghi chú triển khai (03/11/2026)

- Recovery Code của Kiến trúc B là bản save nén deflate, version `AR1`, CRC32 và giới hạn kích thước; là snapshot tiến trình, không phải danh tính server; xuất mã mới sau khi chơi.
- Ba edition 2026 trước đây gắn nhầm LEGACY được phân loại CHAMPION, giữ nguyên id/stats/odds; LEGACY sinh từ dataset không vào pack. `ratingSource` của edition remap là `adjusted`, giữ `rawRating` và `ratingNote`. Checksum tại `src/data/generated/legacyManifest.json`.
- Training/sponsorship: tài trợ phục hồi 100 credits/ngày khi ví dưới 100; giao hữu và thử lại miễn phí; `CHAMPION_POOL` tạm không huấn luyện.
- Theo yêu cầu chủ dự án, BO3/BO5 dừng ở kết quả từng ván để đọc logs rồi bấm Next (`GameRecap`), lưu được khi reload; không đổi luật/RNG/odds.
- Benchmark prototype phụ chưa đạt (adaptive–random gap 3.51 điểm %, +10 power 76.09%); DEC-5 đủ dải.

## Nhật ký thay đổi của file này

| Ngày | Thay đổi |
|---|---|
| 03/11/2026 | Tạo file. Ghi nhận G0 = B. Thêm DEC-1..DEC-9 và Q1..Q4 sau audit mã nguồn và nghiên cứu dữ liệu Golden Road. |
| 03/11/2026 | Chủ dự án trả lời Q1-Q3; cập nhật DEC-3, DEC-4, DEC-7, DEC-9; thêm Q5 và Q6. |
| 03/11/2026 | Gộp tài liệu. Chủ dự án chốt: hạn 15/11 (Q5 đóng, Q3 bị thay thế), host Vercel (DEC-10), khai AI ở ô riêng khi nộp (DEC-11). Agent thêm DEC-12. Tách các mục đã chốt khỏi "Đề xuất"; giữ nguyên trạng thái các mục DEC-1, 2, 4 (mapping), 5–9. G0 vẫn "Đã ghi nhận". |
| 03/11/2026 | Chủ dự án yêu cầu triển khai DEC-12 → **Đã chốt** và đã triển khai. Dọn `docs/ref/golden_road/`: chỉ còn `data.js` (nguồn importer). |
