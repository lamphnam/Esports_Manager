# Contest, quyền sử dụng và nguồn

Cập nhật 03/11/2026. Gồm điều lệ phần thi Công nghệ của Road to Predator League 2027, cách dự án tuân thủ, quyền sử dụng tài sản và dữ liệu, và bảng đối chiếu dữ kiện. **Điều lệ có thể thay đổi: luôn đối chiếu bản hiện hành tại thời điểm nộp.**

## 1. Điều lệ phần thi Công nghệ (đọc 03/11/2026)

Nguồn: `https://predatorleague.acervietnam.com.vn/terms?tab=technology` (tab "Điều lệ Phần thi Công nghệ"). Trang render bằng JavaScript nên nội dung được lấy từ bundle `terms-*.js`; có thể còn sót vài câu ngắn. Trang `/portal/technology` yêu cầu **đăng nhập Portal** (chuyển sang `/join`) nên **chưa đọc được**: nếu có yêu cầu bổ sung trong đó (ví dụ thuộc tính `sandbox`/`allow` của iframe, mẫu nộp bài) cần dán lại để đối chiếu.

**Thời gian và đối tượng**
- Nộp sản phẩm: **26/10/2026 đến hết 15/11/2026**. Bình chọn: 26/10 đến hết **22/11/2026**. (Chủ dự án xác nhận 03/11: hạn là 15/11, không giãn.)
- Tác giả hoặc nhóm tối đa 5 sinh viên cùng một trường. Dự án này là cá nhân.

**Nền tảng**
- Game chơi trên website, BTC nhúng bằng **iframe** tới nơi sinh viên host. **Không host trên Portal.** Sinh viên tự chịu chi phí.
- Sinh viên có thể giữ nguyên URL đã nộp và thay toàn bộ nội dung, nhưng **phải báo BTC duyệt lại**; BTC có thể tạm ngừng nhúng nếu phát hiện thay đổi không khai báo.

**Nội dung và bản quyền**
- Không dùng tác phẩm có bản quyền (hình ảnh, video, âm thanh) chưa được tác giả cho phép; sinh viên chịu trách nhiệm với BTC và pháp luật.
- Không sao chép nguyên vẹn hoặc gần như hoàn toàn game thương mại được bảo hộ khi chưa có ủy quyền.
- Không cổ xúy vi phạm pháp luật; không bạo lực, máu me; không chính trị, tôn giáo, kích động thù địch hay trái thuần phong mỹ tục.
- Sinh viên cho phép BTC dùng ảnh/video gameplay để giới thiệu và chấm thi.

**AI**
- Được dùng mọi LLM/AI Agent trong toàn bộ quá trình làm game. Sinh viên kiểm duyệt đầu ra, không tạo sản phẩm phái sinh xâm phạm bản quyền, và **game phải có đánh dấu sử dụng AI nếu có dùng theo pháp luật Việt Nam**.

**Cấm**
- Tệp chứa mã độc, spyware, mã khai thác; tấn công hay phá hạ tầng Portal.
- Thu thập mật khẩu Portal; yêu cầu đăng nhập tài khoản BTC trong game; tự chuyển hướng hoặc lừa đảo; lấy dữ liệu người chơi vượt phạm vi công bố; truy cập trái phép quyền riêng tư, kể cả **microphone, camera**.

**Bình chọn và xử lý**
- Mọi sinh viên có tài khoản Portal đều trải nghiệm và bình chọn được. **1 vote/sinh viên/game**; một vote hợp lệ = 0,05 Điểm Predator cá nhân và 0,2 điểm trường (có thể đổi theo tình hình). Bình chọn diễn ra trên Portal, **không bao giờ mô phỏng trong game**.
- Game vi phạm không được đưa lên trang bình chọn; game đã duyệt mà vi phạm thì BTC thu hồi phê duyệt không cần báo trước. Xử lý gồm xóa game, trừ điểm, báo nhà trường, xóa tài khoản.
- Khiếu nại qua kênh BTC kèm bằng chứng như **mã nguồn gốc, tài liệu thiết kế, prompt log AI, nhật ký phát triển**. Quyết định của BTC là cuối cùng.
- Sinh viên chịu trách nhiệm toàn bộ về game gửi BTC (bản quyền, AI, nội dung).

## 2. Đối chiếu dự án

