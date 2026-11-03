# Match Simulator — engine, quyết định, recap

Cập nhật 03/11/2026. Mô tả engine TypeScript thuần trong `src/lib/simulator.ts` (dùng `seededRng.ts`, `tacticsMatrix.ts`), dùng chung cho career, demo và Draft. Không có server authority: client tự tính kết quả và lưu save ([ARCHITECTURE.md](ARCHITECTURE.md)). Phần chưa làm ghi **[Đích]**.

## 1. Mục tiêu

Trận là **3 quyết định có hậu quả**, không phải MOBA 3D. Đội hình/tactic tốt hơn phải thắng nhiều hơn trên 10k seed cố định, nhưng đội yếu vẫn thỉnh thoảng thắng. UI chỉ render event log do engine sinh, không kể chuyện rời rạc.

Đầu vào bất biến: snapshot hai đội (role, edition, level, effective stats), `seed`, `seriesFormat`, lựa chọn tactic. Đầu ra: `SimulationResult` gồm kết quả từng ván, 3 pha (events, `winProbability`, `goldDelta`, `keyMoment`), MVP, `breakdown`, `counterfactual`, `coachingAdvice`.

## 2. Hàm chính

`simulateGame`, `simulateSeries`, `simulateNextGame` (từng ván, dùng cho BO3/BO5), `seriesFinished`, `recommendTactics` (gợi ý tự động theo archetype), `summarizeSeries`, `computeCounterfactuals`; `getPhaseRng`/`computeSubSeed`/`murmurHash3` trong `seededRng.ts`; `DECISION_FIT_MATRIX`, `getDecisionFit`, `getTacticRosterFit` trong `tacticsMatrix.ts`.

## 3. Công thức

Mỗi đội có ba thuộc tính trung bình trên 5 thành viên (làm tròn):

```
LANE      = 0.60*mechanics + 0.25*mental   + 0.15*macro
MACRO     = 0.60*macro     + 0.25*teamwork + 0.15*mental
TEAMFIGHT = 0.40*mechanics + 0.40*teamwork + 0.20*mental
```

Người chơi: `P_phase = weighted(attributes) + synergy[-8,8] + tacticFit[-5,5] + decisionFit[-6,6] + form[-2,2]`. Đối thủ: attributes + synergy + form; **archetype thực tế** của đối thủ ở pha đó quyết định `decisionFit` của người chơi. Không mô tả đối thủ như có bộ lựa chọn thủ công tương đương.

`P_diff = P_A - P_B`; xác suất thắng pha `sigmoid(diff, scale 18)` kẹp trong `[0.08, 0.92]`. Không dùng OVR hiển thị trực tiếp để quyết định thắng.

**Sub-seed theo pha (bắt buộc):** mỗi lần rút ngẫu nhiên dùng PRNG khởi tạo từ `hash(seed, gameIndex, phase, eventSlot)`, không dùng một luồng random dùng chung. Quyết định của người chơi chỉ đổi **xác suất**, không làm lệch random của pha sau. Nhờ đó giải thích counterfactual là trung thực: chạy lại cùng random với quyết định khác và so sánh `P_phase`. Golden test: đổi quyết định EARLY không đổi random draw của MID/LATE. Cấm `Math.random()` trong `src/lib/` (release-audit kiểm).

## 4. Pha và tactic

| Pha | Tactic |
|---|---|
| EARLY | `GANK_TOP`, `PLAY_MID`, `SAFE_FARM` |
| MID | `CONTEST_OBJECTIVE`, `SPLIT_PUSH`, `TRADE_MAP` |
| LATE | `FORCE_TEAMFIGHT`, `PROTECT_CARRY`, `PICK_OFF` |

`tacticFit` (±5) phụ thuộc đội hình (ví dụ `GANK_TOP` cần Jungle/Top có mechanics cao; `TRADE_MAP` lấy trung bình mental hai người, clamp ở một chỗ) nên đáp án tối ưu = f(đối thủ, đội hình), không học thuộc được. Phase state (gold/control/momentum) nằm trong khoảng giới hạn; event log mô tả state đã suy ra, không khẳng định sai.

## 5. Đối thủ và thông tin cho người chơi

