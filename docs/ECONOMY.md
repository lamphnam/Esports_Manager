# Economy — Pack, thẻ, huấn luyện, Market, Facilities

Cập nhật 03/11/2026. Mô tả hệ thống đang chạy trong `src/lib/economyEngine.ts` và reducer `src/context/GameContext.tsx` (Architecture B: một snapshot `localStorage`, không có server authority). Phần thiết kế chưa làm ghi **[Đích]**. Nguồn thưởng từng chapter: [GAME_DESIGN.md](GAME_DESIGN.md) §3.

## 1. Ví và ledger

- Ví có 3 loại: `credits`, `trainingMaterials`, `scoutTickets`. Ví khởi đầu: 500 credits (cộng thưởng Chapter 1 là 500, tổng 1000 sau F0). Materials và tickets có hiển thị nhưng **chưa là chi phí thật** của training.
- Không tiền thật, không crypto, không giá trị quy đổi, không thị trường người-với-người.
- Mọi biến động ghi vào `ledger` chỉ-ghi-thêm (`sourceType`: MILESTONE, PACK_BUY, TRAINING, TRANSFER, FACILITY, SPONSOR). Ledger nóng giữ **500 dòng gần nhất**; phần cũ cộng dồn vào `ledgerArchive` (tổng credits/materials/tickets và `count`). Mọi mutation đi qua một reducer duy nhất (`saveReducer`).
- ID sinh bằng UUID (`identity.ts`), ngày tính theo múi giờ Việt Nam (`vietnamDay()`).
- **Tài trợ phục hồi:** +100 credits khi ví dưới 100, tối đa một lần/ngày VN; ngày đã claim lưu trong save nên không farm được khi archive ledger. Giao hữu và thử lại luôn miễn phí và không thưởng, nên không bao giờ soft-lock ở 0 credits.

## 2. Pack

| Pack | Phân bố mặc định | Cách có | Bảo vệ | Giá |
|---|---|---|---|---|
|Welcome|0 Common / 100% Rare+ with 80 Rare, 18 Epic, 2 Legendary|tutorial only|guaranteed upgrade|0|
|Scout|55 Common / 35 Rare / 9 Epic / 1 Legendary|campaign/credits|at most 8 openings without Epic+ if same pack family|800|
|Elite|0 Common / 55 Rare / 40 Epic / 5 Legendary|boss/season|Rare+|2000|
|Champion|0 Common / 0 Rare / 85 Epic / 15 Legendary|major trophy|Epic+|5000|

Tất cả xác suất là **giá trị cân bằng nguyên mẫu**, hiển thị cho người chơi, chỉ được đổi cùng `packTableVersion` và ghi chú rõ. `pity` chỉ tăng cho đúng pack family có bảo vệ và reset khi nhận Epic+.

**Định nghĩa pity chốt (v2.2):** `misses` = số lần mở liên tiếp của cùng pack family không ra Epic+. `pityEpicPlusAt = 8` nghĩa là **tối đa 7 lần liên tiếp không Epic+**; khi `misses == 7`, **lần mở thứ 8 buộc ra Epic+** (loại Common/Rare khỏi bảng trọng số của lần đó). Test biên bắt buộc: lần 7 vẫn có thể hụt, lần 8 không bao giờ hụt, `misses` reset về 0 sau Epic+ (kể cả Epic+ tự nhiên), và chạy 100k lần mở không bao giờ có chuỗi hụt > 7.

**Chất lượng Common (v2.2):** Common rơi từ Scout pack có `baseOvr >= scoutCommonMinOvr (62)` để tránh pack "hụt hoàn toàn" so với starter 55–65. Giá trị là giả thuyết cân bằng.

**Pool và giao dịch [Đã có]:**

- **Pool pack (DEC-13)** = 30 `CURRENT_EDITIONS` + 649 `LEGACY` (`PACK_POOL` trong `economyEngine.ts`), tức ~679 ứng viên: Thường 89, Hiếm 377, Sử Thi 173, Huyền Thoại 40. Odds, pity và ràng buộc Common ≥ 62 giữ nguyên, chỉ có nhiều thẻ hơn trong mỗi độ hiếm. Trước đây pool chỉ có 30 thẻ (8 / 12 / 7 / 3) nên các tuyển thủ lặp lại liên tục. 5 bản Team Secret Whales 2026 vẫn nằm ngoài pack. Test: 20k lần rút Scout cho > 250 thẻ khác nhau, Legacy chiếm > 70%, tỷ lệ Thường/Huyền Thoại đúng bảng.
- Mở pack tiêu thụ đúng một instance, tạo thẻ, cập nhật pity, ghi ledger và lưu `pendingReveal` trong **cùng một snapshot** trước khi phát animation. Reload hiện lại đúng thẻ đã mint, không rút lại. Skip hủy cả hai timer, không reveal hay confetti lần hai.
- Welcome Pack mở tự động sau khi thắng Chapter 1, không mua miễn phí để farm.

## 3. Chỉ số, OVR, role-fit, synergy

