# Node Description Batch 61 of 139

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

- "data_route_post": "POST()" | kind=code-symbol | source=src/app/api/bi/reports/[unico]/data/route.ts:L24 | neighbors=[route.ts, t()]
- "data_route_t": "t()" | kind=code-symbol | source=src/app/api/bi/reports/[unico]/data/route.ts:L7 | neighbors=[route.ts, POST()]
- "enter_route_getempresauq": "getEmpresaUq()" | kind=code-symbol | source=src/app/api/audit/enter/route.ts:L8 | neighbors=[route.ts, POST()]
- "enter_route_post": "POST()" | kind=code-symbol | source=src/app/api/audit/enter/route.ts:L17 | neighbors=[route.ts, getEmpresaUq()]
- "exit_route_getempresauq": "getEmpresaUq()" | kind=code-symbol | source=src/app/api/audit/exit/route.ts:L7 | neighbors=[route.ts, POST()]
- "exit_route_post": "POST()" | kind=code-symbol | source=src/app/api/audit/exit/route.ts:L16 | neighbors=[route.ts, getEmpresaUq()]
- "export_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/modules/export/route.ts:L5 | neighbors=[route.ts, txt()]
- "export_route_txt": "txt()" | kind=code-symbol | source=src/app/api/system/modules/[unico]/export/route.ts:L5 | neighbors=[route.ts, GET()]
- "freights_page_freightssetuppage": "FreightsSetupPage()" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L321 | neighbors=[page.tsx, t()]
- "freights_page_t": "t()" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L29 | neighbors=[page.tsx, FreightsSetupPage()]
- "handling_route_num": "num()" | kind=code-symbol | source=src/app/api/freights/handling/route.ts:L8 | neighbors=[route.ts, POST()]
- "handling_route_txt": "txt()" | kind=code-symbol | source=src/app/api/freights/handling/route.ts:L7 | neighbors=[route.ts, POST()]
- "images_cache_resetcache": "resetCache()" | kind=code-symbol | source=src/app/api/products/images/_cache.ts:L14 | neighbors=[_cache.ts, route.ts]
- "import_route_bit": "bit()" | kind=code-symbol | source=src/app/api/system/modules/import/route.ts:L6 | neighbors=[route.ts, POST()]
- "import_route_num": "num()" | kind=code-symbol | source=src/app/api/system/modules/import/route.ts:L7 | neighbors=[route.ts, POST()]
- "import_route_txt": "txt()" | kind=code-symbol | source=src/app/api/system/modules/import/route.ts:L5 | neighbors=[route.ts, POST()]
- "inventory_entry_modaladdpotoinventory_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalAddPOToInventory.tsx:L8 | neighbors=[ModalAddPOToInventory.tsx, ModalAddPOToInventory()]
- "inventory_entry_modaladdproducttopacking_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalAddProductToPacking.tsx:L6 | neighbors=[ModalAddProductToPacking.tsx, ModalAddProductToPacking()]
- "inventory_entry_modalavailabledate_today": "today()" | kind=code-symbol | source=src/components/inventory-entry/ModalAvailableDate.tsx:L7 | neighbors=[ModalAvailableDate.tsx, ModalAvailableDate()]
- "inventory_entry_modalawbsetup_fmtdate": "fmtDate()" | kind=code-symbol | source=src/components/inventory-entry/ModalAWBSetup.tsx:L9 | neighbors=[ModalAWBSetup.tsx, t()]
- "inventory_entry_modalawbsetup_modalawbsetup": "ModalAWBSetup()" | kind=code-symbol | source=src/components/inventory-entry/ModalAWBSetup.tsx:L21 | neighbors=[ModalAWBSetup.tsx, page.tsx]
- "inventory_entry_modalawbsetup_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalAWBSetup.tsx:L7 | neighbors=[ModalAWBSetup.tsx, fmtDate()]
- "inventory_entry_modalboxcomposition_modalboxcomposition": "ModalBoxComposition()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxComposition.tsx:L23 | neighbors=[ModalBoxComposition.tsx, page.tsx]
- "inventory_entry_modalboxmove_modalboxmove": "ModalBoxMove()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxMove.tsx:L18 | neighbors=[ModalBoxMove.tsx, page.tsx]
- "inventory_entry_modalboxnotes_modalboxnotes": "ModalBoxNotes()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxNotes.tsx:L15 | neighbors=[ModalBoxNotes.tsx, page.tsx]
- "inventory_entry_modalboxpo_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxPO.tsx:L8 | neighbors=[ModalBoxPO.tsx, ModalBoxPO()]
- "inventory_entry_modalboxrepacking_modalboxrepacking": "ModalBoxRepacking()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxRepacking.tsx:L22 | neighbors=[ModalBoxRepacking.tsx, page.tsx]
- "inventory_entry_modalboxtransform_modalboxtransform": "ModalBoxTransform()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxTransform.tsx:L20 | neighbors=[ModalBoxTransform.tsx, page.tsx]
- "inventory_entry_modalboxwhcontrol_modalboxwhcontrol": "ModalBoxWHControl()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxWHControl.tsx:L21 | neighbors=[ModalBoxWHControl.tsx, page.tsx]
- "inventory_entry_modaldeletepackingdetails_modaldeletepackingdetails": "ModalDeletePackingDetails()" | kind=code-symbol | source=src/components/inventory-entry/ModalDeletePackingDetails.tsx:L20 | neighbors=[ModalDeletePackingDetails.tsx, page.tsx]
- "inventory_entry_modaleditbox_fmt2": "fmt2()" | kind=code-symbol | source=src/components/inventory-entry/ModalEditBox.tsx:L7 | neighbors=[ModalEditBox.tsx, ModalEditBox()]
- "inventory_entry_modaleditbox_fmt4": "fmt4()" | kind=code-symbol | source=src/components/inventory-entry/ModalEditBox.tsx:L8 | neighbors=[ModalEditBox.tsx, ModalEditBox()]
- "inventory_entry_modaleditbox_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalEditBox.tsx:L6 | neighbors=[ModalEditBox.tsx, ModalEditBox()]
- "inventory_entry_modalfiltercustomers_modalfiltercustomers": "ModalFilterCustomers()" | kind=code-symbol | source=src/components/inventory-entry/ModalFilterCustomers.tsx:L17 | neighbors=[ModalFilterCustomers.tsx, page.tsx]
- "inventory_entry_modalfiltergrowers_modalfiltergrowers": "ModalFilterGrowers()" | kind=code-symbol | source=src/components/inventory-entry/ModalFilterGrowers.tsx:L17 | neighbors=[ModalFilterGrowers.tsx, page.tsx]
- "inventory_entry_modalheader2_modalheader2": "ModalHeader2()" | kind=code-symbol | source=src/components/inventory-entry/ModalHeader2.tsx:L26 | neighbors=[ModalHeader2.tsx, page.tsx]
- "inventory_entry_modalheadercopy_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalHeaderCopy.tsx:L6 | neighbors=[ModalHeaderCopy.tsx, ModalHeaderCopy()]
- "inventory_entry_modalheadercopy_today": "today()" | kind=code-symbol | source=src/components/inventory-entry/ModalHeaderCopy.tsx:L7 | neighbors=[ModalHeaderCopy.tsx, ModalHeaderCopy()]
- "inventory_entry_modalscanhistory_modalscanhistory": "ModalScanHistory()" | kind=code-symbol | source=src/components/inventory-entry/ModalScanHistory.tsx:L16 | neighbors=[ModalScanHistory.tsx, page.tsx]
- "inventory_entry_modalselectpwarehouse_modalselectpwarehouse": "ModalSelectPWarehouse()" | kind=code-symbol | source=src/components/inventory-entry/ModalSelectPWarehouse.tsx:L16 | neighbors=[ModalSelectPWarehouse.tsx, page.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-060.json

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
