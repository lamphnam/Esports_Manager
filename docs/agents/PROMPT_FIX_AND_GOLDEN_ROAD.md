# PROMPT: Sửa lỗi từ audit + tích hợp dữ liệu Golden Road vào APAC Rising

> Dành cho coding agent làm việc trong repo này. Ngày tạo: 2026-11-03, cập nhật cùng ngày sau khi chủ dự án trả lời Q1-Q3 (`DECISIONS.md`). Hạn nộp gốc 15/11/2026 **đã được chủ dự án báo là giãn**; ngày mới chưa ghi (Q5), nên các mốc ngày trong mục 6 chỉ là thứ tự tham chiếu. Không cắt phạm vi vì lịch, nhưng vẫn làm đúng thứ tự ưu tiên.
> Quy tắc ưu tiên tài liệu vẫn theo `docs/CLAUDE.md`: `00_START_HERE.md` v2.2 scope cut > `02` > `01` > `03`–`09` > `config/*.json`.

---

## 0. Vai trò và luật làm việc

Bạn là Senior Engineer sửa lỗi và mở rộng bản build **Kiến trúc B (local-first React + TS + Vite, Bun)** của *APAC Rising: Esports Manager*.

1. **Mỗi bug phải tái hiện trước, sửa sau.** Viết test (hoặc script repro) thất bại trước, sửa, rồi chạy lại cho xanh. Audit bên dưới là của một lượt review trước; dòng code có thể đã lệch, hãy tự kiểm chứng, đừng tin mù.
2. **Không báo "xong" nếu thiếu bằng chứng.** Cuối mỗi phase ghi: lệnh đã chạy, output quan sát được, blocker (theo `10` §3). Cập nhật checkbox và Log trong `docs/index.md`.
3. **Mỗi phase một commit** (hoặc một nhóm commit nhỏ) trên nhánh `fix/audit-and-golden-road`. Không push `main`.
4. **Không đụng vào những thứ sau**: bảng odds pack và định nghĩa pity v2.2 (trừ khi test cho thấy lỗi), `DECISION_FIT_MATRIX` (đang đúng và khớp `config/tactics.matrix.json`), không dùng `Math.random()` trong simulator, không thêm màu tím/indigo/violet, không thêm emoji vào UI, không thêm dependency ngoài `vitest` (và `@vitest/coverage-v8` nếu cần).
5. Mọi số liệu về giải đấu thật phải mang `rulesBasisYear`, `isOfficialFormat`, `adaptationNote`, `realWorldReferenceUrl` (theo `docs/CLAUDE.md`). LCP, First Stand, MSI, Worlds là **hư cấu, loại trực tiếp, có nhãn**.
6. Gặp mâu thuẫn giữa các spec hoặc cần quyết định thuộc về chủ dự án: bổ sung vào `docs/DECISIONS.md` (**đã có sẵn**, G0 = B đã ghi nhận) mục "Câu hỏi mở", rồi chọn phương án **mặc định** ghi trong chính file đó, đừng dừng cả luồng. Không được tự đổi trạng thái "Đề xuất" thành "Đã chốt".
7. **Mã nguồn và giao diện của Golden Road không được sao chép** (`agents/IMPLEMENTATION_PROMPT.md` dòng 16, xem DEC-9 và mục 4.2). Chỉ dùng nó như tài liệu tham khảo về luật chơi và dữ kiện lịch sử. Quyền mà chủ dự án đã có (Q1) **chỉ bao phủ điểm rating**, không bao phủ mã hay giao diện.

**Thứ tự đọc bắt buộc trước khi code:** `docs/00_START_HERE.md`, `docs/CLAUDE.md`, `docs/DECISIONS.md`, `docs/index.md`, `docs/09_ACCEPTANCE_QA.md`, `docs/13_MATCH_DECISION_SPEC.md`, `docs/04_COLLECTION_PACKS_ECONOMY.md`, `docs/11_RIGHTS_SOURCES.md`, `docs/research/LINKS_AND_FACT_CHECK.md`, rồi `docs/ref/golden_road/*` (mục 4).

---

## 1. Phase 0: nền kiểm thử (làm trước, tối đa nửa ngày)

- Thêm `vitest`, script `test`, `typecheck`, và bật `"strict": true` trong `tsconfig.json`. Sửa các lỗi type phát sinh ở mức tối thiểu.
- Tạo `src/lib/__tests__/` với các test bất biến mà spec đã yêu cầu nhưng repo chưa có:
  - Ma trận `DECISION_FIT_MATRIX`: 4 ràng buộc (không chiến thuật bị thống trị trong một pha; mỗi chiến thuật là tốt nhất trước ít nhất 1 archetype; chênh trung bình giữa các chiến thuật cùng pha <= 1.5; mọi giá trị trong [-6, 6]), và khớp 100% với `docs/config/tactics.matrix.json`.
  - Golden test sub-seed: đổi quyết định `EARLY` thì `formBonus`, archetype thực, `winProbability` của `MID` và `LATE` giữ nguyên.
  - Pity: 10k seed, chuỗi hụt dài nhất của Scout là 7; lần mở thứ 8 buộc Epic+; reset về 0 khi ra Epic/Legendary; Common của Scout luôn `baseOvr >= 62`.
  - Xác suất thắng luôn trong [0.08, 0.92], không NaN, trên 5000 ván BO1/BO3/BO5.
