# APAC Rising: Esports Manager

Web MOBA esports manager: xây dựng CLB, tuyển mộ thẻ theo mùa, huấn luyện và thi đấu từ Campus → Road to VCS → VCS → LCP → các sự kiện toàn cầu mô phỏng.

Kiến trúc B: React + TypeScript + Vite + Bun. Game chạy phía client và lưu `localStorage`; không cần API key, backend hoặc tài khoản Portal. Client quyết định trận đấu, pack và ví, vì vậy bản local-first **không chống được gian lận hoặc sửa save**.

## Chạy và kiểm tra

Đã kiểm tra với Bun 1.4.3 trên Windows:

```text
bun install --frozen-lockfile
bun run dev
bun run typecheck
bun run test
bun run build
bun scripts/balance-sim.ts
bun run audit:release
```

Dev: `http://localhost:3000`. `bun run clean` chỉ xóa `dist` bằng script kiểm tra đường dẫn, dùng được trên Windows. Bộ test gồm invariants simulator/pack, regressions, recovery, dữ liệu và draft. Balance dùng 4000 seed mỗi ô, kiểm tra dải DEC-5 cho Ch1–5.

## Save và Recovery Code

- Snapshot version 1 được ghi nguyên khối vào `apac_rising_save_v3`; lần đầu tự migrate ba key v2 cũ. Hot ledger giữ 500 dòng gần nhất và tổng archive cho phần cũ.
- Recovery Code dạng `AR1.<base64url(deflate JSON)>.<CRC32>` chứa bản save tại lúc xuất; xuất mã mới sau khi chơi. CRC phát hiện lỗi dữ liệu, không phải chữ ký chống gian lận. Giới hạn mã 500k ký tự, giải nén 2MB.
- Có thể nhập từ Onboarding hoặc màn Sao lưu. Khi storage/clipboard bị chặn, banner và cách sao chép thủ công vẫn hoạt động. Không đưa mã vào URL hoặc log.
- Reset chỉ xóa key của game. Demo BO5 giữ toàn bộ state trong component và không ghi save sự nghiệp.
- Trận đang chơi, recap chưa claim và reveal pack được lưu để reload tiếp tục đúng trạng thái, kết quả và thẻ đã nhận.

## Dữ liệu và phạm vi quyền

`scripts/import-golden-road.ts` chỉ đọc dữ kiện/rating từ `docs/ref/golden_road/data.js` ở build time. File sinh được commit trong `src/data/generated/`, kèm SHA256 của nguồn và từng output. Dùng `bun scripts/import-golden-road.ts --check` để kiểm tra tái sinh; chỉnh rating tại `ratingOverrides.ts`, không sửa tay JSON.

Credit dữ liệu rating lịch sử: **Golden Road (goldenroadlol.com)**. Chủ dự án đã có quyền dùng và điều chỉnh rating; quyền này chỉ bao phủ rating. Engine, giao diện, CSS, icon, copy và poster chia sẻ của bản game này được viết độc lập; `docs/ref` không nằm trong bundle. Q6 về dòng ghi công cuối cùng vẫn mở.

649 Legacy editions / 374 identities / 73 đội / 129 team-years. Mapping rating sang OVR giữ thứ tự; chỉ số là giá trị giải trí, không phải đánh giá khách quan người thật. Legacy không vào pack hiện tại. Năm bản ghi TSW 2026 có source/confidence/retrievedAt; dữ kiện Low chưa được xác minh không được thêm vào game. Xem `docs/research/LINKS_AND_FACT_CHECK.md`.

Tên CLB thật bật theo quyền chủ dự án đã ghi nhận, có alias cho đội lịch sử. Chưa có file ảnh/logo thật được duyệt: chỉ dùng placeholder hình học và SVG. Khi thêm asset phải có `asset_license` từng file; không công khai email cấp quyền.

## Quy tắc mô phỏng

- LCP, First Stand, MSI, Worlds là knockout hư cấu có nhãn và provenance; không coi là thể thức chính thức hoặc thông tin xác nhận mùa 2027.
- BO1/BO3/BO5 dùng cùng engine seeded. Ván đầu ba quyết định; các ván sau dùng FOCUS_1, có tùy chọn manualAll trong career. Watch/Fast/Skip chỉ đổi replay của ván đã tính.
- BO3/BO5 dừng ở kết quả từng ván, hiển thị thắng/thua, tỷ số chuỗi, MVP và logs ba pha. Người chơi bấm “Ván Tiếp Theo” để chọn chiến thuật; ván cuối có nút “Xem Tổng Kết Chuỗi”. Demo BO5 cũng theo luồng này.
- Odds/pity v2.2 giữ nguyên. Scout tối đa 7 miss liên tiếp, lần thứ 8 Epic+; không có thanh toán tiền thật.
- `FEATURE_GOLDEN_ROAD=false`: Draft đã được phát triển và QA trực tiếp component, nhưng chưa bật cho bản nộp vì gate R1/public HTTPS/portal chưa đầy đủ. `ENABLE_REAL_CLUB_NAMES=true`.
- Tài trợ phục hồi 100 credits/ngày VN khi ví dưới 100; giao hữu và thử lại miễn phí. Market Legacy xoay theo ngày, không phản ánh hợp đồng đời thực.

## QA iframe và triển khai

```text
bun run build
bun run preview -- --host 127.0.0.1 --port 4173
bun scripts/harness-server.ts
```

Mở `http://127.0.0.1:4174`: parent và game (`localhost:4173`) khác hostname/origin. `scripts/e2e-*.js` là các hàm `async(page)` chạy bằng Playwright tool `browser_run_code_unsafe` với `filename`, không thêm dependency Playwright vào dự án. Chúng tạo context test riêng, không xóa storage trình duyệt đang dùng. Có F0, reload, Skip fake clock, blocked storage/clipboard, demo no-write, draft, accessibility và iframe trên production build.

Chỉ deploy nội dung `dist/`. `infra/nginx.conf.template` có SPA fallback, health endpoint, HTTPS và CSP `frame-ancestors`; phải điền game host, certificate và portal origin đã được xác minh. Không dùng placeholder hoặc đoán portal host. Trước khi thay Nginx trên Oracle: audit port/vhost, backup và chỉ thay vhost game; chưa có thao tác lên máy chủ trong lượt này.

Hạn gốc 15/11/2026 đã được giãn; ngày mới còn mở tại `docs/DECISIONS.md` Q5. Khi có ngày, đóng băng tính năng trước tối thiểu hai ngày làm việc. Bằng chứng từng phase: `docs/evidence/PHASE_0.md` → `PHASE_4.md`; tracker tại `docs/index.md` M9. Chưa xác nhận public HTTPS, portal thật hoặc QA Safari/iOS bằng thiết bị thật.

Trò chơi không phải sản phẩm chính thức của Riot/Acer. Thể thức, lịch, chỉ số và điều kiện tham dự được giản lược cho mô phỏng; không thu thập tài khoản Portal, camera hay microphone.
