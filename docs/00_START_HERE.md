# APAC Rising — Esports Manager | START HERE

**Documentation release:** v2.2 + cập nhật triển khai 03/11/2026 (xem `CHANGELOG.md`) • language: Vietnamese
**Product:** Web MOBA esports-manager, campaign từ sinh viên Việt Nam đến Worlds, kết hợp thu thập thẻ tuyển thủ theo mùa, pack, đào tạo, chuyển nhượng, tài chính CLB, match simulation.  
**Submission window:** hạn gốc 15/11/2026 đã được chủ dự án giãn; ngày mới chưa ghi (`DECISIONS.md` Q5). Không dùng ngày cũ làm hạn hiện hành.
**Team:** 1 developer + coding agents. **Architecture B:** React/TypeScript/Vite/Bun, simulator TS, save localStorage, host tĩnh; Oracle/Nginx là hướng deploy chưa nghiệm thu public. Spring Boot/Neon là tham chiếu Architecture A tùy chọn.

**Trạng thái hiện tại:** theo [index.md — Now/M9](index.md), không suy ra mức hoàn thành từ các mục tiêu thiết kế phía dưới. Phase 0–4 có bằng chứng local; public HTTPS/portal, Safari/Firefox, playtest và một số mục tiêu balance vẫn mở. `FEATURE_GOLDEN_ROAD=false`; chưa đạt nghiệm thu bản nộp. BO3/BO5 đã có kết quả từng ván và nút Next thủ công; xem `05`/`07`/`13`.

## Đọc theo thứ tự
1. `01_PRODUCT_VISION_GDD.md` — north star, vòng lặp chơi, nguyên tắc và phạm vi.
2. `02_CAMPAIGN_RESEARCH_REALITY.md` — những gì là thực tế, phần giả lập và các nguồn chính thức.
3. `03_CAMPAIGN_DESIGN.md` — 3 acts, 12 chapters, qualification, thất bại có hậu quả và career seasons.
4. `04_COLLECTION_PACKS_ECONOMY.md` — player/card edition/owned card, pack, pity, training, transfer, finance.
5. `05_MATCH_SIMULATOR.md` — engine MOBA theo pha, BO, seeded RNG, Fearless-lite và kiểm thử cân bằng.
6. `06_DATA_MODEL_API.md` — entities, migrations, endpoints, idempotency, transaction, bảo mật.
7. `07_FRONTEND_UX_ART.md` — flow UI, card design, mobile/iframe, assets.
8. `08_ARCHITECTURE_DEPLOY.md` — monorepo, Nginx/SSL, Oracle ARM, Neon, CI/CD.
9. `09_ACCEPTANCE_QA.md` — testcase, tiêu chí demo/submit.
10. `10_ROADMAP_AGENT_WORKFLOW.md` — sprint và scope gates; không thay đổi ngầm các quyết định.
11. `11_RIGHTS_SOURCES.md` — license checklist, nguồn, claim confidence.
12. `12_CONTENT_BLUEPRINT.md` — dữ liệu sản phẩm/đối thủ/episode/định mức tạo content.
13. `13_MATCH_DECISION_SPEC.md` — **(mới v2.2)** quyết định trong trận: người chơi biết gì, ma trận tactic × đối thủ, số quyết định theo thể thức.
14. `14_ECONOMY_SIM_TABLE.md` — **(mới v2.2)** bảng nguồn/sink credits theo chapter (giả thuyết để mô phỏng kiểm chứng).
15. `agents/IMPLEMENTATION_PROMPT.md` — copy cho agent, chia phase và báo cáo bằng chứng.
16. `config/*.json` — ví dụ cân bằng, competition và card (hư cấu).
17. `DECISIONS.md` — nhật ký quyết định: Gate G0 = B đã ghi nhận; DEC-1..9 giữ trạng thái Đề xuất; Q1–Q3 đã trả lời, Q4–Q6 còn mở và có mặc định để tiếp tục.
18. `agents/PROMPT_FIX_AND_GOLDEN_ROAD.md` — **(mới 03/11)** prompt sửa lỗi audit và tích hợp dữ liệu lịch sử; theo dõi ở `index.md` mục M9.
19. `research/LINKS_AND_FACT_CHECK.md` — liên kết chính thức và bảng kiểm tra thực tế 03/11/2026 kèm độ tin cậy.
20. `ref/golden_road/` — **chỉ để tham khảo** (fan game bên thứ ba): không đóng gói, không sao chép mã/giao diện. Xem `11` §6.

