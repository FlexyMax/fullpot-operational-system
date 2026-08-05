# Node Description Batch 32 of 139

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

- "cases_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/cases/route.ts:L20 | neighbors=[route.ts, bit(), num(), txt()] | lang=en
- "cashback_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/cashback/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), ca478bf perf(customer-payments): standa…] | lang=en
- "charges_by_date_route": "route.ts" | kind=code-symbol | source=src/app/api/awbs/charges-by-date/route.ts:L1 | neighbors=[GET(), POST(), db.ts, executeProcedure()] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@0a24231b5411133d57cab10b78c670c4bf9e9811": "0a24231 style(bi): increase grid workspace height and enable scroll" | kind=Commit | source=git | neighbors=[master, page.tsx, 99cd873 fix(bi): restore grid/filters s…, 91438b4 feat(bi): persist saved pivot/g…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@0b1681dbd1e4cdc6a04e81e9799b1659100e9bfa": "0b1681d feat(ap): add multi-invoice checkbox payment to Vendor Invoices tab" | kind=Commit | source=git | neighbors=[master, 7eb7a26 feat(ap): group vendor invoices…, page.tsx, c12c454 fix(csv): dedupe duplicate lowe…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@0eba280db6c33bab3691ac659a90d382482fde66": "0eba280 feat(ar): increase totals row height and font size in customer grid" | kind=Commit | source=git | neighbors=[master, bffba33 fix(ar): use correct InvoiceHTM…, page.tsx, 7841f8d fix(ar): invoice search navigat…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@165c3d036e6daa1b9e98efcdb172bc5ba949c915": "165c3d0 feat(inventory-entry): update mobile card image style to full-height fl…" | kind=Commit | source=git | neighbors=[master, 74dd6c2 fix(inventory-entry): restore m…, page.tsx, b457960 fix(ie): correct image fetch fo…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@1857d90e8d32fd05e256cec8016db7dbfcfcab1d": "1857d90 feat(scan-in): add confirm dialogs for Batch/Confirm buttons + refresh …" | kind=Commit | source=git | neighbors=[master, ea21633 fix(scan-in): rename SPs to NC_…, page.tsx, 624fb9b fix(scan-in): map all SP column…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@1ac6172ba4640cc98a158e5b0e691d1f9e258eaa": "1ac6172 style(qc): unify StockListTab grid headers, remove duplicate search bar…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, af5d85c style(qc): remove duplicate sea…, StockListTab.tsx, 7c0d5ac feat(qc): infinite scroll, auto…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@1d1cadb4a2e7b5d90d00b3dde4338d5d9065e1ae": "1d1cadb feat(awbs): auto-set date range to AWB min/max invoice dates on Go sear…" | kind=Commit | source=git | neighbors=[page.tsx, master, f11125f feat(awbs): scroll to searched …, 658b41a fix(awbs): include AWBCODE in s…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@1d76b4262123522a658b792c769b371bb62a57c5": "1d76b42 fix(flexy2qb): pass first record unico for By Date actions in Customer …" | kind=Commit | source=git | neighbors=[master, 91438b4 feat(bi): persist saved pivot/g…, CustomerPaymentsTab.tsx, aa8bab8 fix(payment-auth): use sp_NC_ac…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@1f53c318c14d4c7d8f38bffef35ec9d44703d329": "1f53c31 fix(ar/mobile): 4 mobile fixes for Customer Payments" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, f7acc6c fix(qc/mobile): 3 mobile UX imp…, page.tsx, 75a1bd0 feat(qc): AuditLogModal uses Pa…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@232afb78e5e61080c46c1cf4e9e871ccdd6cfdcf": "232afb7 fix(payment-auth): safer paFetch for non-JSON error responses" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, e612ffd feat(payment-auth): 4 Months De…, page.tsx, e1517a2 fix(payment-auth): 4 Months Vie…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@27ff929e51fc4662583a6ef66cc53fcb3c0f207d": "27ff929 fix(build): add turbopackUseSystemTlsCerts to fix Geist font TLS failure" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 081d28f fix(payment-auth): payments PDF…, next.config.ts, ecf4fd3 fix(reports): fix blank print +…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@2e367ec9a8cf20a9e140815baff23c35098e2287": "2e367ec feat(inventory-entry): vertical tab strip + full-bleed card images" | kind=Commit | source=git | neighbors=[113d989 fix(payment-auth): fix date upd…, master, d250585 fix(pa): use correct NC_ SPs fo…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@2f37a6549420c61e7363bb35837130391ff5d40e": "2f37a65 feat(customers): statement modal footer + totals tfoot row" | kind=Commit | source=git | neighbors=[master, cc3d5cb fix(customers): export CSV down…, page.tsx, d250585 fix(pa): use correct NC_ SPs fo…] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@3568ff11563edd461fd5eeb78372b130a559a083": "3568ff1 fix(awbs): AWB# search now filters grid to only matching AWBs" | kind=Commit | source=git | neighbors=[page.tsx, master, e8d0d5e feat: proper xlsx export with S…, 4b782d7 fix(ap): pass supplier_uq in Ed…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@39269e49610de4f5798b9856f511d028768376c9": "39269e4 fix(system-users): prevent scroll reset during infinite scroll page fet…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, fe25620 feat(system-users): taller log …, page.tsx, 7efdb5e fix(system-users): replace miss…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@3cd3204b3be13208c3695441deb51b2accb5c9cb": "3cd3204 fix(bi): avoid cube-structure conflicts when saving/loading configs" | kind=Commit | source=git | neighbors=[master, page.tsx, 5a17025 fix(bi): avoid grid reset after…, 615a4d3 fix(bi): save and restore row g…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@3d2b0df544ad9d03692c20a51a9f60224f49f46e": "3d2b0df feat(inventory-entry): full-cell image in Boxes Detail desktop table" | kind=Commit | source=git | neighbors=[master, 113d989 fix(payment-auth): fix date upd…, page.tsx, d5423ca feat(inventory-entry): make pro…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@3ed1d777b6a4fec07d9cf48065dac9e2ac016743": "3ed1d77 fix(flexy2qb): correctly pass record unico to audit log after CRUD" | kind=Commit | source=git | neighbors=[route.ts, worktree-agent-a59e3078904cba68a, 3c0001a feat(flexy2qb): add CSV downloa…, e62e50b feat(flexy2qb): add LogRecordMo…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@4b782d752d7bcf66f46f79554ed2921b67ea1733": "4b782d7 fix(ap): pass supplier_uq in Edit Payment PUT — fixes NULL constraint e…" | kind=Commit | source=git | neighbors=[master, 3568ff1 fix(awbs): AWB# search now filt…, page.tsx, d5ca233 feat(ap): add '+ New Payment Au…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@4c69f8a22ef12173812a6309e299cbc35e10eb85": "4c69f8a fix(ar): replace orange header border with subtle gray line" | kind=Commit | source=git | neighbors=[master, 581b42b fix(ar): remove gray separator …, StatementPDFv2.tsx, 4d6d80d feat(ar): white header + aging/…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@4eac9f5de7e450746539582e4fcef0d25f093960": "4eac9f5 feat(ap): light gray month rows, + New Payment Auth in dropdown" | kind=Commit | source=git | neighbors=[master, 808d098 feat(ap): add Create Bank modal…, page.tsx, 7eb7a26 feat(ap): group vendor invoices…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@563666cd534872b1c4350b22c7bd4b48c16ddfd6": "563666c style(bi): increase grid min-height to 80vh" | kind=Commit | source=git | neighbors=[master, page.tsx, 615a4d3 fix(bi): save and restore row g…, 99cd873 fix(bi): restore grid/filters s…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@581b42b761b4d9fe2f7043c830d7ed686547a0f7": "581b42b fix(ar): remove gray separator line from statement PDF header" | kind=Commit | source=git | neighbors=[4c69f8a fix(ar): replace orange header …, master, 7841f8d fix(ar): invoice search navigat…, StatementPDFv2.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@5a17025bf8e67e6da011d9ea738407fe3b65957d": "5a17025 fix(bi): avoid grid reset after save by not refetching configs immediat…" | kind=Commit | source=git | neighbors=[3cd3204 fix(bi): avoid cube-structure c…, master, page.tsx, 658b41a fix(awbs): include AWBCODE in s…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@5d4075f3d98a6c7a0f63710b8d4671637371fe70": "5d4075f refactor(ap): move New Bank option into bank dropdown list" | kind=Commit | source=git | neighbors=[master, 9006e92 fix(cp): fix income types dropd…, page.tsx, 808d098 feat(ap): add Create Bank modal…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@615a4d3e224d00c816f7116e1971dfbd632d5f41": "615a4d3 fix(bi): save and restore row groups, pivot and value columns explicitly" | kind=Commit | source=git | neighbors=[563666c style(bi): increase grid min-he…, master, page.tsx, 3cd3204 fix(bi): avoid cube-structure c…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@658b41a0b67674a21fd621036b058cbaaa2b1d80": "658b41a fix(awbs): include AWBCODE in selAwb after Go search" | kind=Commit | source=git | neighbors=[5a17025 fix(bi): avoid grid reset after…, page.tsx, master, 1d1cadb feat(awbs): auto-set date range…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@6b863f32a9fef02c489a522b7c63483cc1413b64": "6b863f3 fix(payment-authorizations): history modal generates PDF via sp_flower_…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 8364803 feat(payment-authorizations): i…, page.tsx, 7d048ed fix(payment-authorizations): 7 …] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@6e70d6809b27bb70920ab83eddc55475602cc795": "6e70d68 fix(flexy2qb): remove extra date params from OCharges/Credits SP calls" | kind=Commit | source=git | neighbors=[route.ts, worktree-agent-a59e3078904cba68a, f61ab73 feat(flexy2qb): replace mobile …, ba2e1f0 feat(flexy2qb): mobile date pic…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@72a649be13c71537f98f39bb573c11d6790a8afb": "72a649b fix(ap): remove 'use client' from PaymentAuthPDF — renderToBuffer runs …" | kind=Commit | source=git | neighbors=[master, 931ccd4 feat(ap): add per-row Pay butto…, PaymentAuthPDF.tsx, d8a9f3c feat(ap): add proper Payment Au…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@74dd6c2d09cdccbd0ee4128a838c81f13d3a2095": "74dd6c2 fix(inventory-entry): restore mobile card height with min-h + h-full on…" | kind=Commit | source=git | neighbors=[165c3d0 feat(inventory-entry): update m…, master, d5423ca feat(inventory-entry): make pro…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@75a1bd0d56a6a83d79f28920da12abb6e9181658": "75a1bd0 feat(qc): AuditLogModal uses PanelGrid + add design standards to CLAUDE…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 1f53c31 fix(ar/mobile): 4 mobile fixes …, AuditLogModal.tsx, 843b4b7 fix(qc): restore useQuery impor…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@7eb7a268fa7c4314d91ba617d0ba2febb41b3bc8": "7eb7a26 feat(ap): group vendor invoices by month with subtotal rows and month c…" | kind=Commit | source=git | neighbors=[0b1681d feat(ap): add multi-invoice che…, master, 4eac9f5 feat(ap): light gray month rows…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@7efdb5e082154df984eea00dd78915c69a72b333": "7efdb5e fix(system-users): replace missing refetchLog with logNonce increment" | kind=Commit | source=git | neighbors=[6eb5e58 fix(system-users): cast records…, worktree-agent-a59e3078904cba68a, 39269e4 fix(system-users): prevent scro…, page.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@80a47350e09af9bd3792f85c2816483313e2c145": "80a4735 fix(flexy2qb): refresh dates panel after mutations in Purchases2QB" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 7448ff1 fix(flexy2qb): Mark as Not Read…, Purchases2QBTab.tsx, 90f7847 fix(flexy2qb): Invoice Not Read…] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@843b4b7d48fb48974a60e004178bec630ad57b1a": "843b4b7 fix(qc): restore useQuery import alongside useInfiniteQuery in QualityC…" | kind=Commit | source=git | neighbors=[605e4e2 feat(qc): paginate QC stock sea…, worktree-agent-a59e3078904cba68a, 75a1bd0 feat(qc): AuditLogModal uses Pa…, QualityCreditsTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@8bad964f045e0fe8505c124466a5ef5db6271eb3": "8bad964 fix(users): email field spans 2 cols in upsert modal (mobile + desktop)" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, a0363ff fix(companies): first-load blan…, UserUpsertModal.tsx, edc6703 fix(access): prevent accidental…] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-031.json

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
