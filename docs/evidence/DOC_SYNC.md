# Đồng bộ tài liệu sau Phase 4 — 03/11/2026

Phạm vi: tài liệu khớp build B và phản hồi dừng đọc kết quả từng ván. Không thay gameplay hoặc ghi nhận thêm quyết định của chủ dự án.

## Thay đổi (file:dòng)

- `docs/05_MATCH_SIMULATOR.md:3`, `07_FRONTEND_UX_ART.md:3`, `09_ACCEPTANCE_QA.md:3`, `13_MATCH_DECISION_SPEC.md:5`: engine B, GAME_RECAP, thắng/thua/logs, Next thủ công, career reload và demo no-write; yêu cầu regression và giới hạn QA local.
- `docs/04_COLLECTION_PACKS_ECONOMY.md:3`, `06_DATA_MODEL_API.md:3`, `08_ARCHITECTURE_DEPLOY.md:3`: pool pack không Legacy, OVR/training/perk thực tế, localStorage/save/recovery contract và deploy harness; phần A được ghi rõ là tham khảo.
- `docs/00_START_HERE.md:3`, `CLAUDE.md:13`, `10_ROADMAP_AGENT_WORKFLOW.md:3`, `agents/IMPLEMENTATION_PROMPT.md:3`: kiến trúc B hiện tại, hạn đã giãn chưa có ngày mới và work order/M9 hiện hành.
- `docs/03_CAMPAIGN_DESIGN.md:3`, `12_CONTENT_BLUEPRINT.md:3`, `14_ECONOMY_SIM_TABLE.md:3`: phân biệt thiết kế đích với code đã kiểm chứng; catalog 399 identities/684 editions; chưa có đầy đủ next split/qualification hoặc mô phỏng wallet theo chính sách.
- `docs/11_RIGHTS_SOURCES.md:13`, `index.md:15`, `CHANGELOG.md:3`, `FILE_MANIFEST.json:1`: placeholder/credit theo mặc định Q6, tracker/log, changelog và manifest mới. DECISIONS không đổi.

## Lệnh và output

```text
python - (kiểm tra protected blocks/relative links và chuẩn hóa EOL Markdown về CRLF hiện có, qua PowerShell here-string)
PASS: pack odds, pity definition, decision matrix and DECISIONS unchanged from HEAD.
PASS: modified Markdown relative file links resolve.
PASS: source/config/dependencies unchanged from HEAD.
bun scripts/generate-manifest.ts
Generated 39 documentation entries (reference source checksums live in legacyManifest.json).
bun scripts/generate-manifest.ts --check
PASS: 39 documentation entries match bytes/sha256.
git diff --check -- docs
exit=0; khong co loi whitespace (Git canh bao EOL cua FILE_MANIFEST.json)
```

Đối chiếu catalog bằng Bun import các export thực tế: `players=399`, `editions=684`, `currentPackEditions=30`, `legacy=649`. Đã đọc lại save/recovery, simulator, recap UI, training, palette và flag trước khi mô tả contract. Không chạy lại tests/build/E2E cho lượt chỉ sửa tài liệu; 31 tests/14 browser results là bằng chứng Phase 4 đã lưu trước đó, không phải lượt chạy mới.

## Blocker và phần không làm

- Tài liệu đã ghi rõ các gate mở: public HTTPS/portal, Safari/iOS/Firefox, human playtest, balance prototype, qualification/next split đầy đủ và wallet-policy simulation. Đồng bộ docs không giải quyết hoặc tự tick các gate này; G3 giữ tắt.
- Không sửa bảng odds/pity v2.2, decision matrix, rulesVersion, DECISIONS hoặc tự trả lời Q4–Q6. Không sửa docs/ref và không sao chép thêm dữ liệu hay assets.
- Các thay đổi có sẵn ngoài docs (ba file skill bị xóa và thư mục untracked trong docs/ref) được giữ nguyên, không đưa vào commit này. Chỉ commit cục bộ tài liệu đã nêu; không push.
