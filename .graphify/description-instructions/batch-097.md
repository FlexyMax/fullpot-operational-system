# Node Description Batch 98 of 139

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

- "inventory_entry_modalboxtransform_num": "num()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxTransform.tsx:L7 | neighbors=[ModalBoxTransform.tsx]
- "inventory_entry_modalboxtransform_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxTransform.tsx:L9 | neighbors=[ModalBoxTransform.tsx]
- "inventory_entry_modalboxtransform_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxTransform.tsx:L6 | neighbors=[ModalBoxTransform.tsx]
- "inventory_entry_modalboxwhcontrol_empty": "EMPTY" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxWHControl.tsx:L18 | neighbors=[ModalBoxWHControl.tsx]
- "inventory_entry_modalboxwhcontrol_empty_info": "EMPTY_INFO" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxWHControl.tsx:L19 | neighbors=[ModalBoxWHControl.tsx]
- "inventory_entry_modalboxwhcontrol_int": "int()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxWHControl.tsx:L7 | neighbors=[ModalBoxWHControl.tsx]
- "inventory_entry_modalboxwhcontrol_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxWHControl.tsx:L9 | neighbors=[ModalBoxWHControl.tsx]
- "inventory_entry_modalboxwhcontrol_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxWHControl.tsx:L6 | neighbors=[ModalBoxWHControl.tsx]
- "inventory_entry_modaldeletepackingdetails_fmt2": "fmt2()" | kind=code-symbol | source=src/components/inventory-entry/ModalDeletePackingDetails.tsx:L9 | neighbors=[ModalDeletePackingDetails.tsx]
- "inventory_entry_modaldeletepackingdetails_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalDeletePackingDetails.tsx:L11 | neighbors=[ModalDeletePackingDetails.tsx]
- "inventory_entry_modaldeletepackingdetails_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalDeletePackingDetails.tsx:L8 | neighbors=[ModalDeletePackingDetails.tsx]
- "inventory_entry_modaleditbox_calc": "calc()" | kind=code-symbol | source=src/components/inventory-entry/ModalEditBox.tsx:L20 | neighbors=[ModalEditBox.tsx]
- "inventory_entry_modaleditbox_empty": "EMPTY" | kind=code-symbol | source=src/components/inventory-entry/ModalEditBox.tsx:L10 | neighbors=[ModalEditBox.tsx]
- "inventory_entry_modaleditbox_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalEditBox.tsx:L29 | neighbors=[ModalEditBox.tsx]
- "inventory_entry_modalfiltercustomers_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalFilterCustomers.tsx:L7 | neighbors=[ModalFilterCustomers.tsx]
- "inventory_entry_modalfiltercustomers_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalFilterCustomers.tsx:L5 | neighbors=[ModalFilterCustomers.tsx]
- "inventory_entry_modalfiltergrowers_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalFilterGrowers.tsx:L7 | neighbors=[ModalFilterGrowers.tsx]
- "inventory_entry_modalfiltergrowers_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalFilterGrowers.tsx:L5 | neighbors=[ModalFilterGrowers.tsx]
- "inventory_entry_modalheader2_empty": "EMPTY" | kind=code-symbol | source=src/components/inventory-entry/ModalHeader2.tsx:L19 | neighbors=[ModalHeader2.tsx]
- "inventory_entry_modalheader2_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalHeader2.tsx:L9 | neighbors=[ModalHeader2.tsx]
- "inventory_entry_modalheader2_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalHeader2.tsx:L6 | neighbors=[ModalHeader2.tsx]
- "inventory_entry_modalheader2_today": "today()" | kind=code-symbol | source=src/components/inventory-entry/ModalHeader2.tsx:L7 | neighbors=[ModalHeader2.tsx]
- "inventory_entry_modalheadercopy_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalHeaderCopy.tsx:L9 | neighbors=[ModalHeaderCopy.tsx]
- "inventory_entry_modalscanhistory_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalScanHistory.tsx:L9 | neighbors=[ModalScanHistory.tsx]
- "inventory_entry_modalscanhistory_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalScanHistory.tsx:L7 | neighbors=[ModalScanHistory.tsx]
- "inventory_entry_modalselectpwarehouse_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalSelectPWarehouse.tsx:L8 | neighbors=[ModalSelectPWarehouse.tsx]
- "inventory_entry_modalselectpwarehouse_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalSelectPWarehouse.tsx:L6 | neighbors=[ModalSelectPWarehouse.tsx]
- "inventory_entry_modalsendtowhouse_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalSendToWhouse.tsx:L8 | neighbors=[ModalSendToWhouse.tsx]
- "inventory_entry_modalsendtowhouse_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalSendToWhouse.tsx:L6 | neighbors=[ModalSendToWhouse.tsx]
- "inventory_entry_modalwarehousetransfer_int": "int()" | kind=code-symbol | source=src/components/inventory-entry/ModalWarehouseTransfer.tsx:L8 | neighbors=[ModalWarehouseTransfer.tsx]
- "inventory_entry_modalwarehousetransfer_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalWarehouseTransfer.tsx:L10 | neighbors=[ModalWarehouseTransfer.tsx]
- "inventory_entry_modalwarehousetransfer_today": "today()" | kind=code-symbol | source=src/components/inventory-entry/ModalWarehouseTransfer.tsx:L7 | neighbors=[ModalWarehouseTransfer.tsx]
- "inventory_entry_modalwhousetotals_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalWhouseTotals.tsx:L11 | neighbors=[ModalWhouseTotals.tsx]
- "inventory_entry_page_audit_map": "AUDIT_MAP" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L162 | neighbors=[page.tsx]
- "inventory_entry_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L45 | neighbors=[page.tsx]
- "inventory_entry_page_empty_packing": "EMPTY_PACKING" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L112 | neighbors=[page.tsx]
- "inventory_entry_page_fmt4": "fmt4()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L55 | neighbors=[page.tsx]
- "inventory_entry_page_ie_days": "IE_DAYS" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L191 | neighbors=[page.tsx]
- "inventory_entry_page_ie_months": "IE_MONTHS" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L190 | neighbors=[page.tsx]
- "inventory_entry_page_ie_tabs": "IE_TABS" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L122 | neighbors=[page.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-097.json

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
