# Node Description Batch 58 of 139

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

- "public_pdf_worker_min_xfaparser_mkattributes": "._mkAttributes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAParser, warn(), .onBeginElement()]
- "public_pdf_worker_min_xfaparser_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAParser, gr, .parseXml()]
- "public_pdf_worker_min_xhtmlnamespace_body": ".body()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getRichTextAsHtml(), XhtmlNamespace, Body]
- "public_pdf_worker_min_xmlconnection": "XmlConnection" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .xmlConnection(), .constructor()]
- "public_pdf_worker_min_xmlparserbase_parsecontent": "._parseContent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XMLParserBase, ._resolveEntities(), .parseXml()]
- "public_pdf_worker_min_xmlparserbase_resolveentities": "._resolveEntities()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XMLParserBase, ._parseContent(), .parseXml()]
- "public_pdf_worker_min_xr": "xr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindValue(), ._findDataByNameToConsume()]
- "public_pdf_worker_min_xref_processxrefstream": ".processXRefStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, .readXRefStream(), .readXRef()]
- "public_pdf_worker_min_xref_readxrefstream": ".readXRefStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, .processXRefStream(), FormatError]
- "public_pdf_worker_min_xsdconnection": "XsdConnection" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .xsdConnection(), .constructor()]
- "public_pdf_worker_min_xsl": "Xsl" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .xsl(), .constructor()]
- "public_pdf_worker_min_zpl": "Zpl" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .zpl(), .constructor()]
- "purchase_orders_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/purchase-orders/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "quota_uq_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/quota/growers-in/[quota_uq]/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "rates_route_post": "POST()" | kind=code-symbol | source=src/app/api/freights/rates/route.ts:L21 | neighbors=[route.ts, num(), txt()]
- "recipes_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/recipes/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "reports_paymentauthpdf_c": "c()" | kind=code-symbol | source=src/components/reports/PaymentAuthPDF.tsx:L50 | neighbors=[PaymentAuthPDF.tsx, fmtD(), PaymentAuthPDF()]
- "reports_paymentauthpdf_fmtd": "fmtD()" | kind=code-symbol | source=src/components/reports/PaymentAuthPDF.tsx:L52 | neighbors=[PaymentAuthPDF.tsx, c(), PaymentAuthPDF()]
- "reports_statementpdf_c": "c()" | kind=code-symbol | source=src/components/reports/StatementPDF.tsx:L90 | neighbors=[StatementPDF.tsx, fmtD(), StatementPDF()]
- "reports_statementpdf_fmtd": "fmtD()" | kind=code-symbol | source=src/components/reports/StatementPDF.tsx:L95 | neighbors=[StatementPDF.tsx, c(), StatementPDF()]
- "sales_page_fmt": "fmt()" | kind=code-symbol | source=src/app/sales/page.tsx:L32 | neighbors=[page.tsx, parseMoney(), SalesPage()]
- "sales_page_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/sales/page.tsx:L34 | neighbors=[page.tsx, t(), SalesPage()]
- "sales_page_t": "t()" | kind=code-symbol | source=src/app/sales/page.tsx:L27 | neighbors=[page.tsx, fmtDate(), SalesPage()]
- "sales_reps_page_t": "t()" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L26 | neighbors=[page.tsx, fmtDate(), SalesRepsPage()]
- "sales_reps_route_post": "POST()" | kind=code-symbol | source=src/app/api/sales-reps/route.ts:L20 | neighbors=[route.ts, bit(), num()]
- "saved_configs_route_get": "GET()" | kind=code-symbol | source=src/app/api/bi/saved-configs/route.ts:L22 | neighbors=[route.ts, t(), userUq()]
- "saved_configs_route_post": "POST()" | kind=code-symbol | source=src/app/api/bi/saved-configs/route.ts:L43 | neighbors=[route.ts, t(), userUq()]
- "saved_configs_route_t": "t()" | kind=code-symbol | source=src/app/api/bi/saved-configs/route.ts:L8 | neighbors=[route.ts, GET(), POST()]
- "saved_configs_route_useruq": "userUq()" | kind=code-symbol | source=src/app/api/bi/saved-configs/route.ts:L16 | neighbors=[route.ts, GET(), POST()]
- "scan_page_physicalscanpage": "PhysicalScanPage()" | kind=code-symbol | source=src/app/scan/page.tsx:L89 | neighbors=[page.tsx, isRack(), t()]
- "scan_page_t": "t()" | kind=code-symbol | source=src/app/scan/page.tsx:L25 | neighbors=[page.tsx, fmtDate(), PhysicalScanPage()]
- "shipto_copy_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/customers/[unico]/shipto-copy/route.ts:L1 | neighbors=[db.ts, executeProcedure(), POST()]
- "sp_companies_sp_sistema_empresas_update": "sp_sistema_empresas_update()" | kind=code-symbol | source=sp_companies.sql:L57 | neighbors=[sp_companies.sql, company, empresas]
- "sp_modules_screens_reports_sp_sistema_modulos_delete": "sp_sistema_modulos_delete()" | kind=code-symbol | source=sp_modules_screens_reports.sql:L75 | neighbors=[sp_modules_screens_reports.sql, modulo, pantalla]
- "sp_modules_screens_reports_sp_sistema_modulos_update": "sp_sistema_modulos_update()" | kind=code-symbol | source=sp_modules_screens_reports.sql:L39 | neighbors=[sp_modules_screens_reports.sql, module, modulo]
- "sp_modules_screens_reports_sp_sistema_pantallas_delete": "sp_sistema_pantallas_delete()" | kind=code-symbol | source=sp_modules_screens_reports.sql:L175 | neighbors=[sp_modules_screens_reports.sql, pantalla, pantalla_reportes]
- "sp_modules_screens_reports_sp_sistema_pantallas_update": "sp_sistema_pantallas_update()" | kind=code-symbol | source=sp_modules_screens_reports.sql:L135 | neighbors=[sp_modules_screens_reports.sql, pantalla, screen]
- "sp_modules_screens_reports_sp_sistema_reportes_update": "sp_sistema_reportes_update()" | kind=code-symbol | source=sp_modules_screens_reports.sql:L238 | neighbors=[sp_modules_screens_reports.sql, pantalla_reportes, report]
- "standing_orders_linemodal_linemodal": "LineModal()" | kind=code-symbol | source=src/app/standing-orders/LineModal.tsx:L29 | neighbors=[LineModal.tsx, t(), OrderDetailModal.tsx]
- "store_useauthstore": "useAuthStore.ts" | kind=code-symbol | source=src/store/useAuthStore.ts:L1 | neighbors=[page.tsx, AuthState, useAuthStore]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-057.json

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