- Thêm script `scripts/balance-sim.ts` in bảng win-rate theo chương cho 3 đội mẫu: (a) 5 thẻ khởi đầu, (b) khởi đầu + 1 Rare từ Welcome Pack, (c) toàn Rare. Dùng 4000 ván mỗi ô. Script này dùng lại ở Phase 2 và Phase 4.

---

## 2. Phase 1: lỗi P0 chặn F0 (ưu tiên cao nhất)

**P0-1. Welcome Pack không mở sau khi thắng Chapter 1** (`src/App.tsx` quanh dòng 47-52, `src/context/GameContext.tsx` dòng ~280-300 và ~440-486).
- Nguyên nhân: `setTimeout` gọi `openPack` bản cũ (stale closure), `club.packs` chưa có pack mới nên `openPack` trả `null`. Gốc sâu hơn: mọi action trong `GameContext` đọc `club`/`ownedCards` từ closure rồi `setClub({...club})` bằng snapshot tuyệt đối, nên hai action liên tiếp ghi đè nhau.
- Cách sửa: chuyển state của CLB sang `useReducer` (hoặc dùng functional update + `clubRef` đồng bộ) để mọi action nhận state mới nhất. Bỏ `setTimeout`; `App.tsx` dùng một cờ `pendingWelcome` + `useEffect` mở pack sau khi `club.packs` đã chứa `WELCOME`. Đặt mọi hook trước các `return` sớm.
- Nghiệm thu: test RTL hoặc Playwright chạy luồng F0 đầy đủ (tạo CLB, 5 thẻ khởi đầu, thắng Chapter 1, Welcome Pack tự mở, "Trang Bị Vào Đội Hình", reload không mất gì). Không còn `setTimeout` điều phối state.

**P0-2. Recovery Code là hàng trưng bày** (`GameContext.tsx` dòng ~155 và ~583, `RecoveryModal.tsx` dòng ~17-18, `src/index.css` dòng ~25).
- Hiện tại: mã `AR-xxxxxx` sinh bằng `Math.random`, `restoreFromRecoveryCode` luôn trả `true` nếu bắt đầu bằng `AR-`, không có UI nhập, lỗi storage/clipboard bị nuốt nhưng UI vẫn báo "Đã Sao Chép", `user-select: none` toàn body.
- Kiến trúc B không có server, nên mã phải **mang chính bản save**: `AR1.<base64url(nén(JSON save))>.<crc>` có version, checksum, giới hạn kích thước. Viết `encodeSave`/`decodeSave` (có test round-trip, test mã hỏng, test version lạ), UI nhập mã, ô văn bản bôi đen được kèm nút Sao chép có fallback `document.execCommand`/chọn sẵn khi `navigator.clipboard` bị chặn, và banner cảnh báo khi `localStorage` không dùng được (ví dụ iframe cross-origin). Bỏ `user-select: none` ở nơi hiển thị mã.
- Ghi rõ trong `DECISIONS.md` rằng với Kiến trúc B, Recovery Code = bản save nén, không phải danh tính server.

---

## 3. Phase 2: lỗi P1 và polish (theo thứ tự này)

