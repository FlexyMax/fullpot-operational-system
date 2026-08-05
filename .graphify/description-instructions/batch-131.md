# Node Description Batch 132 of 139

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

- "scripts_migrate_customers_tabs_l3": "l3" | kind=code-symbol | source=scripts/migrate-customers-tabs.mjs:L24 | neighbors=[migrate-customers-tabs.mjs]
- "scripts_migrate_customers_tabs_l4": "l4" | kind=code-symbol | source=scripts/migrate-customers-tabs.mjs:L29 | neighbors=[migrate-customers-tabs.mjs]
- "scripts_migrate_customers_tabs_lines": "lines" | kind=code-symbol | source=scripts/migrate-customers-tabs.mjs:L4 | neighbors=[migrate-customers-tabs.mjs]
- "scripts_migrate_customers_tabs_tabsareastart": "tabsAreaStart" | kind=code-symbol | source=scripts/migrate-customers-tabs.mjs:L64 | neighbors=[migrate-customers-tabs.mjs]
- "scripts_migrate_system_panels_c": "c" | kind=code-symbol | source=scripts/migrate-system-panels.mjs:L15 | neighbors=[migrate-system-panels.mjs]
- "scripts_migrate_system_panels_matches": "matches" | kind=code-symbol | source=scripts/migrate-system-panels.mjs:L31 | neighbors=[migrate-system-panels.mjs]
- "scripts_migrate_users_grid": "migrate-users-grid.mjs" | kind=code-symbol | source=scripts/migrate-users-grid.mjs:L1 | neighbors=[c]
- "scripts_migrate_users_grid_c": "c" | kind=code-symbol | source=scripts/migrate-users-grid.mjs:L4 | neighbors=[migrate-users-grid.mjs]
- "search_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales-reps/search/route.ts:L4 | neighbors=[route.ts]
- "search_route_post": "POST()" | kind=code-symbol | source=src/app/api/pos/invoice/search/route.ts:L4 | neighbors=[route.ts]
- "seasons_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/lookups/seasons/route.ts:L4 | neighbors=[route.ts]
- "send_all_customers_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/send-all-customers/route.ts:L4 | neighbors=[route.ts]
- "send_label_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/send-label/route.ts:L4 | neighbors=[route.ts]
- "send_label_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/send-label/route.ts:L9 | neighbors=[route.ts]
- "send_statement_email_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/reports/send-statement-email/route.ts:L9 | neighbors=[route.ts]
- "shipto_carriers_route_get": "GET()" | kind=code-symbol | source=src/app/api/pos/shipto-carriers/route.ts:L8 | neighbors=[route.ts]
- "shipto_copy_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/customers/[unico]/shipto-copy/route.ts:L4 | neighbors=[route.ts]
- "shipto_route_int": "int()" | kind=code-symbol | source=src/app/api/masters/customers/shipto/route.ts:L9 | neighbors=[route.ts]
- "shiptos_route_get": "GET()" | kind=code-symbol | source=src/app/api/standing-orders/shiptos/route.ts:L4 | neighbors=[route.ts]
- "standing_orders_boxcompositionmodal_comprow": "CompRow" | kind=code-symbol | source=src/app/standing-orders/BoxCompositionModal.tsx:L20 | neighbors=[BoxCompositionModal.tsx]
- "standing_orders_boxcompositionmodal_fmt": "fmt()" | kind=code-symbol | source=src/app/standing-orders/BoxCompositionModal.tsx:L10 | neighbors=[BoxCompositionModal.tsx]
- "standing_orders_boxcompositionmodal_fmti": "fmtI()" | kind=code-symbol | source=src/app/standing-orders/BoxCompositionModal.tsx:L11 | neighbors=[BoxCompositionModal.tsx]
- "standing_orders_boxcompositionmodal_props": "Props" | kind=code-symbol | source=src/app/standing-orders/BoxCompositionModal.tsx:L13 | neighbors=[BoxCompositionModal.tsx]
- "standing_orders_boxcompositionmodal_t": "t()" | kind=code-symbol | source=src/app/standing-orders/BoxCompositionModal.tsx:L9 | neighbors=[BoxCompositionModal.tsx]
- "standing_orders_changecustomermodal_props": "Props" | kind=code-symbol | source=src/app/standing-orders/ChangeCustomerModal.tsx:L10 | neighbors=[ChangeCustomerModal.tsx]
- "standing_orders_changecustomermodal_t": "t()" | kind=code-symbol | source=src/app/standing-orders/ChangeCustomerModal.tsx:L8 | neighbors=[ChangeCustomerModal.tsx]
- "standing_orders_changesalesmanmodal_props": "Props" | kind=code-symbol | source=src/app/standing-orders/ChangeSalesmanModal.tsx:L9 | neighbors=[ChangeSalesmanModal.tsx]
- "standing_orders_changesalesmanmodal_t": "t()" | kind=code-symbol | source=src/app/standing-orders/ChangeSalesmanModal.tsx:L7 | neighbors=[ChangeSalesmanModal.tsx]
- "standing_orders_changeseasonmodal_props": "Props" | kind=code-symbol | source=src/app/standing-orders/ChangeSeasonModal.tsx:L15 | neighbors=[ChangeSeasonModal.tsx]
- "standing_orders_futurestockmodal_fmt": "fmt()" | kind=code-symbol | source=src/app/standing-orders/FutureStockModal.tsx:L9 | neighbors=[FutureStockModal.tsx]
- "standing_orders_futurestockmodal_props": "Props" | kind=code-symbol | source=src/app/standing-orders/FutureStockModal.tsx:L21 | neighbors=[FutureStockModal.tsx]
- "standing_orders_futurestockmodal_stockrow": "StockRow" | kind=code-symbol | source=src/app/standing-orders/FutureStockModal.tsx:L11 | neighbors=[FutureStockModal.tsx]
- "standing_orders_futurestockmodal_t": "t()" | kind=code-symbol | source=src/app/standing-orders/FutureStockModal.tsx:L8 | neighbors=[FutureStockModal.tsx]
- "standing_orders_headermodal_days": "DAYS" | kind=code-symbol | source=src/app/standing-orders/HeaderModal.tsx:L8 | neighbors=[HeaderModal.tsx]
- "standing_orders_headermodal_labelinput": "LabelInput()" | kind=code-symbol | source=src/app/standing-orders/HeaderModal.tsx:L36 | neighbors=[HeaderModal.tsx]
- "standing_orders_headermodal_lookups": "Lookups" | kind=code-symbol | source=src/app/standing-orders/HeaderModal.tsx:L19 | neighbors=[HeaderModal.tsx]
- "standing_orders_headermodal_props": "Props" | kind=code-symbol | source=src/app/standing-orders/HeaderModal.tsx:L28 | neighbors=[HeaderModal.tsx]
- "standing_orders_headermodal_toisodate": "toISODate()" | kind=code-symbol | source=src/app/standing-orders/HeaderModal.tsx:L10 | neighbors=[HeaderModal.tsx]
- "standing_orders_linemodal_labelinput": "LabelInput()" | kind=code-symbol | source=src/app/standing-orders/LineModal.tsx:L18 | neighbors=[LineModal.tsx]
- "standing_orders_linemodal_props": "Props" | kind=code-symbol | source=src/app/standing-orders/LineModal.tsx:L9 | neighbors=[LineModal.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-131.json

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