## Cắt phạm vi v2.2 (ưu tiên cao nhất, ghi đè các file 03/10/12 khi mâu thuẫn)
- **Phải xong tốt:** Campus → Road to VCS → VCS (Chapter 1–5) + pack/training/ledger.
- **Dạng dữ liệu, đơn giản hóa:** LCP, First Stand, MSI, Worlds dùng **knockout đơn (hư cấu, có nhãn)**. Swiss, double elimination, Play-In chỉ làm nếu dư thời gian (P2).
- **`demoScenario` "Chung kết thế giới" (bắt buộc, P1):** một trận BO5 chơi được trong ~3 phút từ nút ở Hub, dùng đội dựng sẵn, **không ghi vào career thật**. Đây là cách giám khảo/người bình chọn thấy cao trào mà không cần chơi hàng giờ.
- **P2 (chỉ khi dư giờ):** NPC Transfer, Facilities, Hall of Fame đầy đủ, Predator side cup.
- **Gate G0 (28/10):** quyết định có chủ ý giữa kiến trúc A (server-authoritative như tài liệu) và B (local-first, simulator TS, host tĩnh). Xem `10_ROADMAP_AGENT_WORKFLOW.md` §0. **Cập nhật 03/11:** đã ghi nhận lựa chọn **B** trong `DECISIONS.md` (chờ chủ dự án xác nhận văn bản).

## Quy tắc nguồn sự thật / xung đột
- Nội dung đã khóa ở các file này có thứ tự ưu tiên: `02` (thực tế & hạn chế) > `01` (mục tiêu game) > `03-09` (đặc tả) > `config` (seed mẫu).
- `config` mang tính khởi tạo để cân bằng, KHÔNG phải luật giải chuyên nghiệp chính thức.
- Trục chuyên nghiệp VIETNAM **Campus → Road to VCS → VCS → LCP → global events**, **không** mặc định LCP→LCK. Theo Riot, LCP 2027 nhận các đội xuất sắc từng split từ VCS/PCS/LJL, slot chi tiết đang được công bố dần.
- Predator League là nhánh sự kiện esports riêng, **không phải vòng loại của LCP hoặc Worlds**.
- Người dùng tuyên bố đã nhận chấp thuận từ Riot về **tên và ảnh tuyển thủ**. Tài liệu coi đây là đầu vào của dự án; phải theo phạm vi email, không tự suy ra quyền logo đội, giải, IP trò chơi hoặc bất kỳ thương hiệu nào khác. **Cập nhật 03/11:** chủ dự án khẳng định phạm vi email là toàn bộ, không giới hạn (`DECISIONS.md` Q2); vẫn lập `asset_license` cho từng file ảnh/logo được thêm vào.

## Definition of first playable / release
**F0 — First playable vertical slice (không được bỏ):** tên CLB → 5 thẻ khởi đầu → trận Campus có 3 quyết định → nhận pack bảo đảm Rare → mở pack (có animation) → thay tuyển thủ → trận thứ hai với sức mạnh cập nhật → reload không mất tiến trình.

**R1 — Contest candidate:** F0 ổn định + Campaign tiến tới ít nhất chức vô địch VCS và hành trình LCP/Worlds dạng dữ liệu + hệ thống pack/training/market đơn giản + trực tuyến trên domain và iframe. Nếu game chưa qua QA, feature nào chưa đủ ổn định phải tắt bằng feature flag, không để phá F0.

**V2 — Living game:** nhiều career seasons, nhánh LCK/LPL manager career, sâu chiến thuật, mùa thẻ mới, thành tích lâu dài, daily challenge và hơn nữa.

## Các quyết định không tùy tiện đổi
- Một chủ tài khoản khách có 1 CLB/career save mặc định, có thể mở rộng nhiều save sau.
- Thẻ tuyển thủ theo season edition KHÁC mùa sự nghiệp CLB.
- Architecture B hiện tại: engine TS + reducer lưu pack, thưởng, kinh tế và kết quả trong một snapshot localStorage; không có server authority/chống sửa save. Quy tắc backend là nguồn sự thật chỉ áp dụng Architecture A tùy chọn.
- Game có dữ liệu thẻ **được cấp phép** nếu có xác nhận asset-level; trong môi trường dev dùng placeholder hư cấu.
- Không yêu cầu đăng nhập vào portal của BTC và không thu thập thông tin tài khoản portal.
- Kết quả thi đấu gắn với phiên bản rules và snapshot đội hình, chống replay/submit trùng.

## Lệnh gọi agent
Work order hiện tại là `agents/PROMPT_FIX_AND_GOLDEN_ROAD.md`; đọc `index.md` M9 và `evidence/PHASE_0.md` → `PHASE_4.md` trước khi tiếp tục các gate còn mở. `agents/IMPLEMENTATION_PROMPT.md` là prompt khởi tạo tham khảo, không phải lý do làm lại baseline hoặc các phase đã có bằng chứng.
