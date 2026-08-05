# Node Description Batch 100 of 139

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

- "items_tab1_empty_variety": "EMPTY_VARIETY" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L83 | neighbors=[Tab1.tsx]
- "items_tab1_sf": "sF()" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L20 | neighbors=[Tab1.tsx]
- "items_tab1_tab1": "Tab1()" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L287 | neighbors=[Tab1.tsx]
- "items_tab2_btn": "Btn()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L52 | neighbors=[Tab2.tsx]
- "items_tab2_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L21 | neighbors=[Tab2.tsx]
- "items_tab2_empty_prod2": "EMPTY_PROD2" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L704 | neighbors=[Tab2.tsx]
- "items_tab2_empty_quota": "EMPTY_QUOTA" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L183 | neighbors=[Tab2.tsx]
- "items_tab2_n2": "n2()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L24 | neighbors=[Tab2.tsx]
- "items_tab2_nextpage": "nextPage()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L47 | neighbors=[Tab2.tsx]
- "items_tab2_prebookdatemodal": "PreBookDateModal()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L649 | neighbors=[Tab2.tsx]
- "items_tab2_productsmodaltab2": "ProductsModalTab2()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L706 | neighbors=[Tab2.tsx]
- "items_tab2_sf": "sF()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L26 | neighbors=[Tab2.tsx]
- "items_tab3_btn": "Btn()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L42 | neighbors=[Tab3.tsx]
- "items_tab3_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L17 | neighbors=[Tab3.tsx]
- "items_tab3_empty_pack": "EMPTY_PACK" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L87 | neighbors=[Tab3.tsx]
- "items_tab3_empty_vd": "EMPTY_VD" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L242 | neighbors=[Tab3.tsx]
- "items_tab3_minigrid": "MiniGrid()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L54 | neighbors=[Tab3.tsx]
- "items_tab3_n2": "n2()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L20 | neighbors=[Tab3.tsx]
- "items_tab3_nextpage": "nextPage()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L24 | neighbors=[Tab3.tsx]
- "items_tab3_sf": "sF()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L21 | neighbors=[Tab3.tsx]
- "items_tab3_warehousebogomodal": "WarehouseBOGOModal()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L419 | neighbors=[Tab3.tsx]
- "label_laser_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-laser/route.tsx:L8 | neighbors=[route.tsx]
- "layout_appfooter_appfooterprops": "AppFooterProps" | kind=code-symbol | source=src/components/layout/AppFooter.tsx:L3 | neighbors=[AppFooter.tsx]
- "layout_appheader_appheaderprops": "AppHeaderProps" | kind=code-symbol | source=src/components/layout/AppHeader.tsx:L8 | neighbors=[AppHeader.tsx]
- "layout_mobileactionbar_grid_icons": "GRID_ICONS" | kind=code-symbol | source=src/components/layout/MobileActionBar.tsx:L21 | neighbors=[MobileActionBar.tsx]
- "layout_mobileactionbar_grid_labels": "GRID_LABELS" | kind=code-symbol | source=src/components/layout/MobileActionBar.tsx:L4 | neighbors=[MobileActionBar.tsx]
- "lib_audit_auditenter": "auditEnter()" | kind=code-symbol | source=src/lib/audit.ts:L31 | neighbors=[audit.ts]
- "lib_audit_auditexit": "auditExit()" | kind=code-symbol | source=src/lib/audit.ts:L42 | neighbors=[audit.ts]
- "lib_audit_auditlog": "auditLog()" | kind=code-symbol | source=src/lib/audit.ts:L58 | neighbors=[audit.ts]
- "lib_audit_panta": "PANTA" | kind=code-symbol | source=src/lib/audit.ts:L6 | neighbors=[audit.ts]
- "lib_authcodes_codeentry": "CodeEntry" | kind=code-symbol | source=src/lib/authCodes.ts:L4 | neighbors=[authCodes.ts]
- "lib_authcodes_codestore": "codeStore" | kind=code-symbol | source=src/lib/authCodes.ts:L20 | neighbors=[authCodes.ts]
- "lib_authcodes_preauthentry": "PreAuthEntry" | kind=code-symbol | source=src/lib/authCodes.ts:L12 | neighbors=[authCodes.ts]
- "lib_authcodes_preauthstore": "preAuthStore" | kind=code-symbol | source=src/lib/authCodes.ts:L21 | neighbors=[authCodes.ts]
- "lib_authguards_superadmin_only_panta": "SUPERADMIN_ONLY_PANTA" | kind=code-symbol | source=src/lib/authGuards.ts:L8 | neighbors=[authGuards.ts]
- "lib_csv_coerce": "coerce()" | kind=code-symbol | source=src/lib/csv.ts:L15 | neighbors=[csv.ts]
- "lib_dates_dateinputtoest": "dateInputToEST()" | kind=code-symbol | source=src/lib/dates.ts:L78 | neighbors=[dates.ts]
- "lib_dates_formatdatelongest": "formatDateLongEST()" | kind=code-symbol | source=src/lib/dates.ts:L52 | neighbors=[dates.ts]
- "lib_dates_nowest": "nowEST()" | kind=code-symbol | source=src/lib/dates.ts:L7 | neighbors=[dates.ts]
- "lib_dates_startofyearest": "startOfYearEST()" | kind=code-symbol | source=src/lib/dates.ts:L17 | neighbors=[dates.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-099.json

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
