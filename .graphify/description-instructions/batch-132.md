# Node Description Batch 133 of 139

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

- "standing_orders_orderdetailmodal_abtn": "ABtn()" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L52 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_orderdetailmodal_bool": "bool()" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L41 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_orderdetailmodal_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L26 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_orderdetailmodal_fieldrow": "FieldRow()" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L44 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_orderdetailmodal_fmt": "fmt()" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L32 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_orderdetailmodal_fmti": "fmtI()" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L33 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_orderdetailmodal_lookups": "Lookups" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L67 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_orderdetailmodal_norm": "norm()" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L30 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_orderdetailmodal_normone": "normOne()" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L31 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_orderdetailmodal_props": "Props" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L68 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_orderdetailmodal_week_cols": "WEEK_COLS" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L43 | neighbors=[OrderDetailModal.tsx]
- "standing_orders_page_bool": "bool()" | kind=code-symbol | source=src/app/standing-orders/page.tsx:L26 | neighbors=[page.tsx]
- "standing_orders_page_days": "DAYS" | kind=code-symbol | source=src/app/standing-orders/page.tsx:L35 | neighbors=[page.tsx]
- "standing_orders_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/standing-orders/page.tsx:L21 | neighbors=[page.tsx]
- "standing_orders_page_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/standing-orders/page.tsx:L27 | neighbors=[page.tsx]
- "standing_orders_page_norm": "norm()" | kind=code-symbol | source=src/app/standing-orders/page.tsx:L25 | neighbors=[page.tsx]
- "standing_orders_page_standingorderspage": "StandingOrdersPage()" | kind=code-symbol | source=src/app/standing-orders/page.tsx:L38 | neighbors=[page.tsx]
- "standing_orders_page_t": "t()" | kind=code-symbol | source=src/app/standing-orders/page.tsx:L24 | neighbors=[page.tsx]
- "standing_orders_productslistmodal_fmt": "fmt()" | kind=code-symbol | source=src/app/standing-orders/ProductsListModal.tsx:L11 | neighbors=[ProductsListModal.tsx]
- "standing_orders_productslistmodal_product": "Product" | kind=code-symbol | source=src/app/standing-orders/ProductsListModal.tsx:L22 | neighbors=[ProductsListModal.tsx]
- "standing_orders_productslistmodal_props": "Props" | kind=code-symbol | source=src/app/standing-orders/ProductsListModal.tsx:L15 | neighbors=[ProductsListModal.tsx]
- "standing_orders_setweeksmodal_even_weeks": "EVEN_WEEKS" | kind=code-symbol | source=src/app/standing-orders/SetWeeksModal.tsx:L28 | neighbors=[SetWeeksModal.tsx]
- "standing_orders_setweeksmodal_odd_weeks": "ODD_WEEKS" | kind=code-symbol | source=src/app/standing-orders/SetWeeksModal.tsx:L27 | neighbors=[SetWeeksModal.tsx]
- "standing_orders_setweeksmodal_props": "Props" | kind=code-symbol | source=src/app/standing-orders/SetWeeksModal.tsx:L20 | neighbors=[SetWeeksModal.tsx]
- "standing_orders_setweeksmodal_weekrow": "WeekRow" | kind=code-symbol | source=src/app/standing-orders/SetWeeksModal.tsx:L18 | neighbors=[SetWeeksModal.tsx]
- "statement_cut_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/reports/statement-cut/route.ts:L1 | neighbors=[POST()]
- "statement_cut_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/reports/statement-cut/route.ts:L4 | neighbors=[route.ts]
- "statement_pdf_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/reports/statement-pdf/route.tsx:L8 | neighbors=[route.tsx]
- "statement_route_get": "GET()" | kind=code-symbol | source=src/app/api/vendors/statement/route.ts:L4 | neighbors=[route.ts]
- "stock_om_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/stock-om/route.tsx:L24 | neighbors=[route.ts]
- "stock_om_route_fmt2": "fmt2()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/stock-om/route.tsx:L8 | neighbors=[route.ts]
- "stock_om_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/stock-om/route.tsx:L7 | neighbors=[route.ts]
- "stock_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales/stock/route.ts:L6 | neighbors=[route.ts]
- "store_useapstore_apstate": "APState" | kind=code-symbol | source=src/store/useAPStore.ts:L4 | neighbors=[useAPStore.ts]
- "store_useauthstore_authstate": "AuthState" | kind=code-symbol | source=src/store/useAuthStore.ts:L4 | neighbors=[useAuthStore.ts]
- "store_useawbstore_awbstate": "AwbState" | kind=code-symbol | source=src/store/useAwbStore.ts:L7 | neighbors=[useAwbStore.ts]
- "store_useawbstore_awbtabid": "AwbTabId" | kind=code-symbol | source=src/store/useAwbStore.ts:L3 | neighbors=[useAwbStore.ts]
- "store_useawbstore_todaystr": "todayStr()" | kind=code-symbol | source=src/store/useAwbStore.ts:L5 | neighbors=[useAwbStore.ts]
- "store_usecarriersstore_carriersstate": "CarriersState" | kind=code-symbol | source=src/store/useCarriersStore.ts:L3 | neighbors=[useCarriersStore.ts]
- "store_usecustomersstore_customersstate": "CustomersState" | kind=code-symbol | source=src/store/useCustomersStore.ts:L3 | neighbors=[useCustomersStore.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-132.json

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
