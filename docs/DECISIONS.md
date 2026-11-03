# DECISIONS.md — Nhật ký quyết định

Cập nhật lần cuối: 03/11/2026 (sau khi chủ dự án trả lời Q1-Q3). File này là điều kiện của Gate G0 (`agents/IMPLEMENTATION_PROMPT.md`, `10` §0).
Quy ước trạng thái: **Đã ghi nhận** (chủ dự án đã nêu, chờ xác nhận bằng văn bản) · **Đề xuất** (agent đề xuất, chưa ai duyệt) · **Đã chốt** (chủ dự án đã quyết rõ ràng, trong phiên làm việc hoặc bằng văn bản) · **Mở** (cần chủ dự án quyết).
Agent không được tự đổi trạng thái "Đề xuất" thành "Đã chốt"; chỉ chủ dự án làm việc đó.

---

## G0. Kiến trúc

| Mục | Nội dung |
|---|---|
| Lựa chọn | **B: local-first** (simulator TypeScript chạy phía client, lưu bền bằng `localStorage`, Recovery Code dự phòng, host tĩnh) |
| Trạng thái | **Đã ghi nhận** theo lời chủ dự án trong phiên làm việc 03/11/2026. Chủ dự án xác nhận bằng cách đổi trạng thái này thành "Đã chốt". |
| Bằng chứng trong repo | `package.json`, `vite.config.ts`, `src/context/GameContext.tsx`, `src/lib/simulator.ts` (không có thư mục `backend/`) |
| Hệ quả theo spec | `06` và `08` chỉ còn là tham chiếu cho phần tùy chọn (`CLAUDE.md`, mục Gate G0). Deploy skeleton (HTTPS + iframe harness + CSP) vẫn bắt buộc. |
| Hạn chế đã biết | Client tự quyết định kết quả trận, pack và ví, nên **không chống được gian lận**. Chấp nhận cho bản contest và phải nói rõ trong README. Các bất biến phía server (idempotency, ledger giao dịch, `CHECK >= 0`) được thay bằng: mọi mutation đi qua một reducer duy nhất, ledger chỉ ghi thêm, và test property. |

---

## Quyết định đề xuất (chờ chủ dự án duyệt)