| # | File (theo audit) | Việc cần làm | Nghiệm thu |
|---|---|---|---|
| 1 | `GameContext.tsx:217` `equipCard` | Một `OwnedCard` không được nằm ở hai slot. Nếu thẻ đang ở role khác thì **hoán đổi** hoặc từ chối. Thẻ chơi role phụ bị phạt -3 theo `04` §6 (kiểm tra có áp dụng chưa). | Test: không bao giờ có hai role cùng `instanceId`. Karsa/Slayder không nhân đôi. |
| 2 | `tacticsMatrix.ts:231` | TRADE_MAP sai độ ưu tiên toán tử: `a ?? 60 + (b ?? 60)`. Sửa thành `((a ?? 60) + (b ?? 60)) / 2`. | Test: đội cân bằng cho `teamMental` ≈ trung bình hai người. |
| 3 | `tacticsMatrix.ts:193` `getTacticRosterFit` | Clamp về [-5, 5] ở đúng một chỗ. | Test property: mọi đội, mọi chiến thuật nằm trong [-5, 5]. |
| 4 | `simulator.ts:181` | Đối thủ không nhận synergy, `eventRng` bị bỏ phí. Cho đối thủ `synergyBonus` (clamp [-8, 8]) và dao động từ `eventRng`, đối xứng với người chơi. **Sau đó chạy `balance-sim` và hiệu chỉnh lại OVR đối thủ ở `campaignData.ts`** theo bảng mục tiêu bên dưới. | `balance-sim` nằm trong dải mục tiêu. |
| 5 | `economyEngine.ts` `getTrainingCost`, `GameContext.tsx:232`, `TrainingView.tsx:17`, `FacilitiesView.tsx:15` | Perk `TRAINING_CENTER` (giảm 10% cấp 1, theo mô tả UI) chưa được áp. Truyền `tier` vào `getTrainingCost`. Rà các perk `SCOUT_OFFICE` và `STRATEGY_LAB`: perk nào chưa có code thì **sửa mô tả UI cho đúng thực tế** hoặc ẩn cấp đó. Facilities là P2 theo scope v2.2, nên ưu tiên sự trung thực của UI hơn là làm thêm tính năng. | Test: có tier 1 thì chi phí giảm 10%, UI và logic cùng một giá trị. |
| 6 | `MatchCenterModal.tsx:123`, `simulator.ts:411` | Hiện cả loạt BO3/BO5 được mô phỏng một lần với một bộ chiến thuật. Chuyển sang `simulateNextGame` (sub-seed đã độc lập theo `gameIndex`): ván 1 chọn đủ 3 pha, các ván sau theo `decisionPolicy` của `13` §4 (`FOCUS_1`, tổng quyết định 3/5/7 cho BO1/BO3/BO5). Hiển thị `wasOffScript`, `opponentTactic`, `keyMoment`, `winProbability`, `mvpName` đã được tính nhưng chưa render. | Người chơi đổi được chiến thuật giữa các ván; log hiện hành vi lệch bài của đối thủ. |
| 7 | `MatchCenterModal.tsx:430-443` | Tỉ số "trực tiếp" đang lộ kết quả cuối ngay từ pha đầu. Tính tỉ số chạy từ `games.slice(0, activeGameIndex)`. | Pha EARLY ván 1 hiện 0 - 0. |
| 8 | `PackOpeningModal.tsx:65` | `handleSkip` không hủy timer 800ms/2000ms nên thẻ bị đẩy về `BLOOM` rồi hiện lại, confetti bắn hai lần. Lưu timer trong `useRef`, hủy khi skip, chỉ bắn hiệu ứng khi chưa `REVEALED`. | Test fake-timer: sau Skip không có chuyển trạng thái nào nữa. |
| 9 | `Navbar.tsx:50` | Header rộng 447px ở viewport 390px. Ẩn chữ wordmark dưới `sm`, giảm gap, bỏ `shrink-0`, thêm `min-w-0`. | Đo bằng Playwright 390x844: `scrollWidth <= clientWidth`, nút khôi phục và nút âm thanh nằm trong màn hình kể cả khi credits có dấu phân cách nghìn. |
| 10 | `MatchCenterModal.tsx:647`, `HubView.tsx:72-76`, `CampaignView.tsx:190` | Thi lại chương đã vượt vẫn hứa thưởng và có nút "Nhận Thưởng" nhưng không phát gì. Chống farm là đúng, vậy UI phải nói thẳng "Giao hữu: không thưởng". Dùng giá trị trả về của `claimChapterReward`. Sửa quảng cáo thưởng 10,000 ở Hub nếu không có logic thật. | Test: thi lại không đổi credits và UI không hứa thưởng. |
| 11 | `simulator.ts:366`, `:459`, `MatchCenterModal.tsx:635` | Counterfactual: bỏ câu "tối ưu hơn (+0%)" khi chênh lệch bằng 0; chọn lựa chọn thay thế có `abs(diff)` lớn nhất trong cả 3 pha (không chỉ `games[0]`/pha EARLY); viết theo mẫu `13` §5 kèm một gợi ý hành động; dịch enum archetype sang tiếng Việt. | Test: câu giải thích khớp dấu của `diff`. |
| 12 | `cardCatalog.ts:668`, `TrainingView.tsx:151` | `ovr` hiển thị đang tách khỏi chỉ số mô phỏng; `championPool` không dùng trong công thức nào nhưng vẫn tăng OVR; chỉ số chạm 99 vẫn cho train ("99 -> 101"). Quyết định: hoặc cho `championPool` có tác dụng thật (ví dụ hệ số nhỏ vào `getTacticRosterFit`), hoặc bỏ khỏi menu train. Chặn train khi đã chạm trần, xám hóa chỉ số đầy. Hiển thị `trainingMaterials`/`scoutTickets` hoặc ngừng thưởng. | Test: `computeCardOvr(getEffectiveCardStats(card))` = OVR hiển thị. |
| 13 | `GameContext.tsx` | Chống soft-lock: hết credits thì phải có nguồn thu nhỏ (giao hữu có thưởng thấp và trần mỗi ngày, hoặc tài trợ khi thua theo `14` chỉ tiêu 3). Bọc ghi `localStorage` trong một khóa duy nhất có `version`, giới hạn kích thước `ledger`. Dùng `isLoading` để không nháy Onboarding với người chơi cũ. ID dùng bộ đếm hoặc `crypto.randomUUID()` thay vì `Date.now()`. | Test: người chơi 0 credits luôn có đường kiếm lại. |
| 14 | `App.tsx:62`, `index.html:2` | Class `font-sans` đè mất `Be Vietnam Pro`; `<html lang="en">` trong khi nội dung tiếng Việt. Sửa cả hai. | Font tính toán đúng bằng `getComputedStyle`. |

