# Node Description Batch 13 of 139

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
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "public_pdf_worker_min_wrapreason": "wrapReason()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, MessageHandler, .#z(), AbortException, MissingPDFException, PasswordException] | lang=en
- "public_pdf_worker_min_writevalue": "writeValue()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, writeArray(), writeDict(), .encryptString(), escapePDFName(), escapeString()] | lang=en
- "public_pdf_worker_min_xmlparserbase_parsexml": ".parseXml()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.parseFromString(), .parse(), XMLParserBase, .onComment(), .onDoctype(), .onPi()] | lang=en
- "public_pdf_worker_min_xref_fetchasync": ".fetchAsync()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getAllPageDicts(), .getPageDict(), .getAsync(), .#X(), ._getLinearizationPage(), .#Z()] | lang=en
- "public_pdf_worker_min_xref_indexobjects": ".indexObjects()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, bytesToString(), InvalidPDFException, isCmd(), Lexer, Parser] | lang=en
- "rates_route": "route.ts" | kind=code-symbol | source=src/app/api/freights/rates/route.ts:L1 | neighbors=[4cb57ca feat(freights): eliminate direc…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), GET()] | lang=en
- "reports_reportmodal": "ReportModal.tsx" | kind=code-symbol | source=src/components/reports/ReportModal.tsx:L1 | neighbors=[page.tsx, page.tsx, Tab2.tsx, page.tsx, page.tsx, ReportModal] | lang=en
- "reports_reportutils_fmt": "fmt()" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L5 | neighbors=[route.tsx, route.tsx, route.ts, route.tsx, route.tsx, route.tsx] | lang=en
- "rowunico_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/bunch-recipe/[rowunico]/route.ts:L1 | neighbors=[69066d9 fix(bunch-recipe): 5 UI fixes +…, a2a004f feat(items): Bunch Recipe + Box…, db.ts, executeProcedure(), getFullpotPool(), DELETE()] | lang=en
- "sales_reps_route": "route.ts" | kind=code-symbol | source=src/app/api/sales-reps/route.ts:L1 | neighbors=[db.ts, executeProcedure(), executeQuery(), bit(), GET(), int()] | lang=en
- "statement_pdf_route": "route.tsx" | kind=code-symbol | source=src/app/api/customer-payments/reports/statement-pdf/route.tsx:L1 | neighbors=[4d6d80d feat(ar): white header + aging/…, 89816c3 feat(ar): PDF preview in modal …, db.ts, executeProcedure(), companyInfo.ts, getCompanyInfo()] | lang=en
- "store_usescanoutstore": "useScanOutStore.ts" | kind=code-symbol | source=src/store/useScanOutStore.ts:L1 | neighbors=[3ab71d6 feat(scan-out): add full Scan O…, page.tsx, INITIAL, ScanOutItem, ScanOutOrder, ScanOutState] | lang=en
- "to_farm_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/to-farm/route.ts:L1 | neighbors=[5c9b4e0 feat(standing-orders): register…, 821d7d5 feat(standing-orders): audit lo…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog()] | lang=en
- "transform_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transform/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), num()] | lang=en
- "wh_control_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/wh-control/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), int()] | lang=en
- "awb_setup_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/awb-setup/route.ts:L1 | neighbors=[GET(), POST(), str(), db.ts, executeProcedure(), serverAudit.ts] | lang=en
- "change_awb_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/change-awb/route.ts:L1 | neighbors=[P, POST(), str(), db.ts, executeProcedure(), serverAudit.ts] | lang=en
- "change_season_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/change-season/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), route.ts] | lang=en
- "close_route": "route.ts" | kind=code-symbol | source=src/app/api/pos/invoice/close/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), route.ts] | lang=en
- "colors_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/colors/route.ts:L1 | neighbors=[GET(), POST(), db.ts, executeProcedure(), serverAudit.ts, serverAuditLog()] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@387e481f22169b02473313f53194e1328adb456e": "387e481 feat(items): migrate grids to PanelGridTable + fix Tab3 initial load" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 71bd4f0 feat(items): remove Alternative…, route.ts, Tab2.tsx, Tab3.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@5949fecb27dd9e648be5219cb779772be5d1e4a3": "5949fec feat(audit): server-side bitacora logging for all AP CRUD routes" | kind=Commit | source=git | neighbors=[route.ts, worktree-agent-a59e3078904cba68a, 6285dc8 fix(qc+inventory-entry): Scan O…, route.tsx, route.tsx, serverAudit.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@7c0d5ac4cf567a16b8241d927bcb6d715409c369": "7c0d5ac feat(qc): infinite scroll, auto-select dates, responsive, QC History re…" | kind=Commit | source=git | neighbors=[37b7727 fix(payment-auth): payments-by-…, worktree-agent-a59e3078904cba68a, 1ac6172 style(qc): unify StockListTab g…, CancelledPurchasesTab.tsx, QCHistoryTab.tsx, QualityCreditsTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@8b150b91ddec5d467d57b411e1a89d68cb6ac4f1": "8b150b9 fix(qc): add onLog/onRefresh to all PanelGrids, fix QCHistory alignment…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, b8b372b fix(qc): wire AuditLogModal to …, CancelledPurchasesTab.tsx, QCHistoryTab.tsx, QualityCreditsTab.tsx, StockListTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@a0363ff0961dbae329f235d2111f34ccfdb505c3": "a0363ff fix(companies): first-load blank, raw SQL, missing audit trail" | kind=Commit | source=git | neighbors=[8bad964 fix(users): email field spans 2…, page.tsx, worktree-agent-a59e3078904cba68a, fac809c perf(modules): eliminate raw SQ…, page.tsx, route.ts] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@b4899cca85b5905f3ca9c4bd66dbf04eeb79d834": "b4899cc style(standing-orders): standardize remaining modals to design system" | kind=Commit | source=git | neighbors=[821d7d5 feat(standing-orders): audit lo…, master, worktree-agent-a59e3078904cba68a, eb8eaa1 fix(standing-orders): eliminate…, BoxCompositionModal.tsx, HeaderModal.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@b6ad5a5cbd6e1377d4d957f0b9f2bf34ae0f8fbf": "b6ad5a5 feat(masters/items): variety packs CRUD + replace browser dialogs with …" | kind=Commit | source=git | neighbors=[1afc81e fix(masters/items/grades): corr…, master, worktree-agent-a59e3078904cba68a, b9cd36c feat(items): convert Tab2 All P…, Tab2.tsx, Tab3.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ba40c733f962cfd8ed8040bbf0213ef05d1d2ec2": "ba40c73 feat(ar): fix invoice print/email — modal + PDF attachment via puppeteer" | kind=Commit | source=git | neighbors=[master, f035be9 fix(ar): use invoice_uq (flower…, page.tsx, route.ts, route.ts, pdf.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@bd0afdebe4bdf9a3e4b04c595e4ceeb29ab631c0": "bd0afde fix(payment-auth): blank PDF (ASCII subtitles), detail modal vendor col…" | kind=Commit | source=git | neighbors=[0b02d04 fix(payment-auth): 4 issues — V…, worktree-agent-a59e3078904cba68a, ecf4fd3 fix(reports): fix blank print +…, page.tsx, route.ts, route.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@efc6ad8b2c0e535a640a7c6b28cd401cfb002a6d": "efc6ad8 refactor(qc): migrate all grid headers to standard PanelGrid component" | kind=Commit | source=git | neighbors=[af5d85c style(qc): remove duplicate sea…, worktree-agent-a59e3078904cba68a, 8b150b9 fix(qc): add onLog/onRefresh to…, CancelledPurchasesTab.tsx, QCHistoryTab.tsx, QualityCreditsTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f982d3e06ecd8d537b168f57247921faefcc7b8e": "f982d3e fix(inventory-entry+qc): modal footer buttons, toast confirms, scroll, …" | kind=Commit | source=git | neighbors=[bbc39ac feat(inventory-entry): migrate …, route.ts, master, worktree-agent-a59e3078904cba68a, ce6710b feat(audit+ux): serverAuditLog …, ModalBoxComposition.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@fac809c598795e307688ba65eee7ab2429a78e1b": "fac809c perf(modules): eliminate raw SQL, add SP audit trail, standardize error…" | kind=Commit | source=git | neighbors=[a0363ff fix(companies): first-load blan…, worktree-agent-a59e3078904cba68a, ca478bf perf(customer-payments): standa…, page.tsx, route.ts, route.ts] | lang=en
- "context_qccontext": "QCContext.tsx" | kind=code-symbol | source=src/app/qc/context/QCContext.tsx:L1 | neighbors=[QCContext, QCProvider(), QCState, useQCContext(), page.tsx, QCHistoryTab.tsx] | lang=en
- "images_cache": "_cache.ts" | kind=code-symbol | source=src/app/api/products/images/_cache.ts:L1 | neighbors=[buildCache(), ensureCache(), getS3(), resetCache(), signKey(), route.ts] | lang=en
- "inventory_entry_modalboxwhcontrol": "ModalBoxWHControl.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxWHControl.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, EMPTY, EMPTY_INFO, int(), ModalBoxWHControl(), Props] | lang=en
- "lib_authguards_requiresuperadmin": "requireSuperAdmin()" | kind=code-symbol | source=src/lib/authGuards.ts:L29 | neighbors=[route.ts, route.ts, route.ts, authGuards.ts, getSessionNivel(), route.ts] | lang=en
- "lib_db_getfullpotpool": "getFullpotPool()" | kind=code-symbol | source=src/lib/db.ts:L29 | neighbors=[route.ts, db.ts, executeProcedure(), executeQuery(), route.ts, route.ts] | lang=en
- "login_page": "page.tsx" | kind=code-symbol | source=src/app/login/page.tsx:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, 7350a1a feat(auth): implement 2-step lo…, d7aa6e3 fix(auth): enforce user permiss…, ErrorBox(), LoginPage(), Step] | lang=en
- "lookups_route": "route.ts" | kind=code-symbol | source=src/app/api/vendors/lookups/route.ts:L1 | neighbors=[597add0 feat(standing-orders): Change S…, a1da4e3 refactor(masters/items): replac…, f887af3 feat(bunch-recipe): searchable …, db.ts, executeProcedure(), GET()] | lang=en
- "modals_logrecordmodal_logrecordmodal": "LogRecordModal()" | kind=code-symbol | source=src/app/flexy2qb/components/modals/LogRecordModal.tsx:L23 | neighbors=[LogRecordModal.tsx, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx, PurchasesOChargesTab.tsx, Sales2QBTab.tsx] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-012.json

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
