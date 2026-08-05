# Node Description Batch 3 of 139

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
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "pending_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-in/pending/route.ts:L1 | neighbors=[0b02d04 fix(payment-auth): 4 issues — V…, 657dacf fix(ap-reports): filter VFP met…, 7772f1b feat(scan-in): add AWB Receptio…, 7d048ed fix(payment-authorizations): 7 …, a61433b fix(ap-reports): normalize colu…, bd0afde fix(payment-auth): blank PDF (A…]
- "layout_appheader": "AppHeader.tsx" | kind=code-symbol | source=src/components/layout/AppHeader.tsx:L1 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, d7aa6e3 fix(auth): enforce user permiss…]
- "lib_audit_useauditlog": "useAuditLog()" | kind=code-symbol | source=src/lib/audit.ts:L90 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, page.tsx]
- "public_pdf_worker_min_xref_fetch": ".fetch()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._saveRadioButton(), .metadata(), .#O(), _collectJS(), ._cache(), .getCached()]
- "reports_reportpdf_reportpdf": "ReportPDF()" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L98 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.tsx]
- "scan_in_page": "page.tsx" | kind=code-symbol | source=src/app/scan-in/page.tsx:L1 | neighbors=[1857d90 feat(scan-in): add confirm dial…, 624fb9b fix(scan-in): map all SP column…, 7772f1b feat(scan-in): add AWB Receptio…, AuditLogModal.tsx, AuditLogModal(), AppFooter.tsx]
- "lib_dates": "dates.ts" | kind=code-symbol | source=src/lib/dates.ts:L1 | neighbors=[page.tsx, page.tsx, Shared.tsx, route.ts, page.tsx, currentYearEST()]
- "lib_permissions_usepagepermissions": "usePagePermissions()" | kind=code-symbol | source=src/lib/permissions.ts:L136 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, page.tsx]
- "public_pdf_worker_min_annotationfactory_create": ".create()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AnnotationFactory, Annotation, ._getPageIndex(), ButtonWidgetAnnotation, CaretAnnotation, ChoiceWidgetAnnotation]
- "public_pdf_worker_min_field_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Field, applyAssist(), CheckButton, checkDimensions(), ChoiceList, computeBbox()]
- "public_pdf_worker_min_htmlresult_success": ".success()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.[nn](), .[nn](), .[nn](), .[nn](), .[nn](), .[nn]()]
- "tabs_stocklisttab": "StockListTab.tsx" | kind=code-symbol | source=src/app/qc/components/tabs/StockListTab.tsx:L1 | neighbors=[1ac6172 style(qc): unify StockListTab g…, 3091e96 feat(qc/panelgrid): Download as…, 6285dc8 fix(qc+inventory-entry): Scan O…, 7c0d5ac feat(qc): infinite scroll, auto…, 8b150b9 fix(qc): add onLog/onRefresh to…, b8b372b fix(qc): wire AuditLogModal to …]
- "components_auditlogmodal_auditlogmodal": "AuditLogModal()" | kind=code-symbol | source=src/components/AuditLogModal.tsx:L20 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, AuditLogModal.tsx]
- "components_shared": "Shared.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/Shared.tsx:L1 | neighbors=[9ef9c8a fix(customer-payments): correct…, ApplyPaymentModal.tsx, ApproveCreditModal.tsx, CashBackModal.tsx, CorpInvoiceModal.tsx, CorpPaymentModal.tsx]
- "customers_route": "route.tsx" | kind=code-symbol | source=src/app/api/sales-reps/reports/customers/route.tsx:L1 | neighbors=[2fa45a1 fix(sales-reps): add explicit a…, 3170b5b fix(sales-reps): exclude salesm…, 4907715 feat(sales-reps): group custome…, 533b609 fix(sales-reps): correct SP par…, 65db5f6 fix(sales-reps): add error hand…, cc3d5cb fix(customers): export CSV down…]
- "public_pdf_worker_min_page": "Page" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .annotations(), .constructor(), .content(), .cropBox(), .extractTextContent()]
- "scan_out_page": "page.tsx" | kind=code-symbol | source=src/app/scan-out/page.tsx:L1 | neighbors=[3ab71d6 feat(scan-out): add full Scan O…, 68885a9 fix(menu+scan-out): disable Sca…, AuditLogModal.tsx, AuditLogModal(), AppFooter.tsx, AppHeader.tsx]
- "items_bunchrecipemodal": "BunchRecipeModal.tsx" | kind=code-symbol | source=src/app/masters/items/BunchRecipeModal.tsx:L1 | neighbors=[69066d9 fix(bunch-recipe): 5 UI fixes +…, 70e5b30 fix(bunch-recipe): grade/color/…, a2a004f feat(items): Bunch Recipe + Box…, cc11367 feat(bunch-recipe): smarter var…, f887af3 feat(bunch-recipe): searchable …, AuditLogModal.tsx]
- "layout_appfooter": "AppFooter.tsx" | kind=code-symbol | source=src/components/layout/AppFooter.tsx:L1 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, page.tsx]
- "public_pdf_worker_min_localesetnamespace": "LocaleSetNamespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .calendarSymbols(), .[cn](), .currencySymbol(), .currencySymbols(), .datePattern()]
- "public_pdf_worker_min_subform_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Subform, applyAssist(), BreakAfter, BreakBefore, checkDimensions(), createWrapper()]
- "tabs_qchistorytab": "QCHistoryTab.tsx" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L1 | neighbors=[3091e96 feat(qc/panelgrid): Download as…, 7c0d5ac feat(qc): infinite scroll, auto…, 8b150b9 fix(qc): add onLog/onRefresh to…, af5d85c style(qc): remove duplicate sea…, b8b372b fix(qc): wire AuditLogModal to …, efc6ad8 refactor(qc): migrate all grid …]
- "public_pdf_worker_min_stringtopdfstring": "stringToPDFString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._constructFieldName(), ._parseStringHelper(), .attachments(), ._collectJavaScript(), .destinations()]
- "summary_route": "route.tsx" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/summary/route.tsx:L1 | neighbors=[0b02d04 fix(payment-auth): 4 issues — V…, 657dacf fix(ap-reports): filter VFP met…, 7d048ed fix(payment-authorizations): 7 …, a61433b fix(ap-reports): normalize colu…, bd0afde fix(payment-auth): blank PDF (A…, dc1c19d feat(payment-auth): PDF reports…]
- "tabs_qualitycreditstab": "QualityCreditsTab.tsx" | kind=code-symbol | source=src/app/qc/components/tabs/QualityCreditsTab.tsx:L1 | neighbors=[3091e96 feat(qc/panelgrid): Download as…, 605e4e2 feat(qc): paginate QC stock sea…, 7c0d5ac feat(qc): infinite scroll, auto…, 843b4b7 fix(qc): restore useQuery impor…, 8b150b9 fix(qc): add onLog/onRefresh to…, af5d85c style(qc): remove duplicate sea…]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@080dacf62d132a1bc8c208fb4d0687a8acf3d1a5": "080dacf feat(auth): SUPERADMIN level restrictions, U2FA toggle, multi-email 2FA" | kind=Commit | source=git | neighbors=[page.tsx, master, worktree-agent-a59e3078904cba68a, f5e908f fix(access): SA-only row stylin…, page.tsx, route.ts]
- "payments_resume_route": "route.tsx" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/payments-resume/route.tsx:L1 | neighbors=[081d28f fix(payment-auth): payments PDF…, 657dacf fix(ap-reports): filter VFP met…, 7d048ed fix(payment-authorizations): 7 …, a61433b fix(ap-reports): normalize colu…, dc1c19d feat(payment-auth): PDF reports…, ecf4fd3 fix(reports): fix blank print +…]
- "payments_route": "route.tsx" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/payments/route.tsx:L1 | neighbors=[081d28f fix(payment-auth): payments PDF…, 37b7727 fix(payment-auth): payments-by-…, 657dacf fix(ap-reports): filter VFP met…, 7d048ed fix(payment-authorizations): 7 …, a61433b fix(ap-reports): normalize colu…, dc1c19d feat(payment-auth): PDF reports…]
- "qc_page": "page.tsx" | kind=code-symbol | source=src/app/qc/page.tsx:L1 | neighbors=[f7acc6c fix(qc/mobile): 3 mobile UX imp…, QCContext.tsx, QCProvider(), useQCContext(), AppFooter.tsx, AppHeader.tsx]
- "flexy2qb_page": "page.tsx" | kind=code-symbol | source=src/app/flexy2qb/page.tsx:L1 | neighbors=[Flexy2QBPage(), TABS, useFlexy2QBStore.ts, useFlexy2QBStore, AppFooter.tsx, AppFooter()]
- "lib_db_executequery": "executeQuery()" | kind=code-symbol | source=src/lib/db.ts:L85 | neighbors=[route.ts, route.ts, route.ts, route.ts, route.ts, route.ts]
- "public_pdf_worker_min_partialevaluator_gettextcontent": ".getTextContent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.extractTextContent(), .extractTextContent(), PartialEvaluator, .getByRef(), .getArray(), EvaluatorPreprocessor]
- "public_pdf_worker_min_xref": "XRef" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .fetch(), .fetchAsync(), .fetchCompressed()]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@3b0d9e617de8baf9aee63a315d4e7763cc2c0c59": "3b0d9e6 feat(inventory-entry): add server-side audit logging to all CRUD API ro…" | kind=Commit | source=git | neighbors=[route.ts, route.ts, route.ts, worktree-agent-a59e3078904cba68a, route.ts, bbc39ac feat(inventory-entry): migrate …]
- "delayed_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-in/delayed/route.ts:L1 | neighbors=[7772f1b feat(scan-in): add AWB Receptio…, a54e0fd fix(scan-in): correct SP error/…, f4ad8b5 fix(scan-in): correct all SP pa…, COLUMNS, DELETE(), fmtDate()]
- "items_boxrecipemodal": "BoxRecipeModal.tsx" | kind=code-symbol | source=src/app/masters/items/BoxRecipeModal.tsx:L1 | neighbors=[67b5a2d fix(box-recipe): product dropdo…, a2a004f feat(items): Bunch Recipe + Box…, AuditLogModal.tsx, AuditLogModal(), BoxRecipeModal(), EMPTY_ARR]
- "modals_logrecordmodal": "LogRecordModal.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/modals/LogRecordModal.tsx:L1 | neighbors=[d4bfb3c feat(audit+ui): serverAuditLog …, e62e50b feat(flexy2qb): add LogRecordMo…, utils.ts, cn(), LogEntry, LogRecordModal()]
- "public_pdf_worker_min_basestream": "BaseStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .asyncGetBytes(), .canAsyncDecodeImageFromBuffer(), .getBaseStreams(), .getByte(), .getByteRange()]
- "public_pdf_worker_min_cffcompiler": "CFFCompiler" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .compile(), .compileCharset(), .compileCharStrings(), .compileDict(), .compileEncoding()]
- "public_pdf_worker_min_parser": "Parser" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .create(), .constructor(), .#D(), .filter()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-002.json

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
