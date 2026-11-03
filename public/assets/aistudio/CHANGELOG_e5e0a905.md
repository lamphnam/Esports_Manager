# CHANGELOG

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
