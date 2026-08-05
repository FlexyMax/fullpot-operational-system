# Node Description Batch 84 of 139

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

- "public_pdf_worker_min_xref_setstartxref": ".setStartXRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.parseStartXRef(), XRef]
- "public_pdf_worker_min_zi": "Zi" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .fetchStandardFontData()]
- "public_pdf_worker_min_zs": "Zs" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .onText()]
- "rates_route_num": "num()" | kind=code-symbol | source=src/app/api/freights/rates/route.ts:L8 | neighbors=[route.ts, POST()]
- "rates_route_txt": "txt()" | kind=code-symbol | source=src/app/api/freights/rates/route.ts:L7 | neighbors=[route.ts, POST()]
- "repacking_route_num": "num()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/repacking/route.ts:L11 | neighbors=[route.ts, POST()]
- "repacking_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/repacking/route.ts:L13 | neighbors=[route.ts, num()]
- "reports_companyinfo_t": "t()" | kind=code-symbol | source=src/lib/reports/companyInfo.ts:L16 | neighbors=[companyInfo.ts, getCompanyInfo()]
- "reports_htmlreportmodal_htmlreportmodal": "HtmlReportModal()" | kind=code-symbol | source=src/components/reports/HtmlReportModal.tsx:L11 | neighbors=[page.tsx, HtmlReportModal.tsx]
- "reports_labelgridpdf_labelgridpdf": "LabelGridPDF()" | kind=code-symbol | source=src/components/reports/LabelGridPDF.tsx:L25 | neighbors=[route.tsx, LabelGridPDF.tsx]
- "reports_paymentauthpdf_flex": "flex()" | kind=code-symbol | source=src/components/reports/PaymentAuthPDF.tsx:L53 | neighbors=[PaymentAuthPDF.tsx, PaymentAuthPDF()]
- "reports_paymentauthpdf_fmtn": "fmtN()" | kind=code-symbol | source=src/components/reports/PaymentAuthPDF.tsx:L51 | neighbors=[PaymentAuthPDF.tsx, PaymentAuthPDF()]
- "reports_reportpdf_reportgroup": "ReportGroup" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L50 | neighbors=[route.tsx, ReportPDF.tsx]
- "reports_reportpdf_vendorinfo": "VendorInfo" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L33 | neighbors=[ReportPDF.tsx, reportUtils.ts]
- "reports_reportutils_normkey": "normKey()" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L52 | neighbors=[reportUtils.ts, skipKey()]
- "reports_route_bit": "bit()" | kind=code-symbol | source=src/app/api/system/reports/route.ts:L8 | neighbors=[route.ts, POST()]
- "reports_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/screens/[unico]/reports/route.ts:L6 | neighbors=[route.ts, txt()]
- "reports_route_post": "POST()" | kind=code-symbol | source=src/app/api/system/reports/route.ts:L10 | neighbors=[route.ts, bit()]
- "reports_route_txt": "txt()" | kind=code-symbol | source=src/app/api/system/screens/[unico]/reports/route.ts:L4 | neighbors=[route.ts, GET()]
- "reports_statementpdf_flex": "flex()" | kind=code-symbol | source=src/components/reports/StatementPDF.tsx:L100 | neighbors=[StatementPDF.tsx, StatementPDF()]
- "reports_statementpdf_fmtn": "fmtN()" | kind=code-symbol | source=src/components/reports/StatementPDF.tsx:L91 | neighbors=[StatementPDF.tsx, StatementPDF()]
- "reports_statementpdfv2_flx": "flx()" | kind=code-symbol | source=src/components/reports/StatementPDFv2.tsx:L84 | neighbors=[StatementPDFv2.tsx, StatementPDFv2()]
- "reports_statementpdfv2_fmt": "fmt()" | kind=code-symbol | source=src/components/reports/StatementPDFv2.tsx:L73 | neighbors=[StatementPDFv2.tsx, StatementPDFv2()]
- "reports_statementpdfv2_fmtd": "fmtD()" | kind=code-symbol | source=src/components/reports/StatementPDFv2.tsx:L78 | neighbors=[StatementPDFv2.tsx, StatementPDFv2()]
- "rowunico_route_nullifempty": "nullIfEmpty()" | kind=code-symbol | source=src/app/api/masters/items/products/bunch-recipe/[rowunico]/route.ts:L4 | neighbors=[route.ts, PUT()]
- "rowunico_route_put": "PUT()" | kind=code-symbol | source=src/app/api/masters/items/products/bunch-recipe/[rowunico]/route.ts:L19 | neighbors=[route.ts, nullIfEmpty()]
- "sales_page_fmti": "fmtI()" | kind=code-symbol | source=src/app/sales/page.tsx:L33 | neighbors=[page.tsx, SalesPage()]
- "sales_page_parsemoney": "parseMoney()" | kind=code-symbol | source=src/app/sales/page.tsx:L31 | neighbors=[page.tsx, fmt()]
- "sales_reps_page_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L33 | neighbors=[page.tsx, t()]
- "sales_reps_page_salesrepspage": "SalesRepsPage()" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L264 | neighbors=[page.tsx, t()]
- "sales_reps_route_bit": "bit()" | kind=code-symbol | source=src/app/api/sales-reps/route.ts:L4 | neighbors=[route.ts, POST()]
- "sales_reps_route_num": "num()" | kind=code-symbol | source=src/app/api/sales-reps/route.ts:L5 | neighbors=[route.ts, POST()]
- "sales_usecustomerpaymentsstore_usecustomerpaymentsstore": "useCustomerPaymentsStore" | kind=code-symbol | source=src/store/sales/useCustomerPaymentsStore.ts:L32 | neighbors=[page.tsx, useCustomerPaymentsStore.ts]
- "scan_in_delayedboxmodal_delayedboxmodal": "DelayedBoxModal()" | kind=code-symbol | source=src/components/scan-in/DelayedBoxModal.tsx:L23 | neighbors=[DelayedBoxModal.tsx, page.tsx]
- "scan_in_page_fmtn": "fmtN()" | kind=code-symbol | source=src/app/scan-in/page.tsx:L25 | neighbors=[page.tsx, StatBox()]
- "scan_in_page_scaninpage": "ScanInPage()" | kind=code-symbol | source=src/app/scan-in/page.tsx:L55 | neighbors=[page.tsx, t()]
- "scan_in_page_statbox": "StatBox()" | kind=code-symbol | source=src/app/scan-in/page.tsx:L27 | neighbors=[page.tsx, fmtN()]
- "scan_in_page_t": "t()" | kind=code-symbol | source=src/app/scan-in/page.tsx:L24 | neighbors=[page.tsx, ScanInPage()]
- "scan_out_page_fmtn": "fmtN()" | kind=code-symbol | source=src/app/scan-out/page.tsx:L23 | neighbors=[page.tsx, StatBox()]
- "scan_out_page_statbox": "StatBox()" | kind=code-symbol | source=src/app/scan-out/page.tsx:L25 | neighbors=[page.tsx, fmtN()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-083.json

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
