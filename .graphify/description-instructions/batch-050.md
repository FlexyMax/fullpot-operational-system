# Node Description Batch 51 of 139

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

- "public_pdf_worker_min_inkannotation_createnewdict": ".createNewDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[InkAnnotation, Dict, getModificationDate()]
- "public_pdf_worker_min_interactive": "Interactive" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .interactive(), .constructor()]
- "public_pdf_worker_min_isdict": "isDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, isName(), .createDocumentHandler()]
- "public_pdf_worker_min_isknownfontname": "isKnownFontName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, normalizeFontName(), .translateFont()]
- "public_pdf_worker_min_ispdffunction": "isPDFFunction()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .handleSMask(), .handleTransferFunction()]
- "public_pdf_worker_min_issuers": "Issuers" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .issuers()]
- "public_pdf_worker_min_issuers_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Issuers, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_jbig2stream_decodeimage": ".decodeImage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Jbig2Stream, Jbig2Image, .parseChunks()]
- "public_pdf_worker_min_jog": "Jog" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .jog(), .constructor()]
- "public_pdf_worker_min_jpegstream_jpegoptions": ".jpegOptions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegStream, .getArray(), shadow()]
- "public_pdf_worker_min_keep": "Keep" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .keep()]
- "public_pdf_worker_min_keyusage": "KeyUsage" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .keyUsage()]
- "public_pdf_worker_min_kr": "kr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindOccurrences(), ._createOccurrences()]
- "public_pdf_worker_min_labcs_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LabCS, FormatError, info()]
- "public_pdf_worker_min_labelprinter": "LabelPrinter" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .labelPrinter(), .constructor()]
- "public_pdf_worker_min_layout": "Layout" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .layout(), .constructor()]
- "public_pdf_worker_min_layoutclass": "layoutClass()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn]()]
- "public_pdf_worker_min_level": "Level" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .level(), .constructor()]
- "public_pdf_worker_min_lexer_getstring": ".getString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Lexer, .peekChar(), warn()]
- "public_pdf_worker_min_lexer_hexstringwarn": "._hexStringWarn()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Lexer, .getHexString(), warn()]
- "public_pdf_worker_min_lineannotation": "LineAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_linearized": "Linearized" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .linearized(), .constructor()]
- "public_pdf_worker_min_linkannotation": "LinkAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_linkannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LinkAnnotation, .parseDestDictionary(), getQuadPoints()]
- "public_pdf_worker_min_locale": "Locale" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .locale(), .constructor()]
- "public_pdf_worker_min_locale_set_locale": "locale_set_Locale" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .locale()]
- "public_pdf_worker_min_locale_set_localeset": "locale_set_LocaleSet" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .localeSet()]
- "public_pdf_worker_min_localeset": "LocaleSet" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .localeSet(), .constructor()]
- "public_pdf_worker_min_localpdfmanager_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocalPdfManager, PDFDocument, Stream]
- "public_pdf_worker_min_log": "Log" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .log(), .constructor()]
- "public_pdf_worker_min_lr": "lr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createDataNode(), searchNode()]
- "public_pdf_worker_min_manifest": "Manifest" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .manifest()]
- "public_pdf_worker_min_manifest_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Manifest, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_mapelement": "MapElement" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .map(), .constructor()]
- "public_pdf_worker_min_mdp": "Mdp" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .mdp()]
- "public_pdf_worker_min_mdp_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Mdp, getInteger(), getStringOption()]
- "public_pdf_worker_min_medium": "Medium" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .medium()]
- "public_pdf_worker_min_medium_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Medium, getMeasurement(), getStringOption()]
- "public_pdf_worker_min_mediuminfo": "MediumInfo" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .mediumInfo(), .constructor()]
- "public_pdf_worker_min_meridiem": "Meridiem" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .meridiem(), .constructor()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-050.json

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
