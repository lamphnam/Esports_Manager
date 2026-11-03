# Game Design — APAC Rising: Esports Manager

Cập nhật 03/11/2026. Nguồn sự thật cho vòng chơi, campaign, thẻ và nội dung. Số liệu luật nằm ở [ECONOMY.md](ECONOMY.md) và [MATCH_SIMULATOR.md](MATCH_SIMULATOR.md). **[Đã có]** = chạy trong build hiện tại; **[Đích]** = thiết kế chưa nghiệm thu, không coi là đã xong.

## 1. Tổng quan

- **Tên làm việc:** APAC Rising: Esports Manager (không khẳng định tài trợ hay chính thức).
- **Thể loại:** MOBA esports manager + thẻ tuyển thủ sưu tầm + career campaign. Không phải MOBA thời gian thực.
- **Fantasy:** từ sinh viên lập CLB, mở pack nhận thẻ có nhiều edition theo mùa, dựng đội TOP/JUNGLE/MID/BOT/SUPPORT, huấn luyện, vượt Campus → Road to VCS → VCS → LCP → sự kiện toàn cầu (hư cấu có nhãn).
- **Người chơi:** sinh viên yêu esports; người mới phải chơi được sau 15–30 giây đọc hướng dẫn. Một phiên 3–8 phút, có lưu tiến trình và Skip.

### Năm trụ cột

1. **Underdog → Legend:** 5 sinh viên OVR 55–65 có thể thành biểu tượng CLB, không phải bỏ sạch starter.
2. **Pack → Upgrade → Victory:** phần thưởng thấy ngay; 3–5 phút đầu bảo đảm có pack và quyết định thay người.
3. **Đội thông minh thắng OVR thuần:** role-fit, synergy, tactic và quyết định trong trận tạo chênh lệch thật.
4. **Career ghi nhớ bạn:** thắng/thua, đối thủ, thất bại không xóa save.
5. **Lựa chọn minh bạch:** kết quả có giải thích; RNG có seed và được kiểm định.

## 2. Vòng chơi

Hub → chọn mục tiêu Campaign → chỉnh Lineup/Training/Market → chốt chiến thuật → mô phỏng BO1/BO3/BO5 (3 pha mỗi ván) → kết quả + thưởng (credits, pack, reputation) → mở pack → nâng cấp → chặng kế.

### Onboarding F0 (không được bỏ) **[Đã có]**

1. Nhập tên CLB, chọn logo hình học preset (không upload ảnh). Có đường nhập Recovery Code nếu đã có save.
2. 5 thẻ starter đúng role (OVR 55–65), chỉ một nút `Thi đấu giao hữu`.
3. Chapter 1 (BO1, đối thủ OVR 55) với 3 quyết định tactic qua ba pha.
4. Thắng → **Welcome Pack** đảm bảo Rare+ + credits; animation 3–5 giây có Skip; so sánh OVR/role.
5. Trang bị một chạm → trận thứ hai thấy sức mạnh đội thay đổi. Reload ở bất kỳ bước nào không mất tiến trình.

### Màn hình **[Đã có]**

Tab trong `App.tsx`: Hub, Campaign, Lineup, Collection, Packs, Training, Transfers, Facilities; thêm modal Match Center, Pack Opening, Recovery, World Demo. Hall of Fame, Season Recap, Settings đầy đủ chưa có **[Đích/P2]**. Chi tiết UI: [UX_AND_ART.md](UX_AND_ART.md).

## 3. Campaign

**Thiết kế đích** là season-state-machine có nhánh (đã có vòng lặp mùa giải tuyến tính ở trên; nhánh và qualification theo split vẫn chưa) (PRE_SEASON → DOMESTIC_SPLIT → LCP_STAGE → FIRST_STAND → … → WORLDS → OFF_SEASON), nơi thua ở cấp pro chuyển sang split/năm kế, không bao giờ xóa CLB hay thẻ. **Build hiện tại** là 12 chapter tuyến tính với first-clear guard; qualification theo split, chuyển split/năm sau pro loss và Rival Zero thích nghi **chưa nghiệm thu** **[Đích]**.