- 5 chỉ số 0–100: `mechanics`, `macro`, `teamwork`, `mental`, `championPool`. `effectiveOVR` tính từ chỉ số thực tế (gồm trained stats) với trọng số **MECHANICS 0.30, MACRO 0.25, TEAMWORK 0.20, MENTAL 0.15, CHAMPION_POOL 0.10**. Mô phỏng dùng thuộc tính chứ không dùng OVR hiển thị ([MATCH_SIMULATOR.md](MATCH_SIMULATOR.md) §3).
- Role chính lấy theo **edition** trước identity hiện tại (phạt 0); role phụ phạt -3 vào mọi chỉ số; thẻ không có role đó (chính hay phụ) bị từ chối khi trang bị (`GameContext.tsx` `equipCard`; snapshot có nhánh phạt 15 nhưng không với tới bằng đường equip thường). Một thẻ vật lý không được chiếm hai slot.
- Synergy theo cặp tag (data-driven), cộng dồn tối đa **±8** điểm sức mạnh đội. Không cộng chỉ số theo quốc gia.
- Archetype thẻ gợi ý: Lane Dominator, Playmaker, Late Carry, Shotcaller, Clutch, Flexible.

## 4. Huấn luyện

- Mỗi lần: +2 cho stat được chọn, trần stat 99, trần level 10. Giá `100 + 60*(level-1)` credits, **giảm 10% khi Training Center tier 1** (UI và logic dùng cùng hàm `getTrainingCost`). Xác định, không thất bại.
- Không huấn luyện `CHAMPION_POOL` vì chưa có cơ chế Fearless. OVR hiển thị bằng OVR mô phỏng.
- **[Đích]** Enhancement +0→+5 bằng shards, `potential`; chưa làm.

## 5. Facilities

Giá nâng cấp: tier 1/2/3 = 1000 / 2500 / 5000 credits.

| Công trình | Tier tối đa hiện có | Tác dụng thật |
|---|---|---|
| Training Center | 1 | giảm 10% chi phí huấn luyện |
| Strategy Lab | 3 | +1/+2/+3 synergy (vẫn cap tổng ±8) |
| Scout Office | 0 (ẩn) | chưa có tác dụng nên không hiển thị như đã hoạt động |

Không hiển thị perk chưa làm như đã hoạt động (DEC-8).

## 6. Market (NPC Transfer) [Đã có]

- 6 offer mỗi ngày VN, sinh tất định từ seed `market-<ngày>` từ pool **LEGACY**; expiry thật (hết ngày VN); offer đã mua trong ngày không hồi lại; lưu `purchasedOfferIds`.
- Giá theo rarity: Legendary `8000 + (ovr-90)*500`, Epic `3500 + (ovr-80)*200`, Rare `1600 + (ovr-70)*100`, Common 1200.
- Không phải đấu giá người-với-người, không phản ánh hợp đồng đời thực. **[Đích]** Bán thẻ về NPC (chỉ khi không ở lineup và không phải starter được bảo vệ, giá sàn chống arbitrage).

## 7. Chỉ tiêu kinh tế cần kiểm chứng

Bảng dưới là **giả thuyết thiết kế**, chưa được engine kiểm chứng. `scripts/balance-sim.ts` chỉ đo win-rate theo chapter, **không** mô phỏng ví theo chính sách chi tiêu.

| Chapter | Thu nhập lần đầu | Mục tiêu mua được trước chapter kế |
|---|---|---|
| 1 | 500 (ví đầu) + 500 = 1000 | 1 Scout pack **hoặc** ~3 level training |
| 2 | +600 (code hiện tại) | thêm level training cho 2 starter |
| 3 | +800 | 1 Scout pack + vài level training |
| 4 | +1200 | **ít nhất một nâng cấp có ý nghĩa** không cần RNG hiếm |
| 5 | +2000, Elite + Champion | đủ cho một thẻ Market cấp thấp |

1. Median 3 trận đầu đủ mua ≥ 1 nâng cấp có ý nghĩa (≥ +2 stat tổng hợp hoặc 1 pack) mà không cần Epic.
2. Người chơi 8 Scout pack không Epic+ vẫn qua được chapter kế bằng training + chiến thuật.
3. Không soft-lock ở 0 credits (đã có: giao hữu miễn phí + tài trợ phục hồi).
4. Không lạm phát: credits sinh ra mỗi chapter ≤ ~1.3× sink "hợp lý"; không có chu trình mua–bán có lời.
5. Anti-farm: replay không thưởng; first-clear chỉ một lần (đã có guard).

**[Đích]** Script mô phỏng ví cho 1000 người chơi × 3 chính sách (tiết kiệm / mua pack ngay / training trước) qua Ch1–5, in credits, số pack, win rate chapter và cảnh báo vi phạm chỉ tiêu 1–4. Chưa làm.

## 8. Độ khó Ch6–12 (DEC-14) và mô phỏng tiến trình

