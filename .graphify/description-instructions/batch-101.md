# Node Description Batch 102 of 139

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

- "modals_qcmodal_input": "Input()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L130 | neighbors=[QCModal.tsx]
- "modals_qcmodal_qcform": "QCForm" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L29 | neighbors=[QCModal.tsx]
- "modals_qcmodal_qcmodal": "QCModal()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L156 | neighbors=[QCModal.tsx]
- "modals_qcmodal_qcmodalprops": "QCModalProps" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L21 | neighbors=[QCModal.tsx]
- "modals_qcmodal_qcpost": "qcPost()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L17 | neighbors=[QCModal.tsx]
- "modals_viewbalancemodal_props": "Props" | kind=code-symbol | source=src/app/flexy2qb/components/modals/ViewBalanceModal.tsx:L7 | neighbors=[ViewBalanceModal.tsx]
- "modals_viewbalancemodal_viewbalancemodal": "ViewBalanceModal()" | kind=code-symbol | source=src/app/flexy2qb/components/modals/ViewBalanceModal.tsx:L12 | neighbors=[ViewBalanceModal.tsx]
- "modals_viewinvoicemodal_props": "Props" | kind=code-symbol | source=src/app/flexy2qb/components/modals/ViewInvoiceModal.tsx:L7 | neighbors=[ViewInvoiceModal.tsx]
- "modals_viewinvoicemodal_viewinvoicemodal": "ViewInvoiceModal()" | kind=code-symbol | source=src/app/flexy2qb/components/modals/ViewInvoiceModal.tsx:L12 | neighbors=[ViewInvoiceModal.tsx]
- "modules_page_classes": "CLASSES" | kind=code-symbol | source=src/app/system/modules/page.tsx:L26 | neighbors=[page.tsx]
- "modules_page_confirmdelete": "ConfirmDelete()" | kind=code-symbol | source=src/app/system/modules/page.tsx:L761 | neighbors=[page.tsx]
- "modules_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/system/modules/page.tsx:L25 | neighbors=[page.tsx]
- "modules_page_empty_mod": "EMPTY_MOD" | kind=code-symbol | source=src/app/system/modules/page.tsx:L34 | neighbors=[page.tsx]
- "modules_page_empty_report": "EMPTY_REPORT" | kind=code-symbol | source=src/app/system/modules/page.tsx:L36 | neighbors=[page.tsx]
- "modules_page_empty_screen": "EMPTY_SCREEN" | kind=code-symbol | source=src/app/system/modules/page.tsx:L35 | neighbors=[page.tsx]
- "modules_page_modform": "ModForm" | kind=code-symbol | source=src/app/system/modules/page.tsx:L30 | neighbors=[page.tsx]
- "modules_page_moduleformmodal": "ModuleFormModal()" | kind=code-symbol | source=src/app/system/modules/page.tsx:L497 | neighbors=[page.tsx]
- "modules_page_reportform": "ReportForm" | kind=code-symbol | source=src/app/system/modules/page.tsx:L32 | neighbors=[page.tsx]
- "modules_page_reportformmodal": "ReportFormModal()" | kind=code-symbol | source=src/app/system/modules/page.tsx:L707 | neighbors=[page.tsx]
- "modules_page_screenform": "ScreenForm" | kind=code-symbol | source=src/app/system/modules/page.tsx:L31 | neighbors=[page.tsx]
- "modules_page_screenformmodal": "ScreenFormModal()" | kind=code-symbol | source=src/app/system/modules/page.tsx:L571 | neighbors=[page.tsx]
- "modules_page_sysfetch": "sysFetch()" | kind=code-symbol | source=src/app/system/modules/page.tsx:L28 | neighbors=[page.tsx]
- "modules_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/modules/route.ts:L11 | neighbors=[route.ts]
- "move_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/move/route.ts:L7 | neighbors=[route.ts]
- "move_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/move/route.ts:L11 | neighbors=[route.ts]
- "move_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/move/route.ts:L9 | neighbors=[route.ts]
- "move_targets_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/move-targets/route.ts:L8 | neighbors=[route.ts]
- "move_targets_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/move-targets/route.ts:L4 | neighbors=[route.ts]
- "mpf_route_put": "PUT()" | kind=code-symbol | source=src/app/api/awbs/varieties/mpf/route.ts:L7 | neighbors=[route.ts]
- "next_config_nextconfig": "nextConfig" | kind=code-symbol | source=next.config.ts:L3 | neighbors=[next.config.ts]
- "nextauth_route_handler": "handler" | kind=code-symbol | source=src/app/api/auth/[...nextauth]/route.ts:L76 | neighbors=[route.ts]
- "no_scan_list_route_get": "GET()" | kind=code-symbol | source=src/app/api/scan-in/no-scan-list/route.ts:L7 | neighbors=[route.ts]
- "no_scanned_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned/route.tsx:L11 | neighbors=[route.tsx]
- "no_scanned_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned/route.tsx:L8 | neighbors=[route.tsx]
- "no_scanned_summary_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned-summary/route.tsx:L10 | neighbors=[route.tsx]
- "no_scanned_summary_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned-summary/route.tsx:L7 | neighbors=[route.tsx]
- "notes_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/notes/route.ts:L11 | neighbors=[route.ts]
- "notes_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/notes/route.ts:L7 | neighbors=[route.ts]
- "notes_route_put": "PUT()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/notes/route.ts:L21 | neighbors=[route.ts]
- "notes_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/notes/route.ts:L9 | neighbors=[route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-101.json

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
