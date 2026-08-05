# Node Description Batch 26 of 139

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

- "commit:repo:github.com/FlexyMax/fullpot-operational-system@df02edc0579cd4cfd61d0536e412a024cdac1b98": "df02edc fix(tab3): change Packs menu color amber→orange (type error)" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, e030c40 fix(tab3): cascading Class→Subc…, Tab3.tsx, ed8a8c9 refactor(tab3): remove BOGO ite…]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@e030c40bd4a8ed183dd1371c4eb1575633b64f9e": "e030c40 fix(tab3): cascading Class→Subclass selects in VarietyDefinitionModal" | kind=Commit | source=git | neighbors=[df02edc fix(tab3): change Packs menu co…, master, worktree-agent-a59e3078904cba68a, d2ddb7b style(items): standardize Image…, Tab3.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@e8d0d5e3ad9b53feca7619ff5b3addb401507231": "e8d0d5e feat: proper xlsx export with SheetJS + New Bank in customer-payments m…" | kind=Commit | source=git | neighbors=[3568ff1 fix(awbs): AWB# search now filt…, master, 21d3998 fix(ui): remove redundant recor…, NewPaymentModal.tsx, csv.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@eb8eaa1088c863de081c25eed1b3791e1b64c37e": "eb8eaa1 fix(standing-orders): eliminate raw SQL in detail route" | kind=Commit | source=git | neighbors=[b4899cc style(standing-orders): standar…, master, worktree-agent-a59e3078904cba68a, 5c9b4e0 feat(standing-orders): register…, route.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ed2d27773e8392ae81763dddec918a73aa51f96b": "ed2d277 fix(carriers): mobile grid overlap + Other Settings button in desktop h…" | kind=Commit | source=git | neighbors=[d468a28 feat(carriers+payment-auth): in…, master, worktree-agent-a59e3078904cba68a, page.tsx, 4cb57ca feat(freights): eliminate direc…]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ed8a8c98a11d827629b74d693b7665473f658c97": "ed8a8c9 refactor(tab3): remove BOGO items; move Edit/Delete/Packs to hamburger …" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, df02edc fix(tab3): change Packs menu co…, Tab3.tsx, eea0676 feat(tab3): switch to sp_NC_var…]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@eeffe24c4484b75e704680f4388a239ee5f88fda": "eeffe24 feat(ar): logo + fix balance totals in StatementPDF" | kind=Commit | source=git | neighbors=[7dac8f6 fix(ar): pass date range + mode…, master, 89816c3 feat(ar): PDF preview in modal …, StatementPDF.tsx, route.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f11125ff51f28c583c74b0a44f1510690afc22a0": "f11125f feat(awbs): scroll to searched AWB row after grid refreshes" | kind=Commit | source=git | neighbors=[1d1cadb feat(awbs): auto-set date range…, page.tsx, master, d3f37c5 feat(flexy2qb): add CSV + Excel…, PanelGridTable.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f16203b85f109b45cb1c73197609a7cbd3cda161": "f16203b refactor(items): Tab3 single-grid layout — Components only, variety con…" | kind=Commit | source=git | neighbors=[3f5ad89 fix(tab3): trim Varieties menu …, master, worktree-agent-a59e3078904cba68a, 64d7480 fix(tab3): components grid now …, Tab3.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f1ce20c451d30cb93f15b360f2b48d7bf74d2ddb": "f1ce20c feat(vendors): Web Settings modal is now editable" | kind=Commit | source=git | neighbors=[cd58626 feat(vendors): serverAuditLog o…, master, worktree-agent-a59e3078904cba68a, 2fb1952 fix(vendors): handleOpenWs was …, page.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f5e908f5f97d2afbc3709145a890003f5495081d": "f5e908f fix(access): SA-only row styling shows for non-SUPERADMIN operators only" | kind=Commit | source=git | neighbors=[080dacf feat(auth): SUPERADMIN level re…, page.tsx, master, worktree-agent-a59e3078904cba68a, c00ea33 fix(auth): read nivel from sp_N…]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f62ffd59632ae55bc5fa987731a361b30af066e9": "f62ffd5 debug(sales-reps): temp debug endpoint for SP diagnosis" | kind=Commit | source=git | neighbors=[2fa45a1 fix(sales-reps): add explicit a…, master, worktree-agent-a59e3078904cba68a, 533b609 fix(sales-reps): correct SP par…, route.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@fa8bf19e6cc45ef1306e70978090fabb173993b3": "fa8bf19 fix(standing-orders): Add Line opens Products modal; remove Products fr…" | kind=Commit | source=git | neighbors=[c23f0a7 fix(standing-orders): auto-sele…, master, worktree-agent-a59e3078904cba68a, 6ea09a8 fix(physical-scan): quickfixes …, OrderDetailModal.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@fad3cb1c318062489b4199b0547399d0cf2fe8d8": "fad3cb1 fix(ar): send-all shows all 122 email customers + disable checkbox with…" | kind=Commit | source=git | neighbors=[master, 1da1d3f feat(ar): inline email editor i…, page.tsx, route.ts, fcafe0d feat(ar): wire statement email …]
- "components_topactionbar": "TopActionBar.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/TopActionBar.tsx:L1 | neighbors=[ActionItem, TopActionBar(), TopActionBarProps, utils.ts, cn()]
- "context_qccontext_useqccontext": "useQCContext()" | kind=code-symbol | source=src/app/qc/context/QCContext.tsx:L65 | neighbors=[QCContext.tsx, page.tsx, QCHistoryTab.tsx, QualityCreditsTab.tsx, StockListTab.tsx]
- "credits_route": "route.ts" | kind=code-symbol | source=src/app/api/pos/history/credits/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure(), route.ts, authOptions]
- "delete_route": "route.ts" | kind=code-symbol | source=src/app/api/sales/cart/delete/route.ts:L1 | neighbors=[DELETE(), db.ts, executeProcedure(), route.ts, authOptions]
- "gen_invoices_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/gen-invoices/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), route.ts, authOptions]
- "images_cache_gets3": "getS3()" | kind=code-symbol | source=src/app/api/products/images/_cache.ts:L19 | neighbors=[_cache.ts, buildCache(), route.ts, route.ts, route.ts]
- "images_route": "route.ts" | kind=code-symbol | source=src/app/api/products/images/route.ts:L1 | neighbors=[_cache.ts, ensureCache(), getS3(), signKey(), POST()]
- "inventory_entry_modalboxmove": "ModalBoxMove.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxMove.tsx:L1 | neighbors=[ModalBoxMove(), norm(), Props, t(), page.tsx]
- "inventory_entry_modalboxnotes": "ModalBoxNotes.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxNotes.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, ModalBoxNotes(), Props, t(), page.tsx]
- "inventory_entry_modaleditbox_modaleditbox": "ModalEditBox()" | kind=code-symbol | source=src/components/inventory-entry/ModalEditBox.tsx:L38 | neighbors=[ModalEditBox.tsx, fmt2(), fmt4(), t(), page.tsx]
- "inventory_entry_modalheadercopy": "ModalHeaderCopy.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalHeaderCopy.tsx:L1 | neighbors=[ModalHeaderCopy(), Props, t(), today(), page.tsx]
- "inventory_entry_modalsendtowhouse": "ModalSendToWhouse.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalSendToWhouse.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, ModalSendToWhouse(), Props, t(), page.tsx]
- "invoice_search_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/invoice-search/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure(), route.ts, authOptions]
- "invoices_by_customer_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/invoices-by-customer/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure(), route.ts, authOptions]
- "items_tab2_getpages": "getPages()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L45 | neighbors=[Tab2.tsx, DualListModal(), POPricesModal(), Tab2(), UpdateStockModal()]
- "items_tab2_tab2": "Tab2()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L1046 | neighbors=[Tab2.tsx, getPages(), getTotal(), t(), useSentinel()]
- "items_tab2_usesentinel": "useSentinel()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L31 | neighbors=[Tab2.tsx, DualListModal(), POPricesModal(), Tab2(), UpdateStockModal()]
- "label_laser_route": "route.tsx" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-laser/route.tsx:L1 | neighbors=[GET(), db.ts, executeProcedure(), LabelGridPDF.tsx, LabelGridPDF()]
- "make_invoice_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/make-invoice/route.ts:L1 | neighbors=[db.ts, executeProcedure(), POST(), route.ts, authOptions]
- "make_invoices_bulk_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/make-invoices-bulk/route.ts:L1 | neighbors=[db.ts, executeProcedure(), POST(), route.ts, authOptions]
- "open_route": "route.ts" | kind=code-symbol | source=src/app/api/sales/invoice/open/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, POST()]
- "partial_invoice_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/partial-invoice/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, POST()]
- "payment_authorizations_page_today": "today()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L31 | neighbors=[page.tsx, ModalCRDB(), ModalDateToHistory(), ModalPaymentsReport(), ModalReports()]
- "pbook2invoice_modalattachinvoice": "ModalAttachInvoice.tsx" | kind=code-symbol | source=src/components/pbook2invoice/ModalAttachInvoice.tsx:L1 | neighbors=[fmtDate(), ModalAttachInvoice(), Props, t(), page.tsx]
- "pbook2invoice_modalchangecustomer": "ModalChangeCustomer.tsx" | kind=code-symbol | source=src/components/pbook2invoice/ModalChangeCustomer.tsx:L1 | neighbors=[fmtDate(), ModalChangeCustomer(), Props, t(), page.tsx]
- "pbook2invoice_modalpartialinvoice": "ModalPartialInvoice.tsx" | kind=code-symbol | source=src/components/pbook2invoice/ModalPartialInvoice.tsx:L1 | neighbors=[fmtI(), ModalPartialInvoice(), Props, t(), page.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-025.json

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
