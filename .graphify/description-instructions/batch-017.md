# Node Description Batch 18 of 139

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

- "public_pdf_worker_min_workertask": "WorkerTask" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .createDocumentHandler(), .constructor(), .ensureNotTerminated(), .finish(), .finished()] | lang=en
- "public_pdf_worker_min_writedict": "writeDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, incrementalUpdate(), .getKeys(), escapePDFName(), writeValue(), writeObject()] | lang=en
- "public_pdf_worker_min_xfaparser_onbeginelement": ".onBeginElement()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAParser, An, .build(), .isNsAgnostic(), gr, ._getNameAndPrefix()] | lang=en
- "public_pdf_worker_min_xhtmlobject": "XhtmlObject" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[jr](), .[nn](), .[$s](), .[Wr]()] | lang=en
- "public_pdf_worker_min_xref_fetchuncompressed": ".fetchUncompressed()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, .fetch(), .createCipherTransform(), Lexer, Parser, warn()] | lang=en
- "recepted_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-in/recepted/route.ts:L1 | neighbors=[7772f1b feat(scan-in): add AWB Receptio…, f4ad8b5 fix(scan-in): correct all SP pa…, db.ts, executeProcedure(), route.ts, authOptions] | lang=en
- "reports_reportutils_extractvendorinfo": "extractVendorInfo()" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L105 | neighbors=[route.tsx, route.tsx, route.ts, route.tsx, reportUtils.ts, t()] | lang=en
- "scan_in_delayedboxmodal": "DelayedBoxModal.tsx" | kind=code-symbol | source=src/components/scan-in/DelayedBoxModal.tsx:L1 | neighbors=[7772f1b feat(scan-in): add AWB Receptio…, utils.ts, cn(), DelayedBoxModal(), DelayedBoxModalProps, Reason] | lang=en
- "scan_list_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-in/scan-list/route.ts:L1 | neighbors=[7772f1b feat(scan-in): add AWB Receptio…, f4ad8b5 fix(scan-in): correct all SP pa…, db.ts, executeProcedure(), route.ts, authOptions] | lang=en
- "statement_route": "route.ts" | kind=code-symbol | source=src/app/api/vendors/statement/route.ts:L1 | neighbors=[dates.ts, todayEST(), db.ts, executeProcedure(), route.ts, authOptions] | lang=en
- "store_useitemsstore": "useItemsStore.ts" | kind=code-symbol | source=src/store/useItemsStore.ts:L1 | neighbors=[ee1d500 feat(items): add useItemsStore …, page.tsx, Tab1.tsx, Tab2.tsx, Tab3.tsx, ItemsState] | lang=en
- "store_usescaninstore": "useScanInStore.ts" | kind=code-symbol | source=src/store/useScanInStore.ts:L1 | neighbors=[7772f1b feat(scan-in): add AWB Receptio…, page.tsx, INITIAL, ScanInState, ScanInTabId, ScanInTotals] | lang=en
- "unico_route_put": "PUT()" | kind=code-symbol | source=src/app/api/vendors/groups/[unico]/route.ts:L8 | neighbors=[route.ts, bit(), getTargetNivel(), num(), t(), txt()] | lang=en
- "varieties_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/varieties/route.ts:L1 | neighbors=[15b09b1 feat(items): PanelGrid for Tab1…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), GET()] | lang=en
- "views_route": "route.ts" | kind=code-symbol | source=src/app/api/physical-scan/views/route.ts:L1 | neighbors=[6ea09a8 fix(physical-scan): quickfixes …, db.ts, executeProcedure(), route.ts, authOptions, GET()] | lang=en
- "warehouses_bogo_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/warehouses-bogo/route.ts:L1 | neighbors=[eb1606a feat(masters/items): serverAudi…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), GET()] | lang=en
- "warehouses_route": "route.ts" | kind=code-symbol | source=src/app/api/sales-reps/warehouses/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, DELETE(), GET()] | lang=en
- "alternative_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/alternative/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), eb1606a feat(masters/items): serverAudi…] | lang=en
- "app_layout": "layout.tsx" | kind=code-symbol | source=src/app/layout.tsx:L1 | neighbors=[geistMono, geistSans, metadata, RootLayout(), Providers.tsx, Providers()] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@081d28fe470c6be16a3045c5ee3cd9c7f635d10b": "081d28f fix(payment-auth): payments PDF reports — vendor info to header, remove…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 37b7727 fix(payment-auth): payments-by-…, route.tsx, route.tsx, route.tsx, 27ff929 fix(build): add turbopackUseSys…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@113d98912d48bcfe265530c3ba34d8b509344f25": "113d989 fix(payment-auth): fix date update timezone bug + payments default to 1…" | kind=Commit | source=git | neighbors=[master, 2e367ec feat(inventory-entry): vertical…, page.tsx, usePaymentAuthorizationsStore.ts, route.ts, 3d2b0df feat(inventory-entry): full-cel…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@15d04363fe0aa9f7077d1097ba87eb03b1772203": "15d0436 fix(images): enable Delete immediately after upload" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 7a76000 fix(images): re-fetch images+ke…, Tab2.tsx, route.ts, 1e41950 fix(images): constrain ImageMod…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@1afc81eba8ef3cde32e009bbafa09064ff7edd50": "1afc81e fix(masters/items/grades): correct table name to flower_products_grades" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, b6ad5a5 feat(masters/items): variety pa…, route.ts, route.ts, a1da4e3 refactor(masters/items): replac…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@1c0ea4a49be3e3c5794f094fb8fc02d75ce85c9b": "1c0ea4a fix(permissions): wire correct panta_uq for users, access and companies…" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 8f4f4aa fix(permissions): replace all 5…, authGuards.ts, permissions.ts, 8ed3e84 fix(users): add u2fa column to …] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@2fa45a1b48cb845cf004ca27fdec72899f851fcb": "2fa45a1 fix(sales-reps): add explicit any type to report route row callbacks" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, f62ffd5 debug(sales-reps): temp debug e…, route.tsx, route.tsx, 65db5f6 fix(sales-reps): add error hand…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@533b609d2f05880511dea4c9411764054743f816": "533b609 fix(sales-reps): correct SP param lcsalesman_uq for customers report" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 3170b5b fix(sales-reps): exclude salesm…, route.tsx, route.ts, f62ffd5 debug(sales-reps): temp debug e…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@5cdc4a20a41cc248467a8c1e2ed7732c24574e73": "5cdc4a2 fix(vendors): Web Settings modal uses sp_flower_growers_update_web" | kind=Commit | source=git | neighbors=[2fb1952 fix(vendors): handleOpenWs was …, master, worktree-agent-a59e3078904cba68a, d468a28 feat(carriers+payment-auth): in…, page.tsx, route.ts] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@624fb9b27e070dfc6c7a1deee15921e693bee56d": "624fb9b fix(scan-in): map all SP column names to lowercase to match SQL Server …" | kind=Commit | source=git | neighbors=[route.ts, master, 1857d90 feat(scan-in): add confirm dial…, page.tsx, route.ts, f4ad8b5 fix(scan-in): correct all SP pa…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@63f5a431546cadc79f9b0bd1fc9338b8963f2c2d": "63f5a43 fix(items): fix variety search to match anywhere (not just suffix)" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 3e16b69 revert(items): restore sp_flowe…, route.ts, route.ts, 7335720 fix(products-modal): show Class…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@67b5a2d34b2c2c6e7ab65bb3e42b65d44b7c59fb": "67b5a2d fix(box-recipe): product dropdown shows only products with bunch recipe" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, ccded87 revert(box-recipe): restore sp_…, BoxRecipeModal.tsx, route.ts, 70e5b30 fix(bunch-recipe): grade/color/…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@68885a983a7f4c53bbdd9dd3544d53f5e9e53ae7": "68885a9 fix(menu+scan-out): disable Scan IN tile; responsive mobile layout for …" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 7772f1b feat(scan-in): add AWB Receptio…, page.tsx, page.tsx, d645c42 fix(permissions): assign correc…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@7448ff1b7dc412a0762ee252ce1e2db1b8f04a83": "7448ff1 fix(flexy2qb): Mark as Not Ready By Date uses row date not panel date" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, d78faa6 fix(flexy2qb): dashboard defaul…, Purchases2QBTab.tsx, Sales2QBTab.tsx, SalesCosts2QBTab.tsx, 80a4735 fix(flexy2qb): refresh dates pa…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@75b26c7893f7cc040a082f395c8821856ec843a2": "75b26c7 feat(physical-scan): add useScanStore Zustand store for currentRack, ac…" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, c12e586 feat(physical-scan): add 2 miss…, page.tsx, useScanStore.ts, 923e449 feat(physical-scan): convert al…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@7841f8d63487feb31ddf9c6529490da35d91d465": "7841f8d fix(ar): invoice search navigation, print, and email" | kind=Commit | source=git | neighbors=[581b42b fix(ar): remove gray separator …, master, 0eba280 feat(ar): increase totals row h…, page.tsx, route.ts, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@836480378abf1ce7a19ec13b9f16b0c2d422ebf9": "8364803 feat(payment-authorizations): implement Credits/Debits (CRDB) management" | kind=Commit | source=git | neighbors=[6b863f3 fix(payment-authorizations): hi…, worktree-agent-a59e3078904cba68a, 5d9ddbd feat(payment-authorizations): e…, route.ts, route.tsx, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@8ed3e84434cf939b3ccf2d059e121c4082923985": "8ed3e84 fix(users): add u2fa column to sp_NC_users_list and sp_NC_User_Info" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 1c0ea4a fix(permissions): wire correct …, sp_NC_User_Info.sql, sp_NC_users_list.sql, c00ea33 fix(auth): read nivel from sp_N…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@944fe1ac6692d215dbd2ceacf6fa7881bfaa0562": "944fe1a fix(awbs): rewrite boxes modal to match VFP fields and values" | kind=Commit | source=git | neighbors=[8efda51 fix(awbs): refresh main AWB gri…, page.tsx, master, worktree-agent-a59e3078904cba68a, route.ts, 5225929 feat(awbs): full mobile respons…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@977afcf196c6ac9dc80d42e5055a95f845cc09e4": "977afcf fix(auth): add SMTP timeouts and 20s API hard timeout to prevent login …" | kind=Commit | source=git | neighbors=[8b0d476 fix(auth): lazy Nodemailer tran…, master, worktree-agent-a59e3078904cba68a, 0bfb1d7 fix(auth): use first email only…, mailer.ts, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@9ef9c8a292323ceb9de9e602467cc9da4d74ab2f": "9ef9c8a fix(customer-payments): correct date display and CR/DB filter for NY ti…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 3d34448 feat(flexy2qb): comprehensive t…, Shared.tsx, page.tsx, route.ts, d74492b fix(customer-payments): sticky …] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@b2de8e0f8b4ea3993d3bba95e6f0238ec5a24e86": "b2de8e0 fix(items): add description validation + diagnostic logs for descriptio…" | kind=Commit | source=git | neighbors=[5f3d836 fix(items): description not sav…, master, worktree-agent-a59e3078904cba68a, 416549a feat(items): add Show checkboxe…, Tab2.tsx, route.ts] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-017.json

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
