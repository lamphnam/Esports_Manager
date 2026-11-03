# CHANGELOG

## v2.2.2 — 2026-11-03 (Phase 0–2, rulesVersion v1.1.0)
- Thêm strict TypeScript, vitest, invariant/property tests và balance-sim.
- Sửa Welcome Pack, Recovery Code nén và lưu một snapshot; F0 390×844/reload xanh.
- Sửa 14 mục P1: equip unique, tactic fit, synergy đối thủ/cân bằng Ch1–5, discount, từng ván FOCUS_1, scoreboard, Skip timer, mobile header, giao hữu, counterfactual, training OVR/cap, tài trợ phục hồi/UUID/ledger archive, font/lang.
- Không đổi odds, pity hoặc decision matrix. Bằng chứng: `evidence/PHASE_0.md`, `PHASE_1.md`, `PHASE_2.md`.

## v2.2.1 — 2026-11-03 (chỉ tài liệu, **không đổi `rulesVersion`**)
Sau khi audit bản build Kiến trúc B hiện có và phân tích `docs/ref/golden_road/`.

**Quyết định & quy trình**
- Thêm `DECISIONS.md`: ghi nhận Gate G0 = B theo lời chủ dự án (chờ xác nhận văn bản), 9 quyết định đề xuất (DEC-1..9) và 4 câu hỏi mở (Q1..Q4).
- Thêm `agents/PROMPT_FIX_AND_GOLDEN_ROAD.md`: prompt sửa 2 lỗi P0, 13 lỗi P1 và tích hợp dữ liệu lịch sử, chia Phase 0-4 theo lịch 03-14/11.
- `index.md`: thêm milestone **M9**, decision D5-D7, ba dòng Log; không tick mục M3/M4 vì chưa có bằng chứng test.

**Dữ liệu & quyền**
- `ref/golden_road/` là tài liệu tham khảo (fan game bên thứ ba, có quảng cáo và Ko-fi); **không** đưa vào bundle, **không** sao chép mã/giao diện (`IMPLEMENTATION_PROMPT` dòng 16). Chủ dự án xác nhận (Q1) đã có quyền tham khảo, dùng và điều chỉnh **điểm rating**; quyền này không bao phủ mã hay giao diện.
- Chủ dự án khẳng định email của Riot bao phủ mọi thứ, không giới hạn (Q2): tên CLB thật được phép (`ENABLE_REAL_CLUB_NAMES` mặc định `true`). Ảnh/logo thật vẫn cần `asset_license` từng asset và nằm ngoài work order hiện tại.
- Hạn nộp được giãn (Q3), ngày mới chưa ghi (Q5): bỏ thứ tự cắt phạm vi theo lịch; mốc ngày trong `index.md` M1-M8 sẽ được dời khi có ngày mới.
- `11_RIGHTS_SOURCES.md` §6: ghi chú về dữ liệu bên thứ ba và điều khoản fan-project của Riot (bản 08/2018, đọc 03/11/2026).
- `research/LINKS_AND_FACT_CHECK.md`: thêm bảng kiểm tra thực tế 03/11/2026 (LCP 2026, MSI 2026, First Stand 2026, Worlds 2026) kèm độ tin cậy. Liquipedia và Leaguepedia chặn công cụ fetch, nên **đội hình VCS chưa được xác minh**.
- Phân loại thẻ `LEGACY` không đổi bảng pack: `packTableVersion` và định nghĩa pity v2.2 giữ nguyên.

**Chưa thay đổi**
- Các "verified facts" ở `02`/`11` (mục 3-4) vẫn **chưa được kiểm chứng lại**.
- Thể thức và số suất Worlds 2026 chỉ mới có từ một blog bên thứ ba; đối chiếu với primer chính thức của Riot trước khi dùng.

## v2.2 — 2026-10-27
Dựa trên đánh giá ý tưởng và tài liệu v2.1.

**Phạm vi & lịch**
- Cắt phạm vi: ưu tiên Campus → VCS (Ch1–5); LCP/FST/MSI/Worlds mặc định knockout đơn hư cấu; Swiss/double elim thành P2 (`00`, `03` §4).
- Thêm `demoScenario` "Chung kết thế giới" (P1) (`03` §11).
- Roadmap viết lại: Gate G0 (chọn kiến trúc A/B), deploy skeleton trước 30/10, playtest F0 vào 31/10, nên nộp 14/11 (`10`).
- Giảm mục tiêu nội dung: ~30 edition, ưu tiên khung thẻ/hiệu ứng (`12` §8).

**Gameplay**
- Thêm `13_MATCH_DECISION_SPEC.md` + `config/tactics.matrix.json`: thông tin hiển thị cho người chơi, ma trận tactic × archetype không có tactic thống trị, đối thủ off-script 20%, số quyết định BO3/BO5 giảm còn 5/7.
- Sub-seed RNG theo (seed, gameIndex, phase, eventSlot) để giải thích counterfactual trung thực (`05` §3).
- Thêm `14_ECONOMY_SIM_TABLE.md`: bảng nguồn/sink và chỉ tiêu kiểm chứng.
- Pity chốt: tối đa 7 lần hụt, lần 8 buộc Epic+; Common từ Scout pack có OVR ≥ 62 (`04`, `balance.initial.json`).

**Kỹ thuật**
- `milestone_claim.career_year` NOT NULL DEFAULT 0 (UNIQUE với NULL không chặn trùng trong PostgreSQL); CHECK số dư `>= 0` (`06`).
- Flyway chạy qua direct endpoint của Neon, tách `FLYWAY_URL` / `DB_URL` (`06` §8, `08` §6).
- `08` §1b: deploy skeleton và kiểm tra storage trong iframe trên Chrome/Safari/Firefox từ sớm.

**Chưa thay đổi**
- Các "verified facts" ở `02`/`11` giữ nguyên, **chưa được kiểm chứng lại** trong lần cập nhật này. Đối chiếu với nguồn chính thức trước khi nộp.
- Quyết định cuối giữa kiến trúc A và B thuộc về chủ dự án (Gate G0).
