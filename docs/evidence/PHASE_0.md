# Phase 0 — 03/11/2026

Baseline: `ca12d39`, nhánh `fix/audit-and-golden-road`. Không push.

Thay đổi: `package.json:7` thêm vitest/test/typecheck; `tsconfig.json:3` strict và giới hạn source roots (không kiểm tra mã tham khảo); `vitest.config.ts:1`; `src/lib/__tests__/invariants.test.ts:1` (6 tests); `src/lib/__tests__/fixtures.ts:1`; `scripts/balance-sim.ts:1` (4000 series/ô, 12 chương × 3 đội).

Lệnh và output:

```text
bun add -d vitest
installed vitest@5.1.0; 16 packages installed
bun run typecheck
$ tsc --noEmit
bun run test
Test Files 1 passed (1)
Tests 6 passed (6)
bun scripts/balance-sim.ts
Chapter | Format | Starter | +1 Rare (Welcome fixture, TOP) | All Rare
1 | BO1 | 68.78% | 73.92% | 85.63%
2 | BO3 | 45.63% | 53.77% | 77.63%
3 | BO3 | 25.20% | 32.45% | 58.10%
4 | BO3 | 19.80% | 25.73% | 50.30%
5 | BO5 | 3.60% | 6.47% | 23.23%
```

Output đầy đủ: `phase-0-typecheck.txt`, `phase-0-test.txt`, `phase-0-balance.txt`.
Kiểm chứng: matrix khớp spec và đủ 4 property; 1000 seed determinism/sub-seed; 10k seed/100k pack; 5000 series mỗi format; golden vector Mulberry32. Strict không phát sinh lỗi ứng dụng.

Blocker: không. Cài dependency và Git cần quyền ghi ngoài sandbox; đã được công cụ cấp quyền. Lần chạy ban đầu `bun run test/typecheck` báo Script not found vì tiến trình cài Bun ghi lại package.json; đã thêm lại scripts và chạy xanh.

Chưa làm: sửa gameplay/P0/P1, E2E và release QA thuộc phase sau. Không sửa odds, pity, matrix hoặc reference code. Không cần red/green bug test ở phase này vì chỉ bổ sung safety net, không sửa bug.