| Quy định | Trạng thái |
|---|---|
| Web + iframe, không host Portal | Đạt về kiến trúc (static, [ARCHITECTURE.md](ARCHITECTURE.md)); **chưa deploy và chưa thử nhúng thật** |
| Không đăng nhập Portal, không camera/mic, không chuyển hướng, không mã độc | Đạt theo code (không có lời gọi mạng ngoài Google Fonts, không `getUserMedia`, không redirect); QA thủ công trước khi nộp |
| Không thu thập dữ liệu vượt phạm vi | Đạt: không backend, không tracking; chỉ Google Fonts (lộ IP cho Google), có thể tự host font |
| Không bạo lực/máu me, không chính trị/tôn giáo | Đạt: giao tranh là thuật ngữ thể thao; rà lại copy trước khi nộp |
| Bản quyền hình/âm thanh | Toàn bộ hình là placeholder tự vẽ; âm thanh tổng hợp bằng WebAudio (`audioSynth.ts`) |
| Không sao chép game thương mại | Engine và UI viết độc lập; Golden Road chỉ cung cấp rating/dữ kiện (§7) |
| Đánh dấu dùng AI | Chủ dự án khai ở **ô riêng khi nộp bài trên Portal** nên không thêm trong game (DEC-11). Nếu BTC yêu cầu hiển thị trong game, thêm một dòng ở footer `App.tsx` |
| Giữ bằng chứng (code, thiết kế, prompt log AI, nhật ký dev) | Git history + `docs/`; **giữ prompt log AI** ngoài repo nếu có |
| Đổi nội dung sau duyệt phải báo BTC | Quy trình: đóng băng tính năng trước hạn; sau nộp chỉ sửa lỗi và báo BTC |

## 3. Cần BTC hoặc Portal xác nhận

1. **Origin trang nhúng game** (để quyết định `frame-ancestors`) và **thuộc tính iframe** (`sandbox`, `allow`). Nếu `sandbox` thiếu `allow-same-origin` thì `localStorage` bị chặn; game vẫn chơi được nhờ banner và Recovery Code.
2. Thời gian BTC duyệt (game phải được duyệt mới lên trang bình chọn: nộp sớm để có thêm ngày bình chọn).
3. Cách khai báo AI và các thông tin khác ở form nộp.

## 4. Quyền, thương hiệu và disclaimer

- Chủ dự án khẳng định đã có email của Riot cho phép dùng **tên và hình tuyển thủ**, và (03/11/2026, DECISIONS Q2) phạm vi là toàn bộ, không giới hạn. Nội dung email **chưa được kiểm tra bởi agent**; bằng chứng giữ **ngoài repo công khai**. Trang chính sách công khai của Riot ("Legal Jibber Jabber", bản 08/2018) chặt hơn: chỉ fan project phi thương mại, cần disclaimer rõ, cấm logo/nhãn hiệu không có giấy phép và cấm dùng IP của Riot trong game. Coi email của chủ dự án là ràng buộc của dự án, trang công khai chỉ để tham khảo.
- **Tên CLB thật bật** (`ENABLE_REAL_CLUB_NAMES=true`, DEC-3), có alias cho đội lịch sử. Nhãn hiệu Acer/Predator League **không thuộc quyền Riot cấp**; không dùng logo giải. Không bao giờ tự nhận là sản phẩm chính thức của Riot hay Acer.
- **Disclaimer trong game** (footer `App.tsx`): "Trò chơi mô phỏng sự nghiệp esports, sử dụng quy tắc và chỉ số giải trí. Lịch, thể thức và điều kiện tham dự được giản lược; không phản ánh đầy đủ hệ thống thi đấu chính thức. Đây không phải sản phẩm chính thức của Riot/Acer." Kèm dòng ghi nguồn rating Golden Road.
- Predator Cup/"APAC Invitational": không bao giờ liên thông tới LCP hay Worlds; chỉ bật khi quyền thương hiệu Acer rõ.

## 5. Quy tắc `asset_license` cho ảnh và logo

Hiện chỉ có **5 icon vị trí** (bên dưới) là asset thật trong repo; mọi hình khác là placeholder hình học/SVG. Trước khi thêm bất kỳ file nào, ghi cho từng asset: `assetId`, tên tuyển thủ, `sourceURI`, chủ bản quyền, tham chiếu email cấp quyền, phạm vi dùng được, chỉnh sửa phái sinh được phép, phạm vi contest/thương mại, lãnh thổ, hạn, ghi công, ngày duyệt, hash file. Không lưu nội dung email riêng tư trong repo công khai. Lý do: bản quyền ảnh/logo có thể thuộc CLB hay nhiếp ảnh gia độc lập với quyền tên/hình người. Kiểm tra email áp dụng cho **game này, cuộc thi, hosting và phân phối**, và cho phép biến đổi chân dung nếu cần.

