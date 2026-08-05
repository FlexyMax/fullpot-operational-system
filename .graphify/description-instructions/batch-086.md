# Node Description Batch 87 of 139

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "tabs_qualitycreditstab_t": "t()" | kind=code-symbol | source=src/app/qc/components/tabs/QualityCreditsTab.tsx:L13 | neighbors=[QualityCreditsTab.tsx, fmtDate()]
- "tabs_stocklisttab_stocklisttab": "StockListTab()" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L41 | neighbors=[StockListTab.tsx, today()]
- "tabs_stocklisttab_today": "today()" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L16 | neighbors=[StockListTab.tsx, StockListTab()]
- "tabs_transitboxestab_t": "t()" | kind=code-symbol | source=src/app/qc/components/tabs/TransitBoxesTab.tsx:L12 | neighbors=[TransitBoxesTab.tsx, TransitBoxesTab()]
- "tabs_transitboxestab_transitboxestab": "TransitBoxesTab()" | kind=code-symbol | source=src/app/qc/components/tabs/TransitBoxesTab.tsx:L26 | neighbors=[TransitBoxesTab.tsx, t()]
- "test_api_executeprocedure": "executeProcedure()" | kind=code-symbol | source=test_api.js:L12 | neighbors=[test_api.js, run()]
- "test_api_run": "run()" | kind=code-symbol | source=test_api.js:L21 | neighbors=[test_api.js, executeProcedure()]
- "test_lookups_executeprocedure": "executeProcedure()" | kind=code-symbol | source=test_lookups.js:L12 | neighbors=[test_lookups.js, run()]
- "test_lookups_run": "run()" | kind=code-symbol | source=test_lookups.js:L21 | neighbors=[test_lookups.js, executeProcedure()]
- "test_salesman_executeprocedure": "executeProcedure()" | kind=code-symbol | source=test_salesman.js:L12 | neighbors=[test_salesman.js, run()]
- "test_salesman_run": "run()" | kind=code-symbol | source=test_salesman.js:L21 | neighbors=[test_salesman.js, executeProcedure()]
- "transfer_route_num": "num()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transfer/route.ts:L10 | neighbors=[route.ts, POST()]
- "transfer_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transfer/route.ts:L13 | neighbors=[route.ts, num()]
- "transform_route_num": "num()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transform/route.ts:L10 | neighbors=[route.ts, POST()]
- "transform_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transform/route.ts:L12 | neighbors=[route.ts, num()]
- "unico_route_bit": "bit()" | kind=code-symbol | source=src/app/api/vendors/[unico]/route.ts:L8 | neighbors=[route.ts, PUT()]
- "unico_route_getextrafields": "getExtraFields()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/route.ts:L15 | neighbors=[route.ts, GET()]
- "unico_route_num": "num()" | kind=code-symbol | source=src/app/api/vendors/[unico]/route.ts:L9 | neighbors=[route.ts, PUT()]
- "users_route_post": "POST()" | kind=code-symbol | source=src/app/api/system/users/route.ts:L19 | neighbors=[route.ts, txt()]
- "users_route_txt": "txt()" | kind=code-symbol | source=src/app/api/system/users/route.ts:L8 | neighbors=[route.ts, POST()]
- "vendors_backup_firstofyear": "firstOfYear()" | kind=code-symbol | source=vendors_backup.tsx:L40 | neighbors=[vendors_backup.tsx, VendorsPage()]
- "vendors_backup_norm": "norm()" | kind=code-symbol | source=vendors_backup.tsx:L23 | neighbors=[vendors_backup.tsx, VendorsPage()]
- "vendors_backup_t": "t()" | kind=code-symbol | source=vendors_backup.tsx:L22 | neighbors=[vendors_backup.tsx, VendorsPage()]
- "vendors_backup_today": "today()" | kind=code-symbol | source=vendors_backup.tsx:L39 | neighbors=[vendors_backup.tsx, VendorsPage()]
- "vendors_page_firstofyear": "firstOfYear()" | kind=code-symbol | source=src/app/vendors/page.tsx:L66 | neighbors=[page.tsx, VendorsPage()]
- "vendors_page_norm": "norm()" | kind=code-symbol | source=src/app/vendors/page.tsx:L49 | neighbors=[page.tsx, VendorsPage()]
- "vendors_page_t": "t()" | kind=code-symbol | source=src/app/vendors/page.tsx:L48 | neighbors=[page.tsx, VendorsPage()]
- "vendors_page_today": "today()" | kind=code-symbol | source=src/app/vendors/page.tsx:L65 | neighbors=[page.tsx, VendorsPage()]
- "vendors_route_bit": "bit()" | kind=code-symbol | source=src/app/api/vendors/route.ts:L6 | neighbors=[route.ts, POST()]
- "vendors_route_num": "num()" | kind=code-symbol | source=src/app/api/vendors/route.ts:L7 | neighbors=[route.ts, POST()]
- "verify_bi_exec_main": "main()" | kind=code-symbol | source=verify_bi_exec.js:L15 | neighbors=[verify_bi_exec.js, runPositional()]
- "verify_bi_exec_runpositional": "runPositional()" | kind=code-symbol | source=verify_bi_exec.js:L7 | neighbors=[verify_bi_exec.js, main()]
- "warehouse_route_bit": "bit()" | kind=code-symbol | source=src/app/api/freights/warehouse/route.ts:L8 | neighbors=[route.ts, POST()]
- "warehouse_route_num": "num()" | kind=code-symbol | source=src/app/api/freights/warehouse/route.ts:L9 | neighbors=[route.ts, POST()]
- "warehouse_route_txt": "txt()" | kind=code-symbol | source=src/app/api/freights/warehouse/route.ts:L7 | neighbors=[route.ts, POST()]
- "web_route_bit": "bit()" | kind=code-symbol | source=src/app/api/vendors/[unico]/web/route.ts:L8 | neighbors=[route.ts, PUT()]
- "web_route_put": "PUT()" | kind=code-symbol | source=src/app/api/vendors/[unico]/web/route.ts:L10 | neighbors=[route.ts, bit()]
- "web_user_route_bit": "bit()" | kind=code-symbol | source=src/app/api/masters/customers/web-user/route.ts:L7 | neighbors=[route.ts, POST()]
- "web_user_route_txt": "txt()" | kind=code-symbol | source=src/app/api/masters/customers/web-user/route.ts:L6 | neighbors=[route.ts, POST()]
- "wh_instructions_route_casebreakdown": "caseBreakdown()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/wh-instructions/route.tsx:L11 | neighbors=[route.tsx, t()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-086.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
