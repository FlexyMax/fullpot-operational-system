# Node Description Batch 11 of 139

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

- "public_pdf_worker_min_partialevaluator_handlesetfont": ".handleSetFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .getOperatorList(), .getTextContent(), ErrorFont, .addDependencies(), .loadFont()] | lang=en
- "public_pdf_worker_min_pdfdocument_checklastpage": ".checkLastPage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .ensureCatalog(), .ensureDoc(), .getAllPageDicts(), .setActualNumPages(), .delete()] | lang=en
- "public_pdf_worker_min_pdffunction_constructpostscript": ".constructPostScript()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunction, .getArray(), FormatError, info(), PostScriptCompiler, PostScriptEvaluator] | lang=en
- "public_pdf_worker_min_radialaxialshading_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RadialAxialShading, .getRgb(), .getArray(), FormatError, info(), isNumberArray()] | lang=en
- "public_pdf_worker_min_template_rn": ".[rn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Template, Ar, .isBreak(), .success(), mr, nn] | lang=en
- "public_pdf_worker_min_text": "Text" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createText(), .text(), .constructor(), .[gr](), .[nn]()] | lang=en
- "public_pdf_worker_min_updatexfa": "updateXFA()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, incrementalUpdate(), .encryptString(), .createCipherTransform(), parseXFAPath(), SimpleDOMNode] | lang=en
- "public_pdf_worker_min_valuetohtml": "valueToHtml()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn](), .[nn](), .[nn]()] | lang=en
- "public_pdf_worker_min_writestream": "writeStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, writeObject(), bytesToString(), .encryptString(), .getAsync(), info()] | lang=en
- "public_pdf_worker_min_xfaattribute": "XFAAttribute" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[Er](), .[sn](), .[tn](), .[Ur]()] | lang=en
- "public_pdf_worker_min_xref_getnewtemporaryref": ".getNewTemporaryRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.saveNewAnnotations(), .createNewAnnotation(), .createStructureTree(), .#q(), .updateStructureTree(), .#v()] | lang=en
- "repacking_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/repacking/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), int()] | lang=en
- "saved_configs_route": "route.ts" | kind=code-symbol | source=src/app/api/bi/saved-configs/route.ts:L1 | neighbors=[91438b4 feat(bi): persist saved pivot/g…, db.ts, executeProcedure(), route.ts, authOptions, GET()] | lang=en
- "shipto_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/customers/shipto/route.ts:L1 | neighbors=[4a1017f fix(customers): replace direct …, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), bit()] | lang=en
- "standing_orders_headermodal": "HeaderModal.tsx" | kind=code-symbol | source=src/app/standing-orders/HeaderModal.tsx:L1 | neighbors=[b4899cc style(standing-orders): standar…, DAYS, HeaderModal(), LabelInput(), Lookups, Props] | lang=en
- "transfer_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transfer/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), int()] | lang=en
- "upload_route": "route.ts" | kind=code-symbol | source=src/app/api/products/images/upload/route.ts:L1 | neighbors=[15d0436 fix(images): enable Delete imme…, 809d3e2 feat(images): add delete image …, be7b4ab fix(images): explicit PutObject…, _cache.ts, getS3(), resetCache()] | lang=en
- "warehouse_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/warehouse/route.ts:L1 | neighbors=[4cb57ca feat(freights): eliminate direc…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), bit()] | lang=en
- "airlines_route": "route.ts" | kind=code-symbol | source=src/app/api/freights/airlines/route.ts:L1 | neighbors=[genUq(), GET(), POST(), txt(), db.ts, executeProcedure()] | lang=en
- "atpda_route": "route.ts" | kind=code-symbol | source=src/app/api/freights/atpda/route.ts:L1 | neighbors=[GET(), num(), POST(), txt(), db.ts, executeProcedure()] | lang=en
- "carrier_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/customers/carrier/route.ts:L1 | neighbors=[bit(), GET(), POST(), txt(), db.ts, executeProcedure()] | lang=en
- "change_customer_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/change-customer/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), route.ts] | lang=en
- "change_salesman_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/change-salesman/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), route.ts] | lang=en
- "classes_route": "route.ts" | kind=code-symbol | source=src/app/api/vendors/classes/route.ts:L1 | neighbors=[DELETE(), GET(), POST(), db.ts, executeProcedure(), serverAudit.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@3091e961630aa96ed4a200b3bdb1c0ff5704a0c5": "3091e96 feat(qc/panelgrid): Download as header icon, row selection in Transit+C…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 605e4e2 feat(qc): paginate QC stock sea…, CancelledPurchasesTab.tsx, QCHistoryTab.tsx, QualityCreditsTab.tsx, StockListTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@597add03d9db1f13c20bdcdb8313322c611899e8": "597add0 feat(standing-orders): Change Season modal + pbseason_uq in detail SP" | kind=Commit | source=git | neighbors=[505c1d8 feat(standing-orders): PDF prin…, master, worktree-agent-a59e3078904cba68a, route.ts, 8042468 perf(standing-orders): dirty tr…, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@8e924819c3052d7e06b37a7f9974995da69b6a56": "8e92481 feat(system-access): convert to SPs, PanelGrid, and full CRUD audit tra…" | kind=Commit | source=git | neighbors=[page.tsx, worktree-agent-a59e3078904cba68a, 3322075 fix(users): close unico mismatc…, audit.ts, route.ts, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@a1da4e3af048b3051fc8a6562fb51f1233d1b053": "a1da4e3 refactor(masters/items): replace all executeQuery raw SQL with sp_NC_* …" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, route.ts, 1afc81e fix(masters/items/grades): corr…, route.ts, route.ts] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@a54e0fd8f81906e3ed09094164ded9c4b1b6fdb9": "a54e0fd fix(scan-in): correct SP error/message column reading across all CRUD r…" | kind=Commit | source=git | neighbors=[route.ts, route.ts, master, a5dce9a fix(scan-in): pass lcUser_uq fr…, route.ts, route.ts] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@a61433b477e01d383e91a73eff0ab8ef8ccabe8d": "a61433b fix(ap-reports): normalize column key comparison in VFP_SKIP" | kind=Commit | source=git | neighbors=[657dacf fix(ap-reports): filter VFP met…, worktree-agent-a59e3078904cba68a, cc2daff debug(ap-reports): add format=c…, route.tsx, route.tsx, route.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@b8b372bba34d86c1564b37ec89187e78c46e68e7": "b8b372b fix(qc): wire AuditLogModal to all grids, add missing refresh icons, sh…" | kind=Commit | source=git | neighbors=[8b150b9 fix(qc): add onLog/onRefresh to…, worktree-agent-a59e3078904cba68a, ffbad81 fix(qc): hamburger always for m…, QCModal.tsx, CancelledPurchasesTab.tsx, QCHistoryTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ee1d500983cd4086d44728f31fac4f03c8f3a0da": "ee1d500 feat(items): add useItemsStore (Zustand) for all 3 tabs" | kind=Commit | source=git | neighbors=[1e63937 fix(items): Tab1 description fi…, master, worktree-agent-a59e3078904cba68a, d151d61 feat(sales-reps): reports modal…, page.tsx, Tab1.tsx] | lang=en
- "components_gridmenu_gridmenu": "GridMenu()" | kind=code-symbol | source=src/components/GridMenu.tsx:L26 | neighbors=[GridMenu.tsx, page.tsx, page.tsx, page.tsx, page.tsx, page.tsx] | lang=en
- "customer_uq_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/statement/[customer_uq]/route.ts:L1 | neighbors=[9ef9c8a fix(customer-payments): correct…, ca478bf perf(customer-payments): standa…, GET(), P, dates.ts, normalizeToISODate()] | lang=en
- "data_route": "route.ts" | kind=code-symbol | source=src/app/api/bi/reports/[unico]/data/route.ts:L1 | neighbors=[bodySchema, P, POST(), t(), db.ts, executeProcedure()] | lang=en
- "flexy2qb_useflexy2qbstore_useflexy2qbstore": "useFlexy2QBStore" | kind=code-symbol | source=src/store/flexy2qb/useFlexy2QBStore.ts:L12 | neighbors=[page.tsx, useFlexy2QBStore.ts, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx, PurchasesOChargesTab.tsx] | lang=en
- "grades_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/grades/route.ts:L1 | neighbors=[15b09b1 feat(items): PanelGrid for Tab1…, 1afc81e fix(masters/items/grades): corr…, a1da4e3 refactor(masters/items): replac…, GET(), POST(), db.ts] | lang=en
- "handling_route": "route.ts" | kind=code-symbol | source=src/app/api/freights/handling/route.ts:L1 | neighbors=[4cb57ca feat(freights): eliminate direc…, GET(), num(), POST(), txt(), db.ts] | lang=en
- "import_route": "route.ts" | kind=code-symbol | source=src/app/api/system/modules/import/route.ts:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, bit(), num(), POST(), txt(), authGuards.ts] | lang=en
- "inventory_entry_modaladdpotoinventory": "ModalAddPOToInventory.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalAddPOToInventory.tsx:L1 | neighbors=[bbc39ac feat(inventory-entry): migrate …, ModalAddPOToInventory(), norm(), Props, t(), utils.ts] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-010.json

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
