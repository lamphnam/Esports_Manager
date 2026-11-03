# Phase 2 — 03/11/2026

Thực hiện mục 1–11 rồi 12–14. Chưa làm mục G.

## Thay đổi (file:dòng, điểm vào)

1. `src/context/GameContext.tsx:208`: từ chối equip instance đang ở slot khác; snapshot áp -3 cho secondary role.
2–3. `src/lib/tacticsMatrix.ts:193`: TRADE_MAP lấy trung bình cả hai mental, clamp tacticFit tại một wrapper [-5,5]. Matrix giữ nguyên.
4. `src/lib/simulator.ts:181`: synergy đối thủ ±8 và form từ eventRng. `src/data/campaignData.ts:1` chỉnh OVR đối thủ Ch1–5 thành 55/62/66/72/77; rosterPreview giảm cùng delta. `scripts/balance-sim.ts:21` kiểm tra DEC-5 và exit nonzero nếu ngoài dải.
5. `src/lib/economyEngine.ts:173`: training tier discount 10%; `TrainingView.tsx:17`, `GameContext.tsx:239` dùng cùng hàm. `FacilitiesView.tsx:7`: chỉ hiện Training tier1 và Strategy Lab với đúng +1/+2/+3 synergy; ẩn Scout Office chưa triển khai.
6–7. `src/lib/simulator.ts:447`: `simulateNextGame`, `seriesFinished`, `recommendTactics`, `summarizeSeries`; `MatchCenterModal.tsx:80`: từng ván, FOCUS_1, manualAll tùy chọn, log lệch bài/tactic/keyMoment/probability/MVP. `:164` scoreboard từ ván trước, không lộ kills trước LATE. Modal giới hạn chiều cao để thao tác trên mobile.
8. `PackOpeningModal.tsx:23`: ref timers + revealed guard; Skip hủy cả hai timer và không reveal/confetti lại.
9. `Navbar.tsx:50`: wordmark ẩn dưới sm, gap/min-width/touch controls phù hợp 390px.
10. `MatchCenterModal.tsx:148`, `CampaignView.tsx:160`, `HubView.tsx:72`: giao hữu không thưởng; dùng kết quả claim. Welcome không được mua miễn phí để farm. Audit nói Hub quảng cáo 10,000 nhưng không còn chuỗi đó; reward Ch12 10,000 có logic thật.
11. `simulator.ts:362`/`:492`: counterfactual cả series, sắp abs(diff) giảm dần, đúng dấu/tương đương khi 0, nhãn archetype Việt (`src/lib/labels.ts:1`), có hành động tiếp theo.
12. `cardCatalog.ts:668`, `PlayerCard.tsx:85`, `TrainingView.tsx:18`: OVR tính từ effective stats, bỏ Champion Pool khỏi menu train, chặn 99/level10, preview cap 99, hiển thị materials/tickets.
13. `saveState.ts:15`: hot ledger tối đa 500, archive giữ tổng tiền/material/ticket. `identity.ts:1`: UUID, ngày VN. `GameContext.tsx:610`: tài trợ 100 credits khi ví dưới 100, một lần/ngày; cờ ngày nằm trong save. Giao hữu/thử lại luôn miễn phí. Save một key/version và isLoading đã có từ Phase 1.
14. `src/App.tsx:68`, `index.html:2`: bỏ font-sans override, lang vi.

## Repro đỏ trước sửa

```text
bun run test src/lib/__tests__/audit.test.ts
6 failed: TRADE_MAP expected 4 received -1; tactic cap received 16;
opponent synergy expected 8 received 0; discount expected 90 received 100;
counterfactual largest gap expected 5 received 1; OVR expected 62 received 64.
P1-6 incremental API test: expected true received false.
Playwright e2e-state: Karsa unique=false, Slayder unique=false;
stat cap=false, zero credits recovery=false, IDs unique under same timestamp=false.
Playwright live/layout: headerWidth=428, viewport=390, liveScore="1 - 0",
font=system sans, lang=en, simulateNextGame=undefined.
Playwright e2e-skip: Error P1-8 Skip rewound to BLOOM after 800ms.
Playwright replay: Error P1-10 cleared Chapter 1 still advertises first-clear reward.
bun run test recovery.test.ts -t P1-13: ledger length 600 <= 500 failed.
```

## Xanh / lệnh cuối

```text
bun run typecheck: $ tsc --noEmit (exit 0)
bun run test: Test Files 3 passed (3); Tests 19 passed (19)
bun run build: 1689 modules transformed; built in 329ms
bun scripts/balance-sim.ts (4000 seeds/cell):
Ch1: 68.70% target 65-72% PASS
Ch2: 54.23% target 50-60% PASS
Ch3: 48.63% target 45-55% PASS
Ch4: 49.52% target 45-55% PASS
Ch5: 49.30% target 45-55% PASS
Playwright e2e-state: unique Karsa/Slayder, claim once, no free Welcome,
stat cap, 0 credits recovery and unique IDs all true.
Playwright e2e-series: firstGameScore="0 - 0", focusPolicy=true,
automaticTactics=6, nextGameStarts=true.
Playwright e2e-skip: skipStableAfter3000ms=true.
Playwright e2e-layout: header=384, client=384, viewport=390,
font="Be Vietnam Pro", lang=vi, controls within [276,368].
Playwright e2e-f0: 6 cards, 1000 credits, completed=[1], equip/reload/recovery=true, pageErrors=[]
Playwright e2e-storage: blocked storage/clipboard fallback all true.
```

Blocker: không. DEC-5 dùng mặc định Q4, không đổi đề xuất thành đã chốt.

Chưa làm: G0–G4, release scan UI/biography, QA iframe và deploy thật thuộc phase sau. Chưa có domain/portal origin nên deploy thật cần cấu hình chủ dự án. Không thay odds/pity/matrix. `rulesVersion` tăng v1.1.0 do balance/perk. Thư mục untracked `docs/ref/golden_road/.claude/` không do agent tạo, không stage.
