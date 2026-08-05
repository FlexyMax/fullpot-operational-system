# Node Description Batch 99 of 139

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

- "inventory_entry_page_iemobiletabs": "IEMobileTabs()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L146 | neighbors=[page.tsx]
- "inventory_entry_page_ieverticaltabs": "IEVerticalTabs()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L130 | neighbors=[page.tsx]
- "inventory_entry_page_lefttab": "LeftTab" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L119 | neighbors=[page.tsx]
- "inventory_entry_page_norm": "norm()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L49 | neighbors=[page.tsx]
- "inventory_entry_page_tbtn": "TBtn()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L88 | neighbors=[page.tsx]
- "invoice_charges_route_get": "GET()" | kind=code-symbol | source=src/app/api/awbs/invoice-charges/route.ts:L8 | neighbors=[route.ts]
- "invoice_charges_route_post": "POST()" | kind=code-symbol | source=src/app/api/awbs/invoice-charges/route.ts:L19 | neighbors=[route.ts]
- "invoice_no_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/invoice-by-number/[invoice_no]/route.ts:L5 | neighbors=[route.ts]
- "invoice_no_route_p": "P" | kind=code-symbol | source=src/app/api/customer-payments/invoice-by-number/[invoice_no]/route.ts:L3 | neighbors=[route.ts]
- "invoice_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/invoice/route.tsx:L14 | neighbors=[route.tsx]
- "invoice_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/accounts-payable/invoice/route.ts:L74 | neighbors=[route.tsx]
- "invoice_route_fmt2": "fmt2()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/invoice/route.tsx:L9 | neighbors=[route.tsx]
- "invoice_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/invoice/route.tsx:L8 | neighbors=[route.tsx]
- "invoice_route_group": "GROUP" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/invoice/route.tsx:L24 | neighbors=[route.tsx]
- "invoice_route_post": "POST()" | kind=code-symbol | source=src/app/api/accounts-payable/invoice/route.ts:L19 | neighbors=[route.tsx]
- "invoice_route_put": "PUT()" | kind=code-symbol | source=src/app/api/accounts-payable/invoice/route.ts:L46 | neighbors=[route.tsx]
- "invoice_search_route_get": "GET()" | kind=code-symbol | source=src/app/api/pbook2invoice/invoice-search/route.ts:L6 | neighbors=[route.ts]
- "invoice_uq_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/invoice-print/[invoice_uq]/route.ts:L4 | neighbors=[route.ts]
- "invoice_uq_route_p": "P" | kind=code-symbol | source=src/app/api/customer-payments/applied/[invoice_uq]/route.ts:L3 | neighbors=[route.ts]
- "invoices_by_customer_route_get": "GET()" | kind=code-symbol | source=src/app/api/pbook2invoice/invoices-by-customer/route.ts:L6 | neighbors=[route.ts]
- "invoices_route_get": "GET()" | kind=code-symbol | source=src/app/api/scan-in/invoices/route.ts:L7 | neighbors=[route.ts]
- "items_boxrecipemodal_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/masters/items/BoxRecipeModal.tsx:L12 | neighbors=[BoxRecipeModal.tsx]
- "items_boxrecipemodal_empty_form": "EMPTY_FORM" | kind=code-symbol | source=src/app/masters/items/BoxRecipeModal.tsx:L17 | neighbors=[BoxRecipeModal.tsx]
- "items_boxrecipemodal_n2": "n2()" | kind=code-symbol | source=src/app/masters/items/BoxRecipeModal.tsx:L14 | neighbors=[BoxRecipeModal.tsx]
- "items_boxrecipemodal_props": "Props" | kind=code-symbol | source=src/app/masters/items/BoxRecipeModal.tsx:L19 | neighbors=[BoxRecipeModal.tsx]
- "items_boxrecipemodal_sf": "sF()" | kind=code-symbol | source=src/app/masters/items/BoxRecipeModal.tsx:L15 | neighbors=[BoxRecipeModal.tsx]
- "items_bunchrecipemodal_cboption": "CbOption" | kind=code-symbol | source=src/app/masters/items/BunchRecipeModal.tsx:L13 | neighbors=[BunchRecipeModal.tsx]
- "items_bunchrecipemodal_combobox": "Combobox()" | kind=code-symbol | source=src/app/masters/items/BunchRecipeModal.tsx:L15 | neighbors=[BunchRecipeModal.tsx]
- "items_bunchrecipemodal_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/masters/items/BunchRecipeModal.tsx:L109 | neighbors=[BunchRecipeModal.tsx]
- "items_bunchrecipemodal_empty_form": "EMPTY_FORM" | kind=code-symbol | source=src/app/masters/items/BunchRecipeModal.tsx:L113 | neighbors=[BunchRecipeModal.tsx]
- "items_bunchrecipemodal_props": "Props" | kind=code-symbol | source=src/app/masters/items/BunchRecipeModal.tsx:L122 | neighbors=[BunchRecipeModal.tsx]
- "items_bunchrecipemodal_sf": "sF()" | kind=code-symbol | source=src/app/masters/items/BunchRecipeModal.tsx:L111 | neighbors=[BunchRecipeModal.tsx]
- "items_page_itemssetuppage": "ItemsSetupPage()" | kind=code-symbol | source=src/app/masters/items/page.tsx:L14 | neighbors=[page.tsx]
- "items_tab1_crudmodal": "CrudModal()" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L23 | neighbors=[Tab1.tsx]
- "items_tab1_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L17 | neighbors=[Tab1.tsx]
- "items_tab1_empty_case": "EMPTY_CASE" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L82 | neighbors=[Tab1.tsx]
- "items_tab1_empty_class": "EMPTY_CLASS" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L78 | neighbors=[Tab1.tsx]
- "items_tab1_empty_color": "EMPTY_COLOR" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L81 | neighbors=[Tab1.tsx]
- "items_tab1_empty_grade": "EMPTY_GRADE" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L80 | neighbors=[Tab1.tsx]
- "items_tab1_empty_subclass": "EMPTY_SUBCLASS" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L79 | neighbors=[Tab1.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-098.json

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
