# Node Description Batch 88 of 139

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "wh_instructions_route_fmt2": "fmt2()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/wh-instructions/route.tsx:L9 | neighbors=[route.tsx, GET()]
- "wh_instructions_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/wh-instructions/route.tsx:L8 | neighbors=[route.tsx, GET()]
- "without_invoice_route_get": "GET()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/without-invoice/route.tsx:L22 | neighbors=[route.tsx, t()]
- "without_invoice_route_t": "t()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/without-invoice/route.tsx:L7 | neighbors=[route.tsx, GET()]
- "access_page_copyaccessmodal": "CopyAccessModal()" | kind=code-symbol | source=src/app/system/access/page.tsx:L643 | neighbors=[page.tsx]
- "access_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/system/access/page.tsx:L22 | neighbors=[page.tsx]
- "access_page_issarow": "isSARow()" | kind=code-symbol | source=src/app/system/access/page.tsx:L27 | neighbors=[page.tsx]
- "access_page_perm_fields": "PERM_FIELDS" | kind=code-symbol | source=src/app/system/access/page.tsx:L33 | neighbors=[page.tsx]
- "access_page_perm_labels": "PERM_LABELS" | kind=code-symbol | source=src/app/system/access/page.tsx:L34 | neighbors=[page.tsx]
- "access_page_permfield": "PermField" | kind=code-symbol | source=src/app/system/access/page.tsx:L32 | neighbors=[page.tsx]
- "access_page_sa_panta": "SA_PANTA" | kind=code-symbol | source=src/app/system/access/page.tsx:L25 | neighbors=[page.tsx]
- "access_page_sysfetch": "sysFetch()" | kind=code-symbol | source=src/app/system/access/page.tsx:L40 | neighbors=[page.tsx]
- "access_page_systemaccesspage": "SystemAccessPage()" | kind=code-symbol | source=src/app/system/access/page.tsx:L48 | neighbors=[page.tsx]
- "account_resume_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/account-resume/route.ts:L4 | neighbors=[route.ts]
- "accounts_payable_page_accountspayablepage": "AccountsPayablePage()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L74 | neighbors=[page.tsx]
- "accounts_payable_page_apcalendar": "APCalendar()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L1714 | neighbors=[page.tsx]
- "accounts_payable_page_apfetch": "apFetch()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L32 | neighbors=[page.tsx]
- "accounts_payable_page_apsearchmodal": "APSearchModal()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L1310 | neighbors=[page.tsx]
- "accounts_payable_page_crdbform": "CrdbForm" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L48 | neighbors=[page.tsx]
- "accounts_payable_page_crdbschema": "crdbSchema" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L40 | neighbors=[page.tsx]
- "accounts_payable_page_creditdebitmodal": "CreditDebitModal()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L1798 | neighbors=[page.tsx]
- "accounts_payable_page_days": "DAYS" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L1712 | neighbors=[page.tsx]
- "accounts_payable_page_deletedialog": "DeleteDialog()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L1540 | neighbors=[page.tsx]
- "accounts_payable_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L29 | neighbors=[page.tsx]
- "accounts_payable_page_formfield": "FormField()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L2037 | neighbors=[page.tsx]
- "accounts_payable_page_invoiceform": "InvoiceForm" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L71 | neighbors=[page.tsx]
- "accounts_payable_page_invoicemodal": "InvoiceModal()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L1580 | neighbors=[page.tsx]
- "accounts_payable_page_invoiceschema": "invoiceSchema" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L57 | neighbors=[page.tsx]
- "accounts_payable_page_months": "MONTHS" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L1710 | neighbors=[page.tsx]
- "accounts_payable_page_pendingapmodal": "PendingAPModal()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L1105 | neighbors=[page.tsx]
- "accounts_payable_page_pobform": "PobForm" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L55 | neighbors=[page.tsx]
- "accounts_payable_page_pobschema": "pobSchema" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L50 | neighbors=[page.tsx]
- "accounts_payable_page_pomodal": "POModal()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L1897 | neighbors=[page.tsx]
- "accounts_payable_page_printreport": "printReport()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L825 | neighbors=[page.tsx]
- "accounts_payable_page_reportfilterbar": "ReportFilterBar()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L919 | neighbors=[page.tsx]
- "accounts_payable_page_vendorcombobox": "VendorCombobox()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L842 | neighbors=[page.tsx]
- "accounts_payable_page_vendorsummarymodal": "VendorSummaryModal()" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L944 | neighbors=[page.tsx]
- "action_route_mutation_actions": "MUTATION_ACTIONS" | kind=code-symbol | source=src/app/api/flexy2qb/[tab]/[action]/route.ts:L18 | neighbors=[route.ts]
- "action_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/action/route.ts:L8 | neighbors=[route.ts]
- "action_route_post": "POST()" | kind=code-symbol | source=src/app/api/qc/[tab]/[action]/route.ts:L11 | neighbors=[route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-087.json

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
