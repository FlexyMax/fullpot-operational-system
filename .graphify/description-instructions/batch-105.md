# Node Description Batch 106 of 139

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

- "products_solid_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/lookups/products-solid/route.ts:L4 | neighbors=[route.ts]
- "public_pdf_worker_min_abortexception_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AbortException]
- "public_pdf_worker_min_acrobat7_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Acrobat7]
- "public_pdf_worker_min_adbe_jsconsole_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ADBE_JSConsole]
- "public_pdf_worker_min_adbe_jsdebugger_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ADBE_JSDebugger]
- "public_pdf_worker_min_addsilentprint_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AddSilentPrint]
- "public_pdf_worker_min_addstate": "addState()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_addviewerpreferences_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AddViewerPreferences]
- "public_pdf_worker_min_adjustdata_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AdjustData]
- "public_pdf_worker_min_adobeextensionlevel_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AdobeExtensionLevel]
- "public_pdf_worker_min_aes128cipher_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AES128Cipher]
- "public_pdf_worker_min_aes128cipher_expandkey": "._expandKey()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AES128Cipher]
- "public_pdf_worker_min_aes256cipher_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AES256Cipher]
- "public_pdf_worker_min_aes256cipher_expandkey": "._expandKey()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AES256Cipher]
- "public_pdf_worker_min_aesbasecipher_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AESBaseCipher]
- "public_pdf_worker_min_aesbasecipher_decryptblock": ".decryptBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AESBaseCipher]
- "public_pdf_worker_min_aesbasecipher_encrypt": "._encrypt()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AESBaseCipher]
- "public_pdf_worker_min_ag": "Ag" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_ai": "Ai" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_alternatecs_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AlternateCS]
- "public_pdf_worker_min_alternatecs_getoutputlength": ".getOutputLength()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AlternateCS]
- "public_pdf_worker_min_alternatecs_getrgbbuffer": ".getRgbBuffer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AlternateCS]
- "public_pdf_worker_min_alternatecs_getrgbitem": ".getRgbItem()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AlternateCS]
- "public_pdf_worker_min_alwaysembed_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AlwaysEmbed]
- "public_pdf_worker_min_amd_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Amd]
- "public_pdf_worker_min_annotation_getfieldobject": ".getFieldObject()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation]
- "public_pdf_worker_min_annotation_hastextcontent": ".hasTextContent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation]
- "public_pdf_worker_min_annotation_mustbeviewedwhenediting": ".mustBeViewedWhenEditing()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation]
- "public_pdf_worker_min_annotation_reset": ".reset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation]
- "public_pdf_worker_min_annotation_save": ".save()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation]
- "public_pdf_worker_min_annotation_viewable": ".viewable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation]
- "public_pdf_worker_min_annotationborderstyle_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AnnotationBorderStyle]
- "public_pdf_worker_min_appearancestreamevaluator_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AppearanceStreamEvaluator]
- "public_pdf_worker_min_arcfourcipher_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ARCFourCipher]
- "public_pdf_worker_min_area_cr": ".[Cr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Area]
- "public_pdf_worker_min_area_gr": ".[Gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Area]
- "public_pdf_worker_min_area_jr": ".[Jr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Area]
- "public_pdf_worker_min_area_pr": ".[pr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Area]
- "public_pdf_worker_min_area_vs": ".[Vs]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Area]
- "public_pdf_worker_min_arraybufferstobytes": "arrayBuffersToBytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-105.json

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
