# Đặc tả clean-room — 03/11/2026

Nguồn hành vi: mục G3 trong PROMPT_FIX_AND_GOLDEN_ROAD, không đọc hoặc port engine.js/game.js/style.css. Chỉ importer build-time đọc data.js để lấy dữ kiện/rating đã được cho phép. UI, copy, thuật toán draft/bracket và poster chia sẻ được viết mới.

- Năm slot TOP/JUNGLE/MID/BOT/SUPPORT. Identity chỉ dùng một lần, kể cả khác edition/năm.
- Một đề nghị gồm khu vực, CLB và năm. Tập đề nghị luôn được lọc theo slot trống và identity chưa dùng; không có đề nghị thì trả trạng thái rỗng an toàn.
- Ba lượt thay đề nghị, mỗi phạm vi REGION/CLUB/YEAR được dùng một lần. CLUB giữ khu vực, YEAR giữ CLB; phạm vi không có lựa chọn khác được phép giữ đề nghị hợp lệ.
- Sau mỗi lần chọn thẻ, tạo đề nghị mới từ pool còn hợp lệ; hoàn tất năm slot thì kết thúc draft.
- Seed cùng chuỗi hành động tạo cùng kết quả. Không có global random stream hoặc Math.random.
- Circuit gồm Split 1, First Stand, Split 2, MSI, Split 3, Worlds, mỗi chặng là bracket 8 đội loại trực tiếp hư cấu. Mọi series dùng simulator chính, BO3 cho split, BO5 cho global; game đầu đủ ba tactic, game sau gợi ý tự động và giữ tactic MID của người chơi (FOCUS_1).
- Mỗi draft seed thưởng tối đa một lần trong career; tối đa hai seed/ngày VN. Mỗi lần 50 credits và một thẻ Legacy đã draft. Thưởng chỉ qua action riêng, không tác động odds/pity.
- Poster mới 1080×1350: tiêu đề trên, bảng sáu chặng ở giữa, roster phía dưới. Slate/Amber/Cobalt/Crimson, chữ và đường nét tự vẽ; không logo/ảnh/icon từ reference.
- Flag mặc định tắt. Không bật trong bản nộp trước khi toàn bộ gate F0/R1 + 390×844 + iframe đạt.

Rating derived: hash(playerId|team|year|role), chọn tier với trọng số 13/56/25/6, lấy raw integer trong 76–80 / 81–86 / 87–91 / 92–98, qua mapping chung. Đây là phân bố cân bằng, không suy đoán thành tích người thật.
