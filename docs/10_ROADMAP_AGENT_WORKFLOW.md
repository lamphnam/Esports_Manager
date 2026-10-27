# 10 — Roadmap, Agent Workflow, Scope / Decision Gates

**Date:** 27/10/2026. Deadline: 15/11/2026. Solo developer + AI agents. Goal ambitious yet testable; AI accelerates implementation, not unattended integration/QA.

## 0. Gate G0 — chọn kiến trúc (hạn 28/10)
Game đơn người chơi, không tiền thật, không leaderboard công khai. Chọn có chủ ý:
- **A. Server-authoritative (như tài liệu):** Spring Boot + Neon + Oracle. Giá trị trình diễn kỹ thuật cao, nhưng thêm chi phí (idempotency, ledger, concurrency test, CSP, vận hành) và thêm điểm có thể hỏng khi nhiều người vào cùng lúc bình chọn.
- **B. Local-first:** simulator bằng TypeScript (PRNG seed + golden test), lưu IndexedDB, host tĩnh (Cloudflare Pages/Nginx), backend tùy chọn cho thứ thật sự cần. Ổn định và rẻ hơn nhiều; kém "authoritative".
Ghi quyết định + lý do vào `docs/DECISIONS.md`. Nếu chọn A, giữ nguyên các tài liệu; nếu chọn B, tài liệu 06/08 chỉ còn là tham chiếu cho phần tùy chọn.

## 1. Milestone calendar (v2.2)
| Ngày | Kết quả | Deliverables | Quality gate |
|---|---|---|---|
|27–28/10|Gate G0 + Skeleton|quyết định kiến trúc; repo; health endpoint/static page|G0 ghi vào DECISIONS.md|
|28–30/10|**Deploy skeleton**|domain thật, HTTPS, iframe harness, CSP, Neon (nếu A), thử storage trong iframe Chrome/Safari|trang tải được trong iframe ở hostname khác|
|29/10–01/11|F0 vertical slice|club, 5 thẻ, trận 3 quyết định, welcome pack, swap, trận 2|reload không mất; **31/10: 2–3 người chơi thử F0**|
|01–03/11|Economy|multi-pack, pity (định nghĩa v2.2), training, ledger|idempotent, không overspend/dupe; bảng `14` đối chiếu mô phỏng|
|04–07/11|Campaign Ch1–5 + demoScenario|Campus → Road to VCS → VCS; thua → split sau; `demoScenario`|VCS path chơi được; demo chạy ~3 phút|
|08–10/11|Mở rộng & polish|LCP/FST/MSI/Worlds knockout đơn (dữ liệu); khung thẻ + reveal; P2 nếu dư giờ|không có asset ngoài quyền; benchmark cân bằng|
|11–12/11|Production hardening|bảo mật, quan sát, test trong portal thật nếu có|public E2E, không đụng site khác|
|13–14/11|Playtest & freeze|5–10 người, sửa blocker, quay video/ảnh|không P0/P1; **nên nộp 14/11** để còn đệm|
|15/11|Hạn chót|chỉ dùng cho sự cố|—|

Mốc là mục tiêu, không phải cam kết: dùng feature flag hoặc cắt dọc thay vì ship module hỏng.

## 2. Do not build everything in one agent run
- Phase 0: read-only audit, report repo state, architecture, plan, risks and changes; wait for explicit developer instruction if agent operating in approval-gated environment.
- Phase 1: F0 one vertical slice end-to-end, real backend persistence + frontend, seed dev cards.
- Phase 2: Atomic economy and collectible domain; tests concurrency.
- Phase 3: Career event graph and promotion/relegation branches.
- Phase 4: Advanced competitions + UI; tools for content catalogs.
- Phase 5: Art assets/license pipeline; QA; deploy.

## 3. Definition of done per PR / agent execution
- Feature narrative + exact files changed; no unrelated rewrite.
- Acceptance criteria mapped to tests; show commands and actual output, not blanket 'all passed' claims.
- Database migration + rollback risk evaluated.
- API backward compatibility and optimistic lock/idempotency covered if writing mutations.
- Mobile/iframe screenshots or description based on actual verification.
- No secrets/PII in code/log; licenses noted for new image inputs.
- Commit hash or patch summary; follow repo coding style, no unnecessary comments if repo rule disallows.

## 4. Risks & mitigation
1. **Scope:** 12 chapters + 75 editions do not mean 12 engines or 75 unique character mechanics. Data-driven templates and validator. Good design scalable; QA still necessary.
2. **Balance:** AI-generated stats not trustworthy; run seeded simulations and playtest.
3. **Career correctness:** split qualification config versioned; avoid fictional 'LCP promotes to LCK'.
4. **Legal:** user's Riot grant for names/photos is input; track exact rights/assets separately; use placeholders when uncertain.
5. **Backend/Neon availability:** game has recovery and retry semantics, server authoritative state.
6. **Iframe storage:** guest token may not persist across embed contexts; implement recovery + test real portal.
7. **Oracle resources:** avoid port/service collision and validate SSH/deployment on ARM.

## 5. Scope gates
**If 30/10 skeleton chưa chạy trong iframe harness**: dừng làm gameplay mới, sửa CSP/Cloudflare/storage trước.  
**If 31/10 F0 not playable**: pause additional cosmetics/content generation and fix first 5-minute loop.  
**If 07/11 LCP/Worlds engine unstable**: ship 2027-inspired simplified competition formats with explicit fictional label, preserve VCS + meaningful Career.  
**If 11/11 economy dupe/authorization issue**: disable affected pack/transfer features, never bypass server-side controls.  
**If 13/11 iframe/public load breaks**: prioritize contest viability over optional extra seasons.

## 6. 'Ambitious' means architecture first, not unbounded launch content
Desired full long-term includes academic tryouts, rival stories, first stand, MSI, Worlds, Hall of Fame, pack seasonal editions, NPC transfer, budgets, facilities, seasons. Submission should demonstrate complete core loop even when optional branches are disabled.
