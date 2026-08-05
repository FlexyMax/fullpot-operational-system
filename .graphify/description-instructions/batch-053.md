# Node Description Batch 54 of 139

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

- "public_pdf_worker_min_pdfdocument_numpages": ".numPages()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, shadow(), .getNumPages()]
- "public_pdf_worker_min_pdfdocument_parsehasjsactions": "._parseHasJSActions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .ensureCatalog(), .ensureDoc()]
- "public_pdf_worker_min_pdfdocument_xfadata": ".xfaData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, stringToUTF8String(), warn()]
- "public_pdf_worker_min_pdfdocument_xfafactory": ".xfaFactory()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, shadow(), XFAFactory]
- "public_pdf_worker_min_pdffunction_parsearray": ".parseArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunction, .fetchIfRef(), .createFromArray()]
- "public_pdf_worker_min_pdffunctionfactory_localfunctioncache": "._localFunctionCache()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunctionFactory, LocalFunctionCache, shadow()]
- "public_pdf_worker_min_pdfimage_buildimage": ".buildImage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.buildPaintImageXObject(), PDFImage, warn()]
- "public_pdf_worker_min_pdfimage_createbitmap": ".createBitmap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage, convertToRGBA(), .createImageData()]
- "public_pdf_worker_min_pdfimage_getcomponents": ".getComponents()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage, .createImageData(), .fillGrayBuffer()]
- "public_pdf_worker_min_pdfimage_undopreblend": ".undoPreblend()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage, .createImageData(), .getRgb()]
- "public_pdf_worker_min_pdfworkerstream_getfullreader": ".getFullReader()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStream, assert(), PDFWorkerStreamReader]
- "public_pdf_worker_min_pdfworkerstream_getrangereader": ".getRangeReader()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.sendRequest(), PDFWorkerStream, PDFWorkerStreamRangeReader]
- "public_pdf_worker_min_pdfworkerstreamreader_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamReader, .sendWithPromise(), .sendWithStream()]
- "public_pdf_worker_min_permissions": "Permissions" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .permissions(), .constructor()]
- "public_pdf_worker_min_pickplatformitem": "pickPlatformItem()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .content(), .filename()]
- "public_pdf_worker_min_picktraybypdfsize": "PickTrayByPDFSize" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .pickTrayByPDFSize(), .constructor()]
- "public_pdf_worker_min_picture": "Picture" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .picture()]
- "public_pdf_worker_min_plaintextmetadata": "PlaintextMetadata" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .plaintextMetadata(), .constructor()]
- "public_pdf_worker_min_polygonannotation": "PolygonAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_polylineannotation": "PolylineAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_popupannotation": "PopupAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_postscriptcompiler": "PostScriptCompiler" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructPostScript(), .compile()]
- "public_pdf_worker_min_postscriptparser_nexttoken": ".nextToken()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptParser, .accept(), .parse()]
- "public_pdf_worker_min_presence": "Presence" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .presence(), .constructor()]
- "public_pdf_worker_min_present": "Present" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .present(), .constructor()]
- "public_pdf_worker_min_print": "Print" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .print(), .constructor()]
- "public_pdf_worker_min_printername": "PrinterName" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .printerName(), .constructor()]
- "public_pdf_worker_min_printhighquality": "PrintHighQuality" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .printHighQuality(), .constructor()]
- "public_pdf_worker_min_printscaling": "PrintScaling" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .printScaling(), .constructor()]
- "public_pdf_worker_min_processsegments": "processSegments()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parseChunks(), processSegment()]
- "public_pdf_worker_min_producer": "Producer" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .producer(), .constructor()]
- "public_pdf_worker_min_proto": "Proto" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .proto()]
- "public_pdf_worker_min_quantizeandinverse": "quantizeAndInverse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, buildComponentData(), JpegError]
- "public_pdf_worker_min_readsegments": "readSegments()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parseChunks(), readSegmentHeader()]
- "public_pdf_worker_min_readuncompressedbitmap": "readUncompressedBitmap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .byteAlign(), .onSymbolDictionary()]
- "public_pdf_worker_min_reason": "Reason" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .reason()]
- "public_pdf_worker_min_reasons": "Reasons" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .reasons()]
- "public_pdf_worker_min_reasons_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Reasons, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_recoverjsurl": "recoverJsURL()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .parseDestDictionary()]
- "public_pdf_worker_min_rectangle_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Rectangle, getStringOption(), XFAObjectArray]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-053.json

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
