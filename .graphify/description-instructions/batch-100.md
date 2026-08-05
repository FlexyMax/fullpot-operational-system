# Node Description Batch 101 of 139

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

- "lib_dates_toisodateest": "toISODateEST()" | kind=code-symbol | source=src/lib/dates.ts:L40 | neighbors=[dates.ts]
- "lib_db_baseconfig": "baseConfig" | kind=code-symbol | source=src/lib/db.ts:L3 | neighbors=[db.ts]
- "lib_db_fullpotconfig": "fullpotConfig" | kind=code-symbol | source=src/lib/db.ts:L23 | neighbors=[db.ts]
- "lib_db_sistemaconfig": "sistemaConfig" | kind=code-symbol | source=src/lib/db.ts:L24 | neighbors=[db.ts]
- "lib_permissions_full_access": "FULL_ACCESS" | kind=code-symbol | source=src/lib/permissions.ts:L108 | neighbors=[permissions.ts]
- "lib_permissions_pagepermissions": "PagePermissions" | kind=code-symbol | source=src/lib/permissions.ts:L96 | neighbors=[permissions.ts]
- "lib_permissions_screen_panta": "SCREEN_PANTA" | kind=code-symbol | source=src/lib/permissions.ts:L40 | neighbors=[permissions.ts]
- "lib_utils_formatcurrency": "formatCurrency()" | kind=code-symbol | source=src/lib/utils.ts:L8 | neighbors=[utils.ts]
- "lib_utils_formatdate": "formatDate()" | kind=code-symbol | source=src/lib/utils.ts:L16 | neighbors=[utils.ts]
- "line_route_post": "POST()" | kind=code-symbol | source=src/app/api/standing-orders/line/route.ts:L9 | neighbors=[route.ts]
- "lines_route_get": "GET()" | kind=code-symbol | source=src/app/api/pbook2invoice/lines/route.ts:L4 | neighbors=[route.ts]
- "list_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales-reps/reports/list/route.tsx:L10 | neighbors=[route.tsx]
- "log_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/users/[unico]/log/route.ts:L5 | neighbors=[route.ts]
- "login_page_errorbox": "ErrorBox()" | kind=code-symbol | source=src/app/login/page.tsx:L449 | neighbors=[page.tsx]
- "login_page_loginpage": "LoginPage()" | kind=code-symbol | source=src/app/login/page.tsx:L12 | neighbors=[page.tsx]
- "login_page_step": "Step" | kind=code-symbol | source=src/app/login/page.tsx:L10 | neighbors=[page.tsx]
- "logo_route_post": "POST()" | kind=code-symbol | source=src/app/api/system/companies/[unico]/logo/route.ts:L37 | neighbors=[route.ts]
- "logo_route_txt": "txt()" | kind=code-symbol | source=src/app/api/system/companies/[unico]/logo/route.ts:L6 | neighbors=[route.ts]
- "lookups_route_get": "GET()" | kind=code-symbol | source=src/app/api/vendors/lookups/route.ts:L4 | neighbors=[route.ts]
- "make_invoice_route_post": "POST()" | kind=code-symbol | source=src/app/api/pbook2invoice/make-invoice/route.ts:L9 | neighbors=[route.ts]
- "make_invoices_bulk_route_post": "POST()" | kind=code-symbol | source=src/app/api/pbook2invoice/make-invoices-bulk/route.ts:L9 | neighbors=[route.ts]
- "menu_page_geticon": "getIcon()" | kind=code-symbol | source=src/app/menu/page.tsx:L66 | neighbors=[page.tsx]
- "menu_page_label_display": "LABEL_DISPLAY" | kind=code-symbol | source=src/app/menu/page.tsx:L58 | neighbors=[page.tsx]
- "menu_page_menuitem": "MenuItem" | kind=code-symbol | source=src/app/menu/page.tsx:L15 | neighbors=[page.tsx]
- "menu_page_superadmin_only_routes": "SUPERADMIN_ONLY_ROUTES" | kind=code-symbol | source=src/app/menu/page.tsx:L94 | neighbors=[page.tsx]
- "menu_route_get": "GET()" | kind=code-symbol | source=src/app/api/user/menu/route.ts:L4 | neighbors=[route.ts]
- "messages_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/masters/customers/[unico]/messages/route.ts:L38 | neighbors=[route.ts]
- "messages_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/customers/[unico]/messages/route.ts:L9 | neighbors=[route.ts]
- "messages_route_p": "P" | kind=code-symbol | source=src/app/api/masters/customers/[unico]/messages/route.ts:L7 | neighbors=[route.ts]
- "modals_boxtransfermodal_boxtransfermodal": "BoxTransferModal()" | kind=code-symbol | source=src/app/qc/components/modals/BoxTransferModal.tsx:L20 | neighbors=[BoxTransferModal.tsx]
- "modals_boxtransfermodal_boxtransfermodalprops": "BoxTransferModalProps" | kind=code-symbol | source=src/app/qc/components/modals/BoxTransferModal.tsx:L13 | neighbors=[BoxTransferModal.tsx]
- "modals_boxtransfermodal_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/qc/components/modals/BoxTransferModal.tsx:L7 | neighbors=[BoxTransferModal.tsx]
- "modals_boxtransfermodal_qcpost": "qcPost()" | kind=code-symbol | source=src/app/qc/components/modals/BoxTransferModal.tsx:L9 | neighbors=[BoxTransferModal.tsx]
- "modals_logrecordmodal_logentry": "LogEntry" | kind=code-symbol | source=src/app/flexy2qb/components/modals/LogRecordModal.tsx:L10 | neighbors=[LogRecordModal.tsx]
- "modals_logrecordmodal_props": "Props" | kind=code-symbol | source=src/app/flexy2qb/components/modals/LogRecordModal.tsx:L18 | neighbors=[LogRecordModal.tsx]
- "modals_qcmodal_calcqc": "calcQC()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L106 | neighbors=[QCModal.tsx]
- "modals_qcmodal_cbrow": "CBRow()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L134 | neighbors=[QCModal.tsx]
- "modals_qcmodal_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L7 | neighbors=[QCModal.tsx]
- "modals_qcmodal_field": "Field()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L121 | neighbors=[QCModal.tsx]
- "modals_qcmodal_inforow": "InfoRow()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L147 | neighbors=[QCModal.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-100.json

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