| ID | Đề xuất | Lý do | Trạng thái |
|---|---|---|---|
| DEC-1 | **Recovery Code = bản save nén** có version và checksum, dạng `AR1.<base64url>.<crc>`, kèm UI nhập mã và banner khi `localStorage` bị chặn. | Kiến trúc B không có server để tra mã. Bản cũ chỉ sinh mã ngẫu nhiên và `restoreFromRecoveryCode` luôn trả `true` (audit 03/11, mục P0-2). | Đề xuất |
| DEC-2 | Thẻ **LEGACY** (từ dữ liệu lịch sử) **không** vào bảng pack hiện tại: không đổi `packTableVersion`, không đổi pity. Chỉ nhận qua mốc thưởng hoặc chế độ Golden Road. | Giữ nguyên các bất biến pack đã được kiểm chứng; tránh làm hỏng F0. | Đề xuất |
| DEC-3 | **Được hiển thị tên CLB thật.** Cờ `ENABLE_REAL_CLUB_NAMES` mặc định `true`; giữ `teamAlias` (tên hư cấu) làm phương án tắt nhanh. Logo và ảnh được phép về nguyên tắc nhưng **chưa nằm trong work order hiện tại** (repo chưa có file asset được duyệt): dùng placeholder cho đến khi có `asset_license` từng asset. | Chủ dự án khẳng định email Riot bao phủ mọi thứ, không giới hạn (Q2). Thay cho đề xuất ban đầu (tên hư cấu theo `11` §1). | **Đã chốt** (chủ dự án, 03/11/2026, trong phiên làm việc) |
| DEC-4 | **Nguồn rating**: được dùng điểm rating của Golden Road làm giá trị khởi đầu và được điều chỉnh (Q1). Mỗi edition mang `ratingSource` = `golden_road` / `adjusted` / `derived`. Người không có trong dataset (VCS/LCP 2026) dùng `deriveRating()`. **Mapping `rating -> baseOvr`** đơn điệu, từng khúc: 76-80 -> 55-69, 80-86 -> 70-79, 86-91 -> 80-89, 91-98 -> 90-96. | Đo ngày 03/11 trên `docs/ref/golden_road/data.js`: rating gốc 76-98 (TB 84.8); dùng thẳng sẽ cho 535/649 thẻ Epic và 80 thẻ Legendary. Mapping này cho 81 Common, 365 Rare, 166 Epic, 37 Legendary. | Nguồn rating: **Đã chốt** (chủ dự án). Mapping: Đề xuất |
| DEC-5 | Bảng win-rate mục tiêu với chiến thuật mặc định: Ch1 BO1 65-72% (đội khởi đầu), Ch2 BO3 50-60% (+1 Rare), Ch3 BO3 45-55% (2 Rare), Ch4 BO3 45-55% (3 Rare), Ch5 BO5 45-55% (toàn Rare + 1 Epic). | Đo trước khi sửa với đội khởi đầu: 66-69% / 46% / 26% / 20% / 5%. Chương 3-5 quá khó, và việc cho đối thủ nhận synergy sẽ làm khó thêm. | Đề xuất |
| DEC-6 | Tiểu sử tuyển thủ trong `cardCatalog.ts`: **mỗi câu phải có nguồn** trong `research/LINKS_AND_FACT_CHECK.md`, nếu không thì thay bằng mô tả lối chơi trung tính. Không đưa họ tên đời thực, tuổi, quê quán. | Hiện có họ tên đầy đủ và thành tích của người thật mà repo không dẫn nguồn. | Đề xuất |
| DEC-7 | Chế độ "Golden Road Draft" là **P2, phát triển sau cờ `FEATURE_GOLDEN_ROAD`**. Hạn nộp đã giãn (Q3) nên được lên kế hoạch làm, nhưng chỉ **bật trong bản nộp** nếu toàn bộ acceptance F0/R1 đã xanh và QA 390x844 + iframe đạt. | Scope v2.2: tính năng chưa QA-ready phải nằm sau cờ. | Đề xuất |
| DEC-8 | Facilities (P2): perk nào chưa có code thì **sửa mô tả UI cho đúng** hoặc ẩn cấp đó, không làm thêm tính năng. | Perk giảm 10% chi phí huấn luyện chỉ hiển thị, chưa trừ tiền (audit, mục 7). | Đề xuất |
| DEC-9 | **Engine Golden Road phải viết lại từ đầu (clean-room)** theo luật chơi đã mô tả, không port mã nguồn. UI, văn bản, ảnh chia sẻ, CSS, icon đều làm mới. **Quyền ở Q1 chỉ bao phủ điểm rating, không bao phủ mã và giao diện.** | `agents/IMPLEMENTATION_PROMPT.md` dòng 16: "never ... copy existing game code/UI"; điều khoản cuộc thi cấm "copied commercial game assets" (`11` §2). Golden Road là site có Ko-fi và banner đồng ý quảng cáo (`style.css:75`, `game.js` `supportBlock`). | Đề xuất |

---

## Câu hỏi đã được chủ dự án trả lời

Các câu trả lời dưới đây là lời chủ dự án trong phiên làm việc 03/11/2026. Bằng chứng gốc (email, tin nhắn cấp quyền) giữ **ngoài repo công khai**.

| ID | Câu hỏi | Trả lời | Hệ quả |
|---|---|---|---|
| Q1 | Có quyền dùng điểm rating trong `docs/ref/golden_road/data.js` không? | **Có.** Chủ dự án đã xin được quyền tham khảo điểm rating, được dùng và điều chỉnh cho phù hợp. | DEC-4: rating gốc dùng làm giá trị khởi đầu, có `ratingSource`. Quyền **chỉ bao phủ điểm rating**; mã và giao diện vẫn phải làm clean-room (DEC-9). |
| Q2 | Email của Riot có bao phủ tên CLB thật và việc dùng trong game không? | **Có, bao phủ tất cả, không giới hạn.** | DEC-3: tên CLB thật được phép, cờ `ENABLE_REAL_CLUB_NAMES` mặc định `true`. Ghi chú sổ sách: khi thêm ảnh hoặc logo thật vẫn lập `asset_license` từng asset (`11` §1), vì bên giữ bản quyền ảnh/logo có thể là CLB hoặc nhiếp ảnh gia. |
| Q3 | Có chấp nhận cắt G3 nếu trễ lịch? | **Không trễ lịch; hạn nộp đã được giãn.** | Bỏ thứ tự cắt phạm vi. G3 vào kế hoạch chính (DEC-7). Ngày mới xem Q5. |

