# 02 — Campaign Research: sự thật & phần chuyển thể

**As-of:** 2026-10-27. Ưu tiên thông báo chính thức LoL Esports/Acer, không xem game adaptation là quy định thật.

## A. Verified facts
1. **LCP 2027 đổi cơ chế**: Riot thông báo ngày 21/09/2026 rằng mỗi split, các đội thi đấu ở hệ thống nội địa **VCS (VN), PCS, LJL**, đội tốt nhất giành quyền vào **LCP (giai đoạn tranh tài cấp APAC)**; LCP là đường vào global events cho APAC. Cấu trúc, slot và format chính xác từng split chờ công bố tiếp: https://lolesports.com/en-SG/lolesports/news/a-more-open-lcp-ecosystem-in-2027
2. **Road to VCS 2026** tồn tại; VCS có các vòng loại cho giải cộng đồng, giai đoạn Mùa Xuân/Hè; một số hoạt động phong trào/campus có liên hệ Road to VCS nhưng **không** có quy tắc mọi CLB sinh viên tự động vào VCS. https://lolesports.com/vi-VN/news/gioi-thieu-vcs-
3. **Worlds 2026** gồm Play-In BO5 double-elimination của 4 đội chọn 1 vào Swiss, Swiss 16 đội lên 3 thắng hoặc 3 thua, 8 đội Knockout BO5; **2027 format chưa phải bản cố định**. https://lolesports.com/en-GB/news/worlds-2026-primer
4. **Predator League 2027** dự kiến tổ chức tại Việt Nam tháng 01/2027, có LMHT và VALORANT; giải riêng của Acer, không phải vòng loại LCP/Worlds. https://www.predator-league.com/about
5. **Road to Predator League 2027 phần thi Công nghệ**: game web nhúng iframe do tác giả host, cho phép AI dev, cấm đánh cắp thông tin Portal/camera/mic/redirect, một vote/student/game; kiểm tra lại điều lệ thời điểm nộp tại https://predatorleague.acervietnam.com.vn/terms?tab=technology

## B. Important distinctions
- Campus -> Road to VCS là câu chuyện chuyển thể lấy cảm hứng từ hệ thống grassroots, không là quyền vào VCS mặc nhiên.
- VCS -> LCP có thể diễn ra lại **mỗi split** theo 2027, không 'vô địch một lần để giữ vé mãi'.
- **LCK/LPL là các khu vực độc lập**; CLB VN không thăng hạng từ LCP qua LCK/LPL. Tham gia bằng **manager career switch** hoặc gặp tại global tournaments.
- First Stand/MSI/Worlds là **các sự kiện quốc tế theo điều kiện mùa giải**; không được mô tả 'cứ thắng LCP một lần là chắc chắn dự tất cả'.
- Worlds format ví dụ dựa theo 2026 và cần `rulesYear` để cập nhật theo năm thực tế.
- Thương hiệu 'Predator League' và thẻ tên/ảnh tuyển thủ có chủ quyền khác nhau; giấy phép tên/ảnh Riot được người dùng nói đã có, không tự bao gồm trademark logo đội, logo giải, client game hoặc thương hiệu Acer.

## C. Design adaptation / fictional rules (explicit)
- CLB sinh viên tại VN dự vòng 'Campus District' hư cấu, sau đó có cơ hội vào 'Road to VCS' trong chế độ giả lập.
- Số trận mỗi split có thể rút gọn 3–5 fixtures + playoffs vì UX, không dùng để tuyên bố thể thức thật.
- 'LCP qualification' được xác định bằng `qualificationConfig` riêng trong data và điều kiện thắng một domestic competition của mô phỏng; **không gán số suất chính thức chưa có công bố**.
- Predator Invitational là đường song song, có thể có tên sự kiện chung 'APAC Invitational' trước khi xác nhận quyền thương hiệu.
- Opponent archetypes 'Korean powerhouse'... là mô hình AI, không khẳng định mọi đội/khu vực cùng một phong cách.

## D. Suggested content provenance fields
`competition.realWorldReferenceUrl`, `competition.rulesBasisYear`, `competition.adaptationNote`, `competition.isOfficialFormat` (mặc định false), `rosterData.asOfDate`, `licenseAssetId`. Nội dung fiction luôn có `adaptationNote` trong nội bộ admin/data và một disclaimer gọn ở UI.

## E. Source review gate
Trước nộp, đối chiếu điều lệ công nghệ, tình trạng quyền tài sản, kích hoạt iframe, biểu tượng BTC. Chỉ điều chỉnh chi tiết giải thật nếu có thông báo chính thức mới, không để agent tự điền suất 2027 chưa được công bố.
