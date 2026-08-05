# Node Description Batch 97 of 139

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

- "id_route_get": "GET()" | kind=code-symbol | source=src/app/api/audit/record/[id]/route.ts:L6 | neighbors=[route.ts]
- "images_route_post": "POST()" | kind=code-symbol | source=src/app/api/products/images/route.ts:L10 | neighbors=[route.ts]
- "in_corp_uq_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/corporate-payments/[in_corp_uq]/route.ts:L5 | neighbors=[route.ts]
- "in_corp_uq_route_p": "P" | kind=code-symbol | source=src/app/api/customer-payments/corporate-payments/[in_corp_uq]/route.ts:L3 | neighbors=[route.ts]
- "in_transit_route_get": "GET()" | kind=code-symbol | source=src/app/api/physical-scan/in-transit/route.ts:L7 | neighbors=[route.ts]
- "income_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/income/route.ts:L4 | neighbors=[route.ts]
- "income_types_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/lookups/income-types/route.ts:L4 | neighbors=[route.ts]
- "income_uq_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/payment-invoices/[income_uq]/route.ts:L5 | neighbors=[route.ts]
- "income_uq_route_p": "P" | kind=code-symbol | source=src/app/api/customer-payments/payment-invoices/[income_uq]/route.ts:L3 | neighbors=[route.ts]
- "initialize_route_post": "POST()" | kind=code-symbol | source=src/app/api/system/access/initialize/route.ts:L6 | neighbors=[route.ts]
- "insert_route_post": "POST()" | kind=code-symbol | source=src/app/api/payment-authorizations/outcomes/insert/route.ts:L7 | neighbors=[route.ts]
- "inventory_entry_modaladdpotoinventory_norm": "norm()" | kind=code-symbol | source=src/components/inventory-entry/ModalAddPOToInventory.tsx:L9 | neighbors=[ModalAddPOToInventory.tsx]
- "inventory_entry_modaladdpotoinventory_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalAddPOToInventory.tsx:L11 | neighbors=[ModalAddPOToInventory.tsx]
- "inventory_entry_modaladdproducttopacking_int": "int()" | kind=code-symbol | source=src/components/inventory-entry/ModalAddProductToPacking.tsx:L7 | neighbors=[ModalAddProductToPacking.tsx]
- "inventory_entry_modaladdproducttopacking_num": "num()" | kind=code-symbol | source=src/components/inventory-entry/ModalAddProductToPacking.tsx:L8 | neighbors=[ModalAddProductToPacking.tsx]
- "inventory_entry_modaladdproducttopacking_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalAddProductToPacking.tsx:L10 | neighbors=[ModalAddProductToPacking.tsx]
- "inventory_entry_modalavailabledate_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalAvailableDate.tsx:L9 | neighbors=[ModalAvailableDate.tsx]
- "inventory_entry_modalavailabledate_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalAvailableDate.tsx:L6 | neighbors=[ModalAvailableDate.tsx]
- "inventory_entry_modalawbsetup_empty_form": "EMPTY_FORM" | kind=code-symbol | source=src/components/inventory-entry/ModalAWBSetup.tsx:L19 | neighbors=[ModalAWBSetup.tsx]
- "inventory_entry_modalawbsetup_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalAWBSetup.tsx:L11 | neighbors=[ModalAWBSetup.tsx]
- "inventory_entry_modalawbsetup_today": "today()" | kind=code-symbol | source=src/components/inventory-entry/ModalAWBSetup.tsx:L8 | neighbors=[ModalAWBSetup.tsx]
- "inventory_entry_modalboxcomposition_empty_row": "EMPTY_ROW" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxComposition.tsx:L13 | neighbors=[ModalBoxComposition.tsx]
- "inventory_entry_modalboxcomposition_fmt2": "fmt2()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxComposition.tsx:L10 | neighbors=[ModalBoxComposition.tsx]
- "inventory_entry_modalboxcomposition_int": "int()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxComposition.tsx:L8 | neighbors=[ModalBoxComposition.tsx]
- "inventory_entry_modalboxcomposition_norm": "norm()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxComposition.tsx:L11 | neighbors=[ModalBoxComposition.tsx]
- "inventory_entry_modalboxcomposition_num": "num()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxComposition.tsx:L9 | neighbors=[ModalBoxComposition.tsx]
- "inventory_entry_modalboxcomposition_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxComposition.tsx:L15 | neighbors=[ModalBoxComposition.tsx]
- "inventory_entry_modalboxcomposition_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxComposition.tsx:L7 | neighbors=[ModalBoxComposition.tsx]
- "inventory_entry_modalboxmove_norm": "norm()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxMove.tsx:L7 | neighbors=[ModalBoxMove.tsx]
- "inventory_entry_modalboxmove_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxMove.tsx:L9 | neighbors=[ModalBoxMove.tsx]
- "inventory_entry_modalboxmove_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxMove.tsx:L6 | neighbors=[ModalBoxMove.tsx]
- "inventory_entry_modalboxnotes_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxNotes.tsx:L8 | neighbors=[ModalBoxNotes.tsx]
- "inventory_entry_modalboxnotes_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxNotes.tsx:L6 | neighbors=[ModalBoxNotes.tsx]
- "inventory_entry_modalboxpo_fmt2": "fmt2()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxPO.tsx:L10 | neighbors=[ModalBoxPO.tsx]
- "inventory_entry_modalboxpo_norm": "norm()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxPO.tsx:L9 | neighbors=[ModalBoxPO.tsx]
- "inventory_entry_modalboxpo_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxPO.tsx:L12 | neighbors=[ModalBoxPO.tsx]
- "inventory_entry_modalboxrepacking_int": "int()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxRepacking.tsx:L7 | neighbors=[ModalBoxRepacking.tsx]
- "inventory_entry_modalboxrepacking_num": "num()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxRepacking.tsx:L8 | neighbors=[ModalBoxRepacking.tsx]
- "inventory_entry_modalboxrepacking_props": "Props" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxRepacking.tsx:L10 | neighbors=[ModalBoxRepacking.tsx]
- "inventory_entry_modalboxrepacking_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxRepacking.tsx:L6 | neighbors=[ModalBoxRepacking.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-096.json

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