**Bảng mục tiêu win-rate (đề xuất, ghi vào `DECISIONS.md` để chủ dự án xác nhận)** với chiến thuật mặc định, sau khi sửa mục 4:

| Chương | Đội mẫu | Win-rate mục tiêu |
|---|---|---|
| 1 (BO1) | 5 thẻ khởi đầu | 65-72% |
| 2 (BO3) | khởi đầu + 1 Rare | 50-60% |
| 3 (BO3) | 2 Rare | 45-55% |
| 4 (BO3) | 3 Rare | 45-55% |
| 5 (BO5) | toàn Rare + 1 Epic | 45-55% |

Hiện tại (đo trước khi sửa, đội khởi đầu): 66-69% / 46% / 26% / 20% / 5%. Chương 3-5 đang quá khó, nhưng việc cho đối thủ nhận synergy sẽ làm khó thêm, nên phải hiệu chỉnh OVR đối thủ.

---

## 4. Phase 3: tích hợp dữ liệu Golden Road

### 4.1 Đây là cái gì

`docs/ref/golden_road/` là mã nguồn một game fan khác (goldenroadlol.com): quay Region -> Team -> Year, chọn tuyển thủ cho từng role, rồi mô phỏng 6 chặng (Split 1, First Stand, Split 2, MSI, Split 3, Worlds). Nó **không phải** simulator theo pha; nó chỉ cho thứ ta chưa có: **dữ liệu lịch sử lớn** và **một vòng chơi draft ngắn**.

Đã đo bằng script (đừng tin số này mù, hãy chạy lại):

- `data.js`: `GAME_TEAMS` gồm **73 đội, 129 đội hình theo năm, 649 mùa tuyển thủ, 374 tuyển thủ**, năm **2011-2025**, 12 khu vực. Schema: `{ id, name, region, rosters: { [year]: { TOP|JNG|MID|ADC|SUP: [[name, rating], ...] } } }`. Có 4 đội hình có thêm người dự bị (mảng dài hơn 1).
- `rating`: 76-98, trung bình 84.8. Phân bố: 75-79 có 34, 80-84 có 315, 85-89 có 220, 90-94 có 71, 95+ có 9. Đây là điểm do tác giả chấm tay, **bị nén ở khoảng cao**, nên không thể dùng thẳng làm `baseOvr`.
- Phủ khu vực: LCS 18 đội, LEC 16, LCK 14, LPL 12, LMS 3, CBLOL 3, TCL 2, và mỗi khu vực PCS/VCS/LJL/LLA/LCL một đội. **VCS chỉ có GAM Esports 2017, LCP không có, PCS chỉ có PSG Talon 2021.** Dữ liệu này mạnh về lịch sử toàn cầu, yếu về đúng khu vực mà game nhắm tới.
- 6 tuyển thủ đổi role giữa các mùa (xiaohu, xpeke, kikis, perkz, zven, huhi): khớp với `primaryRole` + `secondaryRole` của `PlayerIdentity`. Không có hai tuyển thủ trùng slug và không có ai vào hai đội cùng năm.
- Trùng với catalog hiện tại của ta: Faker, Ruler, Karsa, SofM, Maple, Levi, Optimus. Phải gộp theo slug, không tạo bản sao.
- `engine.js` là logic thuần (không DOM), dùng `Math.random`. `game.js` là UI dựng bằng chuỗi `innerHTML`. **Không port cả hai**; chỉ học luật chơi từ chúng (xem 4.2 mục 6). File header nhắc tới `test.js` nhưng file này không có trong thư mục.
- Đây là một site thương mại: `style.css` có banner đồng ý quảng cáo (dòng 75) và nút Ko-fi (dòng ~1062), `game.js` có `supportBlock`. Điều này làm rủi ro "copied commercial game assets" của cuộc thi (`11` §2) trở nên thật.

