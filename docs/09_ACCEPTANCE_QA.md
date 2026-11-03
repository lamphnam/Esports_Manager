# 09 — QA, Acceptance Criteria, Test Matrix

## Trạng thái local — 03/11/2026

Architecture B đang dùng simulator TS/localStorage. [Phase 4](evidence/PHASE_4.md) và [output CLI](evidence/phase-4-commands.txt) ghi 31 tests xanh, typecheck/build/balance/import/release-audit exit 0; [browser evidence](evidence/phase-4-e2e.json) ghi 14 kết quả xanh. Đây là Chromium và harness cross-origin **local**, không phải nghiệm thu public hoặc mọi browser. Checklist A/B/E bên dưới vẫn là gate sản phẩm; không tick cả nhóm chỉ từ một happy path.

- F0 touch 390×844/desktop, Welcome Pack/equip/reload/recovery và storage bị chặn đã có E2E.
- BO3/BO5 có verdict và tỷ số **từng ván**, logs cả 3 pha; chờ 15 giây vẫn ở recap, reload career giữ recap, bấm Next mới tới `FOCUS_1` hoặc tổng kết chuỗi. Cả mẫu thắng/thua được kiểm tra. Demo BO5 chờ Next và toàn bộ localStorage không đổi.
- Deep reload giữa replay/result/pending reveal, Skip timer, focus/keyboard/reduced motion/touch, equip unique, training discount/cap và sponsorship có regression.
- DEC-5 campaign đạt mặc định. Benchmark prototype còn thiếu hai mục tiêu: +10 power 76.09% ngoài dải 60–75%, adaptive–random 3.51 điểm % dưới 5. Không báo balance tổng thể đã đạt.
- Chưa xác nhận public HTTPS/portal thật, Safari/iOS/Firefox, playtest 5–10 người hoặc toàn bộ qualification/pro-loss sang split mới. `FEATURE_GOLDEN_ROAD=false`, chưa đạt R1/submission-ready.

Với B, tiêu chí server authority/guest bearer/API concurrency/Flyway/Neon chỉ áp dụng nếu triển khai A sau này. Không thay chúng bằng tuyên bố có chống sửa save; B chỉ validate dữ liệu và các transition của ứng dụng.

## A. P0 first-playable (blocking)
- [ ] Club created without collecting Portal credentials; valid response and guest recovery guidance.
- [ ] 5 starter cards exactly one per TOP/JUNGLE/MID/BOT/SUPPORT, OVR 55–65, persistence after reload.
- [ ] One Campus match with three phases (or deterministic auto tutorial if explicitly chosen), winner determined by seeded engine (TS/local save under B; server-side under A).
- [ ] Display post-match WHY win/loss (stats/tactic/decision contributions); next action visible.
- [ ] First-win Welcome Pack exactly once, guaranteed Rare+; reveal visually and Skip safely.
- [ ] One-click equip card from pack when role matches; effect visible on team stats/synergy and next match.
- [ ] Next stage offered; no stuck state if user refreshes on pack/match/recap.
- [ ] Functional responsive 390×844 + desktop; iframe loading and click/audio behavior tested.

## B. Release candidate campaign / collection / manager
- [ ] VCS progression gated by successful in-game Road to VCS; LCP by per-split domestic results; First Stand/MSI/Worlds conditional.
- [ ] A pro loss can end a split without deleting club/cards; next split/year available.
- [ ] Predator side cup is NOT a Worlds qualifier and respects brand rights.
- [ ] Campaign correctly tracks BO1/BO3/BO5, Swiss cutoff / knockout bracket when enabled.
- [ ] Pack rarity probabilities visible; pity guarantee tested; no real-money mechanics.
- [ ] User cannot equip the same card twice, train another club's card, overspend, duplicate reward or re-open consumed pack.
- [ ] Season edition separate from Career Season; multiple cards same identity allowed.
- [ ] Rights-scoped images only, fallbacks for uncatalogued, no broken thumbnails.
- [ ] `Watch/Fast/Skip` same result; partial match recovery after refresh.
- [ ] BO3/BO5 dừng ở `GAME_RECAP` sau từng ván, kể cả ván cuối; verdict, tỷ số chuỗi, kills/MVP và 3 logs đọc được. Không tự Next; career reload vẫn giữ recap; demo không ghi save.
- [ ] Mobile controls, reduced motion and keyboard navigation usable.

## C. Automated testing
- Unit: stat derived, OVR bounds, role-fit, synergy cap, tactics outcomes, seeded RNG stable, BO termination.
- Integration B: save/recovery round-trip và malformed input, reducer/mutation/equip/pack/reward invariants, deep match/recap/pending-reveal reload. Integration/Testcontainers sau đây chỉ thuộc A: guest bootstrap, card ownership, wallet transactions, pack concurrency, claim duplicate requests, Flyway clean migration.
- E2E Playwright: onboarding F0, reload, pack retry timeout, wallet low balance, direct deep links via Nginx SPA fallback, game embedded test iframe.
- Model tests: 10k+ Monte Carlo seeds vs config; no impossible global event participation; balanced win rates; no infinite currency farm.
- Regression recap: `scripts/e2e-game-recap.js`, `e2e-series.js`, `e2e-demo.js`; giữ test chờ 15000ms, restore career, explicit Next và demo localStorage byte-identical. Mỗi bug mới phải có repro đỏ trước sửa, sau đó chạy lại xanh.
- Security tests: IDOR/BOLA, brute token guessing/rate limiting, CSP/frame-ancestors from actual domain, no Authorization logging, HTML injection in club name.

## D. Exploratory playtest script (5–10 students)
1. Give only URL and say 'hãy chơi 5 phút'—do not instruct.
2. Record time to first match, time to pack open, player understanding of OVR/synergy and whether next CTA is obvious.
3. Ask: 'Tại sao vừa thắng/thua?' 'Thẻ mới có giá trị gì?' 'Có muốn chơi tiếp không?' 'Cái gì gây khó hiểu?'
4. Log severe blockers, confusing UIs, missed clicks, frame issue, load time, rage quits. No unnecessary identity collection.
5. Prioritize a bug fixing gameplay first, not just colors/visual polish.

## E. Pre-submission compliance
- [ ] Public HTTPS game URL verified by outsider.
- [ ] URL embeds correctly in cross-origin iframe without Portal login or unauthorized redirects.
- [ ] Permissions list/assets/licensing covered as checked in `11_RIGHTS_SOURCES.md`.
- [ ] No malware, spyware, camera/mic requests, account scraping, stolen source/assets.
- [ ] Game owner acknowledges contest vote happens on Portal, not in-game.
- [ ] Repo commit hash, author info, description, logo, gameplay screenshots/video prepared if Portal requires.
- [ ] `README` explains any fictional gameplay adaptations.
- [ ] Demo backup/staging build if Oracle/Neon outage occurs.
- [ ] Follow contest's current official terms at the moment of submission.

## F. Block-release issues
Always block publish on: authorization bypass, economy dupe, loss of progress, irrecoverable login, pack reward mismatch, iframe blank, mobile cannot tap, direct/automatic external redirect, unauthorized assets, privilege exposure or broken campaign state.
