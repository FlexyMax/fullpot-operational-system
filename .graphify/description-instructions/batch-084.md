# Node Description Batch 85 of 139

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

- "scan_page_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/scan/page.tsx:L28 | neighbors=[page.tsx, t()]
- "scan_page_fmtn": "fmtN()" | kind=code-symbol | source=src/app/scan/page.tsx:L26 | neighbors=[page.tsx, StatBox()]
- "scan_page_israck": "isRack()" | kind=code-symbol | source=src/app/scan/page.tsx:L36 | neighbors=[page.tsx, PhysicalScanPage()]
- "scan_page_statbox": "StatBox()" | kind=code-symbol | source=src/app/scan/page.tsx:L53 | neighbors=[page.tsx, fmtN()]
- "scratch_freights_rewrite": "freights_rewrite.js" | kind=code-symbol | source=scratch/freights_rewrite.js:L1 | neighbors=[fs, path]
- "screens_route_bit": "bit()" | kind=code-symbol | source=src/app/api/system/screens/route.ts:L8 | neighbors=[route.ts, POST()]
- "screens_route_post": "POST()" | kind=code-symbol | source=src/app/api/system/screens/route.ts:L10 | neighbors=[route.ts, bit()]
- "scripts_extract_fpt_strings": "extract-fpt-strings.mjs" | kind=code-symbol | source=scripts/extract-fpt-strings.mjs:L1 | neighbors=[buf, text]
- "scripts_inspect_so_calls": "inspect-so-calls.mjs" | kind=code-symbol | source=scripts/inspect-so-calls.mjs:L1 | neighbors=[callSP(), config]
- "scripts_inspect_so_lookups": "inspect-so-lookups.mjs" | kind=code-symbol | source=scripts/inspect-so-lookups.mjs:L1 | neighbors=[call(), config]
- "scripts_inspect_so_sps": "inspect-so-sps.mjs" | kind=code-symbol | source=scripts/inspect-so-sps.mjs:L1 | neighbors=[config, SP_LIST]
- "scripts_migrate_system_panels": "migrate-system-panels.mjs" | kind=code-symbol | source=scripts/migrate-system-panels.mjs:L1 | neighbors=[c, matches]
- "seasons_route_bit": "bit()" | kind=code-symbol | source=src/app/api/freights/seasons/route.ts:L9 | neighbors=[route.ts, POST()]
- "seasons_route_genuq": "genUq()" | kind=code-symbol | source=src/app/api/freights/seasons/route.ts:L11 | neighbors=[route.ts, POST()]
- "seasons_route_num": "num()" | kind=code-symbol | source=src/app/api/freights/seasons/route.ts:L10 | neighbors=[route.ts, POST()]
- "seasons_route_txt": "txt()" | kind=code-symbol | source=src/app/api/freights/seasons/route.ts:L8 | neighbors=[route.ts, POST()]
- "send_code_route_maskemail": "maskEmail()" | kind=code-symbol | source=src/app/api/auth/send-code/route.ts:L6 | neighbors=[route.ts, POST()]
- "send_code_route_post": "POST()" | kind=code-symbol | source=src/app/api/auth/send-code/route.ts:L11 | neighbors=[route.ts, maskEmail()]
- "shipto_route_bit": "bit()" | kind=code-symbol | source=src/app/api/masters/customers/shipto/route.ts:L10 | neighbors=[route.ts, POST()]
- "shipto_route_num": "num()" | kind=code-symbol | source=src/app/api/masters/customers/shipto/route.ts:L8 | neighbors=[route.ts, POST()]
- "shipto_route_txt": "txt()" | kind=code-symbol | source=src/app/api/masters/customers/shipto/route.ts:L7 | neighbors=[route.ts, POST()]
- "sp_companies_company": "company" | kind=code-symbol | source=sp_companies.sql:L106 | neighbors=[sp_companies.sql, sp_sistema_empresas_update()]
- "sp_companies_sp_sistema_empresas_delete": "sp_sistema_empresas_delete()" | kind=code-symbol | source=sp_companies.sql:L113 | neighbors=[sp_companies.sql, empresas]
- "sp_companies_sp_sistema_empresas_insert": "sp_sistema_empresas_insert()" | kind=code-symbol | source=sp_companies.sql:L10 | neighbors=[sp_companies.sql, empresas]
- "sp_modules_screens_reports_module": "module" | kind=code-symbol | source=sp_modules_screens_reports.sql:L68 | neighbors=[sp_modules_screens_reports.sql, sp_sistema_modulos_update()]
- "sp_modules_screens_reports_report": "report" | kind=code-symbol | source=sp_modules_screens_reports.sql:L277 | neighbors=[sp_modules_screens_reports.sql, sp_sistema_reportes_update()]
- "sp_modules_screens_reports_screen": "screen" | kind=code-symbol | source=sp_modules_screens_reports.sql:L168 | neighbors=[sp_modules_screens_reports.sql, sp_sistema_pantallas_update()]
- "sp_modules_screens_reports_sp_sistema_modulos_insert": "sp_sistema_modulos_insert()" | kind=code-symbol | source=sp_modules_screens_reports.sql:L10 | neighbors=[sp_modules_screens_reports.sql, modulo]
- "sp_modules_screens_reports_sp_sistema_pantallas_insert": "sp_sistema_pantallas_insert()" | kind=code-symbol | source=sp_modules_screens_reports.sql:L104 | neighbors=[sp_modules_screens_reports.sql, pantalla]
- "sp_modules_screens_reports_sp_sistema_reportes_delete": "sp_sistema_reportes_delete()" | kind=code-symbol | source=sp_modules_screens_reports.sql:L284 | neighbors=[sp_modules_screens_reports.sql, pantalla_reportes]
- "sp_modules_screens_reports_sp_sistema_reportes_insert": "sp_sistema_reportes_insert()" | kind=code-symbol | source=sp_modules_screens_reports.sql:L204 | neighbors=[sp_modules_screens_reports.sql, pantalla_reportes]
- "standing_orders_boxcompositionmodal_boxcompositionmodal": "BoxCompositionModal()" | kind=code-symbol | source=src/app/standing-orders/BoxCompositionModal.tsx:L31 | neighbors=[BoxCompositionModal.tsx, OrderDetailModal.tsx]
- "standing_orders_changecustomermodal_changecustomermodal": "ChangeCustomerModal()" | kind=code-symbol | source=src/app/standing-orders/ChangeCustomerModal.tsx:L21 | neighbors=[ChangeCustomerModal.tsx, OrderDetailModal.tsx]
- "standing_orders_changesalesmanmodal_changesalesmanmodal": "ChangeSalesmanModal()" | kind=code-symbol | source=src/app/standing-orders/ChangeSalesmanModal.tsx:L20 | neighbors=[ChangeSalesmanModal.tsx, OrderDetailModal.tsx]
- "standing_orders_changeseasonmodal_changeseasonmodal": "ChangeSeasonModal()" | kind=code-symbol | source=src/app/standing-orders/ChangeSeasonModal.tsx:L25 | neighbors=[ChangeSeasonModal.tsx, OrderDetailModal.tsx]
- "standing_orders_changeseasonmodal_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/standing-orders/ChangeSeasonModal.tsx:L9 | neighbors=[ChangeSeasonModal.tsx, t()]
- "standing_orders_changeseasonmodal_t": "t()" | kind=code-symbol | source=src/app/standing-orders/ChangeSeasonModal.tsx:L7 | neighbors=[ChangeSeasonModal.tsx, fmtDate()]
- "standing_orders_futurestockmodal_futurestockmodal": "FutureStockModal()" | kind=code-symbol | source=src/app/standing-orders/FutureStockModal.tsx:L23 | neighbors=[FutureStockModal.tsx, OrderDetailModal.tsx]
- "standing_orders_headermodal_t": "t()" | kind=code-symbol | source=src/app/standing-orders/HeaderModal.tsx:L7 | neighbors=[HeaderModal.tsx, HeaderModal()]
- "standing_orders_linemodal_t": "t()" | kind=code-symbol | source=src/app/standing-orders/LineModal.tsx:L7 | neighbors=[LineModal.tsx, LineModal()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-084.json

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