- **Archetype chính** hiển thị bằng nhãn tiếng Việt + 1 câu mô tả (`EARLY_AGGRO`, `OBJECTIVE_CONTROL`, `LATE_SCALING`, `SPLIT_PRESSURE`, `BALANCED`) cùng 3 thanh Early/Mid/Late so với đội mình. Không có thông tin nào bị giấu mà không có dấu hiệu.
- **Off-script:** mỗi pha, với xác suất `sim.offScriptChance` = 0.2 (rút bằng sub-seed), đối thủ chơi lệch archetype. Event log tiết lộ hành vi thật để người chơi đọc và điều chỉnh pha sau.
- **[Đích]** Scout Office hiện "độ tin cậy" nhãn; Rival Zero đổi archetype sau khi xem lineup.

## 6. Ma trận `decisionFit` (điểm, cap ±6/pha)

Giá trị cộng vào `P_phase` của người chơi theo archetype **thực tế** của đối thủ ở pha đó. Nguồn máy đọc: `docs/config/tactics.matrix.json` (phải luôn khớp bảng này; test so khớp).

### EARLY
| Tactic | EARLY_AGGRO | OBJECTIVE_CONTROL | LATE_SCALING | SPLIT_PRESSURE | BALANCED |
|---|---|---|---|---|---|
| `GANK_TOP` | -2 | +0 | +4 | +2 | +0 |
| `PLAY_MID` | +0 | +4 | +2 | -2 | +1 |
| `SAFE_FARM` | +4 | -2 | -2 | +2 | +1 |

### MID
| Tactic | EARLY_AGGRO | OBJECTIVE_CONTROL | LATE_SCALING | SPLIT_PRESSURE | BALANCED |
|---|---|---|---|---|---|
| `CONTEST_OBJECTIVE` | +2 | -2 | +0 | +4 | +1 |
| `SPLIT_PUSH` | -2 | +4 | +2 | -2 | +0 |
| `TRADE_MAP` | +0 | +0 | +4 | +2 | +1 |

### LATE
| Tactic | EARLY_AGGRO | OBJECTIVE_CONTROL | LATE_SCALING | SPLIT_PRESSURE | BALANCED |
|---|---|---|---|---|---|
| `FORCE_TEAMFIGHT` | +2 | +0 | -2 | +4 | +1 |
| `PROTECT_CARRY` | +2 | -2 | +4 | +0 | +1 |
| `PICK_OFF` | -2 | +4 | +0 | +2 | +0 |

Ràng buộc đã kiểm tra tự động và phải được giữ trong CI:
1. Không tactic nào thống trị tactic khác trong cùng pha (luôn có archetype mà tactic kém hơn).
2. Mỗi tactic là lựa chọn **tốt nhất** với ít nhất một archetype.
3. Trung bình các tactic trong cùng pha chênh nhau ≤ 1.5 điểm (không có lựa chọn "mặc định tốt").
4. Mọi giá trị trong [-6, 6].

## 7. Số quyết định theo thể thức

| Thể thức | Policy | Số quyết định tối đa |
|---|---|---|
| BO1 | `MANUAL_ALL_3` | 3 |
| BO3 | `GAME1_ALL_3_THEN_FOCUS_1` | 3 + 1 + 1 = 5 |
| BO5 | `GAME1_ALL_3_THEN_FOCUS_1` | 3 + 4 = 7 |

- `FOCUS_1` (từ ván 2): người chơi chọn **một pha cần can thiệp** và tactic cho pha đó; hai pha còn lại dùng gợi ý tự động theo archetype đối thủ và **được hiển thị rõ**. Đổi pha focus hoặc tắt `manualAll` đưa các pha tự động về gợi ý, không giữ lựa chọn thủ công ẩn.
- Công tắc "Chơi thủ công cả 3 pha" (`manualAllOptional`) có trong career.
- BO1 first-to-1, BO3 first-to-2, BO5 first-to-3.

## 8. Luồng ván và recap (`GAME_RECAP`) [Đã có]

Theo yêu cầu của chủ dự án: BO3/BO5, cả **career và demo**, dừng ở **kết quả từng ván** (kể cả ván cuối).