**Asset đầu tiên được lên kế hoạch: 5 icon vị trí** (Top, Jungle, Mid, Bot, Support) từ League of Legends Wiki (`wiki.leagueoflegends.com/en-us/images/{Top,Jungle,Middle,Bottom,Support}_icon.png`), nội dung thuộc Riot Games. Chủ dự án yêu cầu dùng (03/11/2026) và khẳng định email Riot bao phủ mọi thứ (Q2). Cách thêm: **tự lưu 5 file về máy** (wiki chặn tải tự động) rồi đặt tên `top.png`, `jungle.png`, `mid.png`, `bot.png`, `support.png` trong `src/assets/roles/`; game tự dùng chúng thay icon SVG (`RoleIcon.tsx`), đóng gói cùng bản build, **không gắn link trực tiếp** tới wiki (tránh request bên thứ ba và lộ IP người chơi). Đã thêm 5 file, bảng dưới ghi lại.

| assetId | sourceURI | chủ bản quyền | tham chiếu cấp quyền | phạm vi | hash file | ngày duyệt |
|---|---|---|---|---|---|---|
| `role-top`, `role-jungle`, `role-mid`, `role-bot`, `role-support` | URL wiki ở trên | Riot Games | email Riot (chủ dự án, giữ ngoài repo) | game này, cuộc thi, hosting và phân phối theo email | sha256 (16 ký tự đầu): Bottom_icon.png: e31f52d0a22510a1…; Jungle_icon.png: 09199a7a04d55365…; Middle_icon.png: 8ab75f9db816711a…; Support_icon.png: 8ec24b2853ab0e26…; Top_icon.png: 2b7763dd473c0eee… | 03/11/2026 (chủ dự án thêm file) |

## 6. Nguồn và đối chiếu dữ kiện

**Liên kết chính thức**
- LCP 2027 (21/09/2026): https://lolesports.com/en-SG/lolesports/news/a-more-open-lcp-ecosystem-in-2027
- Road to VCS / VCS 2026: https://lolesports.com/vi-VN/news/gioi-thieu-vcs-
- Worlds 2026 primer: https://lolesports.com/en-GB/news/worlds-2026-primer
- Predator League 2027: https://www.predator-league.com/about
- Điều lệ cuộc thi: https://predatorleague.acervietnam.com.vn/terms?tab=technology

**Độ tin cậy:** High = đọc trực tiếp trên trang; Medium = nhất quán qua nhiều nguồn thứ cấp; Low = nguồn đơn hoặc mâu thuẫn. **Không đưa dòng Low vào dữ liệu game** nếu chưa kiểm với trang chính thức. Các dữ kiện dưới đây mô tả 2026, **không phải cơ sở cho format 2027**.

| Dữ kiện | Giá trị | Nguồn | Độ tin cậy |
|---|---|---|---|
| LCP 2027 đổi cơ chế | Mỗi split, đội mạnh từ VCS/PCS/LJL vào LCP; slot/format chưa công bố | lolesports.com (21/09/2026) | High |
| LCP 2026 | 8 đội, 3 split; split 1–2 vòng tròn BO3, top 6 vào playoff BO5; split 3 Swiss rồi double elimination | en.wikipedia.org/wiki/2026_LCP_season | High |
| LCP 2026 kết quả | Team Secret Whales vô địch cả 3 split; Worlds 2026 seed: TSW, CTBC Flying Oyster, MVK Esports | cùng nguồn | High |
| Team Secret Whales | Pun (TOP), Hizto (JNG), Dire (MID), Eddie (BOT), Bie (SUP) | lolesports.com (membership), Sheep Esports (role) | High cho membership, Medium cho role |
| Chung kết Worlds 2024 | T1 thắng BLG 3–2 (02/11/2024); roster T1 Zeus/Oner/Faker/Gumayusi/Keria, BLG Bin/Xun/knight/Elk/ON | Comcast Spectacor, Wikipedia, LoL Esports VOD | High (kết quả), Medium (roster) |
| First Stand 2026 | Bilibili Gaming thắng G2 Esports ở chung kết, São Paulo | Sheep Esports, GosuGamers, esports.gg | Medium |
| MSI 2026 | Hanwha Life Esports thắng Bilibili Gaming 3–2, Daejeon, 28/06–12/07 | Sheep Esports | Medium |
| Worlds 2026 format | Play-In 4 đội (double elimination BO5), Swiss 16 đội, Knockout 8 đội BO5; Fearless Draft ở BO3/BO5 | blog bên thứ ba | **Low** (đối chiếu primer chính thức) |
| Worlds 2026 slot và lịch | LCK/LPL/LEC/LCS/LCP 3 suất… | blog bên thứ ba | **Low** |
| GAM Esports split 1 lineup | Kiaya, Draktharr, Aress, Artemis, Taki | Sheep Esports | **Low** (nguồn khác ghi Gloryy ở MID) |
| VCS 2025 cấu trúc, roster VCS, nhà vô địch theo năm | Không lấy được (Liquipedia 403, Leaguepedia 402) | — | **Chưa xác minh** |

