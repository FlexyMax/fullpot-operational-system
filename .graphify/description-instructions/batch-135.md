# Node Description Batch 136 of 139

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

- "tabs_sales2qbtab_filterrows": "filterRows()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Sales2QBTab.tsx:L25 | neighbors=[Sales2QBTab.tsx]
- "tabs_sales2qbtab_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Sales2QBTab.tsx:L28 | neighbors=[Sales2QBTab.tsx]
- "tabs_sales2qbtab_sales2qbtab": "Sales2QBTab()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Sales2QBTab.tsx:L36 | neighbors=[Sales2QBTab.tsx]
- "tabs_sales2qbtab_sub_tabs": "SUB_TABS" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Sales2QBTab.tsx:L19 | neighbors=[Sales2QBTab.tsx]
- "tabs_salescosts2qbtab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCosts2QBTab.tsx:L18 | neighbors=[SalesCosts2QBTab.tsx]
- "tabs_salescosts2qbtab_filterrows": "filterRows()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCosts2QBTab.tsx:L25 | neighbors=[SalesCosts2QBTab.tsx]
- "tabs_salescosts2qbtab_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCosts2QBTab.tsx:L28 | neighbors=[SalesCosts2QBTab.tsx]
- "tabs_salescosts2qbtab_salescosts2qbtab": "SalesCosts2QBTab()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCosts2QBTab.tsx:L36 | neighbors=[SalesCosts2QBTab.tsx]
- "tabs_salescosts2qbtab_sub_tabs": "SUB_TABS" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCosts2QBTab.tsx:L19 | neighbors=[SalesCosts2QBTab.tsx]
- "tabs_salescreditstab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCreditsTab.tsx:L18 | neighbors=[SalesCreditsTab.tsx]
- "tabs_salescreditstab_filterrows": "filterRows()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCreditsTab.tsx:L25 | neighbors=[SalesCreditsTab.tsx]
- "tabs_salescreditstab_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCreditsTab.tsx:L28 | neighbors=[SalesCreditsTab.tsx]
- "tabs_salescreditstab_salescreditstab": "SalesCreditsTab()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCreditsTab.tsx:L36 | neighbors=[SalesCreditsTab.tsx]
- "tabs_salescreditstab_sub_tabs": "SUB_TABS" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCreditsTab.tsx:L19 | neighbors=[SalesCreditsTab.tsx]
- "tabs_stocklisttab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L12 | neighbors=[StockListTab.tsx]
- "tabs_stocklisttab_fmt": "fmt()" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L15 | neighbors=[StockListTab.tsx]
- "tabs_stocklisttab_helpicon": "HelpIcon()" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L33 | neighbors=[StockListTab.tsx]
- "tabs_stocklisttab_props": "Props" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L27 | neighbors=[StockListTab.tsx]
- "tabs_stocklisttab_qcpost": "qcPost()" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L18 | neighbors=[StockListTab.tsx]
- "tabs_stocklisttab_subtab": "SubTab" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L25 | neighbors=[StockListTab.tsx]
- "tabs_stocklisttab_t": "t()" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L14 | neighbors=[StockListTab.tsx]
- "tabs_stocklisttab_toastconfirm": "toastConfirm()" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L22 | neighbors=[StockListTab.tsx]
- "tabs_transitboxestab_colorval": "colorVal()" | kind=code-symbol | source=src/app/qc/components/tabs/TransitBoxesTab.tsx:L20 | neighbors=[TransitBoxesTab.tsx]
- "tabs_transitboxestab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/qc/components/tabs/TransitBoxesTab.tsx:L10 | neighbors=[TransitBoxesTab.tsx]
- "tabs_transitboxestab_qcpost": "qcPost()" | kind=code-symbol | source=src/app/qc/components/tabs/TransitBoxesTab.tsx:L14 | neighbors=[TransitBoxesTab.tsx]
- "terms_route_get": "GET()" | kind=code-symbol | source=src/app/api/accounts-payable/terms/route.ts:L4 | neighbors=[route.ts]
- "test_api_config": "config" | kind=code-symbol | source=test_api.js:L3 | neighbors=[test_api.js]
- "test_api_sql": "sql" | kind=code-symbol | source=test_api.js:L2 | neighbors=[test_api.js]
- "test_lookups_config": "config" | kind=code-symbol | source=test_lookups.js:L3 | neighbors=[test_lookups.js]
- "test_lookups_sql": "sql" | kind=code-symbol | source=test_lookups.js:L2 | neighbors=[test_lookups.js]
- "test_salesman_config": "config" | kind=code-symbol | source=test_salesman.js:L3 | neighbors=[test_salesman.js]
- "test_salesman_sql": "sql" | kind=code-symbol | source=test_salesman.js:L2 | neighbors=[test_salesman.js]
- "to_farm_route_post": "POST()" | kind=code-symbol | source=src/app/api/standing-orders/to-farm/route.ts:L9 | neighbors=[route.ts]
- "to_whouse_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/to-whouse/route.ts:L7 | neighbors=[route.ts]
- "to_whouse_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/to-whouse/route.ts:L11 | neighbors=[route.ts]
- "to_whouse_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/to-whouse/route.ts:L9 | neighbors=[route.ts]
- "totals_route_get": "GET()" | kind=code-symbol | source=src/app/api/physical-scan/totals/route.ts:L6 | neighbors=[route.ts]
- "transfer_route_int": "int()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transfer/route.ts:L11 | neighbors=[route.ts]
- "transfer_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transfer/route.ts:L7 | neighbors=[route.ts]
- "transfer_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transfer/route.ts:L9 | neighbors=[route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-135.json

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
