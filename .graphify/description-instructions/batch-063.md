# Node Description Batch 64 of 139

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

- "photo_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/users/[unico]/photo/route.ts:L19 | neighbors=[route.ts, extractJpeg()]
- "pick_list_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/pick-list/route.tsx:L9 | neighbors=[route.tsx, GET()]
- "pick_list_route_t": "t()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/pick-list/route.tsx:L7 | neighbors=[route.tsx, GET()]
- "price_route_num": "num()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/price/route.ts:L10 | neighbors=[route.ts, PUT()]
- "price_route_put": "PUT()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/price/route.ts:L12 | neighbors=[route.ts, num()]
- "print_composition_route_n": "n()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/print-composition/route.tsx:L8 | neighbors=[route.tsx, GET()]
- "print_composition_route_t": "t()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/print-composition/route.tsx:L7 | neighbors=[route.tsx, GET()]
- "products_route_bit": "bit()" | kind=code-symbol | source=src/app/api/masters/items/products/route.ts:L26 | neighbors=[route.ts, POST()]
- "products_route_num": "num()" | kind=code-symbol | source=src/app/api/masters/items/products/route.ts:L27 | neighbors=[route.ts, POST()]
- "products_route_txt": "txt()" | kind=code-symbol | source=src/app/api/masters/items/products/route.ts:L25 | neighbors=[route.ts, POST()]
- "public_pdf_worker_min_a": "a" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_a_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[a, fixURL()]
- "public_pdf_worker_min_aa": "Aa" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .fallbackToSystemFont()]
- "public_pdf_worker_min_acrobat_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Acrobat, XFAObjectArray]
- "public_pdf_worker_min_adbe_jsconsole": "ADBE_JSConsole" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_adbe_jsdebugger": "ADBE_JSDebugger" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_addhex": "addHex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .process()]
- "public_pdf_worker_min_aesbasecipher_decrypt": "._decrypt()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AESBaseCipher, ._decryptBlock2()]
- "public_pdf_worker_min_aesbasecipher_decryptblock2": "._decryptBlock2()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AESBaseCipher, ._decrypt()]
- "public_pdf_worker_min_aesbasecipher_expandkey": "._expandKey()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AESBaseCipher, unreachable()]
- "public_pdf_worker_min_agent_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Agent, XFAObjectArray]
- "public_pdf_worker_min_annotation_isviewable": "._isViewable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, ._hasFlag()]
- "public_pdf_worker_min_annotation_loadresources": ".loadResources()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .getAsync()]
- "public_pdf_worker_min_annotation_mustbeprinted": ".mustBePrinted()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .getOperatorList()]
- "public_pdf_worker_min_annotation_mustbeviewed": ".mustBeViewed()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, ._hasFlag()]
- "public_pdf_worker_min_annotation_printable": ".printable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, ._isPrintable()]
- "public_pdf_worker_min_annotation_setappearance": ".setAppearance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor()]
- "public_pdf_worker_min_annotation_setrotation": ".setRotation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor()]
- "public_pdf_worker_min_annotationborderstyle_sethorizontalcornerradius": ".setHorizontalCornerRadius()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.setBorderStyle(), AnnotationBorderStyle]
- "public_pdf_worker_min_annotationborderstyle_setverticalcornerradius": ".setVerticalCornerRadius()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.setBorderStyle(), AnnotationBorderStyle]
- "public_pdf_worker_min_appearancefilter_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AppearanceFilter, getStringOption()]
- "public_pdf_worker_min_applystandardfontglyphmap": "applyStandardFontGlyphMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .fallbackToSystemFont()]
- "public_pdf_worker_min_arcfourcipher_decryptblock": ".decryptBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ARCFourCipher, .encryptBlock()]
- "public_pdf_worker_min_arcfourcipher_encrypt": ".encrypt()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ARCFourCipher, .encryptBlock()]
- "public_pdf_worker_min_arithmeticdecoder_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ArithmeticDecoder, .byteIn()]
- "public_pdf_worker_min_arithmeticdecoder_readbit": ".readBit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ArithmeticDecoder, .byteIn()]
- "public_pdf_worker_min_ascii85stream_readblock": ".readBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Ascii85Stream, isWhiteSpace()]
- "public_pdf_worker_min_astargument_visit": ".visit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstArgument, .visitArgument()]
- "public_pdf_worker_min_astbinaryoperation_visit": ".visit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstBinaryOperation, .visitBinaryOperation()]
- "public_pdf_worker_min_astliteral_visit": ".visit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstLiteral, .visitLiteral()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-063.json

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
