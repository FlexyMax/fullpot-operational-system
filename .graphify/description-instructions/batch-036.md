# Node Description Batch 37 of 139

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

- "public_pdf_worker_min_corner_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Corner, getInteger(), getMeasurement(), getStringOption()]
- "public_pdf_worker_min_createposttable": "createPostTable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, string32(), .checkAndRepair(), .convert()]
- "public_pdf_worker_min_createtext": "createText()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindItems(), ._bindValue(), Text]
- "public_pdf_worker_min_datahandler": "DataHandler" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .serialize(), .constructor()]
- "public_pdf_worker_min_datasetreader": "DatasetReader" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getValue(), .xfaDatasets()]
- "public_pdf_worker_min_datasetreader_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DatasetReader, DatasetXMLParser, SimpleXMLParser, .parseFromString()]
- "public_pdf_worker_min_datasetreader_getvalue": ".getValue()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DatasetReader, decodeString(), parseXFAPath(), .constructor()]
- "public_pdf_worker_min_datasets": "Datasets" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[Or](), .datasets()]
- "public_pdf_worker_min_datasets_data": "datasets_Data" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[Mr](), .data()]
- "public_pdf_worker_min_datasetsnamespace": "DatasetsNamespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[cn](), .data(), .datasets()]
- "public_pdf_worker_min_datasetxmlparser": "DatasetXMLParser" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .onEndElement()]
- "public_pdf_worker_min_datetimeedit": "DateTimeEdit" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .dateTimeEdit()]
- "public_pdf_worker_min_decodeiaid": "decodeIAID()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getContexts(), decodeTextRegion(), .onSymbolDictionary()]
- "public_pdf_worker_min_decodeinteger": "decodeInteger()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getContexts(), decodeTextRegion(), .onSymbolDictionary()]
- "public_pdf_worker_min_decodestring": "decodeString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getValue(), stringToUTF8String(), warn()]
- "public_pdf_worker_min_decrypt": "decrypt()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .readBlock(), .constructor(), .readCharStrings()]
- "public_pdf_worker_min_decryptstream": "DecryptStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .createStream(), .constructor(), .readBlock()]
- "public_pdf_worker_min_defaultappearanceevaluator": "DefaultAppearanceEvaluator" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .parse(), parseDefaultAppearance()]
- "public_pdf_worker_min_dict_getrawvalues": ".getRawValues()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[addChildren(), Dict, .hasBlendModes(), .preEvaluateFont()]
- "public_pdf_worker_min_dr": "dr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindElement(), ._findDataByNameToConsume(), .[dr]()]
- "public_pdf_worker_min_edge_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Edge, measureToString(), toStyle(), .assign()]
- "public_pdf_worker_min_empty": "Empty" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .build(), .constructor(), .[Or]()]
- "public_pdf_worker_min_equaterange": "EquateRange" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .equateRange(), .constructor(), .unicodeRange()]
- "public_pdf_worker_min_escapepdfname": "escapePDFName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._computeFontSize(), writeDict(), writeValue()]
- "public_pdf_worker_min_exclude": "Exclude" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .exclude(), .constructor(), .[gr]()]
- "public_pdf_worker_min_expectint": "expectInt()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, FormatError, parseCidChar(), parseCidRange()]
- "public_pdf_worker_min_fetchdest": "fetchDest()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .destinations(), .getDestination(), isValidExplicitDest()]
- "public_pdf_worker_min_fetchremotedest": "fetchRemoteDest()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parseDestDictionary(), isValidExplicitDest(), stringToPDFString()]
- "public_pdf_worker_min_filespec_content": ".content()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FileSpec, pickPlatformItem(), warn(), .fetchIfRef()]
- "public_pdf_worker_min_filespec_filename": ".filename()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FileSpec, pickPlatformItem(), shadow(), stringToPDFString()]
- "public_pdf_worker_min_fill": "Fill" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .fill()]
- "public_pdf_worker_min_fixtextindent": "fixTextIndent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getMeasurement(), mapStyle(), .[on]()]
- "public_pdf_worker_min_fixurl": "fixURL()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), createValidAbsoluteUrl()]
- "public_pdf_worker_min_flushhtml": "flushHTML()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[or](), createLine(), .[or]()]
- "public_pdf_worker_min_fn": "fn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[Fn](), .[sn](), .[Un]()]
- "public_pdf_worker_min_font_spacewidth": "._spaceWidth()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Font, convertCidString(), shadow(), xi]
- "public_pdf_worker_min_fonts_glyph": "fonts_Glyph" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._charToGlyph(), .category(), .constructor()]
- "public_pdf_worker_min_getcustomhuffmantable": "getCustomHuffmanTable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, Jbig2Error, .onImmediateTextRegion(), .onSymbolDictionary()]
- "public_pdf_worker_min_getuint32": "getUint32()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor(), parseCMap()]
- "public_pdf_worker_min_hasmargin": "hasMargin()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn]()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-036.json

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