Đối thủ Ch6–12 trước đây được rút **ngẫu nhiên** từ 129 đội-năm lịch sử (OVR 65–91, trung vị 75), không có đường cong độ khó: Ch6 (OVR 70) yếu hơn cả Ch5 (77). Trong khi đó người chơi lên sức mạnh nhanh: mỗi chương từ Ch5 thưởng pack Elite/Champion và credits (2200 → 10000) đủ để **mua thêm Champion pack (5000)**. Đội 3 Sử Thi + 2 Hiếm (OVR 81) thắng 85–88%, đội 5 Sử Thi thắng 98–99%.

Cách sửa (`src/data/legacyOpponents.ts`):

- Mỗi chương có OVR mục tiêu: **Ch6 80 · Ch7 84 · Ch8 86 · Ch9 88 · Ch10 90 · Ch11 93 · Ch12 95** (`OPPONENT_TARGET_OVR`).
- Đối thủ là đội-năm thật gần mục tiêu nhất (cụm sai khác ≤ 1 OVR, chọn bằng seed), **mỗi đội chỉ xuất hiện một lần** trong chiến dịch. Ch6 vẫn giới hạn khu vực APAC (VCS/PCS/LMS/LJL); Ch9 không còn giới hạn vì APAC chỉ có đội ≤ 73 OVR.
- Khi pool không có đội đủ mạnh, cộng một mức **cân chỉnh độ khó** `difficultyBonus` (tối đa 16) vào mọi chỉ số của roster. Mức này lưu trên snapshot và hiển thị cho người chơi trong màn đội hình đối thủ.

**Kiểm chứng:** `bun scripts/progression-sim.ts` mô phỏng 200–400 người chơi qua Ch1–12 bằng đúng lịch thưởng, bảng pack/pity/pool và simulator; archetype đối thủ được xoay vòng để phép đo trung lập, không huấn luyện, không mua ở Market, tactic mặc định. Hai kiểu chơi: *rewards* (chỉ mở pack thưởng) và *engaged* (còn dùng credits mua Champion rồi Elite). Mục tiêu cho *engaged*: Ch6–9 thắng 45–62%, Ch10 42–60%, Ch11 40–58%, Ch12 38–55% (script thoát khác 0 nếu ngoài dải).

| Ch | Đội trung vị (engaged) | Đối thủ | Win rate engaged | Win rate rewards |
|---|---|---|---|---|
| 6 | 78 | 80 | 54% | 43% |
| 7 | 80 | 84 | 55% | 41% |
| 8 | 83 | 86 | 55% | 39% |
| 9 | 84 | 88 | 51% | 37% |
| 10 | 85 | 91 | 50% | 35% |
| 11 | 86 | 93 | 45% | 31% |
| 12 | 87 | 94 | 51% | 38% |

Người huấn luyện thẻ, mua Market, và đọc đúng archetype sẽ thắng nhiều hơn các số này. DEC-5 (Ch1–5) không đổi. Đội của bạn (OVR 90 ở Ch12 nhờ nhiều Huyền Thoại) là may mắn trên trung vị; pool Legacy cũng làm Sử Thi trung bình giảm từ 86.3 xuống 83.7.

### Mùa giải mới (DEC-15)

Sau khi thắng Chapter 12 (Worlds), Hub hiện màn tổng kết "Vô địch thế giới" kèm nút **Bước sang mùa tiếp theo** (`startNextSeason`, hàm thuần `nextSeasonClub` trong `src/data/season.ts`): `careerYear` +1, `completedChapterIds` đặt lại về `[1, 2]`, `currentChapterId` = 3 (bỏ phần sinh viên), tài trợ khởi đầu **+1000 credits** (ledger SPONSOR). Đội hình, thẻ, ví, danh tiếng được giữ. Thưởng first-clear nhận lại mỗi mùa (guard theo `completedChapterIds` của mùa đó); thể thức và phần thưởng từng chương không đổi.

Từ mùa 2, đối thủ Ch3–12 đều là đội lịch sử thật chọn theo mục tiêu OVR mới (`SEASON2_TARGET_OVR`: 92 · 92 · 93 · 93 · 94 · 95 · 95 · 96 · 96 · 97), mỗi mùa sau +2 và dừng ở **97** (`MAX_TEAM_OVR`, trần chỉ số 99). Mô phỏng 250 người chơi engaged qua 3 mùa: mùa 2 thắng 50–62% mỗi chương, mùa 3 thắng 52–58% (dải nghiệm thu 42–65%). Độ khó bão hòa ở mùa 3 trở đi vì pool và trần chỉ số; nếu cần dài hơi hơn phải thêm cơ chế khác.

## 9. Công bằng và quyền riêng tư

Không đăng nhập Portal, không microtransaction, tỷ lệ pack hiển thị rõ, không cơ chế gây áp lực chơi quá mức; tắt âm và Skip reveal tức thì. Vì save nằm ở client, người chơi có thể sửa save: chấp nhận cho bản contest (xem [ARCHITECTURE.md](ARCHITECTURE.md) §6).
