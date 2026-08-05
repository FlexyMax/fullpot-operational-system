# Node Description Batch 15 of 139

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

- "public_pdf_worker_min_value": "Value" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[tn](), _setValue(), .value(), .constructor(), .[nn]()] | lang=en
- "public_pdf_worker_min_xfafactory_getrichtextashtml": ".getRichTextAsHtml()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), .constructor(), XFAFactory, nn, sn, warn()] | lang=en
- "public_pdf_worker_min_xfaobject_fn": ".[Fn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, fn, kn, nn, pr, _r] | lang=en
- "public_pdf_worker_min_xi": "xi" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair(), .convert(), .fallbackToSystemFont(), ._spaceWidth(), ._simpleFontToUnicode()] | lang=en
- "public_pdf_worker_min_xref_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, CipherTransformFactory, .assignXref(), InvalidPDFException, warn(), .indexObjects()] | lang=en
- "reports_reportmodal_reportmodal": "ReportModal" | kind=code-symbol | source=src/components/reports/ReportModal.tsx:L7 | neighbors=[page.tsx, page.tsx, Tab2.tsx, page.tsx, page.tsx, ReportModal.tsx] | lang=en
- "scripts_migrate_customers_tabs": "migrate-customers-tabs.mjs" | kind=code-symbol | source=scripts/migrate-customers-tabs.mjs:L1 | neighbors=[appFooterLine, findLine(), l1, l2, l3, l4] | lang=en
- "to_whouse_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/to-whouse/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), P] | lang=en
- "ui_downloadbtn_downloadbtn": "DownloadBtn()" | kind=code-symbol | source=src/components/ui/DownloadBtn.tsx:L12 | neighbors=[CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx, PurchasesOChargesTab.tsx, Sales2QBTab.tsx, SalesCosts2QBTab.tsx] | lang=en
- "ui_mobiledatecalendar_mobiledatecalendar": "MobileDateCalendar()" | kind=code-symbol | source=src/components/ui/MobileDateCalendar.tsx:L27 | neighbors=[CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx, PurchasesOChargesTab.tsx, Sales2QBTab.tsx, SalesCosts2QBTab.tsx] | lang=en
- "void_route": "route.ts" | kind=code-symbol | source=src/app/api/pos/invoice/void/route.ts:L1 | neighbors=[ca478bf perf(customer-payments): standa…, db.ts, executeProcedure(), route.ts, authOptions, P] | lang=en
- "web_route": "route.ts" | kind=code-symbol | source=src/app/api/vendors/[unico]/web/route.ts:L1 | neighbors=[5cdc4a2 fix(vendors): Web Settings moda…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), bit()] | lang=en
- "web_user_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/customers/web-user/route.ts:L1 | neighbors=[4a1017f fix(customers): replace direct …, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), bit()] | lang=en
- "approve_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/approve/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), 5949fec feat(audit): server-side bitaco…] | lang=en
- "bunch_recipe_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/bunch-recipe/route.ts:L1 | neighbors=[GET(), nullIfEmpty(), POST(), db.ts, executeProcedure(), 69066d9 fix(bunch-recipe): 5 UI fixes +…] | lang=en
- "carriers_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/carriers/route.ts:L1 | neighbors=[GET(), POST(), db.ts, executeProcedure(), serverAudit.ts, serverAuditLog()] | lang=en
- "column_route": "route.ts" | kind=code-symbol | source=src/app/api/system/access/column/route.ts:L1 | neighbors=[ALLOWED, PUT(), db.ts, executeQuery(), serverAudit.ts, serverAuditLog()] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@3f0f8ef12f9ba17be1c47d3eb95f1ce5a085afea": "3f0f8ef fix(awbs): rename report routes .ts -> .tsx to allow JSX" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, route.tsx, 4987abb fix(awbs): replace remaining se…, route.tsx, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@4c79670a4cc6e82365c25a5edb0b99c4bf2ac575": "4c79670 feat(standing-orders): Zustand store for shared state" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 505c1d8 feat(standing-orders): PDF prin…, OrderDetailModal.tsx, page.tsx, useStandingOrdersStore.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@4d6d80d0a75eb5ae320a7c3f482a72578767c849": "4d6d80d feat(ar): white header + aging/monthly strips in statement PDF" | kind=Commit | source=git | neighbors=[master, 4c69f8a fix(ar): replace orange header …, StatementPDF.tsx, StatementPDFv2.tsx, route.ts, route.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@64d74801c89b19e6e2793436d4ec09c8d45a5a22": "64d7480 fix(tab3): components grid now loads data — fix SP extra params + stand…" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, a2a004f feat(items): Bunch Recipe + Box…, route.ts, page.tsx, Tab3.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@69066d94383b6e5526dc9382801a6455ceeeeb38": "69066d9 fix(bunch-recipe): 5 UI fixes + full Add/Modify/Delete support" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, route.ts, cc11367 feat(bunch-recipe): smarter var…, BunchRecipeModal.tsx, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@785797e1b9016e8b43d93207e65d3b05236e410d": "785797e feat(awbs): full page rewrite with PanelGrid, Zustand, standard modals,…" | kind=Commit | source=git | neighbors=[186ed6c feat(modules): module dropdown …, page.tsx, master, worktree-agent-a59e3078904cba68a, 080dacf feat(auth): SUPERADMIN level re…, useAwbStore.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@809d3e23e9308f5cc26db7d5cb22175abcc1d39d": "809d3e2 feat(images): add delete image functionality in ImageModal" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 1e41950 fix(images): constrain ImageMod…, Tab2.tsx, route.ts, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@91438b41e47cefb741a6b5fe85d82986e0b8c4fb": "91438b4 feat(bi): persist saved pivot/grid configurations in SQL Server" | kind=Commit | source=git | neighbors=[1d76b42 fix(flexy2qb): pass first recor…, master, page.tsx, 0a24231 style(bi): increase grid worksp…, route.ts, bi_saved_configs.sql] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@984655c30c1554f850ab69fe10b83ef8c3d4b653": "984655c fix(items): 4 UI fixes — tab labels, toolbar above grid, button height,…" | kind=Commit | source=git | neighbors=[3aa80d4 feat(panel-grid): add subheader…, master, worktree-agent-a59e3078904cba68a, ce221ab fix(tab3): align panels, fix Va…, page.tsx, Tab2.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@a9637e0a629860128af4c1574720c4d8bf197906": "a9637e0 fix: PA CRDB FK error + Statement email + Send All button" | kind=Commit | source=git | neighbors=[8d9c355 feat(freights): add season filt…, master, fcafe0d feat(ar): wire statement email …, page.tsx, page.tsx, route.ts] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@af5d85c812b0a37f2a278f24fcec69278ff464aa": "af5d85c style(qc): remove duplicate search toolbars from all tabs, unify grid h…" | kind=Commit | source=git | neighbors=[1ac6172 style(qc): unify StockListTab g…, worktree-agent-a59e3078904cba68a, efc6ad8 refactor(qc): migrate all grid …, CancelledPurchasesTab.tsx, QCHistoryTab.tsx, QualityCreditsTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@cfe2d43ecd2b0c3975e24e8b1f612adc545734f5": "cfe2d43 feat(ar): send statement as PDF attachment + new StatementPDF component" | kind=Commit | source=git | neighbors=[9e70e94 refactor(ar): replace raw UPDAT…, master, 7dac8f6 fix(ar): pass date range + mode…, page.tsx, mailer.ts, StatementPDF.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d151d61ed4ddc782cffcf857db85ae1337ca5f79": "d151d61 feat(sales-reps): reports modal + toolbar/header color fixes" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 4ffbbe0 fix(sales-reps): use SALESMAN_F…, route.tsx, route.tsx, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d645c42156e64111680a1ad4d4020811fd06c282": "d645c42 fix(permissions): assign correct panta_uq to scan screens" | kind=Commit | source=git | neighbors=[3ab71d6 feat(scan-out): add full Scan O…, master, worktree-agent-a59e3078904cba68a, 68885a9 fix(menu+scan-out): disable Sca…, route.ts, permissions.ts] | lang=en
- "components_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/components/route.ts:L1 | neighbors=[387e481 feat(items): migrate grids to P…, 63f5a43 fix(items): fix variety search …, 64d7480 fix(tab3): components grid now …, eea0676 feat(tab3): switch to sp_NC_var…, GET(), db.ts] | lang=en
- "debug_route": "route.ts" | kind=code-symbol | source=src/app/api/vendors/debug/route.ts:L1 | neighbors=[533b609 fix(sales-reps): correct SP par…, f62ffd5 debug(sales-reps): temp debug e…, GET(), SPS, db.ts, executeProcedure()] | lang=en
- "documents_route": "route.ts" | kind=code-symbol | source=src/app/api/vendors/documents/route.ts:L1 | neighbors=[cd58626 feat(vendors): serverAuditLog o…, GET(), POST(), db.ts, executeProcedure(), serverAudit.ts] | lang=en
- "enter_route": "route.ts" | kind=code-symbol | source=src/app/api/audit/enter/route.ts:L1 | neighbors=[getEmpresaUq(), POST(), db.ts, executeProcedure(), executeQuery(), route.ts] | lang=en
- "exit_route": "route.ts" | kind=code-symbol | source=src/app/api/audit/exit/route.ts:L1 | neighbors=[getEmpresaUq(), POST(), db.ts, executeProcedure(), executeQuery(), route.ts] | lang=en
- "export_route": "route.ts" | kind=code-symbol | source=src/app/api/system/modules/export/route.ts:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, GET(), txt(), authGuards.ts, requireSuperAdmin(), db.ts] | lang=en
- "groups_route": "route.ts" | kind=code-symbol | source=src/app/api/vendors/groups/route.ts:L1 | neighbors=[cd58626 feat(vendors): serverAuditLog o…, GET(), POST(), db.ts, executeProcedure(), serverAudit.ts] | lang=en
- "grower_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/quota/grower/route.ts:L1 | neighbors=[eb1606a feat(masters/items): serverAudi…, DELETE(), POST(), db.ts, executeProcedure(), serverAudit.ts] | lang=en
- "insert_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/outcomes/insert/route.ts:L1 | neighbors=[aa8bab8 fix(payment-auth): use sp_NC_ac…, ce6710b feat(audit+ux): serverAuditLog …, POST(), db.ts, executeProcedure(), serverAudit.ts] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-014.json

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