- State career: `PREVIEW → PLAYING → GAME_RECAP → PREVIEW` nếu chuỗi chưa xong; `GAME_RECAP → RESOLVED` khi xác nhận tổng kết ván cuối. BO1: `PLAYING → RESOLVED`.
- Recap hiển thị: thắng/thua ván, tỷ số chuỗi, kills, thời lượng, MVP, logs EARLY/MID/LATE. **Không có timer tự chuyển** (test chờ 15 giây vẫn đứng yên).
- Chỉ khi bấm **Ván Tiếp Theo** mới mở lựa chọn `FOCUS_1` cho ván kế (chưa mô phỏng ván đó trước khi xác nhận). Ở ván cuối, **Xem Tổng Kết Chuỗi** mới mở tổng kết và thưởng.
- `Watch / Fast / Skip` chỉ đổi cách phát replay của ván **đã tính**, đều dừng ở cùng recap; `Skip` chỉ chọn mặc định khi bấm rõ ràng và có hiển thị, không bao giờ âm thầm cho thắng. Scoreboard đang xem chỉ đếm ván đã kết thúc, không lộ kills hay kết quả ván hiện tại.
- Career lưu `activeMatch` (snapshot, seed, selections, result/replay, `matchState`) trong save; reload giữa trận hoặc ở recap giữ nguyên ván/kết quả, không sinh seed mới, không trao thưởng lại. Demo dùng state riêng trong component, không ghi `localStorage`, nên không hứa khôi phục demo qua reload.

## 9. Giải thích sau trận (counterfactual)

Engine tính lại `P_phase` với quyết định thay thế và nói ví dụ: "Pha MID: bạn chọn `SPLIT_PUSH` (−2) so với `CONTEST_OBJECTIVE` (+4) vì đối thủ là `SPLIT_PRESSURE`", kèm một gợi ý hành động. Xét mọi ván, ưu tiên alternative có độ chênh tuyệt đối lớn nhất, hiển thị đúng dấu và nói "tương đương" khi bằng 0. Không tuyên bố kết quả "sẽ" đổi, chỉ nói xác suất đổi bao nhiêu. Archetype và tactic có nhãn tiếng Việt (`labels.ts`), không in identifier thô.

## 10. Fearless-lite [Đích]

Không có trong build. Ý tưởng: sau mỗi ván, lặp lại `tacticTag` bị phạt nhỏ với đội có champion pool hẹp. Phải gắn nhãn là giản lược của game, không phải luật Fearless chính thức. Vì vậy **không quảng bá** `CHAMPION_POOL` hay huấn luyện chỉ số này như lợi thế đang hoạt động. Draft tướng đầy đủ cần đánh giá quyền riêng và catalog tướng lớn.

## 11. Kiểm thử và kết quả (03/11, local)

Test tự động (`src/lib/__tests__/`): ma trận (4 ràng buộc + khớp JSON); sub-seed golden; determinism ≥ 1000 lần; pity 100k lần mở; xác suất luôn trong `[0.08, 0.92]`, không NaN, 5000 ván mỗi thể thức; BO terminate đúng; regression recap/reload. Chạy: `bun run test`, `bun scripts/balance-sim.ts`, `bun scripts/simulator-bench.ts`.

| Kiểm tra | Mục tiêu | Kết quả |
|---|---|---|
| DEC-5 campaign, 4000 seed/ô: Ch1 BO1 / Ch2–4 BO3 / Ch5 BO5, đội mặc định | 65–72 / 50–60 / 45–55 / 45–55 / 45–55 % | 68.70 / 54.23 / 48.63 / 49.52 / 49.30 % — **đạt** |
| +10 team power (10k seed) | 60–75% | 76.09% — **chưa đạt** (ngoài dải) |
| Chọn thích nghi vs ngẫu nhiên/cố định | chênh ≥ 5 điểm % | 55.27% vs 51.76% (gap 3.51) — **chưa đạt** |
| BO5 p95 | < 200 ms | ~0.09 ms — đạt |

Độ khó Ch6–12 được đo riêng bằng `scripts/progression-sim.ts` ([ECONOMY.md](ECONOMY.md) §8). Log trận có màu: dòng có lợi cho người chơi xanh, bất lợi đỏ; dòng chốt pha LATE luôn theo người thắng ván (`PhaseLog.tsx`). Không đổi ma trận hay odds để ép số; hai mục chưa đạt cần cân bằng/playtest tiếp theo (xem [PROJECT_STATUS.md](PROJECT_STATUS.md)). Mỗi pha có tối đa 15 sự kiện (giới hạn do `validateSave` áp khi nhập save).