| # | Act | Chapter | Thể thức | Đối thủ | Thưởng first-clear |
|---|---|---|---|---|---|
| 1 | 1 | Năm Người Xa Lạ | BO1 | Học Viện VCS Trẻ (OVR 55) | 500 cr, Welcome Pack, rep 25 |
| 2 | 1 | Vua Sinh Viên | BO3 | Saigon Buffalo Young (62) | 600 cr, Scout, rep 50 |
| 3 | 2 | Đường Tới VCS | BO3 | CERBERUS Esports (66) | 800 cr, Elite, rep 100 |
| 4 | 2 | Chào Sân Chuyên Nghiệp | BO3 | Vikings Esports (72) | 1200 cr, Elite, rep 150 |
| 5 | 2 | Vương Miện Việt Nam | BO5 | GAM Esports (77) | 2000 cr, Elite + Champion, rep 300 |
| 6 | 3 | Đại Chiến Thái Bình Dương (LCP) | BO5 | Đội Legacy từ VCS/PCS/LMS/LJL | 2200 cr, Champion, rep 400 |
| 7 | 3 | First Stand Quốc Tế | BO5 | Đội Legacy (mọi khu vực) | 2500 cr, Champion, rep 500 |
| 8 | 3 | Bậc Thầy Giữa Mùa (MSI) | BO5 | Đội Legacy (mọi khu vực) | 3000 cr, Champion, rep 600 |
| 9 | 3 | Tấm Vé Cuối Cùng | BO5 | Đội Legacy (mọi khu vực) | 3500 cr, Champion, rep 750 |
| 10 | 3 | Đối Đầu Cả Thế Giới | BO5 | Đội Legacy (mọi khu vực) | 4000 cr, Champion, rep 900 |
| 11 | 3 | Bán Kết Sinh Tử | BO5 | Đội Legacy (mọi khu vực) | 5000 cr, 2 Champion, rep 1200 |
| 12 | 3 | Khắc Tên Vào Lịch Sử | BO5 | Đội Legacy (mọi khu vực) | 10000 cr, 2 Champion, rep 2500 |

- **Bracket mùa giải (DEC-15):** 12 chương được gom thành 7 giải để dễ nhìn (`COMPETITIONS` trong `src/data/season.ts`): Giải Sinh Viên (Ch1–2), Road to VCS (Ch3), VCS (Ch4–5), LCP (Ch6, Ch9), First Stand (Ch7), MSI (Ch8), Worlds (Ch10 Vòng bảng, Ch11 Bán kết, Ch12 Chung kết). **Mỗi vòng vẫn là một series của một chương**: bracket là cách hiển thị và đặt tên, chưa thêm trận mới.
- **Qua mùa:** thắng Ch12 → màn "Vô địch thế giới" → bước sang mùa sau (năm +1, giữ đội hình/thẻ/ví, +1000 credits, bắt đầu lại từ Ch3 với đối thủ mạnh hơn). Chi tiết số liệu ở [ECONOMY.md](ECONOMY.md) §8.
- Ch1–5 là phạm vi **phải xong tốt**; OVR đối thủ 55/62/66/72/77 được hiệu chỉnh theo mục tiêu win-rate DEC-5 ([DECISIONS.md](DECISIONS.md)). Ch6–12 dùng `legacyOpponent()` ([legacyOpponents.ts](../src/data/legacyOpponents.ts)): mỗi chapter có OVR mục tiêu tăng dần (80, 84, 86, 88, 90, 93, 95), chọn tất định đội-năm lịch sử gần mục tiêu nhất, mỗi đội chỉ một lần, archetype theo seed; chỉ Ch6 giới hạn khu vực VCS/PCS/LMS/LJL. Khi pool không đủ mạnh có `difficultyBonus` hiển thị cho người chơi ([ECONOMY.md](ECONOMY.md) §8). Dạng **knockout đơn hư cấu có nhãn**, không cần engine riêng; tên đội trong các seed của `campaignData.ts` bị ghi đè bởi đội này. Người chơi xem được đội hình đối thủ (vai trò, tên, OVR) ở Hub, Campaign và màn Match Center, đặt cạnh đội hình của mình.
- Swiss, double elimination, Play-In chỉ làm nếu còn thời gian và có test **[P2]**. Nếu làm Swiss-lite phải gắn nhãn hư cấu.
- Chapter 1–2 (grassroots): thử lại tự do, first-clear chỉ nhận một lần. Giao hữu và thử lại không thưởng. Replay chapter đã clear không hứa thưởng.
- **Anti-farm:** `completedChapterIds` + ledger append-only; không có vòng lặp pack vô hạn.
- Tài trợ phục hồi 100 credits/ngày (giờ Việt Nam) khi ví dưới 100 để không soft-lock.

