# Implementation Prompt — Copy into your coding agent

> **Cập nhật 03/11/2026, ghi đè các đoạn cũ bên dưới:** đây là prompt khởi tạo tham khảo. Work order hiện tại là [PROMPT_FIX_AND_GOLDEN_ROAD.md](PROMPT_FIX_AND_GOLDEN_ROAD.md), trạng thái/bằng chứng ở [M9](../index.md) và [Phase 4](../evidence/PHASE_4.md). G0 = B đã ghi nhận: simulator TS, localStorage, static host; Spring Boot/Neon/Java và API/server authority ở dưới chỉ thuộc phương án A tùy chọn. Hạn gốc 15/11 đã được giãn, ngày mới Q5 còn mở; không lấy ngày trong prompt cũ làm hạn hiện hành. Q1–Q3 đã trả lời, Q4–Q6 dùng mặc định trong DECISIONS, không tự chốt. Không làm lại phase đã có bằng chứng hoặc coi QA local là nghiệm thu public; G3 vẫn tắt.

You are the lead engineer and game-systems designer implementing `APAC Rising: Esports Manager` for **one solo developer**, with submission deadline **15 November 2026**. Do not confuse this project with the previous `Deadline Rush` concept.

## v2.2 amendments (ghi đè mọi mục mâu thuẫn bên dưới)
- Đọc thêm `docs/13_MATCH_DECISION_SPEC.md`, `docs/14_ECONOMY_SIM_TABLE.md`, `docs/CHANGELOG.md`, `docs/config/tactics.matrix.json`.
- **Gate G0:** không bắt đầu code gameplay cho tới khi chủ dự án ghi quyết định kiến trúc (A server-authoritative / B local-first) vào `docs/DECISIONS.md`. Nếu chưa có, dừng và hỏi.
- **Thứ tự mới:** deploy skeleton (HTTPS + iframe harness + CSP + health + kiểm tra storage trong iframe) **trước** F0.
- **Phạm vi:** Step 3 chỉ bắt buộc Campus → Road to VCS → VCS và `demoScenario`; LCP/FST/MSI/Worlds dùng knockout đơn hư cấu; Swiss/double elim/Play-In chỉ khi dư thời gian và có test.
- RNG: dùng sub-seed theo (seed, gameIndex, phase, eventSlot); không dùng luồng random tuần tự dùng chung.
- Pity: tối đa 7 lần hụt, lần thứ 8 buộc Epic+; có test biên.
- Schema: `milestone_claim.career_year NOT NULL DEFAULT 0`; Flyway chạy qua direct endpoint Neon.
- Ma trận quyết định phải có test tính chất (không tactic thống trị) trong CI.

## Read before editing
Read all `docs/00_START_HERE.md` through `docs/12_CONTENT_BLUEPRINT.md` (especially Campaign, simulator, economy, ownership, deployment) and the examples under `docs/config/`. Treat these as source of truth, note contradictions and resolve according to `docs/00_START_HERE.md`. The user states Riot has granted use of **player names/photos** via email; use only license-cleared assets, never infer other marks or copy existing game code/UI.

## Fixed stack
- FE React + TypeScript + Vite with Bun; CSS/flat 2D UI; no full MOBA rendering engine needed.
- BE Spring Boot on Java 21, Neon PostgreSQL, Flyway, test suite.
- Oracle Cloud Ubuntu ARM64 Nginx self-host, free .dpdns.org domain via Cloudflare, game embedded by third-party Portal iframe.

## Step 0 — Read-only audit
1. Inspect current repo, branch, uncommitted files, current services/config and conventions; **do not overwrite existing app**.
2. List high-level tree, assumptions, architecture boundaries, likely pitfalls, exact implementation plan and validation commands.
3. Identify whether repository is empty. If not empty, preserve working code; do not delete/change existing unrelated features.

## Step 1 — FIRST PLAYABLE F0 (priority)
Implement complete vertical slice: guest club registration → starter 5 cards (each role) → Campus tutorial series with three meaningful decisions → canonical server-side match resolution + result reasoning → guaranteed Rare+ Welcome Pack (opening with server-side outcome) → one-click upgrade lineup → play second stronger opponent. Persist throughout reload. Include FE tests, BE tests, migration and end-to-end happy-path. Must support mouse/touch and iframe.

### Minimum backend rules
Backend decides all mutation results (packs, rewards, match, wallet). Use guest bearer token, ownership validation, idempotency keys and transactional ledger. `Watch/Fast/Skip` must replay the SAME persisted match. Do not accept client-submitted scores/winners. Stable seeded Java simulator without DB calls in pure domain engine.

## Step 2 — Collection and manager features
Add season editions, card filtering/details, role-fit and capped synergy, several pack types with probabilities/pity, deterministic training, wallet ledger and NPC transfer market. Concurrency and idempotency tests mandatory.

## Step 3 — Career Campaign
Implement career seasons and explicit eligible/active/completed/eliminated/skipped nodes, Campus/Road-to-VCS/VCS, LCP **per split**, optional First Stand/MSI, Worlds stages inspired by **official 2026** format; competition details for 2027 remain `fictional adaptation` unless newer official rules validated. Pro losses advance to next split/year, never erase all progress. Predator Cup is a separate side branch, not Worlds/LCP qualifier. Only enable formats proven by tests.

## Step 4 — UI content, assets, QA, deploy
Generate original flat/cartoon esports-management UI and responsive card animations; use rights-approved names/photos only after asset license metadata. Deploy isolated site/service to Oracle and use Nginx/Cloudflare HTTPS with correct `frame-ancestors` for actual Portal origin. Test embed in a cross-origin iframe harness. No requests for Portal passwords, camera or microphone. Prepare screenshots, logo, README and contest submission artifacts.

## Non-negotiable testing
- Match deterministic with same inputs/seed; win-rate evaluation over 10k seeds; user decisions matter.
- Pack opening concurrency and retry cannot duplicate cards; rewards claimed once; wallet never negative.
- A pro loss does not soft-lock career; no false path LCP→LCK; qualification conditions correct.
- Guest token is neither logged nor placed in URL; all entity access authorized by guest owner.
- Club save survives refresh and temporary API error; responsive 390px; iframe works.
- `bun run build`, `bun run test`, Maven tests/integration tests, DB migrations on fresh Neon-compatible DB.

## Output at end of EACH step
- Summary (features, files, migrations), exact commands run and observed results; blockers and risks; manual validation steps; next recommended slice. No vague 'done' without evidence. Avoid unrelated rewrites and unreviewed external assets. If scope pressure occurs, feature-flag optional modes, preserve playable flow.

## Begin now
Perform Step 0 in read-only mode, propose a narrow implementation sequence, then build Step 1 vertical slice. Do not implement all stages before first end-to-end playtest.