Các ý tưởng đáng học từ nó: pool quay "không bao giờ bế tắc" (`usableCombos` chỉ giữ combo còn người chưa dùng ở role còn trống), 3 lượt quay lại dùng một lần (Region/Team/Year), ảnh chia sẻ vẽ bằng canvas, i18n vi/en, bản đồ "con đường" 6 chặng.

### 4.2 Rào chắn pháp lý và bản quyền (làm trước, không bỏ qua)

1. **Điểm `rating` của Golden Road: chủ dự án đã có quyền tham khảo, dùng và điều chỉnh (Q1, đã trả lời 03/11/2026).** Vậy được phép dùng chúng làm giá trị khởi đầu. Quy ước: mỗi edition mang `ratingSource` là `golden_road` (giữ nguyên), `adjusted` (đã chỉnh tay hoặc theo công thức, ghi `ratingNote`) hoặc `derived` (không có trong dataset, ví dụ người chơi VCS/LCP 2026, tính bằng `deriveRating(player, team, year, role)` với công thức riêng có tài liệu). Việc chỉnh nằm trong một file ghi đè riêng (ví dụ `src/data/ratingOverrides.ts`), không sửa tay file sinh ra. Giữ lời cấp quyền ngoài repo công khai và ghi vào `docs/11_RIGHTS_SOURCES.md` rằng nó đã có. Nếu bên cấp quyền yêu cầu ghi công, thêm vào màn hình Credits (Q6, còn mở).
2. **Tên đội/CLB: được phép hiển thị tên thật (DEC-3, đã chốt theo chủ dự án).** `ENABLE_REAL_CLUB_NAMES` mặc định `true`, giữ cờ để tắt nhanh về `teamAlias` nếu sau này có vấn đề. Logo và ảnh được phép về nguyên tắc nhưng **nằm ngoài work order này** (repo chưa có file asset nào được duyệt): vẫn dùng placeholder cho đến khi có `asset_license` từng asset (`11` §1).
3. **Tên tuyển thủ, tên CLB và việc dùng trong game: chủ dự án khẳng định email của Riot bao phủ mọi thứ, không giới hạn (Q2, đã trả lời 03/11/2026).** Coi đó là ràng buộc của dự án, đừng tự đặt thêm giới hạn. Việc còn lại chỉ là sổ sách: lưu bằng chứng email ngoài repo công khai (`asset_license`), và vẫn hiện disclaimer mô phỏng của `11` §5 cùng việc không tuyên bố đây là sản phẩm chính thức của Riot/Acer.
4. **Không sao chép** icon role chính thức: `game.js` đặt `USE_OFFICIAL_ICONS = true` trỏ tới `icons/*.png`. Dùng icon SVG tự vẽ của ta.
5. **Tiểu sử tuyển thủ**: `cardCatalog.ts` (dòng ~18, 28, 38, 48, 58, 70...) đang chứa họ tên đầy đủ và tiểu sử như "Nhà vô địch VCS từng khoác áo CERBERUS và Team Whales". Đây là thông tin về người thật mà repo không có nguồn. Mỗi câu phải có nguồn trong `research/LINKS_AND_FACT_CHECK.md` hoặc bị thay bằng mô tả trung tính về lối chơi (không nêu họ tên đời thực, tuổi, quê quán, thành tích).
6. **Clean-room (DEC-9).** `agents/IMPLEMENTATION_PROMPT.md` dòng 16 cấm "copy existing game code/UI". Vì vậy: không dán, không dịch từng dòng, không giữ nguyên tên hàm/biến của `engine.js` và `game.js`; không dùng lại văn bản giao diện (`LOCALES`), CSS, bố cục ảnh chia sẻ, bản đồ "con đường" hay bất kỳ chuỗi hiển thị nào. Viết lại từ **đặc tả hành vi** bạn tự rút ra (ví dụ "pool quay không bao giờ bế tắc", "3 lượt quay lại dùng một lần"), bằng cấu trúc dữ liệu và tên của riêng ta. Nếu cần đối chiếu, đọc xong thì đóng file rồi mới viết.

### 4.3 Việc cần làm (theo thứ tự ưu tiên và rủi ro)

