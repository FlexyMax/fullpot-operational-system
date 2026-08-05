# Node Description Batch 124 of 139

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

- "public_pdf_worker_min_textstate_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextState]
- "public_pdf_worker_min_textstate_translatetextmatrix": ".translateTextMatrix()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextState]
- "public_pdf_worker_min_textwidgetannotation_extracttextcontent": ".extractTextContent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextWidgetAnnotation]
- "public_pdf_worker_min_textwidgetannotation_hastextcontent": ".hasTextContent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextWidgetAnnotation]
- "public_pdf_worker_min_tg": "tg" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_threshold_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Threshold]
- "public_pdf_worker_min_time_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Time]
- "public_pdf_worker_min_time_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Time]
- "public_pdf_worker_min_timeslotmanager_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TimeSlotManager]
- "public_pdf_worker_min_timeslotmanager_reset": ".reset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TimeSlotManager]
- "public_pdf_worker_min_to_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[To]
- "public_pdf_worker_min_tooltip_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ToolTip]
- "public_pdf_worker_min_tounicodemap_amend": ".amend()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ToUnicodeMap]
- "public_pdf_worker_min_tounicodemap_charcodeof": ".charCodeOf()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ToUnicodeMap]
- "public_pdf_worker_min_tounicodemap_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ToUnicodeMap]
- "public_pdf_worker_min_tounicodemap_foreach": ".forEach()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ToUnicodeMap]
- "public_pdf_worker_min_tounicodemap_get": ".get()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ToUnicodeMap]
- "public_pdf_worker_min_tounicodemap_has": ".has()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ToUnicodeMap]
- "public_pdf_worker_min_tounicodemap_length": ".length()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ToUnicodeMap]
- "public_pdf_worker_min_transform_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Transform]
- "public_pdf_worker_min_translatedfont_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TranslatedFont]
- "public_pdf_worker_min_translatedfont_send": ".send()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TranslatedFont]
- "public_pdf_worker_min_traverse_jr": ".[Jr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Traverse]
- "public_pdf_worker_min_traverse_name": ".name()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Traverse]
- "public_pdf_worker_min_truetypecompiled_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TrueTypeCompiled]
- "public_pdf_worker_min_ts": "ts" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_tt": "Tt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_type_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type]
- "public_pdf_worker_min_type1charstring_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1CharString]
- "public_pdf_worker_min_type1font_getcharset": ".getCharset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Font]
- "public_pdf_worker_min_type1font_hasglyphid": ".hasGlyphId()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Font]
- "public_pdf_worker_min_type1font_numglyphs": ".numGlyphs()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Font]
- "public_pdf_worker_min_type1parser_nextchar": ".nextChar()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Parser]
- "public_pdf_worker_min_type1parser_readnumber": ".readNumber()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Parser]
- "public_pdf_worker_min_typeface_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TypeFace]
- "public_pdf_worker_min_ua": "ua" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_ui_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ui]
- "public_pdf_worker_min_ui_ur": ".[ur]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ui]
- "public_pdf_worker_min_ul_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Ul]
- "public_pdf_worker_min_un": "un" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-123.json

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
