# 09 — QA, Acceptance Criteria, Test Matrix

## A. P0 first-playable (blocking)
- [ ] Club created without collecting Portal credentials; valid response and guest recovery guidance.
- [ ] 5 starter cards exactly one per TOP/JUNGLE/MID/BOT/SUPPORT, OVR 55–65, persistence after reload.
- [ ] One Campus match with three phases (or deterministic auto tutorial if explicitly chosen), winner determined server-side.
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
- [ ] Mobile controls, reduced motion and keyboard navigation usable.

## C. Automated testing
- Unit: stat derived, OVR bounds, role-fit, synergy cap, tactics outcomes, seeded RNG stable, BO termination.
- Integration/Testcontainers: guest bootstrap, card ownership, wallet atomic transactions, pack idempotency under concurrency, match claim duplicate requests, Flyway clean migration.
- E2E Playwright: onboarding F0, reload, pack retry timeout, wallet low balance, direct deep links via Nginx SPA fallback, game embedded test iframe.
- Model tests: 10k+ Monte Carlo seeds vs config; no impossible global event participation; balanced win rates; no infinite currency farm.
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
