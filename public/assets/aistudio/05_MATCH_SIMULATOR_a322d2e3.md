# 05 — Match Simulator Specification (server-authoritative)

## 1. Goals
Match is **3 decisions that have consequence**, not a 3D MOBA. A good lineup can lose occasionally, but better lineup/tactics should show positive win-rate across 10k fixed seeds. UI renders event log produced by engine, not disconnected storytelling.

## 2. Source of truth
Primary deterministic simulator implemented in **Java module `domain/simulation`**, with `EngineVersion` and canonical seeded PRNG. Client renders events and submits decisions; no same-game second rules implementation in React. For prototype only, client mock fixtures may be used but **no rewards** until backend validates.

Inputs are immutable snapshots: `matchId`, `rulesVersion`, `engineVersion`, `seed`, `teamASnapshot`/`teamBSnapshot`, `seriesFormat`, `draftRules`, `strategy`, `decisionPath`, `matchContext`.
Outputs: `MatchResult`, `GameResults`, `phaseStates`, `events`, `scoreBreakdown`, `rewardEligibility`, `snapshotHash`.

## 3. Match ratings
Given player stats 0–100, role accuracy, trainings and temporary form, compute weighted team base attributes (use config for weights). E.g. `LANE=0.6*MECHANICS+0.25*MENTAL+0.15*MACRO`, `MACRO=0.6*MACRO+0.25*TEAMWORK+0.15*MENTAL`, `TEAMFIGHT=0.4*MECHANICS+0.4*TEAMWORK+0.2*MENTAL`.

`P_phase = weighted(teamA attributes) + synergyCap[-8,8] + tacticFit[-5,5] + decisionFit[-6,6] + form[-2,2]`, same for B. `P_diff = P_A - P_B`. Stage chances `sigmoid(P_diff / scale)` with clamp e.g. [0.08,0.92]; tune scale from 10k simulations. Do not use `displayedOVR` directly as wins.

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
- Real LoL Fearless Draft involves champion picks/bans across series. **MVP does NOT need full champion IP/ban-pick model**; `fearlessLite` is an explicitly fictional simplification: after each game, repeat-use of a `tacticTag` incurs a small penalty for narrow champion pools, while flexible rosters adapt. Label in UI as simulator adaptation, not official Fearless rules.
- Future full champion draft is feature flagged; requires separate rights evaluation and larger champion data catalog.

## 5. AI outcomes and UX
Server persists canonical result **before** UI plays animation; `Watch/Fast/Skip` all show same matchId outcome. Event text templates from state; key events show turning points + reasons. After defeat, show comparative breakdown in four contributions: roster, synergy, tactic, decisions and one actionable suggestion. No player identity derogation.

## 6. API state machine / idempotency
`CREATED → AWAITING_DECISION → READY_TO_RESOLVE → RESOLVED → REWARDED` (or `CANCELLED/EXPIRED`). POST decision checks seqNo and expected phase, saves a unique action, returns next state; duplicate idempotency key returns original response; cannot mutate decision after resolution. `rewardClaim` awarded once transactionally and writes ledger. Connection loss → reload match state and re-render replay, not create new match.

For responsiveness can calculate all events at the end; active choice screen follows same phase-by-phase persisted deterministic advancement. `Skip` should auto-submit default tactic choice *only on explicit click* and must disclose it, or skip visuals after all decisions locked; never secretly grant victory.

## 7. Data / code organization
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
- fairness across device/browser because outcome server side.

## 9. Performance budget
One simulated BO5 should resolve on CPU in <200ms at p95 in local benchmark for typical snapshots (prototype target, adjust measured baseline). Event logs capped (<=100 game events) and compressed/minimal if required; DB queries not inside phase loop.
