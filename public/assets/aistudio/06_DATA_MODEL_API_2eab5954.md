# 06 — Backend Contract, Database & Domain Model

## 1. Technology
Java 21 + Spring Boot 3.x (pin tested compatible version), Spring Web, Validation, Spring Security (guest bearer only), JPA or JdbcTemplate (choose consistently), Flyway, PostgreSQL Neon, JUnit5 + Testcontainers when available. One deployable monolith initially, module-by-domain inside `backend/src/main/java/...`.

## 2. Aggregate / entity definitions
- `guest_account(id, token_hash, created_at, last_seen_at, revoked_at)` — random high-entropy guest token; NO Portal credentials.
- `club(id, guest_id UNIQUE, name, logo_key, home_region, reputation, career_year, row_version)`.
- `player_identity(id, display_name, primary_role, region, actual_person_flag, source_ref)`.
- `asset_license(id, asset_key UNIQUE, rights_scope, valid_from, valid_until, rights_contact_ref, verified_at, permitted_usage_notes)`.
- `player_card_edition(id, player_id, edition_year, edition_code, rarity, base_ovr, stats_jsonb, trait_codes_jsonb, asset_license_id?, portrait_key?, edition_version)`.
- `owned_card(id, club_id, edition_id, level, xp, enhancement, locked, created_at, row_version)`.
- `lineup_slot(club_id, role, owned_card_id, UNIQUE(club_id,role), UNIQUE(club_id,owned_card_id))` + validate card ownership.
- `wallet(club_id PK, credits, training_materials, scout_tickets, row_version)`.
- `currency_ledger(id, club_id, kind, delta, reason, source_type, source_id, idempotency_key, created_at)` with unique source reward keys.
- `pack_definition(id, pack_family, table_version, rarity_weights_jsonb, pity_limit, active)`.
- `pack_instance(id, club_id, pack_id, origin_type, origin_id, status, opened_edition_id?, opened_owned_card_id?, opened_at?)`.
- `pack_pity(club_id, pack_family, misses, UNIQUE(club_id, pack_family))`.
- `transfer_offer(id, club_id, edition_id, price, valid_until, status, row_version)`.
- `club_upgrade(id, club_id, facility_code, tier, UNIQUE(club_id,facility_code))`.
- `career_season(id, club_id, career_year, current_segment, state, started_at, completed_at, version)`.
- `competition_instance(id, club_id, season_id, template_id, bracket_jsonb, state, placement, rules_basis_year, rules_version)`.
- `fixture(id, competition_instance_id, opponent_id, order_index, status, result_id?, UNIQUE(competition_instance_id,order_index))`.
- `match_session(id, club_id, fixture_id?, rules_version, engine_version, seed, snapshot_jsonb, snapshot_hash, state, next_phase, created_at, completed_at, row_version)`.
- `match_decision(id, match_id, game_index, phase, decision_code, seq_no, idempotency_key, UNIQUE(match_id,game_index,phase))`.
- `match_result(id, match_id UNIQUE, winner, game_scores_jsonb, event_log_jsonb, breakdown_jsonb, resolved_at)`.
- `milestone_claim(id, club_id, milestone_code, career_year INT NOT NULL DEFAULT 0, reward_jsonb, UNIQUE(club_id,milestone_code,career_year))` — **v2.2:** `career_year` KHÔNG được null (PostgreSQL coi NULL ≠ NULL nên UNIQUE không chặn claim trùng); first-clear dùng `0`. Thay thế được bằng `UNIQUE NULLS NOT DISTINCT` (PG15+), nhưng cột NOT NULL là cách đơn giản và an toàn hơn..
- `hall_of_fame_entry(id, club_id, career_year, competition_code, placement, lineup_snapshot_jsonb, created_at)`.
- `api_idempotency(id, club_id, route_key, idempotency_key, request_hash, response_jsonb, status, created_at, UNIQUE(club_id,route_key,idempotency_key))`.

**Note**: Đây là logical schema. Agent phải chuẩn hóa cột/index/fk/migration và không copy nguyên PostgreSQL DDL từ mô tả không đầy đủ này.

## 3. Constraints / indexes (required)
- Foreign keys for all ownership references, unique edition IDs, non-negative currency balances via CHECK (`>= 0`), stable UUID/ULID.
- Composite index `(club_id, created_at DESC)` for results, `(club_id, status)` for packs/fixtures; `(club_id, role)` unique slot.
- Optimistic version or `SELECT FOR UPDATE` for wallet/pack/training/transfer to prevent race duplication.
- `reward ledger UNIQUE(club_id,source_type,source_id,kind)` for first-clear and claims.
- `club_id` always from authenticated guest principal, **never trusted directly from request body**.
- Persist idempotency records for financial mutations; request hash mismatches cause `409 IDEMPOTENCY_CONFLICT`.

