# Node Description Batch 135 of 139

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

- "tabs_customerpaymentstab_sub_tabs": "SUB_TABS" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/CustomerPaymentsTab.tsx:L19 | neighbors=[CustomerPaymentsTab.tsx]
- "tabs_dashboardtab_classes": "CLASSES" | kind=code-symbol | source=src/app/qc/components/tabs/DashboardTab.tsx:L16 | neighbors=[DashboardTab.tsx]
- "tabs_dashboardtab_customer_types": "CUSTOMER_TYPES" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/DashboardTab.tsx:L18 | neighbors=[DashboardTab.tsx]
- "tabs_dashboardtab_dashboardtab": "DashboardTab()" | kind=code-symbol | source=src/app/qc/components/tabs/DashboardTab.tsx:L26 | neighbors=[DashboardTab.tsx]
- "tabs_dashboardtab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/qc/components/tabs/DashboardTab.tsx:L8 | neighbors=[DashboardTab.tsx]
- "tabs_dashboardtab_fmt": "fmt()" | kind=code-symbol | source=src/app/qc/components/tabs/DashboardTab.tsx:L14 | neighbors=[DashboardTab.tsx]
- "tabs_dashboardtab_qcfetch": "qcFetch()" | kind=code-symbol | source=src/app/qc/components/tabs/DashboardTab.tsx:L10 | neighbors=[DashboardTab.tsx]
- "tabs_dashboardtab_sub_tabs": "SUB_TABS" | kind=code-symbol | source=src/app/qc/components/tabs/DashboardTab.tsx:L23 | neighbors=[DashboardTab.tsx]
- "tabs_dashboardtab_subtab": "SubTab" | kind=code-symbol | source=src/app/qc/components/tabs/DashboardTab.tsx:L24 | neighbors=[DashboardTab.tsx]
- "tabs_purchases2qbtab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Purchases2QBTab.tsx:L19 | neighbors=[Purchases2QBTab.tsx]
- "tabs_purchases2qbtab_filterrows": "filterRows()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Purchases2QBTab.tsx:L26 | neighbors=[Purchases2QBTab.tsx]
- "tabs_purchases2qbtab_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Purchases2QBTab.tsx:L29 | neighbors=[Purchases2QBTab.tsx]
- "tabs_purchases2qbtab_purchases2qbtab": "Purchases2QBTab()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Purchases2QBTab.tsx:L37 | neighbors=[Purchases2QBTab.tsx]
- "tabs_purchases2qbtab_sub_tabs": "SUB_TABS" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Purchases2QBTab.tsx:L20 | neighbors=[Purchases2QBTab.tsx]
- "tabs_purchasescreditstab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesCreditsTab.tsx:L18 | neighbors=[PurchasesCreditsTab.tsx]
- "tabs_purchasescreditstab_filterrows": "filterRows()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesCreditsTab.tsx:L25 | neighbors=[PurchasesCreditsTab.tsx]
- "tabs_purchasescreditstab_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesCreditsTab.tsx:L28 | neighbors=[PurchasesCreditsTab.tsx]
- "tabs_purchasescreditstab_purchasescreditstab": "PurchasesCreditsTab()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesCreditsTab.tsx:L36 | neighbors=[PurchasesCreditsTab.tsx]
- "tabs_purchasescreditstab_sub_tabs": "SUB_TABS" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesCreditsTab.tsx:L19 | neighbors=[PurchasesCreditsTab.tsx]
- "tabs_purchasesochargestab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesOChargesTab.tsx:L18 | neighbors=[PurchasesOChargesTab.tsx]
- "tabs_purchasesochargestab_filterrows": "filterRows()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesOChargesTab.tsx:L25 | neighbors=[PurchasesOChargesTab.tsx]
- "tabs_purchasesochargestab_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesOChargesTab.tsx:L28 | neighbors=[PurchasesOChargesTab.tsx]
- "tabs_purchasesochargestab_purchasesochargestab": "PurchasesOChargesTab()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesOChargesTab.tsx:L36 | neighbors=[PurchasesOChargesTab.tsx]
- "tabs_purchasesochargestab_sub_tabs": "SUB_TABS" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesOChargesTab.tsx:L19 | neighbors=[PurchasesOChargesTab.tsx]
- "tabs_qchistorytab_day_labels": "DAY_LABELS" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L36 | neighbors=[QCHistoryTab.tsx]
- "tabs_qchistorytab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L11 | neighbors=[QCHistoryTab.tsx]
- "tabs_qchistorytab_fmtusd": "fmtUSD()" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L19 | neighbors=[QCHistoryTab.tsx]
- "tabs_qchistorytab_month_names": "MONTH_NAMES" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L35 | neighbors=[QCHistoryTab.tsx]
- "tabs_qchistorytab_props": "Props" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L129 | neighbors=[QCHistoryTab.tsx]
- "tabs_qchistorytab_qccalendar": "QCCalendar()" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L40 | neighbors=[QCHistoryTab.tsx]
- "tabs_qchistorytab_qcpost": "qcPost()" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L28 | neighbors=[QCHistoryTab.tsx]
- "tabs_qchistorytab_toastconfirm": "toastConfirm()" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L32 | neighbors=[QCHistoryTab.tsx]
- "tabs_qualitycreditstab_colornum": "colorNum()" | kind=code-symbol | source=src/app/qc/components/tabs/QualityCreditsTab.tsx:L28 | neighbors=[QualityCreditsTab.tsx]
- "tabs_qualitycreditstab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/qc/components/tabs/QualityCreditsTab.tsx:L11 | neighbors=[QualityCreditsTab.tsx]
- "tabs_qualitycreditstab_fmtusd": "fmtUSD()" | kind=code-symbol | source=src/app/qc/components/tabs/QualityCreditsTab.tsx:L19 | neighbors=[QualityCreditsTab.tsx]
- "tabs_qualitycreditstab_props": "Props" | kind=code-symbol | source=src/app/qc/components/tabs/QualityCreditsTab.tsx:L36 | neighbors=[QualityCreditsTab.tsx]
- "tabs_qualitycreditstab_qcpost": "qcPost()" | kind=code-symbol | source=src/app/qc/components/tabs/QualityCreditsTab.tsx:L21 | neighbors=[QualityCreditsTab.tsx]
- "tabs_qualitycreditstab_qualitycreditstab": "QualityCreditsTab()" | kind=code-symbol | source=src/app/qc/components/tabs/QualityCreditsTab.tsx:L41 | neighbors=[QualityCreditsTab.tsx]
- "tabs_qualitycreditstab_toastconfirm": "toastConfirm()" | kind=code-symbol | source=src/app/qc/components/tabs/QualityCreditsTab.tsx:L25 | neighbors=[QualityCreditsTab.tsx]
- "tabs_sales2qbtab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Sales2QBTab.tsx:L18 | neighbors=[Sales2QBTab.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-134.json

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
