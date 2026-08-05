# Node Description Batch 90 of 139

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

- "awbs_page_awbfetch": "awbFetch()" | kind=code-symbol | source=src/app/awbs/page.tsx:L40 | neighbors=[page.tsx]
- "awbs_page_awbsvarietiesmpfmodal": "AwbsVarietiesMpfModal()" | kind=code-symbol | source=src/app/awbs/page.tsx:L660 | neighbors=[page.tsx]
- "awbs_page_cancelbtn": "CancelBtn()" | kind=code-symbol | source=src/app/awbs/page.tsx:L95 | neighbors=[page.tsx]
- "awbs_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/awbs/page.tsx:L28 | neighbors=[page.tsx]
- "awbs_page_fosmodal": "FosModal()" | kind=code-symbol | source=src/app/awbs/page.tsx:L56 | neighbors=[page.tsx]
- "awbs_page_norm": "norm()" | kind=code-symbol | source=src/app/awbs/page.tsx:L34 | neighbors=[page.tsx]
- "awbs_page_savebtn": "SaveBtn()" | kind=code-symbol | source=src/app/awbs/page.tsx:L85 | neighbors=[page.tsx]
- "awbs_page_tabid": "TabId" | kind=code-symbol | source=src/app/awbs/page.tsx:L728 | neighbors=[page.tsx]
- "awbs_page_tabs": "TABS" | kind=code-symbol | source=src/app/awbs/page.tsx:L730 | neighbors=[page.tsx]
- "awbs_page_toastconfirm": "toastConfirm()" | kind=code-symbol | source=src/app/awbs/page.tsx:L47 | neighbors=[page.tsx]
- "balance_route_get": "GET()" | kind=code-symbol | source=src/app/api/accounts-payable/reports/balance/route.ts:L4 | neighbors=[route.ts]
- "banks_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/banks/route.ts:L4 | neighbors=[route.ts]
- "banks_route_post": "POST()" | kind=code-symbol | source=src/app/api/payment-authorizations/banks/route.ts:L13 | neighbors=[route.ts]
- "barcode_route_post": "POST()" | kind=code-symbol | source=src/app/api/pos/invoice/line/barcode/route.ts:L8 | neighbors=[route.ts]
- "batch_scan_route_post": "POST()" | kind=code-symbol | source=src/app/api/scan-in/batch-scan/route.ts:L11 | neighbors=[route.ts]
- "box_history_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/box-history/route.tsx:L17 | neighbors=[route.tsx]
- "box_history_route_fmt": "fmt()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/box-history/route.tsx:L8 | neighbors=[route.tsx]
- "box_history_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/box-history/route.tsx:L10 | neighbors=[route.tsx]
- "box_history_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/box-history/route.tsx:L9 | neighbors=[route.tsx]
- "box_recipe_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/box-recipe/route.ts:L4 | neighbors=[route.ts]
- "box_recipe_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/box-recipe/route.ts:L14 | neighbors=[route.ts]
- "boxes_route_get": "GET()" | kind=code-symbol | source=src/app/api/awbs/[awbcode]/boxes/route.ts:L4 | neighbors=[route.ts]
- "boxes_route_int": "int()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/route.ts:L9 | neighbors=[route.ts]
- "boxes_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/route.ts:L7 | neighbors=[route.ts]
- "bunch_recipe_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/bunch-recipe/route.ts:L6 | neighbors=[route.ts]
- "business_intelligence_page_apidelete": "apiDelete()" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L112 | neighbors=[page.tsx]
- "business_intelligence_page_apipost": "apiPost()" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L90 | neighbors=[page.tsx]
- "business_intelligence_page_apiput": "apiPut()" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L101 | neighbors=[page.tsx]
- "business_intelligence_page_biconfigjson": "BIConfigJson" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L62 | neighbors=[page.tsx]
- "business_intelligence_page_bifetch": "biFetch()" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L83 | neighbors=[page.tsx]
- "business_intelligence_page_bireport": "BIReport" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L34 | neighbors=[page.tsx]
- "business_intelligence_page_bireportdata": "BIReportData" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L41 | neighbors=[page.tsx]
- "business_intelligence_page_bisavedconfig": "BISavedConfig" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L47 | neighbors=[page.tsx]
- "business_intelligence_page_bivaluecol": "BIValueCol" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L57 | neighbors=[page.tsx]
- "business_intelligence_page_empty_configs": "EMPTY_CONFIGS" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L32 | neighbors=[page.tsx]
- "business_intelligence_page_empty_reports": "EMPTY_REPORTS" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L31 | neighbors=[page.tsx]
- "business_intelligence_page_formatheadername": "formatHeaderName()" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L71 | neighbors=[page.tsx]
- "by_bank_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/outcomes/by-bank/route.ts:L4 | neighbors=[route.ts]
- "carrier_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/customers/carrier/route.ts:L10 | neighbors=[route.ts]
- "carriers_page_confirmdlg": "ConfirmDlg()" | kind=code-symbol | source=src/app/masters/carriers/page.tsx:L27 | neighbors=[page.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-089.json

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