### Tham số thưởng thiết kế ban đầu **[Đích]**

Road to VCS qualification → Elite; VCS title → Elite ×2 + reputation +200; LCP berth → scout ticket; MSI/First Stand → token sự kiện không giao dịch; Worlds Top 8 → Legacy shards; Worlds champion → trophy + một Legacy-choice. Chưa có shards/token trong build.

### Nhánh phụ và tương lai **[Đích]**

- **Predator Cup / "APAC Invitational":** nhánh độc lập, **không** liên thông tới LCP hay Worlds; chỉ bật khi quyền thương hiệu Acer được xác nhận (D3). Chưa làm.
- **Global Manager Career (V2):** offer từ CLB LCK/LPL sau ngưỡng reputation; `AccountCollection` tách khỏi roster. Chưa làm.
- **Rival Zero:** đối thủ Campus tái xuất ở Road to VCS/VCS, adaptive archetype có nhãn "đang thích nghi". Chưa làm.
- Sự kiện kể chuyện (rival rematch, scout recommendation, board expectations, season epilogue): mỗi sự kiện cần prerequisite theo data, hiệu ứng tất định, guard một lần mỗi mùa, không sinh AI lúc runtime.

## 4. Thực tế và hư cấu (không được trộn)

**Dữ kiện thế giới thật** (đối chiếu 27/10–03/11/2026; bảng nguồn và độ tin cậy ở [CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md) §6):

- LCP 2027 đổi cơ chế: mỗi split các đội mạnh nhất từ hệ thống nội địa **VCS, PCS, LJL** giành quyền vào **LCP**, là đường vào global events cho APAC. Slot và format chi tiết từng split **chưa công bố**.
- Road to VCS có tồn tại, nhưng **không** có quy tắc mọi CLB sinh viên tự vào VCS.
- Worlds 2026: Play-In BO5 double elimination 4 đội, Swiss 16 đội 3 thắng/3 thua, Knockout 8 đội BO5. **Format 2027 chưa cố định.**
- Predator League 2027 là giải riêng của Acer (tổ chức tại Việt Nam, 01/2027), không phải vòng loại LCP/Worlds.

**Ranh giới thiết kế:**

- Trục chuyên nghiệp là **VN Campus → Road to VCS → VCS → LCP → global events**. Không bao giờ LCP → LCK; LCK/LPL chỉ là đối thủ hoặc nhánh manager career V2.
- Quyền vào LCP được xét lại **mỗi split**, không "vô địch một lần giữ vé mãi". Luôn mô tả là điều kiện trong `qualificationConfig` của game, không gán số suất chính thức.
- First Stand/MSI/Worlds là sự kiện quốc tế theo điều kiện mùa; không viết "thắng LCP một lần là chắc chắn dự tất cả".
- Mọi dữ liệu giải đấu mang `rulesBasisYear`, `isOfficialFormat` (mặc định `false`), `adaptationNote`, `realWorldReferenceUrl`. UI hiển thị disclaimer gọn (footer `App.tsx`).
- Archetype đối thủ là mô hình AI của game, không khẳng định phong cách của một quốc gia hay khu vực; gắn với đội cụ thể hoặc dữ liệu lối chơi, không gắn quốc tịch.

