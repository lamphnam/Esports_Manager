# 08 — Architecture, Monorepo, Oracle / Nginx / Neon

## 1. Stack (fixed)
- FE: React, TypeScript, Vite, **Bun** install/scripts/build. Pure UI/replay; server-authoritative collection/economy/simulator.
- BE: Java 21, Spring Boot, Maven wrapper (`./mvnw`), PostgreSQL Neon, Flyway, JUnit.
- Infra: Oracle Cloud Always Free Ubuntu 24.04 ARM64 (user says ~12GB RAM), Nginx, existing owned `.dpdns.org` domain through Cloudflare free plan, HTTPS via certificate automation. Server may host OTHER websites; isolate deployment.

## 1b. Deploy skeleton sớm (v2.2)
Trước khi viết gameplay (**mục tiêu 29–30/10**): trang tĩnh + `/api/v1/health` + kết nối Neon + HTTPS trên domain thật + **iframe harness** ở hostname khác + CSP `frame-ancestors` + thử lưu/đọc token trong iframe trên Chrome, Safari (iOS) và Firefox. Mọi bản build sau đó deploy lên cùng khung này. Lý do: lỗi iframe/CSP/Cloudflare/storage là nhóm lỗi khó sửa nhất ở phút chót.

## 2. Suggested repository tree
```
repo/
  docs/                  # this pack
  frontend/
    src/app,src/pages,src/features/{campaign,cards,club,market,matches}
    src/components,src/lib/api,src/assets
    package.json, bun.lock, vite.config.ts
  backend/
    src/main/java/.../{api,application,domain,infrastructure}
    src/main/resources/{application.yml,db/migration,seed}
    src/test/java/...
    pom.xml, mvnw
  infra/
    nginx/apac-rising.conf.example
    systemd/apac-rising.service.example
    scripts/deploy.sh
    env/.env.example
  tools/
    catalog-validation/
```

## 3. Request flow
Contest Portal iframe → game domain HTTPS → Nginx `/` static `frontend/dist` → Nginx `/api/` proxy to `127.0.0.1:808x` Spring Boot → Neon PostgreSQL via TLS. No browser direct DB traffic; backend port bound localhost. Use dedicated subdomain and port not conflicting with existing services.

## 4. Build/deploy baseline
1. FE: `bun install --frozen-lockfile` → `bun run typecheck` → `bun run test` → `bun run build`.
2. BE: `./mvnw test` → `./mvnw package -DskipTests=false`; on ARM Java 21 works if dependencies support aarch64.
3. Stage jar to `/opt/apac-rising/backend/`, FE dist to `/var/www/apac-rising/`; service owns restricted user `apacrising`.
4. Ensure Flyway migration first/at application start; take Neon backups or PITR if offered on plan; migrations forward-only.
5. `systemctl restart apac-rising`; health check; Nginx config test; atomic FE deploy symlink optional.
6. Rollback to prior artifact; DB schema compatibility planned (no destructive migration without backup).

## 5. Nginx embedding CAVEAT
An `iframe` from another origin will be blocked by `X-Frame-Options: DENY/SAMEORIGIN`, and may be blocked by CSP `frame-ancestors`. Allow exact verified portal origin + own origin. **Don't guess BTC iframe parent hostname.** In staging use a separate HTML iframe harness on another test hostname. No all-origin wildcard in production without security review. Ensure `connect-src 'self'` and static asset sources satisfy CSP.

Example **concept only** (agent must adapt tested values):
```
server {
  listen 443 ssl;
  server_name GAME_HOST_HERE;
  root /var/www/apac-rising;
  index index.html;
  # Exact portal origin(s) must be confirmed:
  add_header Content-Security-Policy "frame-ancestors 'self' https://VERIFIED-PORTAL-HOST" always;
  location /api/ { proxy_pass http://127.0.0.1:8087; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
  location / { try_files $uri $uri/ /index.html; }
}
```
Set TLS separately; don't blindly paste placeholder host. Check other global Nginx headers won't add contradictory X-Frame-Options. Keep ACME path and certificate separate. Cloudflare proxy/TLS mode must be tested; prefer strict origin validation rather than insecure modes.

## 6. Spring datasource / Neon
> v2.2: Flyway dùng `FLYWAY_URL` trỏ direct endpoint (xem `06` §8).

Use pooled or direct JDBC connection appropriate to Neon endpoint, TLS, small Hikari pool and **measure**. Example safe starting point on small single-instance game:
```
spring.datasource.hikari.minimum-idle=0
spring.datasource.hikari.maximum-pool-size=3
spring.datasource.hikari.connection-timeout=10000
spring.datasource.hikari.idle-timeout=60000
spring.datasource.hikari.max-lifetime=600000
spring.datasource.hikari.keepalive-time=0
```
These are tunable estimates (validate Neon and network). **Do not use `max-lifetime=25000`**; Hikari minimum is typically 30000ms. Spring config should use env vars `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `GUEST_TOKEN_PEPPER`, not committed secrets. Handle Neon idle cold-start with bounded retries/backoff (no infinite while loops).

## 7. Stability, observability
- Separate systemd unit, memory limits, restart policy, log rotation, health and metrics (no sensitive token logging).
- Only bind 80/443 publicly; database external Neon; Spring bound 127.0.0.1; security group rules tight.
- Backoff retry from frontend on GET only; idempotency key required for mutating POST.
- Feature flags allow disable leaderboard/market/optional animation under outage while campaign retains integrity.
- Preserve current Oracle apps; `ss -lntp`, `nginx -T` audit and backup config first. Never replace default site or restart all apps without impact assessment.

## 8. Quality gates / performance
- first loaded UI usable on average phone after reasonable network delay; target bundle <500 KB gzip for critical JS if feasible, lazy-load heavy animation and card assets.
- health endpoints, 5 concurrent match sessions, concurrent pack opener race; check p95 on VM and Neon after deployment.
- verified HTTPS secure context + iframe parent origin. Do not assume Cloudflare CNAME/config already created.
