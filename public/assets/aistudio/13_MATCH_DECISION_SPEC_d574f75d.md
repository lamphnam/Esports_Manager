# 13 — Match Decision Spec (v2.2)

Mục tiêu: để "Smart team beats pure OVR" thành sự thật có thể kiểm chứng. Người chơi phải có **thông tin để suy luận**, nhưng không có đáp án luôn đúng.

## 1. Người chơi biết gì (Opponent Preview)
- **Archetype chính** của đối thủ (1 trong: EARLY_AGGRO, OBJECTIVE_CONTROL, LATE_SCALING, SPLIT_PRESSURE, BALANCED) hiển thị dưới dạng nhãn + 1 câu mô tả (ví dụ "Hay lấy lợi thế sớm, yếu dần về cuối").
- **Chỉ số tóm tắt** 3 thanh (Early / Mid / Late) so với đội mình.
- **Scout Office (nếu mở):** hiện thêm "độ tin cậy" của nhãn; chưa mở thì nhãn có thể đúng ~80%.
- **Rival Zero** (boss thích nghi): archetype đổi sau khi xem lineup của người chơi; UI nói rõ "đang thích nghi".
- Không thông tin nào được giấu mà không có dấu hiệu cho người chơi.

## 2. Đối thủ không đoán trước hoàn toàn
Mỗi pha, với xác suất `sim.offScriptChance` (mặc định 0.2, lấy bằng sub-seed), đối thủ chơi **lệch archetype**. Sau mỗi pha, event log tiết lộ hành vi thật ("Họ lao vào rồng sớm"), nên người chơi **đọc được** và điều chỉnh pha sau. Đây là chỗ để quyết định có tính suy luận, không phải thuộc lòng bảng.

## 3. Ma trận `decisionFit` (điểm, cap ±6/pha)
Giá trị cộng vào `P_phase` của người chơi theo archetype **thực tế** của đối thủ ở pha đó. Nguồn máy đọc: `config/tactics.matrix.json`.

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

Ràng buộc đã kiểm tra tự động khi tạo file này, và phải được giữ trong CI:
1. Không tactic nào thống trị tactic khác trong cùng pha (luôn có archetype mà tactic kém hơn).
2. Mỗi tactic là lựa chọn **tốt nhất** với ít nhất một archetype.
3. Trung bình các tactic trong cùng pha chênh nhau ≤ 1.5 điểm (không có lựa chọn "mặc định tốt").
4. Mọi giá trị trong [-6, 6].

`decisionFit` chỉ là một phần. `tacticFit` (±5) còn phụ thuộc **đội hình** (ví dụ `GANK_TOP` cần Jungle/Top có MECHANICS cao), nên đáp án tối ưu = f(đối thủ, đội hình), không thể học thuộc.

## 4. Số quyết định theo thể thức
| Thể thức | Policy | Số quyết định tối đa |
|---|---|---|
| BO1 | `MANUAL_ALL_3` | 3 |
| BO3 | `GAME1_ALL_3_THEN_FOCUS_1` | 3 + 1 + 1 = 5 |
| BO5 | `GAME1_ALL_3_THEN_FOCUS_1` | 3 + 4 = 7 |

- `FOCUS_1` (từ ván 2): người chơi chọn **1 pha cần can thiệp** và tactic cho pha đó; hai pha còn lại dùng gợi ý tự động dựa trên archetype đối thủ và **được hiển thị rõ** (không giấu).
- Có công tắc "Chơi thủ công cả 3 pha" cho người thích kiểm soát (`manualAllOptional`).
- `Skip` chỉ chọn mặc định khi bấm rõ ràng và có hiển thị (đúng `05` §6).

## 5. Giải thích sau trận (counterfactual)
Nhờ sub-seed theo pha (`05` §3), engine tính lại `P_phase` với quyết định thay thế và hiển thị: "Pha MID: bạn chọn `SPLIT_PUSH` (−2) so với `CONTEST_OBJECTIVE` (+4) vì đối thủ là `SPLIT_PRESSURE`". Kèm 1 gợi ý hành động. Không tuyên bố kết quả "sẽ" thay đổi, chỉ nói xác suất thay đổi bao nhiêu.

## 6. Kiểm thử bắt buộc
- Test tính chất ma trận (mục 3) chạy trong CI.
- 10k seeds: người chơi chọn tối ưu vs ngẫu nhiên → chênh win rate ≥ 5 điểm % (mục tiêu, hiệu chỉnh).
- 10k seeds: một chính sách "luôn chọn cùng một tactic" không thắng chính sách thích nghi theo archetype.
- Golden test sub-seed: đổi quyết định EARLY không đổi random draw MID/LATE.
- Playtest: hỏi "Vì sao bạn chọn tactic đó?" — nếu câu trả lời là "đoán", thông tin hiển thị ở mục 1 chưa đủ rõ.
