# Node Description Batch 128 of 139

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

- "public_pdf_worker_min_xn": "xn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_xref_lastxrefstreampos": ".lastXRefStreamPos()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef]
- "public_pdf_worker_min_xref_resetnewtemporaryref": ".resetNewTemporaryRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef]
- "public_pdf_worker_min_xrefentryexception_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRefEntryException]
- "public_pdf_worker_min_xrefparseexception_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRefParseException]
- "public_pdf_worker_min_xsdconnection_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XsdConnection]
- "public_pdf_worker_min_xsl_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Xsl]
- "public_pdf_worker_min_xt": "Xt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_y": "y" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_ya": "Ya" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_yi": "yi" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_yn": "yn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_ys": "ys" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_yt": "yt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_za": "Za" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_zpl_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Zpl]
- "public_pdf_worker_min_zt": "Zt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "purchase_orders_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/purchase-orders/route.ts:L5 | neighbors=[route.ts]
- "qc_page_qcpage": "QCPage()" | kind=code-symbol | source=src/app/qc/page.tsx:L46 | neighbors=[page.tsx]
- "qc_page_qcpagewrapper": "QCPageWrapper()" | kind=code-symbol | source=src/app/qc/page.tsx:L38 | neighbors=[page.tsx]
- "qc_page_tabid": "TabId" | kind=code-symbol | source=src/app/qc/page.tsx:L36 | neighbors=[page.tsx]
- "qc_page_tabs": "TABS" | kind=code-symbol | source=src/app/qc/page.tsx:L28 | neighbors=[page.tsx]
- "quarterly_detail_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/quarterly-detail/route.tsx:L11 | neighbors=[route.tsx]
- "quarterly_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/quarterly/route.tsx:L10 | neighbors=[route.tsx]
- "quota_uq_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/products/quota/growers-in/[quota_uq]/route.ts:L4 | neighbors=[route.ts]
- "quotas_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/quotas/route.ts:L4 | neighbors=[route.ts]
- "quotas_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/quotas/route.ts:L14 | neighbors=[route.ts]
- "rates_route_get": "GET()" | kind=code-symbol | source=src/app/api/freights/rates/route.ts:L10 | neighbors=[route.ts]
- "ready_to_scan_route_get": "GET()" | kind=code-symbol | source=src/app/api/physical-scan/ready-to-scan/route.ts:L7 | neighbors=[route.ts]
- "reasons_route_get": "GET()" | kind=code-symbol | source=src/app/api/scan-in/reasons/route.ts:L7 | neighbors=[route.ts]
- "recepted_route_get": "GET()" | kind=code-symbol | source=src/app/api/scan-in/recepted/route.ts:L7 | neighbors=[route.ts]
- "recipe_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/products/recipe/route.ts:L6 | neighbors=[route.ts]
- "recipes_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/recipes/route.ts:L4 | neighbors=[route.ts]
- "refactor_cp_content": "content" | kind=code-symbol | source=refactor_cp.js:L5 | neighbors=[refactor_cp.js]
- "refactor_cp_file": "file" | kind=code-symbol | source=refactor_cp.js:L4 | neighbors=[refactor_cp.js]
- "refactor_cp_fs": "fs" | kind=code-symbol | source=refactor_cp.js:L1 | neighbors=[refactor_cp.js]
- "refactor_cp_path": "path" | kind=code-symbol | source=refactor_cp.js:L2 | neighbors=[refactor_cp.js]
- "repacking_route_int": "int()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/repacking/route.ts:L10 | neighbors=[route.ts]
- "repacking_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/repacking/route.ts:L7 | neighbors=[route.ts]
- "repacking_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/repacking/route.ts:L9 | neighbors=[route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-127.json

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
