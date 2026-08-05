# Node Description Batch 60 of 139

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

- "boxes_route_bit": "bit()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/route.ts:L10 | neighbors=[route.ts, POST()]
- "boxes_route_num": "num()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/route.ts:L8 | neighbors=[route.ts, POST()]
- "bunch_recipe_route_nullifempty": "nullIfEmpty()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/bunch-recipe/route.ts:L4 | neighbors=[route.ts, POST()]
- "bunch_recipe_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/bunch-recipe/route.ts:L16 | neighbors=[route.ts, nullIfEmpty()]
- "business_intelligence_page_applyconfigtogrid": "applyConfigToGrid()" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L132 | neighbors=[page.tsx, cleanColumnState()]
- "business_intelligence_page_businessintelligencepage": "BusinessIntelligencePage()" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L159 | neighbors=[page.tsx, defaultRange()]
- "business_intelligence_page_cleancolumnstate": "cleanColumnState()" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L119 | neighbors=[page.tsx, applyConfigToGrid()]
- "business_intelligence_page_defaultrange": "defaultRange()" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L75 | neighbors=[page.tsx, BusinessIntelligencePage()]
- "carrier_route_bit": "bit()" | kind=code-symbol | source=src/app/api/masters/customers/carrier/route.ts:L8 | neighbors=[route.ts, POST()]
- "carrier_route_txt": "txt()" | kind=code-symbol | source=src/app/api/masters/customers/carrier/route.ts:L7 | neighbors=[route.ts, POST()]
- "carriers_page_carriersdefinitionpage": "CarriersDefinitionPage()" | kind=code-symbol | source=src/app/masters/carriers/page.tsx:L77 | neighbors=[page.tsx, t()]
- "carriers_page_t": "t()" | kind=code-symbol | source=src/app/masters/carriers/page.tsx:L47 | neighbors=[page.tsx, CarriersDefinitionPage()]
- "cases_route_bit": "bit()" | kind=code-symbol | source=src/app/api/masters/items/cases/route.ts:L7 | neighbors=[route.ts, POST()]
- "cases_route_num": "num()" | kind=code-symbol | source=src/app/api/masters/items/cases/route.ts:L8 | neighbors=[route.ts, POST()]
- "cases_route_txt": "txt()" | kind=code-symbol | source=src/app/api/masters/items/cases/route.ts:L6 | neighbors=[route.ts, POST()]
- "cities_route_genuq": "genUq()" | kind=code-symbol | source=src/app/api/freights/cities/route.ts:L9 | neighbors=[route.ts, POST()]
- "cities_route_txt": "txt()" | kind=code-symbol | source=src/app/api/freights/cities/route.ts:L8 | neighbors=[route.ts, POST()]
- "companies_page_companiespage": "CompaniesPage()" | kind=code-symbol | source=src/app/system/companies/page.tsx:L40 | neighbors=[page.tsx, t()]
- "companies_page_t": "t()" | kind=code-symbol | source=src/app/system/companies/page.tsx:L25 | neighbors=[page.tsx, CompaniesPage()]
- "companies_route_bit": "bit()" | kind=code-symbol | source=src/app/api/system/companies/route.ts:L10 | neighbors=[route.ts, POST()]
- "companies_route_txt": "txt()" | kind=code-symbol | source=src/app/api/system/companies/route.ts:L9 | neighbors=[route.ts, POST()]
- "components_providers": "Providers.tsx" | kind=code-symbol | source=src/components/Providers.tsx:L1 | neighbors=[layout.tsx, Providers()]
- "components_providers_providers": "Providers()" | kind=code-symbol | source=src/components/Providers.tsx:L8 | neighbors=[layout.tsx, Providers.tsx]
- "components_shared_toastconfirm": "toastConfirm()" | kind=code-symbol | source=src/app/sales/customer-payments/components/Shared.tsx:L21 | neighbors=[Shared.tsx, page.tsx]
- "components_userupsertmodal_userupsertmodal": "UserUpsertModal()" | kind=code-symbol | source=src/app/system/users/components/UserUpsertModal.tsx:L21 | neighbors=[UserUpsertModal.tsx, page.tsx]
- "composition_route_num": "num()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/route.ts:L11 | neighbors=[route.ts, POST()]
- "composition_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/route.ts:L23 | neighbors=[route.ts, num()]
- "composition_uq_route_num": "num()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/[composition_uq]/route.ts:L11 | neighbors=[route.ts, PUT()]
- "composition_uq_route_put": "PUT()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/[composition_uq]/route.ts:L13 | neighbors=[route.ts, num()]
- "context_qccontext_qcprovider": "QCProvider()" | kind=code-symbol | source=src/app/qc/context/QCContext.tsx:L31 | neighbors=[QCContext.tsx, page.tsx]
- "copy_route_post": "POST()" | kind=code-symbol | source=src/app/api/system/access/copy/route.ts:L6 | neighbors=[route.ts, txt()]
- "copy_route_txt": "txt()" | kind=code-symbol | source=src/app/api/freights/rates/copy/route.ts:L7 | neighbors=[route.ts, POST()]
- "create_route_bit": "bit()" | kind=code-symbol | source=src/app/api/masters/customers/create/route.ts:L9 | neighbors=[route.ts, POST()]
- "create_route_num": "num()" | kind=code-symbol | source=src/app/api/masters/customers/create/route.ts:L7 | neighbors=[route.ts, POST()]
- "create_route_txt": "txt()" | kind=code-symbol | source=src/app/api/masters/customers/create/route.ts:L6 | neighbors=[route.ts, POST()]
- "customer_payments_ar_lookup_sps": "ar_lookup_sps.sql" | kind=code-symbol | source=sql/customer-payments/ar_lookup_sps.sql:L1 | neighbors=[9e70e94 refactor(ar): replace raw UPDAT…, e5fdd2c docs(standards): SP return form…]
- "customers_page_customerssetuppage": "CustomersSetupPage()" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L39 | neighbors=[page.tsx, t()]
- "customers_page_t": "t()" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L27 | neighbors=[page.tsx, CustomersSetupPage()]
- "cut_off_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/cut-off/route.tsx:L26 | neighbors=[route.tsx, t()]
- "cut_off_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/cut-off/route.tsx:L7 | neighbors=[route.tsx, GET()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-059.json

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
