# 05 — Match Simulator Specification

**Cập nhật triển khai 03/11/2026 — Architecture B:** engine đang chạy là TypeScript thuần trong `src/lib/simulator.ts`, dùng `src/lib/seededRng.ts`; `GameContext` lưu snapshot vào localStorage. Các hợp đồng Java/API/server ở dưới là tham chiếu Architecture A, chưa được triển khai. Bằng chứng và giới hạn nghiệm thu: [Phase 4](evidence/PHASE_4.md).

## 1. Goals
Match is **3 decisions that have consequence**, not a 3D MOBA. A good lineup can lose occasionally, but better lineup/tactics should show positive win-rate across 10k fixed seeds. UI renders event log produced by engine, not disconnected storytelling.

## 2. Source of truth
Architecture B dùng một engine TypeScript thuần cho career và demo, tách khỏi React. Kết quả từng ván được tính từ snapshot/seed/decisions trước khi phát replay; reducer xử lý thưởng career một lần. Đây là save phía client, không có xác thực kết quả hoặc chống sửa save từ server. Nếu chuyển sang A, engine và quyền quyết định thưởng phải chuyển về Java module `domain/simulation`; không duy trì hai bộ luật khác nhau trong UI và backend.

Inputs are immutable snapshots: `matchId`, `rulesVersion`, `engineVersion`, `seed`, `teamASnapshot`/`teamBSnapshot`, `seriesFormat`, `draftRules`, `strategy`, `decisionPath`, `matchContext`.
Outputs: `MatchResult`, `GameResults`, `phaseStates`, `events`, `scoreBreakdown`, `rewardEligibility`, `snapshotHash`.

## 3. Match ratings
Given player stats 0–100, role accuracy, trainings and temporary form, compute weighted team base attributes (use config for weights). E.g. `LANE=0.6*MECHANICS+0.25*MENTAL+0.15*MACRO`, `MACRO=0.6*MACRO+0.25*TEAMWORK+0.15*MENTAL`, `TEAMFIGHT=0.4*MECHANICS+0.4*TEAMWORK+0.2*MENTAL`.

Trong build B hiện tại, phía người chơi dùng `P_phase = weighted(attributes) + synergyCap[-8,8] + tacticFit[-5,5] + decisionFit[-6,6] + form[-2,2]`; phía đối thủ dùng attributes + synergy + form, còn archetype thực tế quyết định `decisionFit` của người chơi. Không mô tả đối thủ như có một bộ lựa chọn thủ công tương đương. `P_diff = P_A - P_B`; xác suất pha dùng sigmoid và clamp [0.08,0.92]. Không dùng `displayedOVR` trực tiếp để quyết định thắng.

**Sub-seed theo pha (v2.2, bắt buộc):** mỗi lần lấy ngẫu nhiên dùng PRNG khởi tạo từ `hash(seed, gameIndex, phase, eventSlot)`, **không** dùng một luồng random chung tiêu thụ tuần tự. Quyết định của người chơi chỉ đổi **xác suất**, không làm lệch các giá trị random của pha sau. Nhờ vậy phần giải thích "nếu chọn X thay vì Y thì khác bao nhiêu" (counterfactual) là trung thực: engine chạy lại cùng random với quyết định khác và so sánh `P_phase`. Golden test: đổi 1 quyết định ở pha EARLY không làm đổi random draw của MID/LATE.

**Probabilistic but deterministic under seed:** after every player decision, use seeded PRNG to determine phase swing/outcome. RNG sampled once per defined event, tracked by index in log. Engine must not call `Math.random()` or Java default global random unpredictably.

### Phase example
1. Early: `GANK_TOP`, `PLAY_MID`, `SAFE_FARM`. Effect tied to jungle/mid/top mechanics and opponent composition.
2. Mid: `CONTEST_OBJECTIVE`, `SPLIT_PUSH`, `TRADE_MAP`. Macro/objective and vision synergy matter.
3. Late: `FORCE_TEAMFIGHT`, `PROTECT_CARRY`, `PICK_OFF`. Teamwork/champion pool/mental matter.

Opponent AI is a strategy policy based on its archetype **and current observable state**, not omniscient about hidden player decisions. Tactics each have counters but don't form hard rock-paper-scissors that invalidates stats. Phase state tracks gold/control/momentum in bounded ranges; event log describes derived state (no false claims).

## 3b. Quyết định và thông tin
Xem `13_MATCH_DECISION_SPEC.md` (ma trận tactic × archetype, thông tin hiển thị, số quyết định theo thể thức). Tài liệu này là nguồn sự thật cho `decisionFit`.

## 4. BO series / Fearless-lite
- BO1 first win; BO3 first 2 wins; BO5 first 3 wins.
- Each game snapshot picks phase decision policy; allow human intervention or auto/skip.
- Career và `demoScenario` đều có `GAME_RECAP` sau **mọi ván BO3/BO5**, kể cả ván kết thúc chuỗi: thắng/thua ván, kills, thời lượng, MVP, tỷ số chuỗi và logs EARLY/MID/LATE. Không có timer tự chuyển khỏi recap.
- Chỉ khi bấm **Ván Tiếp Theo** mới mở lựa chọn ván kế; ván đầu có 3 quyết định, từ ván 2 dùng `FOCUS_1` theo `13` §4. Ở ván cuối, **Xem Tổng Kết Chuỗi** mới mở tổng kết/thưởng. BO1 giữ luồng kết quả F0 trực tiếp.
- `Watch/Fast/Skip` chỉ đổi cách phát replay, đều dừng ở cùng recap. Scoreboard đang xem chỉ đếm các ván đã kết thúc, không tiết lộ trước kết quả ván hiện tại.
- Real LoL Fearless Draft involves champion picks/bans across series. **MVP does NOT need full champion IP/ban-pick model**; `fearlessLite` is an explicitly fictional simplification: after each game, repeat-use of a `tacticTag` incurs a small penalty for narrow champion pools, while flexible rosters adapt. Label in UI as simulator adaptation, not official Fearless rules.
- Future full champion draft is feature flagged; requires separate rights evaluation and larger champion data catalog.

