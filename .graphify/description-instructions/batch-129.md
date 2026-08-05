# Node Description Batch 130 of 139

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

- "sales_reps_page_dualpanel": "DualPanel()" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L121 | neighbors=[page.tsx]
- "sales_reps_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L23 | neighbors=[page.tsx]
- "sales_reps_page_empty_form": "EMPTY_FORM" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L40 | neighbors=[page.tsx]
- "sales_reps_page_fmt": "fmt()" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L32 | neighbors=[page.tsx]
- "sales_reps_page_modalsalesrepsreports": "ModalSalesRepsReports()" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L1339 | neighbors=[page.tsx]
- "sales_reps_page_norm": "norm()" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L27 | neighbors=[page.tsx]
- "sales_reps_page_perm_labels": "PERM_LABELS" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L66 | neighbors=[page.tsx]
- "sales_reps_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales-reps/route.ts:L9 | neighbors=[route.ts]
- "sales_reps_route_int": "int()" | kind=code-symbol | source=src/app/api/sales-reps/route.ts:L6 | neighbors=[route.ts]
- "sales_reps_route_str": "str()" | kind=code-symbol | source=src/app/api/sales-reps/route.ts:L7 | neighbors=[route.ts]
- "sales_usecustomerpaymentsstore_customerpaymentsstate": "CustomerPaymentsState" | kind=code-symbol | source=src/store/sales/useCustomerPaymentsStore.ts:L3 | neighbors=[useCustomerPaymentsStore.ts]
- "salesman_route_get": "GET()" | kind=code-symbol | source=src/app/api/pos/salesman/route.ts:L8 | neighbors=[route.ts]
- "salesman_uq_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/customers-by-salesman/[salesman_uq]/route.ts:L5 | neighbors=[route.ts]
- "salesman_uq_route_p": "P" | kind=code-symbol | source=src/app/api/customer-payments/customers-by-salesman/[salesman_uq]/route.ts:L3 | neighbors=[route.ts]
- "salesmen_links_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/sales-reps/salesmen-links/route.ts:L39 | neighbors=[route.ts]
- "salesmen_links_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales-reps/salesmen-links/route.ts:L4 | neighbors=[route.ts]
- "salesmen_links_route_post": "POST()" | kind=code-symbol | source=src/app/api/sales-reps/salesmen-links/route.ts:L24 | neighbors=[route.ts]
- "salesmen_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/lookups/salesmen/route.ts:L4 | neighbors=[route.ts]
- "saved_configs_route_postschema": "postSchema" | kind=code-symbol | source=src/app/api/bi/saved-configs/route.ts:L10 | neighbors=[route.ts]
- "scan_history_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/scan-history/route.ts:L11 | neighbors=[route.ts]
- "scan_history_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/scan-history/route.ts:L4 | neighbors=[route.ts]
- "scan_in_delayedboxmodal_delayedboxmodalprops": "DelayedBoxModalProps" | kind=code-symbol | source=src/components/scan-in/DelayedBoxModal.tsx:L15 | neighbors=[DelayedBoxModal.tsx]
- "scan_in_delayedboxmodal_reason": "Reason" | kind=code-symbol | source=src/components/scan-in/DelayedBoxModal.tsx:L9 | neighbors=[DelayedBoxModal.tsx]
- "scan_in_page_tabs": "TABS" | kind=code-symbol | source=src/app/scan-in/page.tsx:L47 | neighbors=[page.tsx]
- "scan_list_route_get": "GET()" | kind=code-symbol | source=src/app/api/scan-in/scan-list/route.ts:L7 | neighbors=[route.ts]
- "scan_out_page_scanoutpage": "ScanOutPage()" | kind=code-symbol | source=src/app/scan-out/page.tsx:L59 | neighbors=[page.tsx]
- "scan_out_page_t": "t()" | kind=code-symbol | source=src/app/scan-out/page.tsx:L22 | neighbors=[page.tsx]
- "scan_out_page_vendormatchescompuesto": "vendorMatchesCompuesto()" | kind=code-symbol | source=src/app/scan-out/page.tsx:L50 | neighbors=[page.tsx]
- "scan_page_downloadcsv": "downloadCsv()" | kind=code-symbol | source=src/app/scan/page.tsx:L38 | neighbors=[page.tsx]
- "scan_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/scan/page.tsx:L22 | neighbors=[page.tsx]
- "scan_page_fmtlot": "fmtLot()" | kind=code-symbol | source=src/app/scan/page.tsx:L27 | neighbors=[page.tsx]
- "scan_page_tabs": "TABS" | kind=code-symbol | source=src/app/scan/page.tsx:L75 | neighbors=[page.tsx]
- "scan_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/physical-scan/scan/route.ts:L51 | neighbors=[route.ts]
- "scan_route_post": "POST()" | kind=code-symbol | source=src/app/api/scan-in/scan/route.ts:L11 | neighbors=[route.ts]
- "scanned_boxes_route_get": "GET()" | kind=code-symbol | source=src/app/api/physical-scan/scanned-boxes/route.ts:L7 | neighbors=[route.ts]
- "scratch_checksps": "checkSps.js" | kind=code-symbol | source=scratch/checkSps.js:L1 | neighbors=[checkSps()]
- "scratch_checksps_checksps": "checkSps()" | kind=code-symbol | source=scratch/checkSps.js:L5 | neighbors=[checkSps.js]
- "scratch_extractsistema_files": "files" | kind=code-symbol | source=scratch/extractSistema.js:L9 | neighbors=[extractSistema.js]
- "scratch_extractsistema_fs": "fs" | kind=code-symbol | source=scratch/extractSistema.js:L1 | neighbors=[extractSistema.js]
- "scratch_extractsistema_path": "path" | kind=code-symbol | source=scratch/extractSistema.js:L2 | neighbors=[extractSistema.js]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-129.json

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
