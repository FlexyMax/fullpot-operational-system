# Node Description Batch 129 of 139

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

- "report_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/standing-orders/report/route.tsx:L11 | neighbors=[route.tsx]
- "report_route_get": "GET()" | kind=code-symbol | source=src/app/api/standing-orders/report/route.tsx:L27 | neighbors=[route.tsx]
- "report_route_p": "P" | kind=code-symbol | source=src/app/api/customer-payments/payment/[unico]/report/route.ts:L3 | neighbors=[route.tsx]
- "reports_htmlreportmodal_props": "Props" | kind=code-symbol | source=src/components/reports/HtmlReportModal.tsx:L6 | neighbors=[HtmlReportModal.tsx]
- "reports_labelgridpdf_styles": "styles" | kind=code-symbol | source=src/components/reports/LabelGridPDF.tsx:L8 | neighbors=[LabelGridPDF.tsx]
- "reports_labelgridpdf_t": "t()" | kind=code-symbol | source=src/components/reports/LabelGridPDF.tsx:L23 | neighbors=[LabelGridPDF.tsx]
- "reports_paymentauthpdf_props": "Props" | kind=code-symbol | source=src/components/reports/PaymentAuthPDF.tsx:L55 | neighbors=[PaymentAuthPDF.tsx]
- "reports_paymentauthpdf_s": "s" | kind=code-symbol | source=src/components/reports/PaymentAuthPDF.tsx:L11 | neighbors=[PaymentAuthPDF.tsx]
- "reports_reportmodalinner_props": "Props" | kind=code-symbol | source=src/components/reports/ReportModalInner.tsx:L11 | neighbors=[ReportModalInner.tsx]
- "reports_reportmodalinner_reportmodalinner": "ReportModalInner()" | kind=code-symbol | source=src/components/reports/ReportModalInner.tsx:L16 | neighbors=[ReportModalInner.tsx]
- "reports_reportpdf_cell": "cell()" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L78 | neighbors=[ReportPDF.tsx]
- "reports_reportpdf_colflex": "colFlex()" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L84 | neighbors=[ReportPDF.tsx]
- "reports_reportpdf_fmt": "fmt()" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L68 | neighbors=[ReportPDF.tsx]
- "reports_reportpdf_props": "Props" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L57 | neighbors=[ReportPDF.tsx]
- "reports_reportpdf_row": "Row()" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L86 | neighbors=[ReportPDF.tsx]
- "reports_reportpdf_styles": "styles" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L12 | neighbors=[ReportPDF.tsx]
- "reports_reportutils_contact_skip": "CONTACT_SKIP" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L42 | neighbors=[reportUtils.ts]
- "reports_reportutils_grower_cols": "GROWER_COLS" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L47 | neighbors=[reportUtils.ts]
- "reports_reportutils_internal_skip": "INTERNAL_SKIP" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L39 | neighbors=[reportUtils.ts]
- "reports_reportutils_vfp_skip": "VFP_SKIP" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L32 | neighbors=[reportUtils.ts]
- "reports_route_t": "t()" | kind=code-symbol | source=src/app/api/bi/reports/route.ts:L6 | neighbors=[route.ts]
- "reports_statementpdf_props": "Props" | kind=code-symbol | source=src/components/reports/StatementPDF.tsx:L106 | neighbors=[StatementPDF.tsx]
- "reports_statementpdf_s": "s" | kind=code-symbol | source=src/components/reports/StatementPDF.tsx:L17 | neighbors=[StatementPDF.tsx]
- "reports_statementpdfv2_logo": "LOGO" | kind=code-symbol | source=src/components/reports/StatementPDFv2.tsx:L5 | neighbors=[StatementPDFv2.tsx]
- "reports_statementpdfv2_props": "Props" | kind=code-symbol | source=src/components/reports/StatementPDFv2.tsx:L86 | neighbors=[StatementPDFv2.tsx]
- "reports_statementpdfv2_s": "s" | kind=code-symbol | source=src/components/reports/StatementPDFv2.tsx:L17 | neighbors=[StatementPDFv2.tsx]
- "reports_statementpdfv2_str": "str()" | kind=code-symbol | source=src/components/reports/StatementPDFv2.tsx:L83 | neighbors=[StatementPDFv2.tsx]
- "reps_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales/reps/route.ts:L6 | neighbors=[route.ts]
- "reset_route_post": "POST()" | kind=code-symbol | source=src/app/api/pbook2invoice/reset/route.ts:L6 | neighbors=[route.ts]
- "returns_route_get": "GET()" | kind=code-symbol | source=src/app/api/pos/history/returns/route.ts:L6 | neighbors=[route.ts]
- "rowunico_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/masters/items/products/bunch-recipe/[rowunico]/route.ts:L40 | neighbors=[route.ts]
- "rowunico_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/products/bunch-recipe/[rowunico]/route.ts:L6 | neighbors=[route.ts]
- "sales_page_actionbtn": "ActionBtn()" | kind=code-symbol | source=src/app/sales/page.tsx:L60 | neighbors=[page.tsx]
- "sales_page_bool": "bool()" | kind=code-symbol | source=src/app/sales/page.tsx:L57 | neighbors=[page.tsx]
- "sales_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/sales/page.tsx:L24 | neighbors=[page.tsx]
- "sales_page_norm": "norm()" | kind=code-symbol | source=src/app/sales/page.tsx:L28 | neighbors=[page.tsx]
- "sales_page_normone": "normOne()" | kind=code-symbol | source=src/app/sales/page.tsx:L29 | neighbors=[page.tsx]
- "sales_page_statusbadge": "StatusBadge()" | kind=code-symbol | source=src/app/sales/page.tsx:L81 | neighbors=[page.tsx]
- "sales_page_vfprowstyle": "vfpRowStyle()" | kind=code-symbol | source=src/app/sales/page.tsx:L45 | neighbors=[page.tsx]
- "sales_reps_page_confirmdlg": "ConfirmDlg()" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L241 | neighbors=[page.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-128.json

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
