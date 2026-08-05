# Node Description Batch 72 of 139

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

- "public_pdf_worker_min_exclgroup_cr": ".[Cr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExclGroup, getAvailableSpace()]
- "public_pdf_worker_min_exclgroup_hr": ".[Hr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExclGroup, wr]
- "public_pdf_worker_min_exclgroup_lr": ".[Lr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExclGroup, yr]
- "public_pdf_worker_min_exclgroup_or": ".[or]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExclGroup, flushHTML()]
- "public_pdf_worker_min_exclgroup_vs": ".[Vs]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExclGroup, addHTML()]
- "public_pdf_worker_min_exdata_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExData, nn]
- "public_pdf_worker_min_execute_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Execute, getStringOption()]
- "public_pdf_worker_min_exobject_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExObject, XFAObjectArray]
- "public_pdf_worker_min_expressionbuildervisitor_visitargument": ".visitArgument()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.visit(), ExpressionBuilderVisitor]
- "public_pdf_worker_min_expressionbuildervisitor_visitbinaryoperation": ".visitBinaryOperation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.visit(), ExpressionBuilderVisitor]
- "public_pdf_worker_min_expressionbuildervisitor_visitliteral": ".visitLiteral()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.visit(), ExpressionBuilderVisitor]
- "public_pdf_worker_min_expressionbuildervisitor_visitmin": ".visitMin()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.visit(), ExpressionBuilderVisitor]
- "public_pdf_worker_min_expressionbuildervisitor_visitvariable": ".visitVariable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.visit(), ExpressionBuilderVisitor]
- "public_pdf_worker_min_expressionbuildervisitor_visitvariabledefinition": ".visitVariableDefinition()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.visit(), ExpressionBuilderVisitor]
- "public_pdf_worker_min_extras_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Extras, XFAObjectArray]
- "public_pdf_worker_min_fakeunicodefont_getfirstpositioninfo": ".getFirstPositionInfo()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FakeUnicodeFont, .constructor()]
- "public_pdf_worker_min_fakeunicodefont_resources": ".resources()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FakeUnicodeFont, Dict]
- "public_pdf_worker_min_featuretest_iscssroundsupported": ".isCSSRoundSupported()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FeatureTest, shadow()]
- "public_pdf_worker_min_featuretest_isevalsupported": ".isEvalSupported()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FeatureTest, shadow()]
- "public_pdf_worker_min_featuretest_islittleendian": ".isLittleEndian()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FeatureTest, shadow()]
- "public_pdf_worker_min_featuretest_isoffscreencanvassupported": ".isOffscreenCanvasSupported()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FeatureTest, shadow()]
- "public_pdf_worker_min_featuretest_platform": ".platform()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FeatureTest, shadow()]
- "public_pdf_worker_min_field_tn": ".[tn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Field, _setValue()]
- "public_pdf_worker_min_filespec_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FileSpec, warn()]
- "public_pdf_worker_min_fill_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Fill, getStringOption()]
- "public_pdf_worker_min_fill_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Fill, wr]
- "public_pdf_worker_min_find": "find()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .peekBytes()]
- "public_pdf_worker_min_findunequal": "findUnequal()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, bidi()]
- "public_pdf_worker_min_flatestream_asyncgetbytes": ".asyncGetBytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FlateStream, Stream]
- "public_pdf_worker_min_flatestream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FlateStream, FormatError]
- "public_pdf_worker_min_flatestream_generatehuffmantable": ".generateHuffmanTable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FlateStream, .readBlock()]
- "public_pdf_worker_min_flatestream_m": ".#m()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FlateStream, info()]
- "public_pdf_worker_min_float_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Float, valueToHtml()]
- "public_pdf_worker_min_font_encodestring": ".encodeString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Font, .getCharCodeLength()]
- "public_pdf_worker_min_font_renderer": ".renderer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Font, shadow()]
- "public_pdf_worker_min_fontfinder_add": ".add()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontFinder, .addPdfFont()]
- "public_pdf_worker_min_fontfinder_addpdffont": ".addPdfFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontFinder, .add()]
- "public_pdf_worker_min_fontfinder_find": ".find()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontFinder, warn()]
- "public_pdf_worker_min_fontfinder_getdefault": ".getDefault()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontFinder, .defaultFont()]
- "public_pdf_worker_min_fontrendererfactory": "FontRendererFactory" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-071.json

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