## 4. Core endpoints
| Method | Route | Request summary | Response summary |
|---|---|---|---|
|POST|`/api/v1/guests`|clubName, logoKey|guestToken shown once, club profile, onboarding state|
|GET|`/api/v1/me`|Bearer guestToken|club, currency, progress|
|GET|`/api/v1/catalog/cards`|filters role, editionYear, rarity|read-only catalog (licensed images only)|
|GET|`/api/v1/collection`|page, role|owned cards + upgrade/lineup flags|
|GET|`/api/v1/lineup`|—|5 slots, Team OVR and synergy breakdown|
|PUT|`/api/v1/lineup/{role}`|ownedCardId, expectedVersion|updated lineup + validation |
|GET|`/api/v1/campaign`|—|current chapters, fixtures, eligibility, rewards|
|POST|`/api/v1/fixtures/{id}/matches`|chosenStrategy, Idempotency-Key|match snapshot, first phase options|
|GET|`/api/v1/matches/{id}`|—|current phase, decisions, replay/result|
|POST|`/api/v1/matches/{id}/decisions`|gameIndex, phase, code, expectedSeq|next phase or final result|
|POST|`/api/v1/matches/{id}/claim`|Idempotency-Key|persisted reward summary/pack IDs|
|GET|`/api/v1/packs`|—|pack inventory, pity summary|
|POST|`/api/v1/packs/{id}/open`|Idempotency-Key|reveal result, minted owned card|
|POST|`/api/v1/cards/{id}/train`|attribute, levelCount, Idempotency-Key|stats and wallet delta|
|GET|`/api/v1/transfers`|—|NPC offers|
|POST|`/api/v1/transfers/{id}/buy`|Idempotency-Key|owned card, wallet delta|
|POST|`/api/v1/club/facilities/{code}/upgrade`|Idempotency-Key|facility tier, wallet delta|
|GET|`/api/v1/club/history`|—|season recaps & HoF|
|GET|`/actuator/health`|—|status (public liveness only)|

### Contracts for an important path
`POST /api/v1/fixtures/{id}/matches` returns:
```json
{
  "matchId": "uuid",
  "state": "AWAITING_DECISION",
  "rulesVersion": "v1.0.0",
  "snapshotHash": "sha256...",
  "series": "BO3",
  "gameIndex": 1,
  "phase": "EARLY",
  "options": ["GANK_TOP","PLAY_MID","SAFE_FARM"]
}
```
`POST decisions` payload:
```json
{"gameIndex":1,"phase":"EARLY","decisionCode":"PLAY_MID","expectedSeq":0}
```
`GET matches/{id}` after resolved includes phaseLog, score (BO series) and `rewardStatus` not yet claimed/claimed. **Never accepts score or winner from client.**

## 5. Error contracts
`400 VALIDATION_ERROR`, `401 GUEST_TOKEN_INVALID`, `403 NOT_OWNER`, `404 NOT_FOUND`, `409 WRONG_MATCH_PHASE | INSUFFICIENT_FUNDS | IDEMPOTENCY_CONFLICT | DUPLICATE_LINEUP_CARD | STALE_VERSION`, `429 RATE_LIMIT`, `503 TEMPORARILY_UNAVAILABLE`. JSON `{"code":"...","message":"...","requestId":"...","details":[]}`; no exception stack to client.

## 6. Guest identity in cross-site iframe
- **Do not request Portal login/password, do not embed Portal OAuth inside iframe, do not request mic/camera.**
- First visit: server creates random 256-bit guest secret, stores SHA-256+pepper hash, returns token once in HTTPS response; FE stores in localStorage for same origin *if permitted*. Bearer Authorization header on same-origin `/api`.
- Cross-site embed may partition/deny storage or purge it; test in actual contest portal. If unavailable, present **Save/Recovery Code** generated server-side (no private identity), user may manually copy for restore. Do not leak tokens in URLs, logs, analytics or screenshot.
- Initial browser session with blocked storage can still be playable as temporary guest and prompted to save recovery code. A restore UI must be safe from brute force (rate-limit, token entropy) if implemented.
- Content security policy `frame-ancestors` permit contest portal origin and owned domain; avoid `X-Frame-Options: SAMEORIGIN/DENY` for game document if cross-domain embedding required.

## 7. Security and privacy
- Rate-limit guest creation, pack open, market, match create; payload bounds/DTO validation; CSRF not assumed since bearer headers but analyze token storage XSS risk.
- No open redirects, suspicious external JS, third-party tracking pixels, location/mic/camera, Portal data collection.
- Sanitize user-provided club name and nickname; server disallow markup/profanity, frontend escape all.
- Authorization on every entity lookup by principal's `club_id`; prevent BOLA/IDOR.
- Log only request IDs and safe fields; redact Authorization, DB credentials, recovery code, player guest secret.
- Avoid version-specific hardcoded Neon defaults; validate pool vs connection limits with load testing.

## 8. Database migration & seeds
**Flyway + Neon (v2.2):** chạy migration qua **direct (non-pooled) endpoint** của Neon (Flyway dùng advisory lock, không tương thích PgBouncer transaction mode). Runtime app có thể dùng pooled endpoint nếu đã kiểm thử prepared statements; nếu có dấu hiệu lỗi, dùng direct endpoint với Hikari pool nhỏ. Cấu hình hai biến riêng: `DB_URL` (runtime) và `FLYWAY_URL` (migration).

Flyway `V1__core_users_cards.sql`, `V2__economy_packs.sql`, `V3__career_competitions.sql`, `V4__matches.sql`, `V5__history_and_indexes.sql` (actual implementation may reorder by FK). Seeds for fictional dev content; licensed content only loaded after rights metadata.

## 9. Testing business invariants
- Second concurrent pack-open => exactly one card minted and one pack consumed.
- Replay `claim` => one ledger entry; same result.
- Insufficient balance => rollback all mutations.
- Same OwnedCard cannot occupy two slots; cards cannot be sold when equipped.
- Remove/set lineup requires five valid roles to begin match.
- All match decisions authorized and ordered; duplicate accepted idempotently, conflicting duplicate rejected.
- Loss at pro level doesn't delete career or rewards; next split available.
