# Phase 1 — 03/11/2026

## Thay đổi

- `src/context/GameContext.tsx:69`: một save reducer + ref đồng bộ; mọi action đọc state mới nhất. Lưu snapshot versioned vào một key và migrate save cũ. `:286` mở pack tiêu thụ đúng một instance, `:592` xuất/nhập Recovery Code.
- `src/App.tsx:28`: pendingWelcome/useEffect chờ pack; bỏ timeout điều phối, toàn bộ hook trước early return; trạng thái loading và banner storage blocked.
- `src/lib/saveState.ts:25`: validation cấu trúc, reference và bounds trước restore; `src/lib/recoveryCode.ts:16`/`:29`: `AR1.<base64url(deflate)>.<CRC32>`, giới hạn mã 500k ký tự và dữ liệu giải nén 2MB.
- `src/components/RecoveryModal.tsx:6`: nhập/xuất save, báo lỗi, fallback chọn văn bản khi clipboard bị chặn; dialog/Esc/focus trap (`src/lib/useDialog.ts:3`). `OnboardingModal.tsx:42` có đường nhập mã khi chưa có CLB; `src/index.css:25` cho phép chọn văn bản.
- `src/lib/__tests__/recovery.test.ts:10`: 5 tests. `scripts/e2e-p0.js:1`, `scripts/e2e-f0.js:1`, `scripts/e2e-storage.js:1`: Playwright scripts chạy trong browser context riêng.

## Lệnh và output

```text
Playwright scripts/e2e-p0.js BEFORE:
Error: P0 regression: {"claimed":true,"welcomeOpens":false,"duplicate":false,"fakeRestore":true}
AFTER:
{"claimed":true,"welcomeOpens":true,"duplicate":false,"fakeRestore":false}

Playwright scripts/e2e-f0.js:
{"viewport":"390x844","cards":6,"credits":1000,"completed":[1],"equipped":true,"reload":true,"recovery":true,"pageErrors":[]}

Playwright scripts/e2e-storage.js:
{"storageBlockedBanner":true,"restoreFromOnboarding":true,"clipboardBlocked":true,"manualCopySelected":true}

bun run typecheck
$ tsc --noEmit
bun run test
Test Files 2 passed (2)
Tests 11 passed (11)
bun run build
1687 modules transformed; built successfully
```

Trong QA, test timestamp thật phát hiện validator giới hạn 1e12 quá thấp cho milliseconds năm 2026. Đã thêm test thất bại `accepts real millisecond timestamps in 2026`, sửa bounds thành safe integer, chạy lại xanh.

## Nghiệm thu / giới hạn

P0-1: F0 UI thật ở 390×844 với seed cố định (Date.now=1), 5 starter, 3 tactical selections hiện đầy đủ, chiến thắng, Welcome Rare+, trang bị, reload giữ lineup và wallet. P0-2: mã hỏng bị từ chối, mã hợp lệ khôi phục nguyên snapshot, onboarding có import, storage/clipboard bị chặn vẫn có cách sao lưu. CRC là kiểm tra lỗi dữ liệu, không chống sửa save hoặc gian lận.

Blocker: không có blocker Phase 1. Bộ duyệt tự động từ chối `localStorage.clear()` trên localhost; dùng browser context riêng thay thế, không xóa dữ liệu trình duyệt đang dùng. Vite từng cache bản module trong lúc ghi file; khởi động lại dev server và chạy E2E xanh.

Chưa làm: 14 mục P1, cân bằng, pack Skip timer, header overflow, FOCUS_1, iframe cross-origin thật, release/deploy và các mục G (thuộc phase sau). Save một key và isLoading được làm sớm vì cần để restore P0 và không ghi snapshot rời rạc. Không sửa odds/pity/matrix, không dùng tài sản thật.
