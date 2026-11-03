# 14 — Economy Sim Table (v2.2, giả thuyết khởi đầu)

**Cập nhật 03/11/2026:** bảng dưới là giả thuyết thiết kế, không phải bảng payout đã được engine kiểm chứng. `scripts/balance-sim.ts` hiện đo win-rate 3 đội mẫu × 12 chapter (4000 seed/ô), **không** mô phỏng wallet theo 3 chính sách chi tiêu ở cuối tài liệu. Không dùng kết quả DEC-5 để tick các chỉ tiêu thu nhập/lạm phát 1–4. Training/sponsorship/first-clear guards hiện tại xem `04` và bằng chứng `evidence/PHASE_2.md`/`PHASE_4.md`; mô phỏng economy theo chính sách còn mở.

Mọi con số là **giả thuyết** để chạy mô phỏng/playtest, không phải chân lý. Nguồn: `03` §7 và `04` §4. Giá: Scout pack 800, training 100–700 (leo thang), NPC signing 1,200–10,000, facility ≥ 1,000.

| Chapter | Thu nhập lần đầu (credits) | Thu nhập lặp/mùa (ước tính) | Mục tiêu mua được trước chapter kế |
|---|---|---|---|
| 1 Five Strangers | 500 (ví đầu) + 500 (tutorial) = 1,000 | 0 | 1 Scout pack **hoặc** ~3 level training |
| 2 Campus Kings | +200 mỗi trận thắng Campus (≈2–3 trận) | giới hạn có trần | thêm 1 level training cho 2 starter |
| 3 Road to VCS | +800 (qualification) | 1 lần/chu kỳ | 1 Scout pack + vài level training |
| 4 Pro Debut | +1,200 (vào playoff) + 200 tham gia | theo split | **ít nhất 1 nâng cấp có ý nghĩa** mà không cần RNG hiếm |
| 5 Vietnam's Crown | VCS title: Elite x2, reputation | theo mùa | đủ cho 1 NPC signing cấp thấp (~1,200–2,500) |

## Các chỉ tiêu phải kiểm chứng
1. **Median 3 trận đầu** đủ mua ≥ 1 nâng cấp có ý nghĩa (+≥2 stat tổng hợp hoặc 1 pack) mà không cần Epic.
2. Người chơi **8 Scout pack không Epic+** vẫn qua được chapter kế bằng training + chiến thuật.
3. **Không soft-lock ở 0 credits:** luôn còn trận giao hữu (XP nhỏ/không thưởng) hoặc tài trợ nhỏ khi thất bại.
4. **Không lạm phát:** tổng credits sinh ra mỗi chapter ≤ ~1.3× tổng sink "hợp lý" của chapter đó; không có chu trình mua–bán NPC có lời.
5. **Anti-farm:** replay kết quả cache không thưởng; mỗi first-clear chỉ nhận một lần (ledger unique).

## Script economy theo chính sách (chưa triển khai)
Một script mô phỏng đơn giản (Python hoặc test Java) cho 1,000 "người chơi" theo 3 chính sách (tiết kiệm / mua pack ngay / training trước) qua chapter 1–5, in ra: credits theo chapter, số pack, win rate chapter, và cảnh báo vi phạm chỉ tiêu 1–4.
