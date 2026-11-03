# 13 — Match Decision Spec (v2.2)

Mục tiêu: để "Smart team beats pure OVR" thành sự thật có thể kiểm chứng. Người chơi phải có **thông tin để suy luận**, nhưng không có đáp án luôn đúng.

**Cập nhật 03/11/2026:** policy và recap dưới đây mô tả build B đang chạy. Ma trận §3 giữ nguyên. Scout Office/Rival Zero thích nghi ở §1 là thiết kế tương lai, chưa được nghiệm thu trong build hiện tại; không hiển thị perk Scout Office như đã có. Kết quả/gate còn mở xem [Phase 4](evidence/PHASE_4.md).

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

### 4.1. Kết quả từng ván và chuyển ván

- Sau mỗi ván BO3/BO5, career và demo vào `GAME_RECAP`: thắng/thua ván, tỷ số chuỗi, kills, thời lượng, MVP và logs EARLY/MID/LATE. Giữ nguyên màn hình cho đến khi người chơi bấm nút; `Watch/Fast/Skip` không vượt qua điểm dừng này.
- Nếu chuỗi chưa kết thúc, **Ván Tiếp Theo** mới mở `FOCUS_1` cho ván kế; chưa mô phỏng ván đó trước khi xác nhận lựa chọn. Khi đổi focus hoặc tắt `manualAllOptional`, các pha tự động trở lại gợi ý, không giữ thêm lựa chọn thủ công ẩn.
- Nếu chuỗi đã kết thúc, **Xem Tổng Kết Chuỗi** mới mở tổng kết/thưởng; không nhầm thắng một ván với thắng chuỗi. BO1 giữ luồng tổng kết F0 trực tiếp.
- Career lưu và khôi phục đúng `GAME_RECAP`/seed/result qua reload. Demo dùng state riêng, không ghi career và không hứa khôi phục qua reload.

## 5. Giải thích sau trận (counterfactual)
Nhờ sub-seed theo pha (`05` §3), engine tính lại `P_phase` với quyết định thay thế và hiển thị: "Pha MID: bạn chọn `SPLIT_PUSH` (−2) so với `CONTEST_OBJECTIVE` (+4) vì đối thủ là `SPLIT_PRESSURE`". Kèm 1 gợi ý hành động. Không tuyên bố kết quả "sẽ" thay đổi, chỉ nói xác suất thay đổi bao nhiêu.

Tổng kết xét mọi ván trong chuỗi, ưu tiên alternative có độ chênh tuyệt đối lớn nhất. Hiển thị đúng dấu tăng/giảm và nói tương đương khi bằng 0; archetype/tactic có nhãn tiếng Việt dễ đọc, không chỉ in identifier.

## 6. Kiểm thử bắt buộc
- Test tính chất ma trận (mục 3) chạy trong CI.
- 10k seeds: người chơi chọn tối ưu vs ngẫu nhiên → chênh win rate ≥ 5 điểm % (mục tiêu, hiệu chỉnh).
- 10k seeds: một chính sách "luôn chọn cùng một tactic" không thắng chính sách thích nghi theo archetype.
- Golden test sub-seed: đổi quyết định EARLY không đổi random draw MID/LATE.
- Regression `GAME_RECAP`: mẫu thắng/thua BO3/BO5, đủ 3 logs, chờ 15 giây không tự chuyển, reload career cùng kết quả và chỉ Next mới vào FOCUS/tổng kết; demo không đổi localStorage (`scripts/e2e-game-recap.js`, `scripts/e2e-demo.js`).
- Playtest: hỏi "Vì sao bạn chọn tactic đó?" — nếu câu trả lời là "đoán", thông tin hiển thị ở mục 1 chưa đủ rõ.

Benchmark local 10k seed 03/11: adaptive 55.27%, random/fixed 51.76%; adaptive vượt fixed nhưng gap 3.51 điểm % chưa đạt mục tiêu ≥5. Giữ gate đó mở, không sửa ma trận để ép số; Q4 vẫn dùng mặc định đang ghi trong DECISIONS.
