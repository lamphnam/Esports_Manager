# UX và Art — luồng UI, thẻ, pack, responsive

Cập nhật 03/11/2026. Mô tả UI đang chạy (React + Tailwind v4, `src/App.tsx`, `src/components/`, `src/views/`). Mục chưa làm ghi **[Đích]**.

## 1. Hướng thị giác

Dashboard esports chuyên nghiệp kết hợp cảm giác thẻ sưu tầm, hướng **Crisp Industrial**: Slate, Cobalt, Amber, Crimson; chữ tương phản rõ, hỗ trợ tiếng Việt. Khung thẻ và hình đều tự vẽ (CSS/SVG), không sao chép giao diện tham chiếu.

- **Token ngữ nghĩa** (`src/index.css`, khối `@theme`; không dùng hex hay màu raw trong component): `bg #0B1020`, `surface #121A2B`, `elevated #192337`, `line #29354B`, `fg #E8EDF7`, `fg-muted #AAB6CD`, `fg-subtle #8D99B3`, `gold #F5B83D` (hành động chính, phần thưởng), `info #5B8DEF`, `success #37C993`, `danger #EF6B73`. Mọi cặp chữ/nền đạt AA (thấp nhất 4.54). Màu trung tính chiếm ưu thế.
- **Thang chữ:** `text-title` 28, `text-heading` 20, `text-card` 16, `text-body` 15, `text-label` 13, `text-caption` 12 (tối thiểu); không `uppercase`/`tracking-wide` tràn lan.
- **Khối dùng chung:** lớp `.panel`, `.panel-inset`, `.btn` (+ `-primary/-secondary/-info/-ghost/-lg`), `.badge`, `.option` (lựa chọn: tint + vạch vàng bên trái, không viền dày), `.label-text`; component `RoleBadge`, `RarityBadge`, `StatBar`, `PageHeader`, `SegmentedControl` trong `src/components/ui.tsx`. Nhãn role ngắn (JNG, SUP) luôn kèm tên đầy đủ trong `title`/`aria-label`.
- **Rarity:** một hệ thống (`--color-rarity-*`), chỉ xuất hiện ở chấm nhãn độ hiếm và vạch trên của thẻ; khung thẻ trung tính. Thẻ là size container: avatar chỉ hiện khi đủ rộng.
- **Font:** Barlow, Be Vietnam Pro, IBM Plex Mono tải từ Google Fonts (`index.html`); chữ nội dung là Be Vietnam Pro (e2e kiểm); `<html lang="vi">`.
- **Cấm** (release-audit kiểm): màu `purple/indigo/violet`, emoji trong UI. Icon role là SVG tự vẽ kèm chữ.

## 2. Luồng và điều hướng

- **Lần đầu:** Loading → Tạo CLB (hoặc nhập Recovery Code) → 5 thẻ starter → Trận Campus → Welcome Pack → Trang bị một chạm → Trận hai → Hub.
- **Quay lại:** tải save → khôi phục `activeMatch` hoặc `pendingReveal` nếu có → Hub. Tab: Hub, Campaign, Lineup, Collection, Packs, Training, Transfers, Facilities.
- **Trận BO3/BO5:** Opponent Preview → quyết định → replay từng ván → **Game Recap** → **Ván Tiếp Theo** (`FOCUS_1`) → … → **Xem Tổng Kết Chuỗi** → thưởng → Hub. BO1 đi thẳng đến tổng kết. Chi tiết luồng: [MATCH_SIMULATOR.md](MATCH_SIMULATOR.md) §8.

| Màn | Cần có | Trạng thái rỗng/lỗi |
|---|---|---|
| Hub | giai đoạn career, trận kế, team rating, ví, số pack, nút demo | lỗi storage kèm hướng dẫn Recovery Code |
| Campaign | timeline 3 Act, chapter khóa/mở, preview đối thủ, giải thích điều kiện | không có node "mở giả" |
| Lineup | 5 slot + bench, stats hiệu dụng, synergy, so sánh nhanh | roster lỗi được tô nổi |
| Collection | lưới thẻ responsive, lọc role/năm/rarity, chi tiết thẻ | — |
| Packs | tỷ lệ, số pack, reveal lưu bền, Skip | reload hiện lại đúng thẻ, không rút lại |
| Training | xem trước chi phí và before/after, xác nhận rõ | nút tắt khi thiếu credits |
| Market | 6 offer NPC, expiry theo ngày VN | đổi ngày tạo bảng mới; offer đã mua không mua lại |
| Match Center | scoreboard, số ván, timeline, chọn pha, báo cáo, tốc độ | khôi phục trận/recap khi reload |
| Game Recap | thắng/thua ván, kills, thời lượng, MVP, tỷ số chuỗi, logs 3 pha, nút Next | không tự chuyển; focus vào tiêu đề kết quả |
| Season Recap, Hall of Fame | **[Đích/P2]** | trạng thái rỗng hợp lệ |