**G0. Importer (nền cho mọi thứ khác, ~0.5 ngày).**
- `scripts/import-golden-road.ts` đọc **dữ kiện** (đội, năm, role, tên tuyển thủ) từ `docs/ref/golden_road/data.js` (đánh giá bằng `new Function` trong script build, không có trong app) và sinh `src/data/generated/legacyEditions.json` (commit file sinh ra, kèm checksum). Rating theo mục 4.2 điều 1. Không đưa `docs/ref` vào bundle.
- Các đoạn dưới đây nói về "rating gốc" (phân bố, mapping) là **dữ liệu đầu vào**. Dòng `ratingSource: 'derived'` (người không có trong dataset) phải đi qua cùng mapping và cho phân bố tương đương, để thẻ lịch sử và thẻ 2026 so sánh được với nhau.
- Map role: `JNG -> JUNGLE`, `ADC -> BOT`, `SUP -> SUPPORT`. Dựng `PlayerIdentity` (374) và `PlayerCardEdition` với `editionCode: 'LEGACY'`, `editionYear`, `rarity` theo dải trong `config/balance.initial.json` (Common 55-69, Rare 70-79, Epic 80-89, Legendary 90-96).
- **Remap rating -> baseOvr phải đơn điệu** (giữ thứ hạng). Dùng thẳng giá trị gốc sẽ cho 535/649 thẻ Epic và 80 thẻ Legendary, vô nghĩa. Mapping đề xuất (kiểm chứng và chỉnh): 76-80 -> 55-69, 80-86 -> 70-79, 86-91 -> 80-89, 91-98 -> 90-96. Đã thử: cho 81 Common, 365 Rare, 166 Epic, 37 Legendary. Chốt neo mapping trong `DECISIONS.md` và có test đơn điệu + test đếm theo dải.
- Sinh 5 chỉ số (`mechanics, macro, teamwork, mental, championPool`) **tất định** từ `hash(playerId|year)` theo hình dạng role (ví dụ SUPPORT nghiêng `teamwork/macro`, BOT nghiêng `mechanics`), rồi co giãn để `computeCardOvr(stats)` nằm trong ±1 của `baseOvr`. Không dùng `Math.random`. Test: OVR hiển thị bằng OVR tính từ chỉ số.
- Gộp theo slug với 30 thẻ hiện tại; thẻ campaign-critical giữ nguyên id. Bắt buộc có `provenance` (`ratingSource`, `datasetVersion`, `importedAt`).
- Thẻ Legacy **không vào bảng pack hiện tại** (không đổi `packTableVersion`, không đổi pity). Chỉ lấy qua mốc thưởng hoặc chế độ Golden Road ở G3.

**G1. Demo "Chung Kết Thế Giới" dựa trên dữ liệu thật (P1, ~1 ngày).**
- Hiện tại `WORLD_CHAMPIONSHIP_DEMO_SCENARIO` khai báo ratings {89, 90, 91} nhưng roster tính ra {89, 89, 89}, và người chơi thắng khoảng 86% dù được kể là phía yếu. Dựng lại bằng dữ liệu Legacy: hai đội hình lịch sử cùng một năm, ví dụ trận chung kết Worlds 2024 (T1 và BLG đều có trong dataset: T1 2024 = Zeus 89, Oner 90, Faker 90, Gumayusi 89, Keria 92; BLG 2024 = Bin 92, Xun 88, knight 91, Elk 89, ON 87; kết quả thật 3-2 cho T1, hãy xác minh trước khi ghi). Tên đội hiển thị theo DEC-3 (thật hoặc `teamAlias` tùy cờ).
- Phải đối xứng (đối thủ nhận synergy), có 5-7 điểm quyết định để đủ khoảng 3 phút, **không ghi gì vào save sự nghiệp**. Giữ `WorldDemoModal` không import `useGame`. Thêm test chụp snapshot `localStorage` trước và sau demo, phải giống hệt.
- Ratings khai báo phải **tính ra từ roster**, không gõ tay.

**G2. Đối thủ và thị trường từ dataset (P1, ~0.5 ngày).**
- Sinh đối thủ chương 6-12 (loại trực tiếp, hư cấu, có nhãn) từ đội hình Legacy theo `seed`; không bao giờ đưa LCK/LPL vào đường sự nghiệp (chỉ làm đối thủ, theo `docs/CLAUDE.md`).
- Thay thị trường chuyển nhượng tĩnh (6 thẻ Rare giá 1600, `expiresInSeconds` không dùng) bằng danh sách sinh tất định theo ngày, lấy từ pool Legacy, có giá theo rarity. Đừng làm Transfer thành tính năng lớn: NPC Transfer là P2 theo scope v2.2, chỉ cần đủ để không còn dữ liệu chết.

