# 01 — Game Design Document (GDD v2.1)

## 1. Game pitch
**Working title:** APAC Rising: Esports Manager (tên thương mại tạm thời, không khẳng định tài trợ/chính thức).  
**Genre:** MOBA esports manager + collectible player cards + career campaign.  
**Fantasy:** Xuất thân từ sinh viên, tự lập CLB, mở pack nhận thẻ tuyển thủ có nhiều edition theo mùa, xây đội hình TOP/JUNGLE/MID/BOT/SUPPORT, nâng cơ sở/huấn luyện, vượt giải Việt Nam → APAC → Worlds; về sau quản lý nhiều mùa.  
**Audience:** sinh viên yêu esports, người chơi LoL/FC Online/Pokémon; người mới cần chơi được sau 15–30 giây đọc hướng dẫn.  
**Session:** 3–8 phút; có lưu tiến trình và skip trận, chơi được 30–60 giây nếu chỉ muốn thử pack/một trận.

## 2. Player promise / pillars
1. **Underdog → Legend:** 5 sinh viên OVR 55–65 có thể trưởng thành thành biểu tượng CLB; không phải bỏ sạch starter.
2. **Pack → Upgrade → Victory:** phần thưởng thấy ngay; 3–5 phút đầu bảo đảm có gói mở và quyết định thay người.
3. **Smart team beats pure OVR:** role-fit, synergy, champion-pool/fearless-lite, tactic và quyết định trận tạo chênh lệch thực.
4. **Career remembers you:** mùa thắng/thua, đối thủ truyền kiếp, tuyển thủ huyền thoại, Hall of Fame; thất bại không xóa save.
5. **Transparent choices:** kết quả có giải thích sức mạnh và sai lầm; RNG có seed và kiểm định.

## 3. Main loop
Home/Club Hub → chọn mục tiêu Campaign → chỉnh Lineup/Training/Scout/Transfer → chốt chiến thuật → Sim BO1/BO3/BO5 (3 tactical beats mỗi ván) → nhận kết quả/thống kê → phát pack + credits + fanbase/reputation → Collection/Pack Opening → Upgrade → trận/chặng/mùa tiếp theo.

### Onboarding F0 chi tiết
- Màn 1: nhập tên CLB và chọn logo dạng hình học preset (không upload ảnh người dùng).
- Màn 2: 5 thẻ starter theo đúng role, 60s hướng dẫn tối đa; chỉ 1 CTA `Thi đấu giao hữu`.
- Màn 3: match tutorial đối thủ OVR thấp; đưa 3 lựa chọn chiến thuật qua ba pha; win gần như chắc nếu hiểu mechanics, nhưng không ép thua/victory scripted vô lý.
- Màn 4: phần thưởng: **một Rookie Welcome Pack bảo đảm >= Rare** + credits. Hiệu ứng mở pack 3–5 giây có nút Skip, reveal 1 card, so sánh OVR/role/synergy.
- Màn 5: một-click swap nếu slot phù hợp; vào trận thứ hai thấy team power khác và event report.

## 4. User journey & menu
`Splash/Loading → Start/Resume → Club Hub` chứa: `Campaign`, `Lineup`, `Cards`, `Packs`, `Training`, `Transfers`, `Facilities`, `History/Hall of Fame`, `Settings`. Mục khóa hiển thị tooltip điều kiện mở (không lẫn 'Coming Soon' với tính năng đã mở).

## 5. Core game modes
- **Career Campaign:** điểm nhấn, các kỳ thi đấu theo năm, branch qua thắng/thua, trường hợp không dự First Stand/MSI.
- **Collection & Team Building:** thẻ theo mùa, lineup role, synergy, nâng cấp.
- **Club Management:** wallet, scouting/transfer (NPC), training, facilities, hợp đồng giả lập khi mở cấp.
- **Friendly Match/Training:** không farm pack vô hạn; chỉ XP nhỏ hoặc không thưởng.
- **Predator Invitational side quest:** vòng loại Việt Nam → APAC event giả lập; độc lập với suất Riot international. Tên hiển thị phụ thuộc quyền thương hiệu Acer.
- **Future:** Daily challenge có cùng nguồn lực, leaderboard server-reviewed; global manager career (nhận lời mời sang CLB LCK/LPL không phải 'thăng hạng từ LCP').

## 6. Match interaction
- Không làm gameplay MOBA real-time; dựng Match Center giải thích simulate từ roster, tactic, synergy, event, RNG.
- Series BO1/BO3/BO5; mỗi ván gồm 3 pha EARLY/MID/LATE và 1 quyết định của người chơi/pha (có thể áp dụng auto strategy).
- Chọn tactic trước series; cho điều chỉnh giữa ván hoặc giữa game trong series tùy format.
- Có `Watch`, `Fast`, `Skip To Result`, replay kết quả không đổi.
- Tình huống bối cảnh phải trung tính và không bạo lực/đẫm máu; giao tranh là thuật ngữ thể thao trong game, hiệu ứng hợp lệ.

## 7. Card progression
- `Player`=con người/danh tính; `PlayerCardEdition`=phiên bản 2024/2025/2026 với OVR, stats, traits, license; `OwnedCard`=instance riêng, XP, training level, enhancement.
- Bản 2025 OVR 85 có thể khác playstyle bản 2026 OVR 90, không chỉ là buff tuyến tính.
- Rarity Common/Rare/Epic/Legendary; thẻ đã mở không tự ràng buộc hợp đồng với CLB thật ngoài đời; fiction notice trong UI.
- Nâng thẻ dựa trên vật phẩm kiếm từ chơi, không tiền thật.

## 8. Design anti-patterns
- Không sao chép UI/layout/code của LoL Esports Manager, Worlds Mayhem hoặc FC Online; chỉ tham khảo nguyên tắc thiết kế phổ quát.
- Không trộn lẫn real-world qualifier rules với fictional gameplay rules không gắn nhãn.
- Không xây gameplay dựa duy nhất vào OVR/RNG; không biến pack thành hệ thống pay-to-win hay có giá trị đổi tiền.
- Không dùng 'một trận thua = game over'; sau thất bại, người chơi vẫn có kỳ tiếp theo và phương án cải thiện đội.
- Không bắt chờ năng lượng real-time hoặc chuyển hướng portal để xác thực.

## 9. Feature flags
`career.seasonsV2`, `competition.predatorSideCup`, `club.contracts`, `collection.realAssets`, `simulation.fearlessLite`, `features.dailyChallenge`, `features.publicLeaderboard`. Mặc định chỉ bật khi đã có test/QA tương ứng.

## 10. Definition of fun
Người chơi có thể trả lời: 'vì sao mình thắng/thua?', 'mở thẻ mới có giúp đội mạnh hơn không?', 'muốn làm gì tiếp theo?' sau vòng 5 phút đầu. Quan sát 5–10 sinh viên chơi thử trước khi scale content.
