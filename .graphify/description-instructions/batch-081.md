# Node Description Batch 82 of 139

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

- "public_pdf_worker_min_textmeasure_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextMeasure, FontSelector]
- "public_pdf_worker_min_textstate_settextlinematrix": ".setTextLineMatrix()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getTextContent(), TextState]
- "public_pdf_worker_min_textstate_settextmatrix": ".setTextMatrix()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getTextContent(), TextState]
- "public_pdf_worker_min_textwidgetannotation_getfieldobject": ".getFieldObject()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextWidgetAnnotation, .hasFieldFlag()]
- "public_pdf_worker_min_time_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Time, valueToHtml()]
- "public_pdf_worker_min_timepattern_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TimePattern, getStringOption()]
- "public_pdf_worker_min_timepatterns_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TimePatterns, XFAObjectArray]
- "public_pdf_worker_min_timestamp_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TimeStamp, getStringOption()]
- "public_pdf_worker_min_tohexutil": "toHexUtil()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .fingerprints()]
- "public_pdf_worker_min_trace_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Trace, XFAObjectArray]
- "public_pdf_worker_min_translatedfont_removetype3coloroperators": "._removeType3ColorOperators()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TranslatedFont, .normalizeRect()]
- "public_pdf_worker_min_traversal_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Traversal, XFAObjectArray]
- "public_pdf_worker_min_traverse_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Traverse, getStringOption()]
- "public_pdf_worker_min_truetypecompiled_compileglyphimpl": ".compileGlyphImpl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TrueTypeCompiled, compileGlyf()]
- "public_pdf_worker_min_tryparseasdatauri": "tryParseAsDataURI()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, instantiateSync()]
- "public_pdf_worker_min_type1charstring_executecommand": ".executeCommand()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1CharString, .convert()]
- "public_pdf_worker_min_type1font_getglyphmapping": ".getGlyphMapping()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Font, type1FontGlyphMapping()]
- "public_pdf_worker_min_type1font_getseacs": ".getSeacs()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Font, .constructor()]
- "public_pdf_worker_min_type1font_gettype2charstrings": ".getType2Charstrings()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Font, .constructor()]
- "public_pdf_worker_min_type1font_gettype2subrs": ".getType2Subrs()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Font, .constructor()]
- "public_pdf_worker_min_type1parser_readboolean": ".readBoolean()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Parser, .extractFontProgram()]
- "public_pdf_worker_min_type2compiled_compileglyphimpl": ".compileGlyphImpl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type2Compiled, compileCharString()]
- "public_pdf_worker_min_typefaces_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TypeFaces, XFAObjectArray]
- "public_pdf_worker_min_unknownnamespace_cn": ".[cn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[UnknownNamespace, XmlObject]
- "public_pdf_worker_min_updatememoryviews": "updateMemoryViews()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, receiveInstance()]
- "public_pdf_worker_min_validate_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Validate, getStringOption()]
- "public_pdf_worker_min_value_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Value, nn]
- "public_pdf_worker_min_value_sn": ".[sn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Value, sn]
- "public_pdf_worker_min_variables_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Variables, XFAObjectArray]
- "public_pdf_worker_min_versioncontrol_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[VersionControl, getStringOption()]
- "public_pdf_worker_min_widgetannotation_mustbeviewed": ".mustBeViewed()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WidgetAnnotation, ._hasFlag()]
- "public_pdf_worker_min_wn": "wn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[tr]()]
- "public_pdf_worker_min_writedata": "writeData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .toArray()]
- "public_pdf_worker_min_writeint": "writeInt()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, incrementalUpdate()]
- "public_pdf_worker_min_writeint16": "writeInt16()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .toArray()]
- "public_pdf_worker_min_writeint32": "writeInt32()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .toArray()]
- "public_pdf_worker_min_writesignedint16": "writeSignedInt16()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair()]
- "public_pdf_worker_min_xdc_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Xdc, XFAObjectArray]
- "public_pdf_worker_min_xdp_xdp_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[xdp_Xdp, XFAObjectArray]
- "public_pdf_worker_min_xdpnamespace_xdp": ".xdp()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XdpNamespace, xdp_Xdp]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-081.json

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