## 5. Thẻ và catalog

- **`PlayerIdentity`** (con người) → **`PlayerCardEdition`** (phiên bản theo năm/loại: ACADEMY, BREAKOUT, CHAMPION, LEGACY; có stats, OVR, rarity, traits) → **`OwnedCard`** (instance riêng: level, trainedStats, acquiredFrom). Hai bản cùng edition là hai instance. Mùa của CLB (`careerYear`) khác `editionYear` của thẻ.
- **Rarity:** Common 55–69, Rare 70–79, Epic 80–89, Legendary 90–96 (`docs/config/balance.initial.json`). Rarity luôn có nhãn chữ, không chỉ màu.
- **Catalog hiện tại [Đã có]:** 399 identities / 684 editions = **30 `CURRENT_EDITIONS`** + **649 `LEGACY`** (lịch sử 2011–2025, 374 identities, 73 đội, 129 team-years) + 5 bản 2026 Team Secret Whales có `source/confidence/retrievedAt`. Các nhóm identity giao nhau nên không cộng số identity từng nguồn.
- **Pack mở thẻ từ cả CURRENT và LEGACY** (DEC-13, thay DEC-2): ~679 ứng viên nên ít lặp lại; bảng pack và pity giữ nguyên. LEGACY cũng xuất hiện ở Market hằng ngày, đối thủ Ch6–12, demo và Draft.
- **Rating Legacy:** lấy từ dataset tham khảo Golden Road, mỗi edition có `ratingSource` = `golden_road` / `adjusted` / `derived` và mapping đơn điệu sang OVR (neo 76→55, 80→69, 81→70, 86→79, 87→80, 91→89, 92→90, 98→96; tạo 81 Common, 365 Rare, 166 Epic, 37 Legendary). Người không có trong dataset dùng `deriveRating()` (hash `playerId|team|year|role`). Chỉ số là **cân bằng game**, không đánh giá khách quan người thật.
- **Tên và hình:** tên CLB thật bật (`ENABLE_REAL_CLUB_NAMES=true`, DEC-3); toàn bộ hình hiện là placeholder hình học/SVG, chưa có ảnh/logo thật được duyệt. Tiểu sử tuyển thủ phải có nguồn trong [CONTEST_AND_RIGHTS.md](CONTEST_AND_RIGHTS.md), nếu không dùng mô tả lối chơi trung tính; không đưa họ tên đời thực, tuổi, quê quán (DEC-6).
- **Dữ kiện 2026:** chỉ nhập hàng có độ tin cậy từ Medium trở lên; không đưa dòng Low vào game.

## 6. Đối thủ và nội dung

**Archetype trong engine [Đã có]:** `EARLY_AGGRO`, `OBJECTIVE_CONTROL`, `LATE_SCALING`, `SPLIT_PRESSURE`, `BALANCED`. Đối thủ lệch archetype 20% mỗi pha (xem [MATCH_SIMULATOR.md](MATCH_SIMULATOR.md) §5).

**Hướng nội dung đích [Đích]:** 6 loại boss (Campus Rivals, Cyber Veterans, VCS Dark Horse, Pacific Strategists, World Favorite, Rival Zero), mỗi loại có điểm yếu và gợi ý phần thưởng. Template giải: Campus Cup, Road to VCS qualifier/final, VCS mini round-robin + playoff BO5, LCP/First Stand/MSI/Worlds knockout. Khối lượng nội dung là **mục tiêu dữ liệu**, không phải số module code: sinh bằng JSON + validator.

