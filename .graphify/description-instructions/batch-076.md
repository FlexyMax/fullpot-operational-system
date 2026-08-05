# Node Description Batch 77 of 139

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

- "public_pdf_worker_min_pdf17_getownerkey": ".getOwnerKey()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDF17, AES256Cipher]
- "public_pdf_worker_min_pdf17_getuserkey": ".getUserKey()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDF17, AES256Cipher]
- "public_pdf_worker_min_pdfdocument_calculationorderids": ".calculationOrderIds()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, shadow()]
- "public_pdf_worker_min_pdfdocument_cleanup": ".cleanup()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, clearGlobalCaches()]
- "public_pdf_worker_min_pdfdocument_hasonlydocumentsignatures": "._hasOnlyDocumentSignatures()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .formInfo()]
- "public_pdf_worker_min_pdfdocument_htmlforxfa": ".htmlForXfa()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .getPages()]
- "public_pdf_worker_min_pdfdocument_ispurexfa": ".isPureXfa()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .isValid()]
- "public_pdf_worker_min_pdfdocument_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, Catalog]
- "public_pdf_worker_min_pdfdocument_parsestartxref": ".parseStartXRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .setStartXRef()]
- "public_pdf_worker_min_pdfdocument_serializexfadata": ".serializeXfaData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .serializeData()]
- "public_pdf_worker_min_pdfdocument_xfastreams": "._xfaStreams()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .fetchIfRef()]
- "public_pdf_worker_min_pdffunction_getsamplearray": ".getSampleArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunction, .constructSampled()]
- "public_pdf_worker_min_pdffunctionfactory_create": ".create()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunctionFactory, .fetch()]
- "public_pdf_worker_min_pdffunctionfactory_getcached": ".getCached()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunctionFactory, .getByRef()]
- "public_pdf_worker_min_pdfworkerstream_cancelallrequests": ".cancelAllRequests()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.abort(), PDFWorkerStream]
- "public_pdf_worker_min_pdfworkerstreamrangereader_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamRangeReader, .sendWithStream()]
- "public_pdf_worker_min_postscriptlexer_getnumber": ".getNumber()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptLexer, FormatError]
- "public_pdf_worker_min_postscriptstack_copy": ".copy()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.execute(), PostScriptStack]
- "public_pdf_worker_min_postscriptstack_index": ".index()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.execute(), PostScriptStack]
- "public_pdf_worker_min_postscriptstack_roll": ".roll()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.execute(), PostScriptStack]
- "public_pdf_worker_min_postscripttoken_getoperator": ".getOperator()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getToken(), PostScriptToken]
- "public_pdf_worker_min_postscripttoken_if": ".IF()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptToken, shadow()]
- "public_pdf_worker_min_postscripttoken_ifelse": ".IFELSE()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptToken, shadow()]
- "public_pdf_worker_min_postscripttoken_lbrace": ".LBRACE()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptToken, shadow()]
- "public_pdf_worker_min_postscripttoken_opcache": ".opCache()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptToken, shadow()]
- "public_pdf_worker_min_postscripttoken_rbrace": ".RBRACE()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptToken, shadow()]
- "public_pdf_worker_min_pr": "pr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[Fn]()]
- "public_pdf_worker_min_predictorstream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PredictorStream, FormatError]
- "public_pdf_worker_min_predictorstream_readblockpng": ".readBlockPng()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PredictorStream, FormatError]
- "public_pdf_worker_min_preparecomponents": "prepareComponents()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parse()]
- "public_pdf_worker_min_present_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Present, XFAObjectArray]
- "public_pdf_worker_min_proto_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Proto, XFAObjectArray]
- "public_pdf_worker_min_ps": "ps" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_radial_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Radial, getStringOption()]
- "public_pdf_worker_min_radialaxialshading_getir": ".getIR()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RadialAxialShading, unreachable()]
- "public_pdf_worker_min_reader_readbit": ".readBit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Reader, Jbig2Error]
- "public_pdf_worker_min_readint8": "readInt8()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, processSegment()]
- "public_pdf_worker_min_receiveinstance": "receiveInstance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, updateMemoryViews()]
- "public_pdf_worker_min_refsetcache_items": ".items()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSetCache, .fromString()]
- "public_pdf_worker_min_refsetcache_putalias": ".putAlias()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.loadFont(), RefSetCache]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-076.json

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
