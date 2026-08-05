# Node Description Batch 137 of 139

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

- "transform_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transform/route.ts:L7 | neighbors=[route.ts]
- "transform_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/transform/route.ts:L9 | neighbors=[route.ts]
- "ui_downloadbtn_downloadbtnprops": "DownloadBtnProps" | kind=code-symbol | source=src/components/ui/DownloadBtn.tsx:L7 | neighbors=[DownloadBtn.tsx]
- "ui_mobiledatecalendar_day_labels": "DAY_LABELS" | kind=code-symbol | source=src/components/ui/MobileDateCalendar.tsx:L8 | neighbors=[MobileDateCalendar.tsx]
- "ui_mobiledatecalendar_mobiledatecalendarprops": "MobileDateCalendarProps" | kind=code-symbol | source=src/components/ui/MobileDateCalendar.tsx:L14 | neighbors=[MobileDateCalendar.tsx]
- "ui_mobiledatecalendar_month_names": "MONTH_NAMES" | kind=code-symbol | source=src/components/ui/MobileDateCalendar.tsx:L9 | neighbors=[MobileDateCalendar.tsx]
- "ui_panelgrid_isrealitem": "isRealItem()" | kind=code-symbol | source=src/components/ui/PanelGrid.tsx:L46 | neighbors=[PanelGrid.tsx]
- "ui_panelgrid_menudropdown": "MenuDropdown()" | kind=code-symbol | source=src/components/ui/PanelGrid.tsx:L52 | neighbors=[PanelGrid.tsx]
- "ui_panelgrid_panelgrid": "PanelGrid()" | kind=code-symbol | source=src/components/ui/PanelGrid.tsx:L149 | neighbors=[PanelGrid.tsx]
- "ui_panelgrid_panelgridprops": "PanelGridProps" | kind=code-symbol | source=src/components/ui/PanelGrid.tsx:L25 | neighbors=[PanelGrid.tsx]
- "ui_panelgrid_panelmenuitem": "PanelMenuItem" | kind=code-symbol | source=src/components/ui/PanelGrid.tsx:L16 | neighbors=[PanelGrid.tsx]
- "ui_panelgridtable_panelgridtableprops": "PanelGridTableProps" | kind=code-symbol | source=src/components/ui/PanelGridTable.tsx:L7 | neighbors=[PanelGridTable.tsx]
- "unassign_stock_route_post": "POST()" | kind=code-symbol | source=src/app/api/pbook2invoice/unassign-stock/route.ts:L6 | neighbors=[route.ts]
- "under_construction_page": "page.tsx" | kind=code-symbol | source=src/app/under-construction/page.tsx:L1 | neighbors=[UnderConstructionPage()]
- "under_construction_page_underconstructionpage": "UnderConstructionPage()" | kind=code-symbol | source=src/app/under-construction/page.tsx:L6 | neighbors=[page.tsx]
- "unico_route_int": "int()" | kind=code-symbol | source=src/app/api/vendors/[unico]/route.ts:L10 | neighbors=[route.ts]
- "unico_route_p": "P" | kind=code-symbol | source=src/app/api/vendors/groups/[unico]/route.ts:L6 | neighbors=[route.ts]
- "unico_route_patch": "PATCH()" | kind=code-symbol | source=src/app/api/inventory-entry/awb-setup/[unico]/route.ts:L21 | neighbors=[route.ts]
- "unico_route_post": "POST()" | kind=code-symbol | source=src/app/api/standing-orders/box-composition/[unico]/route.ts:L23 | neighbors=[route.ts]
- "unico_route_proc_by_field": "PROC_BY_FIELD" | kind=code-symbol | source=src/app/api/inventory-entry/products/[unico]/route.ts:L12 | neighbors=[route.ts]
- "unico_route_putschema": "putSchema" | kind=code-symbol | source=src/app/api/bi/saved-configs/[unico]/route.ts:L12 | neighbors=[route.ts]
- "unico_route_str": "str()" | kind=code-symbol | source=src/app/api/vendors/[unico]/route.ts:L11 | neighbors=[route.ts]
- "update_awb_route_put": "PUT()" | kind=code-symbol | source=src/app/api/freights/rates/[unico]/update-awb/route.ts:L7 | neighbors=[route.ts]
- "update_route_put": "PUT()" | kind=code-symbol | source=src/app/api/sales/cart/update/route.ts:L6 | neighbors=[route.ts]
- "update_stock_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/products/update-stock/route.ts:L4 | neighbors=[route.ts]
- "upload_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/products/images/upload/route.ts:L7 | neighbors=[route.ts]
- "upload_route_post": "POST()" | kind=code-symbol | source=src/app/api/products/images/upload/route.ts:L28 | neighbors=[route.ts]
- "uq_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/payment-authorizations/outcomes/[uq]/route.ts:L40 | neighbors=[route.ts]
- "uq_route_get": "GET()" | kind=code-symbol | source=src/app/api/pos/stock/uq/route.ts:L8 | neighbors=[route.ts]
- "uq_route_put": "PUT()" | kind=code-symbol | source=src/app/api/payment-authorizations/outcomes/[uq]/route.ts:L17 | neighbors=[route.ts]
- "user_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/access/user/route.ts:L4 | neighbors=[route.ts]
- "users_page_apifetch": "apiFetch()" | kind=code-symbol | source=src/app/system/users/page.tsx:L19 | neighbors=[page.tsx]
- "users_page_usersdefinitionpage": "UsersDefinitionPage()" | kind=code-symbol | source=src/app/system/users/page.tsx:L21 | neighbors=[page.tsx]
- "users_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/users/route.ts:L10 | neighbors=[route.ts]
- "users_sp_nc_user_info": "sp_NC_User_Info.sql" | kind=code-symbol | source=sql/users/sp_NC_User_Info.sql:L1 | neighbors=[8ed3e84 fix(users): add u2fa column to …]
- "users_sp_nc_user_insert": "sp_NC_user_insert.sql" | kind=code-symbol | source=sql/users/sp_NC_user_insert.sql:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…]
- "users_sp_nc_user_update": "sp_NC_user_update.sql" | kind=code-symbol | source=sql/users/sp_NC_user_update.sql:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…]
- "users_sp_nc_users_list": "sp_NC_users_list.sql" | kind=code-symbol | source=sql/users/sp_NC_users_list.sql:L1 | neighbors=[8ed3e84 fix(users): add u2fa column to …]
- "varieties_for_recipes_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/lookups/varieties-for-recipes/route.ts:L4 | neighbors=[route.ts]
- "varieties_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/varieties/route.ts:L6 | neighbors=[route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-136.json

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