`fearlessLite`/penalty lặp `tacticTag` ở trên là thiết kế tương lai, chưa có trong build B. Không quảng bá `CHAMPION_POOL` hoặc huấn luyện chỉ số này như một lợi thế Fearless đang hoạt động.

## 5. AI outcomes and UX
Build B lưu `activeMatch` với snapshot, seed, selections, kết quả/replay và trạng thái `GAME_RECAP` trước khi khôi phục UI. Reload giữa trận hoặc ở recap career phải giữ nguyên ván/kết quả, không sinh seed mới hay trao thưởng lại. `Watch/Fast/Skip` cùng kết quả. Event text bắt nguồn từ state; hiển thị off-script và key moment. Tổng kết so sánh roster, synergy, tactic, decisions và gợi ý hành động; counterfactual xét mọi ván, ưu tiên độ chênh tuyệt đối lớn nhất, mô tả đúng dấu và trường hợp tương đương. Không hạ thấp cá nhân tuyển thủ.

`demoScenario` dùng state riêng trong component, không ghi career/localStorage; vì vậy không có cam kết khôi phục demo qua reload. Test phải so sánh toàn bộ localStorage trước/sau demo.

## 6. API state machine / idempotency

**State UI hiện tại (B):** `PREVIEW → PLAYING → GAME_RECAP → PREVIEW` nếu chuỗi chưa kết thúc; `GAME_RECAP → RESOLVED` khi người chơi xác nhận tổng kết ván cuối. BO1 đi từ `PLAYING → RESOLVED`. Chỉ mô phỏng ván kế khi người chơi xác nhận lựa chọn; recap không tự chạy ván mới. Pending pack reveal được lưu cùng save để reload hiện lại đúng thẻ. State API bên dưới chỉ áp dụng khi triển khai A.
`CREATED → AWAITING_DECISION → READY_TO_RESOLVE → RESOLVED → REWARDED` (or `CANCELLED/EXPIRED`). POST decision checks seqNo and expected phase, saves a unique action, returns next state; duplicate idempotency key returns original response; cannot mutate decision after resolution. `rewardClaim` awarded once transactionally and writes ledger. Connection loss → reload match state and re-render replay, not create new match.

For responsiveness can calculate all events at the end; active choice screen follows same phase-by-phase persisted deterministic advancement. `Skip` should auto-submit default tactic choice *only on explicit click* and must disclose it, or skip visuals after all decisions locked; never secretly grant victory.

## 7. Data / code organization

Hiện tại B: `simulator.ts` chứa `simulateNextGame`, `seriesFinished`, `summarizeSeries`, `recommendTactics`; `seededRng.ts` quản lý sub-seed; `saveState.ts`/`GameContext.tsx` lưu trạng thái; `GameRecap.tsx` chỉ render kết quả. Danh sách Java sau đây là thiết kế A tham khảo.
- `SimulationConfig` immutable loaded from versioned JSON.
- `MatchSnapshot` immutable role-edition-level-stats with hash.
- `SeededRng` with stable cross-JVM outcomes + golden test vectors.
- `SimulationEngine.simulateGame(snapshot, decisions, seed)` pure, no database calls.
- `SeriesEngine.simulateSeries` deterministic;
- `MatchApplicationService` transaction orchestration, persistence, authorization.
- `StoryEventRenderer` maps event codes to localized text; no game rules in the renderer.

## 8. Balance test suite
- same input/seed → same output/hash over >=1,000 runs.
- 10,000 seeds, +10 team power → materially >50% win (target initial 60–75%, calibrate).
- same OVR different fit and traits → meaningful measurable differences.
- decisions matter (optimal vs random performance delta >=5 percentage points in benchmark, target only).
- lower OVR can win occasionally, but no >50% from broken RNG.
- BO3/BO5 terminates at correct wins, no negative rating, no impossible phase state, no nonfinite scores.
- replay/video speed never changes outcome; reward one time under concurrency tests.
- cùng seed/snapshot/decisions cho cùng kết quả; QA browser thực tế vẫn cần chạy riêng. B chưa có server authority.

**Kết quả local 03/11:** invariant/termination và DEC-5 campaign xanh; regression recap kiểm tra chờ 15 giây, reload và explicit Next. Benchmark prototype rộng hơn còn mở: +10 power thắng 76.09% (mục tiêu 60–75%), adaptive–random chênh 3.51 điểm % (mục tiêu ≥5). Không coi các mục tiêu này đã đạt; xem [Phase 4 §5](evidence/PHASE_4.md#5-blocker-giới-hạn-và-phần-không-làm).

## 9. Performance budget
One simulated BO5 should resolve on CPU in <200ms at p95 in local benchmark for typical snapshots (prototype target, adjust measured baseline). Event logs capped (<=100 game events) and compressed/minimal if required; DB queries not inside phase loop.