**Màn trận (kiểu Worlds Mayhem):** tiêu đề có giải và vòng (ví dụ "First Stand · Vòng loại trực tiếp"). Trước trận là hai hàng thẻ 5 tuyển thủ, đối thủ ở trên, VS, đội của bạn ở dưới (chữ viết tắt thay cho ảnh người thật, viền theo dải OVR, trên mobile chuyển thành danh sách dọc), rồi báo cáo trinh sát và chọn chiến thuật. Khi đấu có **bản đồ đường đi** (minimap Summoner's Rift thật trong `src/assets/map/`, mỗi tuyển thủ là một token mang icon vị trí, token hai đội trượt theo pha: bên nào thắng pha thì đẩy lên; tên và OVR có trong `title` của token) và **thanh tiến trình M1…M5** (thắng/thua/đang đấu/chưa đấu) bên cạnh tỷ số; recap cũng có thanh này. Component: `MatchVisuals.tsx`.

**Bracket mùa giải:** `SeasonBracket` hiện 7 khối giải với các vòng, trạng thái (đã vượt qua / đang diễn ra / chưa mở), đối thủ, thể thức và OVR; bấm vòng hiện tại để đấu, vòng đã qua để đấu lại giao hữu. Dạng gọn ở Hub ("Hành trình mùa N"), dạng đầy đủ ở tab Chiến Dịch (có chuyển "Danh sách chương"). Khi thắng Worlds, Hub hiện `SeasonSummary` với nút sang mùa mới.

**Đội hình đối thủ:** component `OpponentRoster` (`<details>`) liệt kê vai trò, tên và OVR của 5 tuyển thủ đối phương, kèm ghi chú cân chỉnh độ khó nếu có; hiện ở Hub (mục tiêu chiến dịch), thẻ Campaign và màn Match Center (mở sẵn).

**Log trận:** dòng có lợi hiện xanh (`text-success`), bất lợi hiện đỏ (`text-danger`), kèm chữ ẩn "Có lợi/Bất lợi" cho trình đọc màn hình; chênh lệch vàng tô theo dấu.

**Sao lưu (DEC-12):** nút Sao lưu (biểu tượng chìa khóa, thêm nhãn chữ từ màn `lg`) trên Navbar hiện chấm vàng khi có tiến trình chưa sao lưu; banner nhắc nằm trong luồng trang ngay dưới header (không phủ lên nút nào), có "Sao lưu ngay" và "Để sau"; màn Sao lưu hiện lần sao lưu gần nhất và lời khuyên theo ngữ cảnh (bản nhúng, Safari/iOS).

Tooltip bối cảnh và mở dần tính năng trong Chapter 1–5. Mục khóa hiển thị điều kiện mở, không dùng "Coming Soon" cho tính năng đã mở.

## 3. Giải phẫu thẻ

Role badge, năm và loại edition, tên hiển thị, OVR, rarity, chân dung (hiện là placeholder hình học), lối chơi, 3 thanh stat nổi bật; chạm/hover mở 5 chỉ số. Phải đọc được không dựa vào màu. Lưới CSS responsive, tránh khóa scroll trên mobile.

**Logo:** `src/assets/brand/logo-128.png` trong navbar (40px, bo góc, viền `line`), favicon và apple-touch-icon ở `public/`; bản gốc `logo-master.png` chỉ để tái sinh các kích thước (sinh bằng canvas, không có công cụ trong repo).

**Icon vị trí:** `RoleIcon` dùng PNG trong `src/assets/roles/` khi có (xem [CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md) §5), nếu không thì SVG tự vẽ.

**Quy tắc tài sản:** dev dùng avatar hình học trừu tượng. Ảnh người thật hoặc tên chỉ khi phạm vi quyền đã được xác nhận; không tải ảnh bên thứ ba từ tìm kiếm và tự cho là có quyền; logo đội/skin/splash art cần quyền riêng. Mỗi file ảnh/logo thêm vào phải có `asset_license` ([CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md) §5).

## 4. Mở pack

1. Xác nhận bằng một lần bấm (không mua nhầm); hiển thị tỷ lệ.
2. Save được commit (thẻ, kho pack, pity, ledger, pending reveal) **trước** animation.
3. 0.8s bóng → bloom màu rarity → 1.5s lật thẻ → bảng so sánh. `prefers-reduced-motion` bỏ hẳn animation và confetti.
4. Nút `Thêm vào đội hình` (nếu role phù hợp) và `Đóng`; không có lượt rút ẩn.
5. Mở lại cùng pack hiện thẻ đã mint, không rút lại.

## 5. Responsive, iframe, trợ năng

- Mục tiêu: desktop 1440×900 và mobile 390×844; thử iframe 1024×720, 768×600, 360×640. Navbar: < md chỉ logo, ví, Sao lưu và nút menu (tab, Demo, âm thanh nằm trong menu, `aria-expanded`, Esc đóng và trả focus); từ md trở lên có hàng tab riêng dưới thanh trên (không bao giờ nhét tab vào thanh trên vì cột nội dung giới hạn 1280px). Đã kiểm 320/375/768/1024/1280/1440/1920 và 640 (tương đương zoom 200%): không tràn ngang.
- Không bắt buộc bàn phím hay hover; nút ≥ 44px; layout cuộn được, tránh nested scroll trap.
- Âm thanh mở khóa sau thao tác người dùng (autoplay policy); trạng thái tắt âm lưu `localStorage` khi được.
- Modal: `role="dialog"`, tên truy cập, Esc, focus trap và khôi phục focus, khóa scroll nền, stack nhiều modal; recap focus vào tiêu đề. `focus-visible` rõ; chữ trong Recovery Code chọn được (không `user-select: none`).
- Lazy load và skeleton; không video lớn; fallback cho ảnh lỗi.

## 6. Chia sẻ

Draft (đang tắt) vẽ poster 1080×1350 bằng canvas; chia sẻ không bắt buộc cho gameplay, vote hay thưởng. Không giả mạo logo Riot/Acer. Không popup hay chuyển hướng từ iframe.

## 7. Cấu trúc component thực tế

`App.tsx` (`MainApp`, state tab và modal) với `GameProvider` (`context/GameContext.tsx`: React Context + reducer + `saveRef`). Views trong `src/views/`, modal trong `src/components/` (MatchCenterModal, GameRecap, PackOpeningModal, RecoveryModal, OnboardingModal, WorldDemoModal, LegacyDraftModal), `useDialog.ts` cho semantics. **Không có router URL** (không deep link, không cần SPA rewrite). Không thêm TanStack Query/Zustand/Zod.
