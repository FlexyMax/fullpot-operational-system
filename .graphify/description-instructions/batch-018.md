# Node Description Batch 19 of 139

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

- "commit:repo:github.com/FlexyMax/fullpot-operational-system@c00ea3324e4e9ca022604a8a40614b82bbca7272": "c00ea33 fix(auth): read nivel from sp_NC_User_Info as 'level' not 'nivel'" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 8ed3e84 fix(users): add u2fa column to …, route.ts, route.ts, f5e908f fix(access): SA-only row stylin…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@c12e58635605b573399a2dbb8d9225b08004f610": "c12e586 feat(physical-scan): add 2 missing tabs + CSV export on all grids" | kind=Commit | source=git | neighbors=[75b26c7 feat(physical-scan): add useSca…, master, worktree-agent-a59e3078904cba68a, 3ab71d6 feat(scan-out): add full Scan O…, page.tsx, useScanStore.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@c23f0a7bb7a14144f60e80ba330697f4febf266d": "c23f0a7 fix(standing-orders): auto-select first line + show all columns on mobi…" | kind=Commit | source=git | neighbors=[331a363 style(standing-orders): white h…, master, worktree-agent-a59e3078904cba68a, fa8bf19 fix(standing-orders): Add Line …, OrderDetailModal.tsx, page.tsx] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ce221ab7a122070aa67abc9f7109a24b8772f986": "ce221ab fix(tab3): align panels, fix Varieties grid height, move Components sea…" | kind=Commit | source=git | neighbors=[984655c fix(items): 4 UI fixes — tab la…, master, worktree-agent-a59e3078904cba68a, ae15318 fix(tab3): remove duplicate pre…, Tab3.tsx, PanelGrid.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d288ae0c6b86b805710f790af3958050e1cfb7b9": "d288ae0 feat(items): Print Recipe generates PDF via ReportModal" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 22af037 fix(print-recipe): add try/catc…, Tab2.tsx, route.tsx, f887af3 feat(bunch-recipe): searchable …] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@e5fdd2c15046a042fd5818b012e858761aa3be8f": "e5fdd2c docs(standards): SP return format standard + AR SQL documentation" | kind=Commit | source=git | neighbors=[ca478bf perf(customer-payments): standa…, worktree-agent-a59e3078904cba68a, c3897b7 docs(standards): require SP aut…, ar_corporate_income_sps.sql, ar_lookup_sps.sql, ar_payment_detail_sps.sql] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ea21633afccc33d6e0f89c89425da65ea9634e0b": "ea21633 fix(scan-in): rename SPs to NC_ convention for insert_in_all and insert…" | kind=Commit | source=git | neighbors=[1857d90 feat(scan-in): add confirm dial…, route.ts, route.ts, master, a54e0fd fix(scan-in): correct SP error/…, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@eea0676c4126fb7b5f07d32b12bbb876d2c89a00": "eea0676 feat(tab3): switch to sp_NC_varieties_search with server-side pagination" | kind=Commit | source=git | neighbors=[ccded87 revert(box-recipe): restore sp_…, master, worktree-agent-a59e3078904cba68a, ed8a8c9 refactor(tab3): remove BOGO ite…, route.ts, Tab3.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f3f0b3871dd892620da476a682563f708a665812": "f3f0b38 fix(products): fix NULL description error on Edit Product save" | kind=Commit | source=git | neighbors=[71bd4f0 feat(items): remove Alternative…, master, worktree-agent-a59e3078904cba68a, c88e838 fix(products): remove lcdescrip…, route.ts, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f7acc6cdaf6ac11a97067b1e5bb2ff07b142edf5": "f7acc6c fix(qc/mobile): 3 mobile UX improvements" | kind=Commit | source=git | neighbors=[1f53c31 fix(ar/mobile): 4 mobile fixes …, worktree-agent-a59e3078904cba68a, 085a822 fix(accounts-payable): mobile t…, page.tsx, StockListTab.tsx, TransitBoxesTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f887af371cdc3172ee902f1c3d65ed7b8606eca5": "f887af3 feat(bunch-recipe): searchable comboboxes for all dropdowns + fix units" | kind=Commit | source=git | neighbors=[cc11367 feat(bunch-recipe): smarter var…, master, worktree-agent-a59e3078904cba68a, d288ae0 feat(items): Print Recipe gener…, BunchRecipeModal.tsx, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f921030c89840700903e8a36ced3e84b81e74e5a": "f921030 style(items): standardize all grid font sizes to text-[13px]" | kind=Commit | source=git | neighbors=[8aaf526 fix(images): derive S3 key from…, master, worktree-agent-a59e3078904cba68a, 387e481 feat(items): migrate grids to P…, Tab2.tsx, Tab3.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@fcafe0d4aaa9850d68c02fe3bb6bf49bcbfd6763": "fcafe0d feat(ar): wire statement email via mailer + add ap_email to customer li…" | kind=Commit | source=git | neighbors=[a9637e0 fix: PA CRDB FK error + Stateme…, master, fad3cb1 fix(ar): send-all shows all 122…, page.tsx, mailer.ts, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@fdce648a096b244ecc44718fe645d2fe91c6d2d1": "fdce648 fix(freights): restore GET handlers for edit — list SP missing season_u…" | kind=Commit | source=git | neighbors=[4cb57ca feat(freights): eliminate direc…, master, worktree-agent-a59e3078904cba68a, 7350a1a feat(auth): implement 2-step lo…, page.tsx, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ffbad81f6bdca340e657c869f218b125943a0d31": "ffbad81 fix(qc): hamburger always for menuItems, AuditLogModal portal, Send-to-…" | kind=Commit | source=git | neighbors=[b8b372b fix(qc): wire AuditLogModal to …, worktree-agent-a59e3078904cba68a, 3091e96 feat(qc/panelgrid): Download as…, AuditLogModal.tsx, StockListTab.tsx, PanelGrid.tsx] | lang=en
- "components_entityformmodal": "EntityFormModal.tsx" | kind=code-symbol | source=src/components/EntityFormModal.tsx:L1 | neighbors=[CheckField, EntityFormModal(), EntityFormModalProps, FormField, utils.ts, cn()] | lang=en
- "components_shared_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/sales/customer-payments/components/Shared.tsx:L6 | neighbors=[CorpInvoiceModal.tsx, CrDbModal.tsx, NewPaymentModal.tsx, SalesmanSelectorModal.tsx, Shared.tsx, page.tsx] | lang=en
- "components_tabtable": "TabTable.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/TabTable.tsx:L1 | neighbors=[Column, downloadExcel(), TabTable(), TabTableProps, utils.ts, cn()] | lang=en
- "dates_route": "route.ts" | kind=code-symbol | source=src/app/api/sales/dates/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure(), executeQuery(), route.ts, authOptions] | lang=en
- "details_route": "route.ts" | kind=code-symbol | source=src/app/api/sales/invoice/details/route.ts:L1 | neighbors=[GET(), P, db.ts, executeProcedure(), route.ts, authOptions] | lang=en
- "extract_cp": "extract_cp.js" | kind=code-symbol | source=extract_cp.js:L1 | neighbors=[componentsDir, content, fs, modals, path, srcFile] | lang=en
- "in_transit_route": "route.ts" | kind=code-symbol | source=src/app/api/physical-scan/in-transit/route.ts:L1 | neighbors=[6ea09a8 fix(physical-scan): quickfixes …, GET(), db.ts, executeProcedure(), route.ts, authOptions] | lang=en
- "initialize_route": "route.ts" | kind=code-symbol | source=src/app/api/system/access/initialize/route.ts:L1 | neighbors=[d4bfb3c feat(audit+ui): serverAuditLog …, POST(), db.ts, executeProcedure(), serverAudit.ts, serverAuditLog()] | lang=en
- "inventory_entry_modalavailabledate": "ModalAvailableDate.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalAvailableDate.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, ModalAvailableDate(), Props, t(), today(), page.tsx] | lang=en
- "inventory_entry_modalboxtransform": "ModalBoxTransform.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxTransform.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, ModalBoxTransform(), num(), Props, t(), page.tsx] | lang=en
- "inventory_entry_modalselectpwarehouse": "ModalSelectPWarehouse.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalSelectPWarehouse.tsx:L1 | neighbors=[bbc39ac feat(inventory-entry): migrate …, ModalSelectPWarehouse(), Props, t(), PanelGrid.tsx, page.tsx] | lang=en
- "lib_db_getsistemapool": "getSistemaPool()" | kind=code-symbol | source=src/lib/db.ts:L42 | neighbors=[db.ts, executeProcedure(), executeQuery(), route.ts, route.ts, route.ts] | lang=en
- "logo_route": "route.ts" | kind=code-symbol | source=src/app/api/system/companies/[unico]/logo/route.ts:L1 | neighbors=[db.ts, getSistemaPool(), extractJpeg(), GET(), POST(), txt()] | lang=en
- "order_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-out/order/route.ts:L1 | neighbors=[3ab71d6 feat(scan-out): add full Scan O…, db.ts, executeProcedure(), route.ts, authOptions, GET()] | lang=en
- "orders_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/orders/route.ts:L1 | neighbors=[db.ts, executeProcedure(), executeQuery(), route.ts, authOptions, GET()] | lang=en
- "others_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/carriers/[unico]/others/route.ts:L1 | neighbors=[d468a28 feat(carriers+payment-auth): in…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), PUT()] | lang=en
- "photo_route": "route.ts" | kind=code-symbol | source=src/app/api/system/users/[unico]/photo/route.ts:L1 | neighbors=[db.ts, getSistemaPool(), extractJpeg(), GET(), POST(), txt()] | lang=en
- "po_prices_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/po-prices/route.ts:L1 | neighbors=[eb1606a feat(masters/items): serverAudi…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), POST()] | lang=en
- "products_solid_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/lookups/products-solid/route.ts:L1 | neighbors=[67b5a2d fix(box-recipe): product dropdo…, a2a004f feat(items): Bunch Recipe + Box…, ccded87 revert(box-recipe): restore sp_…, db.ts, executeProcedure(), GET()] | lang=en
- "public_pdf_worker_min_alternatecs": "AlternateCS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getOutputLength(), .getRgbBuffer(), .getRgbItem(), .parse()] | lang=en
- "public_pdf_worker_min_annotation_constructfieldname": "._constructFieldName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, RefSet, stringToPDFString(), warn(), .constructor(), .constructor()] | lang=en
- "public_pdf_worker_min_annotation_extracttextcontent": ".extractTextContent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, ._transformPoint(), .getArray(), lookupMatrix(), lookupRect(), .getTextContent()] | lang=en
- "public_pdf_worker_min_annotation_hasflag": "._hasFlag()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, ._isPrintable(), ._isViewable(), .mustBeViewed(), .constructor(), .mustBeViewed()] | lang=en
- "public_pdf_worker_min_appearancestreamevaluator": "AppearanceStreamEvaluator" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), ._localColorSpaceCache(), .parse(), ._pdfFunctionFactory(), .constructor()] | lang=en
- "public_pdf_worker_min_astbinaryoperation": "AstBinaryOperation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .visit(), buildAddOperation(), buildMulOperation(), buildSubOperation()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-018.json

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