## Câu hỏi còn mở cho chủ dự án

| ID | Câu hỏi | Mặc định nếu chưa có trả lời | Chặn việc gì |
|---|---|---|---|
| Q4 | Bảng win-rate DEC-5 có phù hợp với cảm giác chơi bạn muốn? | Dùng DEC-5; chỉnh sau playtest. | Hiệu chỉnh đối thủ |
| Q5 | **Ngày nộp mới** sau khi giãn hạn là khi nào? (Điều khoản cuộc thi hiện hành cũng cần đối chiếu: `11` §2.) | Giữ thứ tự ở `agents/PROMPT_FIX_AND_GOLDEN_ROAD.md` mục 6 không gắn ngày; đặt ngày đóng băng tính năng cách ngày nộp tối thiểu 2 ngày làm việc khi biết ngày. | Lịch tuyệt đối trong `index.md` M9 |
| Q6 | Bên cấp quyền rating Golden Road có yêu cầu **ghi công** (credit) không? | Thêm một dòng ghi nguồn dữ liệu trong màn hình Credits/README, không ảnh hưởng gameplay. | Màn hình Credits |

---

## Nhật ký thay đổi của file này

Kết quả G0 (03/11): mapping mặc định triển khai theo neo integer 76→55, 80→69, 81→70, 86→79, 87→80, 91→89, 92→90, 98→96; đơn điệu cả input thập phân. Phân bố đo được 81/365/166/37. Đây là mặc định kỹ thuật theo DEC-4, không thay trạng thái đề xuất. Ba edition 2026 hiện tại trước đây gắn nhầm LEGACY được phân loại CHAMPION, giữ nguyên id/stats/odds; LEGACY sinh từ dataset không vào pack. RatingSource của edition remap là adjusted, giữ rawRating và ratingNote. Bằng chứng checksum tại `src/data/generated/legacyManifest.json`.

Kết quả Phase 2 (03/11): dùng mặc định Q4/DEC-5, OVR đối thủ Ch1–5 = 55/62/66/72/77, win-rate 4000 seed/ô = 68.70/54.23/48.63/49.52/49.30%. Không chốt thay chủ dự án. Tài trợ phục hồi 100 credits/ngày khi ví dưới 100, giao hữu/thử lại miễn phí; Champion Pool tạm không huấn luyện. `evidence/PHASE_2.md`.

Kết quả triển khai Phase 1 (03/11): theo mặc định DEC-1, Recovery Code của Kiến trúc B là bản save nén deflate, version `AR1`, CRC32 và giới hạn kích thước. Mã là snapshot tiến trình, không phải danh tính server; xuất mã mới sau khi chơi. Trạng thái đề xuất của DEC-1 được giữ nguyên. E2E storage bị chặn và round-trip đã xanh, xem `evidence/PHASE_1.md`.

| Ngày | Thay đổi |
|---|---|
| 03/11/2026 | Tạo file. Ghi nhận G0 = B. Thêm DEC-1..DEC-9 và Q1..Q4 sau audit mã nguồn và nghiên cứu dữ liệu Golden Road. |
| 03/11/2026 | Chủ dự án trả lời Q1-Q3: có quyền dùng/điều chỉnh rating Golden Road; email Riot bao phủ mọi thứ; hạn nộp được giãn. Cập nhật DEC-3, DEC-4, DEC-7, DEC-9; thêm Q5 (ngày nộp mới) và Q6 (ghi công). |
