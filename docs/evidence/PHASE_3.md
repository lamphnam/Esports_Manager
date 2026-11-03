# Phase 3 — 03/11/2026

Thứ tự đã thực hiện: G0 → G1 → G2 → G4 → G3, sau gate Phase 1/2. Không đọc, port hoặc bundle engine.js/game.js/style.css của Golden Road. Đặc tả riêng: `docs/research/LEGACY_DRAFT_BEHAVIOR.md:1`.

## Thay đổi

- G0: `scripts/import-golden-road.ts:1`; `src/lib/legacyRatings.ts:1`; `src/data/ratingOverrides.ts:1`; JSON generated và checksum manifest. `src/data/currentCatalog.ts:1` giữ ID campaign, thay biography/traits thiếu nguồn bằng mô tả mô phỏng; ba edition 2026 gắn nhầm LEGACY đổi CHAMPION, không đổi id/stats. `cardCatalog.ts:1` merge theo identity. `economyEngine.ts:128` pack chỉ lấy CURRENT_EDITIONS, giữ pool/odds/pity hiện tại.
- G1: `src/data/legacyPool.ts:1`, `demoScenario.ts:1`, `WorldDemoModal.tsx:1`: T1/BLG 2024 từ dataset; ratings/teamOvr/synergy tính từ roster, 5–7 quyết định BO5, state cục bộ. Không import useGame. `scripts/e2e-demo.js:1` so sánh toàn localStorage trước/sau.
- G2: `legacyOpponents.ts:1`, `campaignData.ts:1`: roster Ch6–12 tất định, APAC cho LCP, các khu vực khác chỉ là đối thủ; nhãn knockout hư cấu + provenance. `economyEngine.ts:181`, `GameContext.tsx:113`, `TransfersView.tsx:20`: market theo ngày VN, giá theo rarity, expiry thực, không hồi offer đã mua trong ngày.
- G4: `verified2026.ts:1`: năm bản ghi TSW Pun/Hizto/Dire/Eddie/Bie, mỗi bản ghi có nguồn/confidence/retrievedAt; rating derived qua mapping chung. Nguồn chính thức xác nhận membership, Sheep xác nhận role. Không nhập dòng Low hoặc GAM mâu thuẫn. Cập nhật `research/LINKS_AND_FACT_CHECK.md:3`.
- G3: `src/lib/legacyDraft/engine.ts:1`, `reward.ts:1`, `share.ts:1`, `LegacyDraftModal.tsx:1`: draft 5 slot unique identity, 3 reroll, sáu bracket 8 đội, simulator chính và FOCUS_1 tự động sau ván đầu, thưởng 50 credits + Legacy đã draft, mỗi seed một lần/tối đa 2 seed/ngày, poster canvas mới 1080×1350. `featureFlags.ts:1`: real club names true, FEATURE_GOLDEN_ROAD false.

## Repro đỏ → xanh

```text
legacy.test.ts BEFORE: monotone mapping expected >=69 received68 at decimal boundary;
OVR expected90 received91 (rounding oscillation); LEGACY pack exclusion failed.
AFTER: mapping monotone, all 649 computed OVR equal baseOvr, 40k pack draws no LEGACY.
G1 BEFORE: ratings declared {89,90,91} vs computed {89,89,89} (failed).
AFTER: both rosters use computed ratings and real 2024 membership.
G2 BEFORE: market expiry undefined, expected1793725200000 (failed).
AFTER: deterministic daily offers and explicit expiry.
```

## Lệnh / output

```text
bun scripts/import-golden-road.ts
73 teams; 129 teamYears; 649 editions; 374 identities
COMMON81 / RARE365 / EPIC166 / LEGENDARY37
sourceSha256 43e63c0fe52262ab876292671a05ad51e59595432746f86e0c5b77816dfd9a7f
outputSha256 009f127fda99459e07f984f4519f1179e9be3a2a6f8cacc92bb7808f929a671f
bun run typecheck: exit0
bun run test: Test Files5 passed; Tests30 passed
bun run build: 1703 modules transformed; build success
bun scripts/balance-sim.ts:
DEC-5 Ch1..5 = 68.70/54.23/48.63/49.52/49.30%, all PASS
```

Playwright `e2e-demo.js` ở 390×844: `localStorageByteIdentical:true`, score mẫu `3-2 · 7/7 quyết định` (kết quả seeded mô phỏng, không ép theo lịch sử).
Playwright `e2e-draft.js`: `flag:false,mobileDraft:true,stages:6,rewardOnce:true,png:true,width:1080,height:1350`. Kiểm thử trực tiếp component, không bật flag nộp.
Property: 1000 seeds với cả 3 reroll đều đủ 5 unique players, không bế tắc. Circuit 6×7 matches, đúng 4/2/1 mỗi round. Thưởng trùng seed/ngày bị chặn và state survive serialize/restore.

Blocker: không chặn triển khai code. Chưa xác minh đủ GAM/VCS 2026, để ngoài dữ liệu mới. Q4/Q5/Q6 giữ mở, dùng mặc định. G3 giữ tắt vì toàn bộ gate R1/public HTTPS/portal chưa có bằng chứng; không tự bật theo QA component.

Chưa làm: ảnh/logo thật vì chưa có asset_license; không bổ sung thông tin 2026 chưa đủ nguồn; không tái hiện Swiss/double elimination; không bật G3 cho bản nộp. Deploy/iframe/release scan và manifest thuộc Phase 4. Chưa tối ưu chunk ~963KB raw (gzip ~153KB), sẽ đánh giá cùng build release. Dữ kiện từ reference có provenance medium, không nhận là roster hiện tại.