Dữ kiện đã dùng trong game: năm bản ghi Team Secret Whales 2026 (`verified2026.ts`, đều Medium, `retrievedAt` 2026-11-03) và dữ kiện lịch sử phục vụ provenance demo (chung kết 2024). Chưa đóng: roster VCS 2025–2026, nhà vô địch VCS theo split, bảng slot Worlds 2026 chính thức; không bao giờ điền từ trí nhớ. Các dữ kiện nền ghi ở [GAME_DESIGN.md](GAME_DESIGN.md) §4 (LCP 2027, Road to VCS, Predator League 2027) **chưa được kiểm chứng lại** từ 27/10/2026 (lần 03/11 chỉ đọc lại điều lệ cuộc thi): đối chiếu bằng liên kết chính thức ở trên trước khi nộp.

| Khẳng định | Trạng thái | Cách dùng trong thiết kế |
|---|---|---|
| LCP 2027 nhận đội từ VCS/PCS/LJL theo split | thông báo chính thức | quy tắc thế giới cứng |
| Slot LCP 2027 và bracket chính xác | chưa công bố | tham số hư cấu, không gắn nhãn chính thức |
| Road to VCS grassroots 2026 | tham chiếu chính thức | cảm hứng, không phải quyền vào VCS |
| Worlds 2026 Swiss 3W/3L | chính thức 2026 | template lấy cảm hứng 2026 |
| Format Worlds 2027 | chưa xác lập | chờ `rulesVersion` mới |
| OVR thẻ, xác suất pack, rating boss | tham số game tự đặt | không phải sự thật lịch sử |
| Predator cup là vòng loại Worlds | **sai** | không bao giờ làm |

## 7. Dữ liệu bên thứ ba và dữ liệu Legacy

- **Golden Road (goldenroadlol.com)** là fan game bên thứ ba có quảng cáo và nút Ko-fi; coi như tác phẩm thương mại. Chủ dự án xác nhận (DECISIONS Q1) đã xin quyền **tham khảo, dùng và điều chỉnh điểm rating**; quyền này **chỉ bao phủ rating**, không bao phủ mã, UI, text, CSS, icon hay bố cục share-card (DEC-9: engine viết lại clean-room). Giữ nội dung cấp quyền ngoài repo công khai.
- `docs/ref/golden_road/` chỉ còn `data.js`, là nguồn đầu vào của importer, **không đóng gói** vào bundle (release-audit chặn). Mã/UI/CSS của nguồn tham khảo (`engine.js`, `game.js`, `style.css`, `index.html`) đã bị xóa khỏi repo 03/11 vì không còn dùng. `bun scripts/import-golden-road.ts` đọc `data.js` ở build time, sinh `src/data/generated/*.json` kèm SHA256 của nguồn và từng output; `--check` kiểm tái sinh. Chỉnh rating tại `src/data/ratingOverrides.ts`, không sửa tay JSON. Dataset: 73 đội, 129 team-years, 649 player-seasons, 374 người chơi, 2011–2025.
- **Độ phủ mỏng ở vùng quan trọng:** VCS chỉ có GAM Esports 2017, PCS có PSG Talon 2021, LCP không có; các thẻ đó dùng `ratingSource: 'derived'`. Roster Legacy nên được đối chiếu lại với Wikipedia hoặc lolesports.com trước khi dựa vào.
- Dòng ghi nguồn đang hiển thị ở footer. Câu hỏi bên cấp quyền có yêu cầu dòng ghi công cụ thể hay không (Q6) còn mở; mặc định đã áp dụng.
- Tiểu sử tuyển thủ trong game: mỗi câu phải có nguồn ở §6 hoặc thay bằng mô tả lối chơi trung tính; không họ tên đời thực, tuổi, quê quán (DEC-6).
- Điều khoản fan-project của Riot: xem §4; không mô tả chi tiết tên tuyển thủ/đội.
