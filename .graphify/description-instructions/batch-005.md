# Node Description Batch 6 of 139

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

- "components_newpaymentmodal": "NewPaymentModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/NewPaymentModal.tsx:L1 | neighbors=[9006e92 fix(cp): fix income types dropd…, e8d0d5e feat: proper xlsx export with S…, NewPaymentModal(), Shared.tsx, Btn(), cpFetch()] | lang=en
- "components_shared_btn": "Btn()" | kind=code-symbol | source=src/app/sales/customer-payments/components/Shared.tsx:L56 | neighbors=[ApplyPaymentModal.tsx, ApproveCreditModal.tsx, CashBackModal.tsx, CorpInvoiceModal.tsx, CorpPaymentModal.tsx, CrDbModal.tsx] | lang=en
- "components_shared_cpfetch": "cpFetch()" | kind=code-symbol | source=src/app/sales/customer-payments/components/Shared.tsx:L29 | neighbors=[ApplyPaymentModal.tsx, ApproveCreditModal.tsx, CashBackModal.tsx, CorpInvoiceModal.tsx, CorpPaymentModal.tsx, CrDbModal.tsx] | lang=en
- "components_shared_fmt": "fmt()" | kind=code-symbol | source=src/app/sales/customer-payments/components/Shared.tsx:L8 | neighbors=[ApplyPaymentModal.tsx, ApproveCreditModal.tsx, CashBackModal.tsx, CorpInvoiceModal.tsx, CorpPaymentModal.tsx, CrDbModal.tsx] | lang=en
- "components_shared_modal": "Modal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/Shared.tsx:L36 | neighbors=[ApplyPaymentModal.tsx, ApproveCreditModal.tsx, CashBackModal.tsx, CorpInvoiceModal.tsx, CorpPaymentModal.tsx, CrDbModal.tsx] | lang=en
- "layout_appfooter_appfooter": "AppFooter()" | kind=code-symbol | source=src/components/layout/AppFooter.tsx:L9 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, page.tsx] | lang=en
- "lib_dates_normalizetoisodate": "normalizeToISODate()" | kind=code-symbol | source=src/lib/dates.ts:L89 | neighbors=[page.tsx, page.tsx, Shared.tsx, route.ts, page.tsx, dates.ts] | lang=en
- "modules_route": "route.ts" | kind=code-symbol | source=src/app/api/system/modules/route.ts:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, ce6710b feat(audit+ux): serverAuditLog …, fac809c perf(modules): eliminate raw SQ…, authGuards.ts, requireSuperAdmin(), db.ts] | lang=en
- "payment_single_route": "route.tsx" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/payment-single/route.tsx:L1 | neighbors=[081d28f fix(payment-auth): payments PDF…, 657dacf fix(ap-reports): filter VFP met…, 7d048ed fix(payment-authorizations): 7 …, a61433b fix(ap-reports): normalize colu…, d8a9f3c feat(ap): add proper Payment Au…, dc1c19d feat(payment-auth): PDF reports…] | lang=en
- "print_composition_route": "route.tsx" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/print-composition/route.tsx:L1 | neighbors=[22af037 fix(print-recipe): add try/catc…, d288ae0 feat(items): Print Recipe gener…, db.ts, executeProcedure(), BOUQUET_COLS, COMBO_COLS] | lang=en
- "public_pdf_worker_min_binarycmapreader_process": ".process()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BinaryCMapReader, addHex(), BinaryCMapStream, .readByte(), .readHex(), .readHexNumber()] | lang=en
- "public_pdf_worker_min_binder_bindelement": "._bindElement()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, .bind(), ._bindOccurrences(), ._createOccurrences(), ._findDataByNameToConsume(), ._getOccurInfo()] | lang=en
- "public_pdf_worker_min_bytestostring": "bytesToString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getString(), unreachable(), .parseNameIndex(), .parseStringIndex(), .decryptString()] | lang=en
- "public_pdf_worker_min_cffparser_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, CFF, .hasName(), .createDict(), .parseCharsets(), .parseCharStrings()] | lang=en
- "public_pdf_worker_min_connectionsetnamespace": "ConnectionSetNamespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[cn](), .connectionSet(), .effectiveInputPolicy(), .effectiveOutputPolicy(), .operation()] | lang=en
- "public_pdf_worker_min_font": "Font" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .charsToGlyphs(), ._charToGlyph(), .checkAndRepair(), .constructor(), .convert()] | lang=en
- "public_pdf_worker_min_identitycmap": "IdentityCMap" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createBuiltInCMap(), .charCodeOf(), .constructor(), .contains(), .forEach()] | lang=en
- "public_pdf_worker_min_iscmd": "isCmd()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), parseBfChar(), parseBfRange(), parseCidChar(), parseCidRange()] | lang=en
- "public_pdf_worker_min_jbig2error": "Jbig2Error" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, decodeRefinement(), decodeTextRegion(), getCustomHuffmanTable(), getStandardTable(), .decodeNode()] | lang=en
- "public_pdf_worker_min_parsecmap": "parseCMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), createBuiltInCMap(), extendCMap(), FormatError, getUint32()] | lang=en
- "public_pdf_worker_min_parser_makefilter": ".makeFilter()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .filter(), Ascii85Stream, AsciiHexStream, CCITTFaxStream, FlateStream] | lang=en
- "public_pdf_worker_min_parser_shift": ".shift()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._readDocumentOutline(), compileCharString(), .read(), .getAll(), Parser, .getObj()] | lang=en
- "public_pdf_worker_min_stringstream": "StringStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getOperatorList(), ._getDefaultCheckedAppearance(), .constructor(), .createAppearance(), .createNewAppearanceStream()] | lang=en
- "public_pdf_worker_min_type1font_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Font, .peekBytes(), .skip(), findBlock(), FormatError, Stream] | lang=en
- "public_pdf_worker_min_util": "Util" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .#A(), .applyInverseTransform(), .applyTransform(), .bezierBoundingBox(), .#e()] | lang=en
- "public_pdf_worker_min_xmlparserbase": "XMLParserBase" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .onBeginElement(), .onCdata(), .onComment(), .onDoctype(), .onEndElement()] | lang=en
- "reports_reportutils_skipkey": "skipKey()" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L55 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.tsx] | lang=en
- "reports_route": "route.ts" | kind=code-symbol | source=src/app/api/system/screens/[unico]/reports/route.ts:L1 | neighbors=[ce6710b feat(audit+ux): serverAuditLog …, fac809c perf(modules): eliminate raw SQ…, db.ts, executeProcedure(), executeQuery(), serverAudit.ts] | lang=en
- "screens_route": "route.ts" | kind=code-symbol | source=src/app/api/system/screens/route.ts:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, ce6710b feat(audit+ux): serverAuditLog …, fac809c perf(modules): eliminate raw SQ…, authGuards.ts, requireSuperAdmin(), db.ts] | lang=en
- "send_statement_email_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/reports/send-statement-email/route.ts:L1 | neighbors=[4d6d80d feat(ar): white header + aging/…, 7dac8f6 fix(ar): pass date range + mode…, cfe2d43 feat(ar): send statement as PDF…, eeffe24 feat(ar): logo + fix balance to…, fcafe0d feat(ar): wire statement email …, db.ts] | lang=en
- "stock_om_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/stock-om/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, companyInfo.ts, getCompanyInfo()] | lang=en
- "awb_full_route": "route.tsx" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-full/route.tsx:L1 | neighbors=[COLUMNS, fmt(), fmtDate(), fmtI(), GET(), t()] | lang=en
- "box_history_route": "route.tsx" | kind=code-symbol | source=src/app/api/inventory-entry/reports/box-history/route.tsx:L1 | neighbors=[COLUMNS, fmt(), fmtDate(), fmtI(), GET(), t()] | lang=en
- "cases_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/cases/route.ts:L1 | neighbors=[bit(), GET(), int(), num(), POST(), txt()] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@a2a004f5bcfe937859059f57bd1d22aaeebe3b7b": "a2a004f feat(items): Bunch Recipe + Box Recipe modals for Tab2" | kind=Commit | source=git | neighbors=[64d7480 fix(tab3): components grid now …, route.ts, master, worktree-agent-a59e3078904cba68a, route.ts, 69066d9 fix(bunch-recipe): 5 UI fixes +…] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ecf4fd3bb0878a2b28022dc0d92580edaf25f93c": "ecf4fd3 fix(reports): fix blank print + extract shared reportUtils to eliminate…" | kind=Commit | source=git | neighbors=[bd0afde fix(payment-auth): blank PDF (A…, worktree-agent-a59e3078904cba68a, 27ff929 fix(build): add turbopackUseSys…, route.tsx, route.tsx, route.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f4ad8b5f9c8169c10bdafdd8a7c09acbaf07b964": "f4ad8b5 fix(scan-in): correct all SP parameter names from DB introspection" | kind=Commit | source=git | neighbors=[7772f1b feat(scan-in): add AWB Receptio…, route.ts, route.ts, master, 624fb9b fix(scan-in): map all SP column…, route.ts] | lang=en
- "components_gridmenu": "GridMenu.tsx" | kind=code-symbol | source=src/components/GridMenu.tsx:L1 | neighbors=[GridMenu(), GridMenuItem, ITEM_COLORS, utils.ts, cn(), page.tsx] | lang=en
- "lib_authcodes": "authCodes.ts" | kind=code-symbol | source=src/lib/authCodes.ts:L1 | neighbors=[7350a1a feat(auth): implement 2-step lo…, cleanup(), CodeEntry, codeStore, consumePreAuth(), PreAuthEntry] | lang=en
- "packing_arrived_route": "route.tsx" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-arrived/route.tsx:L1 | neighbors=[db.ts, executeProcedure(), COLUMNS, fmt(), fmtDate(), fmtI()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-005.json

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