**G3. Chế độ "Golden Road Draft" (P2, sau feature flag, làm sau khi G0-G2 và Phase 2 đã xong, ~1-1.5 ngày). Hạn đã giãn nên nằm trong kế hoạch, không còn là mục "cắt đầu tiên".**
- **Viết lại clean-room** (DEC-9, không port `engine.js`) tại `src/lib/legacyDraft/` với RNG tất định (`Mulberry32` từ `seededRng.ts`), nhận `seed`; bất biến "không bao giờ bế tắc" có test property. Bản gốc có một lỗi biên cần tránh: khi không còn combo hợp lệ, `spinInitial` trả `null` và UI vỡ; bản của ta phải xử lý trường hợp đó.
- Luật (rút từ việc chơi thử bản gốc, không phải từ mã): 5 role, 3 lượt quay lại dùng một lần (Khu vực, Đội, Năm), không dùng một tuyển thủ hai lần, chỉ được chọn người ở role còn trống.
- Thay mô hình xếp hạng Gaussian của bản gốc bằng `simulateSeries` chạy đúng bracket 6 chặng với đối thủ Legacy hư cấu, chiến thuật theo `decisionPolicy`, để mọi thứ nhất quán với simulator chính. (Phương án nhanh: giữ Gaussian làm chế độ "Quick Sim".)
- Thưởng: mở khóa thẻ Legacy và một ít credits, có trần mỗi ngày, mỗi seed chỉ thưởng một lần (chống farm). Ảnh chia sẻ dùng canvas theo bảng màu Crisp Industrial (Slate, Amber `#FFB800`, Cobalt, Crimson), không tím, không emoji.
- Flag `FEATURE_GOLDEN_ROAD`: phát triển với cờ tắt, **bật trong bản nộp chỉ khi** toàn bộ acceptance F0/R1 đã xanh và QA 390x844 + iframe đạt. Không đạt thì để tắt.

**G4. Dữ liệu LCP/VCS thực (nghiên cứu web ngày 03/11/2026, xem 4.4).** Dataset Golden Road không có LCP và gần như không có VCS. Bổ sung một lớp dữ liệu nhỏ, có nguồn, cho các thẻ `CHAMPION 2026` của người Việt, **mỗi bản ghi phải có `source`, `confidence`, `retrievedAt`**. Nếu không xác minh được: `confidence: 'low'`, ghi `unverified`, tuyệt đối không bịa.

### 4.4 Dữ liệu web đã thu thập (03/11/2026, chưa xác minh chéo hết)

Các nguồn Liquipedia (HTTP 403) và Leaguepedia/Fandom (HTTP 402) đã chặn công cụ fetch ở lượt nghiên cứu này, nên **không lấy được đội hình VCS đầy đủ**. Việc đầu tiên của bạn ở G4 là thử lấy từ nguồn truy cập được (Wikipedia, lolesports.com, trang đội trên Sheep Esports, GGScore) hoặc API có User-Agent hợp lệ; nếu vẫn không được, để trống và ghi rõ.

| Dữ kiện | Giá trị | Nguồn | Độ tin cậy |
|---|---|---|---|
| LCP 2026 gồm 8 đội: Team Secret Whales (VN, khách), MVK Esports (VN, khách), Relove Deep Cross Gaming (TW, khách), Ground Zero Gaming (TW, khách), DetonatioN FocusMe (JP, khách), CTBC Flying Oyster, GAM Esports, SoftBank Hawks (đối tác) | xem trái | https://en.wikipedia.org/wiki/2026_LCP_season | Cao |
| Thể thức LCP 2026: 3 split; Split 1 và 2 vòng tròn một lượt BO3, top 6 vào playoff double-elim toàn BO5; Split 3 Swiss rồi double-elim; có điểm chức vô địch | xem trái | cùng trang | Cao |
| Kết quả: Team Secret Whales vô địch cả 3 split; suất Worlds 2026 của LCP: Team Secret Whales, CTBC Flying Oyster, MVK Esports | xem trái | cùng trang | Cao |
| Đội hình Team Secret Whales: Pun (TOP), Hizto (JNG), Dire (MID), Eddie (BOT), Bie (SUP) | xem trái | Sheep Esports, GGScore (kết quả tìm kiếm) | Trung bình |
| Giải thưởng: Dire là MVP chung kết Split 1, Hizto là MVP chung kết Split 2 và MVP mùa | xem trái | Wikipedia 2026 LCP season | Cao |
| GAM Esports Split 1: Kiaya (TOP), Draktharr (JNG), Aress (MID), Artemis (BOT), Taki (SUP), HLV Naul; Levi giải nghệ trước mùa | xem trái | Sheep Esports "GAM completed 2026 LCP roster" | Thấp: có nguồn khác ghi Gloryy đi mid và Draktharr rời đội giữa tháng 9 |
| MSI 2026: Hanwha Life Esports thắng Bilibili Gaming 3-2 tại Daejeon (28/06-12/07). First Stand 2026: Bilibili Gaming thắng G2 tại São Paulo | xem trái | nhiều trang tin (Sheep Esports, GosuGamers, esports.gg) | Trung bình |
| Worlds 2026: 19 đội; Play-In 4 đội (double-elim BO5), Swiss 16 đội 5 vòng (BO3 khi quyết định đi tiếp/bị loại, còn lại BO1), Knockout 8 đội BO5; Fearless Draft cho series BO3/BO5; suất: LCK 3, LPL 3, LEC 3, LCS 3, LCP 3, CBLOL 2, cộng nhà vô địch MSI và vùng đứng nhì MSI; 15/10-14/11, chung kết tại Barclays Center | xem trái | https://blog.loltheory.gg/how-lol-worlds-works/ | Thấp: blog bên thứ ba, cập nhật 25/08/2026, tự ghi danh sách đội chưa chốt. Đối chiếu với https://lolesports.com Worlds 2026 primer trước khi dùng |
| Team Secret Whales thua LYON ở trận mở màn Worlds 2026 | xem trái | Sheep Esports (kết quả tìm kiếm) | Thấp |