**Mục tiêu cân bằng nội dung:** trận tutorial thắng >80% với người chơi chăm chú; 5 phút đầu luôn có Rare+; boss chapter trung bình ~50–65% với đội đã huấn luyện hợp lý; không chapter nào bắt buộc một Legendary; có ít nhất hai chiến lược khả thi và một nâng cấp không phụ thuộc RNG; thẻ nâng cấp có ý nghĩa đầu tiên trong <5 phút; cúp VCS đầu tiên khoảng 30–60 phút chơi (cần playtest xác nhận).

## 7. demoScenario "Chung kết thế giới" **[Đã có]**

Nút ở Hub: BO5 chơi được trong ~3 phút, đội T1 vs BLG 2024 dựng từ dataset lịch sử (rating/teamOvr/synergy tính từ roster), 5–7 quyết định, dùng đúng simulator và UI thật. **Không ghi** reward hay progress vào career: toàn bộ `localStorage` byte-identical trước/sau (có e2e). State chỉ nằm trong component, nên không hứa khôi phục demo qua reload. Gắn nhãn "Demo". Mục đích: giám khảo và người bình chọn thấy cao trào mà không cần chơi hàng giờ. Kết quả là mô phỏng seeded, không ép theo lịch sử.

## 8. Golden Road Draft (G3) — sau cờ `FEATURE_GOLDEN_ROAD=false`

Đã phát triển và QA trực tiếp component nhưng **tắt trong bản nộp**; chỉ bật nếu toàn bộ F0/R1, QA 390×844 và iframe đạt (DEC-7). Đặc tả clean-room (không đọc hay port engine/UI của nguồn tham khảo):

- Năm slot TOP/JUNGLE/MID/BOT/SUPPORT; mỗi identity chỉ dùng một lần kể cả khác edition/năm. Mỗi đề nghị gồm khu vực, CLB, năm, luôn lọc theo slot trống và identity chưa dùng.
- Ba lượt đổi đề nghị, mỗi phạm vi REGION/CLUB/YEAR dùng một lần (CLUB giữ khu vực, YEAR giữ CLB).
- Circuit: Split 1, First Stand, Split 2, MSI, Split 3, Worlds; mỗi chặng là bracket 8 đội loại trực tiếp hư cấu, dùng simulator chính (BO3 split, BO5 global); ván đầu đủ 3 tactic, sau đó gợi ý tự động và giữ tactic MID của người chơi (FOCUS_1).
- Cùng seed + chuỗi hành động cho cùng kết quả; không `Math.random`. Thưởng: mỗi draft seed tối đa một lần trong career, tối đa 2 seed/ngày VN, mỗi lần 50 credits + một thẻ Legacy đã draft, qua action riêng, không đụng odds/pity.
- Poster chia sẻ 1080×1350 vẽ canvas (Slate/Amber/Cobalt/Crimson), không logo/ảnh/icon từ nguồn tham khảo.

## 9. Feature flags

`src/data/featureFlags.ts`: `ENABLE_REAL_CLUB_NAMES=true`, `FEATURE_GOLDEN_ROAD=false`. Các cờ thiết kế khác (`career.seasonsV2`, `competition.predatorSideCup`, `club.contracts`, `collection.realAssets`, `simulation.fearlessLite`, daily challenge, public leaderboard) chưa tồn tại trong code; mặc định chỉ bật khi có test và QA tương ứng.

## 10. Không làm và kiểm chứng "vui"

- Không sao chép UI/layout/code của LoL Esports Manager, Worlds Mayhem hay FC Online; không pay-to-win, không tiền thật hay giá trị đổi tiền; không "một trận thua = game over"; không chờ năng lượng real-time; không chuyển hướng Portal để xác thực.
- Tình huống giao tranh trung tính, không bạo lực/máu me (điều lệ cuộc thi).
- **Definition of fun:** sau 5 phút đầu người chơi trả lời được "vì sao mình thắng/thua?", "thẻ mới có giúp đội mạnh hơn không?", "muốn làm gì tiếp theo?". Quan sát 5–10 người chơi thử trước khi mở rộng nội dung ([QA_AND_RELEASE.md](QA_AND_RELEASE.md) §5).
