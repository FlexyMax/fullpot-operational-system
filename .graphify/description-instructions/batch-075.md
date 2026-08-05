# Node Description Batch 76 of 139

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

- "public_pdf_worker_min_messaging_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Messaging, XFAObjectArray]
- "public_pdf_worker_min_metadataparser_getsequence": "._getSequence()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MetadataParser, ._parseArray()]
- "public_pdf_worker_min_metadataparser_repair": "._repair()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MetadataParser, .constructor()]
- "public_pdf_worker_min_murmurhash3_64_hexdigest": ".hexdigest()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MurmurHash3_64, .preEvaluateFont()]
- "public_pdf_worker_min_murmurhash3_64_update": ".update()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MurmurHash3_64, .preEvaluateFont()]
- "public_pdf_worker_min_nameornumbertree_get": ".get()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NameOrNumberTree, .fetchIfRef()]
- "public_pdf_worker_min_networkpdfmanager_requestloadedstream": ".requestLoadedStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NetworkPdfManager, .requestAllChunks()]
- "public_pdf_worker_min_networkpdfmanager_terminate": ".terminate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NetworkPdfManager, .abort()]
- "public_pdf_worker_min_numberpattern_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NumberPattern, getStringOption()]
- "public_pdf_worker_min_numberpatterns_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NumberPatterns, XFAObjectArray]
- "public_pdf_worker_min_numbersymbol_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NumberSymbol, getStringOption()]
- "public_pdf_worker_min_numbersymbols_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NumberSymbols, XFAObjectArray]
- "public_pdf_worker_min_numericedit_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NumericEdit, getStringOption()]
- "public_pdf_worker_min_occur_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Occur, getInteger()]
- "public_pdf_worker_min_occur_s": ".[$s]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Occur, wr]
- "public_pdf_worker_min_option01": "Option01" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_option10": "Option10" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_optionobject_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[OptionObject, getKeyword()]
- "public_pdf_worker_min_overflow_ur": ".[ur]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Overflow, wr]
- "public_pdf_worker_min_page_content": ".content()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, .getArray()]
- "public_pdf_worker_min_page_getstructtree": ".getStructTree()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, .ensureCatalog()]
- "public_pdf_worker_min_page_onsubstreamerror": "._onSubStreamError()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, warn()]
- "public_pdf_worker_min_page_parsedannotations": "._parsedAnnotations()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, shadow()]
- "public_pdf_worker_min_page_parsestructtree": "._parseStructTree()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, StructTreePage]
- "public_pdf_worker_min_page_userunit": ".userUnit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, shadow()]
- "public_pdf_worker_min_pageoffset_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageOffset, getInteger()]
- "public_pdf_worker_min_pageset_ar": ".[Ar]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageSet, Ar]
- "public_pdf_worker_min_parsecmapname": "parseCMapName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, parseCMap()]
- "public_pdf_worker_min_parser_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .refill()]
- "public_pdf_worker_min_parser_refill": ".refill()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .constructor()]
- "public_pdf_worker_min_parsewmode": "parseWMode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, parseCMap()]
- "public_pdf_worker_min_partialevaluator_clone": ".clone()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .assign()]
- "public_pdf_worker_min_partialevaluator_parseshading": ".parseShading()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, warn()]
- "public_pdf_worker_min_partialevaluator_readcidtogidmap": ".readCidToGidMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .extractDataStructures()]
- "public_pdf_worker_min_partialevaluator_sendimgdata": "._sendImgData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .buildPaintImageXObject()]
- "public_pdf_worker_min_passwordedit_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PasswordEdit, getStringOption()]
- "public_pdf_worker_min_pattern_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Pattern, unreachable()]
- "public_pdf_worker_min_patterncs_isdefaultdecode": ".isDefaultDecode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PatternCS, unreachable()]
- "public_pdf_worker_min_pdf17_checkownerpassword": ".checkOwnerPassword()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDF17, isArrayEqual()]
- "public_pdf_worker_min_pdf17_checkuserpassword": ".checkUserPassword()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDF17, isArrayEqual()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-075.json

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
