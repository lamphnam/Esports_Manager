# 07 — Frontend UX, UI Flow, Animation and Art

## 1. Visual direction
Professional esports dashboard **with collectible card excitement**, hướng Crisp Industrial: Slate, Cobalt, Amber và Crimson; typography tương phản rõ và hỗ trợ tiếng Việt. Khung thẻ/ảnh hình học tự tạo; không sao chép giao diện tham chiếu. Không dùng màu tím/indigo/violet hoặc emoji trong UI. User selects **MOBA manager**, not an isometric live MOBA.

### Palette (initial tokens, configurable)
`bg #090D16`, `panel #111827`, `panel2 #1E293B`, `primary #2563EB`, `accent #FFB800`, `danger #E11D48`; chữ Slate sáng trên nền tối. Common: Slate; Rare: Cobalt; Epic: Crimson; Legendary: Amber. Rarity luôn có nhãn chữ.

## 2. Navigation IA
- First-time: Loading → Create Club → Starter Roster Reveal → Tutorial Match → Welcome Pack → One-click Equip → Second Match → Hub.
- Returning: Loading save → khôi phục active match/pending reveal nếu có → Hub; Campaign, Team/Lineup, Collection, Packs, Training, NPC Transfer, Facilities, Settings. History/Hall of Fame đầy đủ là P2, không phải màn đã nghiệm thu.
- Match BO3/BO5: Opponent Preview → decisions → replay từng ván → **Game Recap** → bấm **Ván Tiếp Theo** → lựa chọn `FOCUS_1`; ở ván cuối bấm **Xem Tổng Kết Chuỗi** → rewards → Hub. BO1 đi thẳng đến tổng kết trận.
- Contextual tooltips and progressive reveal of features in Chapter 1–5.

## 3. Screen definitions
| Screen | Essentials | Empty/error/loading states |
|---|---|---|
|Hub|career stage, upcoming match, team rating, currency, pack count, quick rewards|loading save; lỗi storage và hướng dẫn Recovery Code|
|Campaign Map|3 Act timeline, current split, locked/eligible/failed nodes, opponent preview, qualification explanation|no phantom unlocked stages|
|Lineup|five role slots + bench, effective stats, synergy breakdown, auto-compare|invalid roster highlighted|
|Collection|responsive player-card grid, filter role/year/rarity, card details and edition history|0 cards allowed only dev|
|Pack Room|odds view, pack count, persisted reveal, Skip animation|khôi phục cùng pending reveal, không rút lại thẻ|
|Training|cost preview, before/after stats, clear confirmation|disabled insufficient funds|
|Market|6 NPC offers, expiry theo ngày Việt Nam và seed đã lưu|đổi ngày tạo bảng mới; offer đã mua không mua lại|
|Match Center|scoreboard, game number, timeline, phase choices, report and speed controls|restore career match/recap after reload|
|Game Recap|thắng/thua ván, kills, thời lượng, MVP, tỷ số chuỗi, logs 3 pha, nút Next|không tự chuyển; focus vào tiêu đề kết quả|
|Season Recap (planned)|rank, titles, card of MVP, upcoming split, upgrade suggestions|0 trophies valid|
|Hall of Fame (P2)|medal timeline, signature roster, rival history, share summary|new club empty state|

## 4. Player card anatomy
Role badge, edition year and code, nickname/full display per rights, OVR, rarity, license-cleared portrait, playstyle and 3 prominent stat bars; hover/tap expand 5 stats. Must show rarity and season in text/color-independently. Use responsive CSS grid; avoid scroll lock on mobile.

**Source asset rules**: use placeholder geometrical avatars/abstract portraits in dev. Real player pictures/real names only where user-supplied license scope covers use; do not download third-party photos from search and assume license. Team logos/skins/League champion splash art require separate rights.

## 5. Pack opening (design beat)
1. Confirm press (not forced accidental purchase); UI displays disclosed rates.
2. Build B commit thẻ/kho pack/pity/ledger/pending reveal trong một save trước khi phát animation. Hợp đồng API retry-safe thuộc Architecture A tùy chọn.
3. 0.8s silhouette → rarity color bloom → 1.5s card reveal → comparison panel; reduced-motion skips animation entirely.
4. CTA `Thêm vào đội hình` (role eligible) and `Đóng`; no hidden additional draws from UI.
5. Reopened same pack displays previously minted card rather than drawing again.

## 6. Match watch experience
Mỗi ván có 3 pha; ván đầu chọn cả 3, ván sau mặc định `FOCUS_1` với hai gợi ý tự động hiển thị rõ. `Watch/Fast/Skip` cùng một kết quả, không chạy tiếp qua màn kết quả ván.

BO3/BO5 dừng tại `GAME_RECAP` cho người chơi đọc thắng/thua, tỷ số chuỗi và logs cả 3 pha; không có thời gian chờ tối đa hay tự động Next. Bấm **Ván Tiếp Theo** mới mở chiến thuật ván kế; bấm **Xem Tổng Kết Chuỗi** sau ván cuối mới tới tổng kết/thưởng. Career reload trở lại đúng recap. Demo có cùng điểm dừng nhưng state riêng, không ghi save career. Khi replay chưa hết, scoreboard chỉ tính các ván đã hoàn tất và không hiện sớm kills/kết quả cuối.

## 7. Responsive + iframe
- Primary targets desktop 1440×900 and mobile 390×844; test iframe sizes 1024×720, 768×600, 360×640.
- No mandatory keyboard or hover; buttons >=44px touch targets; scrollable layout (avoid nested scroll traps).
- Browser autoplay restrictions: unlock sounds after explicit user gesture; volume and mute stored locally when possible.
- `prefers-reduced-motion`, accessible text, keyboard focus, ARIA labels, contrast, icon+text status.
- Modal có `role=dialog`, tên truy cập, Esc, focus trap/restore và khóa scroll nền; recap focus tiêu đề. Reduced motion bỏ reveal động/confetti. SVG role tự vẽ thay emoji.
- Loading asset skeletons; route lazy loading; no large video downloads; avoid remote image failures via fallbacks and cached optimized WebP/AVIF.

## 8. Sharing
Generate **image of season recap / roster / championship** via canvas if desired but do not require sharing for gameplay, vote, rewards. Never impersonate official League/Acer logos unless permissions established. Avoid external popup/redirects from embedded iframe.

## 9. Component tree sketch
`AppShell` → `AuthBootstrap` → `CareerStateProvider` → `Router` → `ClubHub` / `CampaignMap` / `SquadBuilder` / `CollectionGrid` / `PackOpeningDialog` / `MatchViewer` / `FacilityView` / `SeasonRecap`.

**Build B hiện tại:** React Context + reducer, saveRef đồng bộ và một snapshot localStorage; validation trong `saveState.ts`, không thêm TanStack Query/Zustand/Zod. Component tree ở trên là phác thảo thiết kế, tên component thật xem `src/App.tsx`/`src/components/`. Nếu triển khai A sau này, API/cache phải theo nguồn sự thật backend; không sao chép wallet server sang nhiều store có thể ghi.