Điều cần làm với bảng này: đưa các dòng đã đủ tin cậy vào `docs/research/LINKS_AND_FACT_CHECK.md` kèm ngày truy cập; **đừng đưa dòng độ tin cậy Thấp vào dữ liệu game** mà chưa xác minh. Cẩn thận ranh giới "thực tế và hư cấu" ở `docs/CLAUDE.md`: số suất và thể thức Worlds 2027 vẫn chưa được xác minh.

---

## 5. Phase 4: nghiệm thu, tài liệu, triển khai

- Chạy và dán output: `bun install --frozen-lockfile`, `bun run typecheck`, `bun run test`, `bun run build`, `bun scripts/balance-sim.ts`.
- Playwright: luồng F0 đầy đủ ở viewport 390x844; luồng reload; mở pack có Skip; harness `iframe` cross-origin (storage bị chặn, hiện banner, Recovery Code khôi phục được).
- Quét lại: không còn class `purple|indigo|violet`; không emoji trong UI; không `Math.random` trong `src/lib/`.
- Triển khai: xóa `public/assets/aistudio/*.md` khỏi bundle công khai (đang lộ cả tài liệu nội bộ về quyền); gỡ `@google/genai`, `express`, `dotenv`, `.env.example`, `metadata.json` nếu không dùng; sửa script `clean` (hiện dùng `rm -rf`, hỏng trên Windows); viết lại `README.md` (hiện là mẫu AI Studio).
- Tài liệu: cập nhật `docs/DECISIONS.md` (đã có; chỉ thêm kết quả thực tế và câu hỏi mới, không đổi trạng thái "Đề xuất" thành "Đã chốt"); đánh dấu các mục đã xong trong `docs/index.md` (M9) **kèm bằng chứng**; thêm entry `docs/CHANGELOG.md` và tăng `rulesVersion` trong `config` nếu gameplay đổi (win-rate, đối thủ, perk); **tái sinh** `FILE_MANIFEST.json` bằng script (không sửa tay).
- Truy cập: `role="dialog"`, `aria-label`, đóng bằng Esc, focus trap cho các modal; nút tối thiểu 44px; `prefers-reduced-motion`.

---

## 6. Thứ tự thực hiện (hạn nộp đã giãn, ngày mới chưa ghi: `DECISIONS.md` Q5)

Hạn nộp đã được giãn nên **không có lịch ép và không có thứ tự cắt phạm vi**. Giữ nguyên thứ tự phụ thuộc dưới đây; ước lượng ngày làm việc chỉ để lập kế hoạch.

| Bước | Việc | Ước lượng |
|---|---|---|
| 1 | Phase 0 (nền test) + Phase 1 (P0-1, P0-2) | 1-2 ngày |
| 2 | Phase 2 mục 1-11 | 2-3 ngày |
| 3 | Phase 2 mục 12-14 + G0 importer | 1-2 ngày |
| 4 | G1 demo Chung Kết Thế Giới | 1 ngày |
| 5 | G2 đối thủ và thị trường từ dữ liệu | 0.5-1 ngày |
| 6 | G4 dữ liệu LCP/VCS thật (có nguồn và độ tin cậy) | 0.5-1 ngày |
| 7 | G3 Golden Road Draft (sau cờ) | 1-1.5 ngày |
| 8 | Phase 4: QA toàn bộ, deploy thử, đóng băng tính năng | 1-2 ngày |

Có thêm thời gian không có nghĩa là làm thêm tính năng trước khi sửa lỗi: **Phase 1 và Phase 2 xong và xanh rồi mới được bắt đầu G3.** Khi chủ dự án báo ngày nộp mới, tính ngược để đặt ngày đóng băng tính năng (cách ngày nộp tối thiểu 2 ngày làm việc) và ghi vào `docs/index.md`.

## 7. Định dạng báo cáo cuối mỗi phase

1. Danh sách thay đổi (file:dòng).
2. Lệnh đã chạy và output (dán nguyên văn phần quan trọng).
3. Bằng chứng nghiệm thu cho từng mục (test nào xanh, ảnh chụp hoặc số đo nào).
4. Blocker và quyết định cần chủ dự án.
5. Mục nào bạn **không** làm và vì sao.
