# Node Description Batch 33 of 139

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

- "commit:repo:github.com/FlexyMax/fullpot-operational-system@8d9c35549013ec4aad9b3c45ea93b85b72af15c7": "8d9c355 feat(freights): add season filter dropdown + modal footer close button" | kind=Commit | source=git | neighbors=[master, a9637e0 fix: PA CRDB FK error + Stateme…, page.tsx, f2d0c3d feat(qc): redesign BoxTransferM…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@90f784763e47f6eb175358bc88fb7e86838cda79": "90f7847 fix(flexy2qb): Invoice Not Ready uses wrong SP, causing Transaction ERR…" | kind=Commit | source=git | neighbors=[6e51a97 fix(flexy2qb): show real SP err…, worktree-agent-a59e3078904cba68a, 80a4735 fix(flexy2qb): refresh dates pa…, Purchases2QBTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@931ccd429a34847c4365d0f2332401a7a83b27de": "931ccd4 feat(ap): add per-row Pay button with partial payment modal (ModalPayIn…" | kind=Commit | source=git | neighbors=[72a649b fix(ap): remove 'use client' fr…, master, d5ca233 feat(ap): add '+ New Payment Au…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@99cd8739c531d6638ac2f9a562a9c07e680cacac": "99cd873 fix(bi): restore grid/filters sidebar and mark reports with saved cubes" | kind=Commit | source=git | neighbors=[0a24231 style(bi): increase grid worksp…, master, page.tsx, 563666c style(bi): increase grid min-he…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@aa8bab8e960446c1ef5f8a85c572158f5d52c36f": "aa8bab8 fix(payment-auth): use sp_NC_accounts_outcome_insert to store pay_doc a…" | kind=Commit | source=git | neighbors=[a5dce9a fix(scan-in): pass lcUser_uq fr…, master, 1d76b42 fix(flexy2qb): pass first recor…, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@b16e699afdfa8dbc2236f6f90511817ff0482e7a": "b16e699 fix(customer-payments): add missing Unapply field to customer info bar" | kind=Commit | source=git | neighbors=[3907ed7 feat(customer-payments): defaul…, worktree-agent-a59e3078904cba68a, d74492b fix(customer-payments): sticky …, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@b4579603803aa3b3ddb782eef7a0e07813fae80b": "b457960 fix(ie): correct image fetch format, fix mobile heights, restructure Pr…" | kind=Commit | source=git | neighbors=[3f09764 feat: sticky AP totals, IE Prod…, master, 165c3d0 feat(inventory-entry): update m…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@b57a3a97c524cc259ae6f8187fca6e71059ca6a0": "b57a3a9 chore(deps): update dependencies and fix 10 audit vulnerabilities" | kind=Commit | source=git | neighbors=[8a33467 fix(qc): wrap nullish-coalescin…, master, worktree-agent-a59e3078904cba68a, 91cba6d fix(config): remove turbopackUs…] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@c12c4544248082d5174d46e70a753c2b6480489f": "c12c454 fix(csv): dedupe duplicate lower/upper-case columns in downloads" | kind=Commit | source=git | neighbors=[master, 0b1681d feat(ap): add multi-invoice che…, csv.ts, d3f37c5 feat(flexy2qb): add CSV + Excel…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@cc2daff7b5dd71bc17479dcad2d20ca6eb3b0f3e": "cc2daff debug(ap-reports): add format=columns to pending route to inspect SP co…" | kind=Commit | source=git | neighbors=[a61433b fix(ap-reports): normalize colu…, worktree-agent-a59e3078904cba68a, e1517a2 fix(payment-auth): 4 Months Vie…, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d2505855b9c17fa6cbc3782c5fb0a55ff9f81295": "d250585 fix(pa): use correct NC_ SPs for CRDB insert/update/delete" | kind=Commit | source=git | neighbors=[2e367ec feat(inventory-entry): vertical…, master, 2f37a65 feat(customers): statement moda…, route.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d5423ca0ffcbc62e385cb0c2a71ff0785704da8b": "d5423ca feat(inventory-entry): make product image fill full cell in desktop tab…" | kind=Commit | source=git | neighbors=[74dd6c2 fix(inventory-entry): restore m…, master, 3d2b0df feat(inventory-entry): full-cel…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d5ca2334a0d829c726dc8cbdf39a78b44fa6ce27": "d5ca233 feat(ap): add '+ New Payment Authorization' option in ModalPayInvoice d…" | kind=Commit | source=git | neighbors=[931ccd4 feat(ap): add per-row Pay butto…, master, 4b782d7 fix(ap): pass supplier_uq in Ed…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d74492b3992250270546d51e361c57a4bba5a402": "d74492b fix(customer-payments): sticky invoice totals row aligned to columns" | kind=Commit | source=git | neighbors=[b16e699 fix(customer-payments): add mis…, worktree-agent-a59e3078904cba68a, 9ef9c8a fix(customer-payments): correct…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d78faa6854ced8bb6b1cf598a0e55f5e511d60c6": "d78faa6 fix(flexy2qb): dashboard defaults to Sales (S) instead of All" | kind=Commit | source=git | neighbors=[7448ff1 fix(flexy2qb): Mark as Not Read…, worktree-agent-a59e3078904cba68a, 657dacf fix(ap-reports): filter VFP met…, DashboardTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d8f60eac5ebd4bccea6f6d8e7c088e59eb66518f": "d8f60ea fix(print-recipe): remove old route.ts that shadowed route.tsx" | kind=Commit | source=git | neighbors=[22af037 fix(print-recipe): add try/catc…, master, worktree-agent-a59e3078904cba68a, 7335720 fix(products-modal): show Class…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@dc61ccb80941a6db1e1fb229b411b9309094ded4": "dc61ccb feat(flexy2qb): wire new NC SPs with date param in route.ts" | kind=Commit | source=git | neighbors=[route.ts, worktree-agent-a59e3078904cba68a, 50212fd style(flexy2qb): taller sub-tab…, f61ab73 feat(flexy2qb): replace mobile …] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@dfc98c2daf92d62ff168109db74241f94a5eb66c": "dfc98c2 fix(AuditLogModal): bareButton text-white → text-gray-400 so icon visib…" | kind=Commit | source=git | neighbors=[21d3998 fix(ui): remove redundant recor…, master, 0d80aaa fix(log): use History icon + ad…, AuditLogModal.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@e1517a2a145ad709fbedc2f7091c3db31da51422": "e1517a2 fix(payment-auth): 4 Months View shows in modal instead of replacing ve…" | kind=Commit | source=git | neighbors=[cc2daff debug(ap-reports): add format=c…, worktree-agent-a59e3078904cba68a, 232afb7 fix(payment-auth): safer paFetc…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@e612ffdaf5bff40bd4cc079334a6b0449e86d814": "e612ffd feat(payment-auth): 4 Months Detail as drill-down inside 4 Months View …" | kind=Commit | source=git | neighbors=[232afb7 fix(payment-auth): safer paFetc…, worktree-agent-a59e3078904cba68a, 0b02d04 fix(payment-auth): 4 issues — V…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@edc6703ed7d79fa225d9496eef4738c2d9f22a08": "edc6703 fix(access): prevent accidental Cancel on Edit, add loading state" | kind=Commit | source=git | neighbors=[3322075 fix(users): close unico mismatc…, page.tsx, worktree-agent-a59e3078904cba68a, 8bad964 fix(users): email field spans 2…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f2d0c3d97dfa99d29286e9f0373470c8a1c9fc58": "f2d0c3d feat(qc): redesign BoxTransferModal insert mode to match AppSmith origi…" | kind=Commit | source=git | neighbors=[45709f7 fix(qc): wire Send to Warehouse…, master, 8d9c355 feat(freights): add season filt…, BoxTransferModal.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f3124845bad3290203d11077c3124f323efdc35e": "f312484 chore(docker): upgrade npm to 11.18.0 in build stages" | kind=Commit | source=git | neighbors=[91cba6d fix(config): remove turbopackUs…, master, worktree-agent-a59e3078904cba68a, 83b28ae feat(users): add Ext-Action col…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f38e812a4a45c6206ce61e6e353e0d3043d8fcf2": "f38e812 fix(awbs): use type_name field from sp_flower_accounts_pay_type_to_awb …" | kind=Commit | source=git | neighbors=[9006e92 fix(cp): fix income types dropd…, page.tsx, master, d8a9f3c feat(ap): add proper Payment Au…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@fe25620b36cb9abc11e76b18ce62ce6b2f1a437c": "fe25620 feat(system-users): taller log panel + log icon on users grid" | kind=Commit | source=git | neighbors=[39269e4 fix(system-users): prevent scro…, worktree-agent-a59e3078904cba68a, d5d052c style: standardize code column …, page.tsx] | lang=en
- "components_entitylistmodal": "EntityListModal.tsx" | kind=code-symbol | source=src/components/EntityListModal.tsx:L1 | neighbors=[EntityListModal(), EntityListModalProps, utils.ts, cn()] | lang=en
- "context_flexy2qbcontext": "Flexy2QBContext.tsx" | kind=code-symbol | source=src/app/flexy2qb/context/Flexy2QBContext.tsx:L1 | neighbors=[Flexy2QBContext, Flexy2QBProvider(), Flexy2QBState, useFlexy2QBContext()] | lang=en
- "cor_pay_uq_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/corporate-invoices/[cor_pay_uq]/route.ts:L1 | neighbors=[GET(), P, db.ts, executeProcedure()] | lang=en
- "corporate_income_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/corporate-income/route.ts:L1 | neighbors=[ca478bf perf(customer-payments): standa…, POST(), db.ts, executeProcedure()] | lang=en
- "corporate_invoice_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/corporate-invoice/route.ts:L1 | neighbors=[ca478bf perf(customer-payments): standa…, POST(), db.ts, executeProcedure()] | lang=en
- "crdb_reasons_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/crdb-reasons/route.ts:L1 | neighbors=[8364803 feat(payment-authorizations): i…, GET(), db.ts, executeProcedure()] | lang=en
- "create_route_post": "POST()" | kind=code-symbol | source=src/app/api/pos/invoice/create/route.ts:L8 | neighbors=[route.ts, bit(), num(), txt()] | lang=en
- "discounts_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/discounts/route.ts:L1 | neighbors=[DELETE(), POST(), db.ts, executeProcedure()] | lang=en
- "fix_empty_arr": "fix_empty_arr.js" | kind=code-symbol | source=fix_empty_arr.js:L1 | neighbors=[dir, files, fs, path] | lang=en
- "fix_freights": "_fix-freights.mjs" | kind=code-symbol | source=_fix-freights.mjs:L1 | neighbors=[c, lines, verify, vl] | lang=en
- "fix_imports": "fix_imports.js" | kind=code-symbol | source=fix_imports.js:L1 | neighbors=[content, file, fs, path] | lang=en
- "fix_tags": "fix_tags.js" | kind=code-symbol | source=fix_tags.js:L1 | neighbors=[content, file, fs, path] | lang=en
- "fix_tags_close": "fix_tags_close.js" | kind=code-symbol | source=fix_tags_close.js:L1 | neighbors=[content, file, fs, path] | lang=en
- "get_sp_defs": "get_sp_defs.js" | kind=code-symbol | source=get_sp_defs.js:L1 | neighbors=[config, main(), SPS, sql] | lang=en
- "growers_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/growers/route.ts:L1 | neighbors=[a2a004f feat(items): Bunch Recipe + Box…, GET(), db.ts, executeProcedure()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-032.json

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
