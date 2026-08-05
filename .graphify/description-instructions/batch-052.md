# Node Description Batch 53 of 139

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

- "public_pdf_worker_min_page_getcontentstream": ".getContentStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, .extractTextContent(), .getOperatorList()]
- "public_pdf_worker_min_page_jsactions": ".jsActions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, collectActions(), shadow()]
- "public_pdf_worker_min_page_mediabox": ".mediaBox()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, ._getBoundingBox(), shadow()]
- "public_pdf_worker_min_page_resources": ".resources()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, ._getInheritableProperty(), shadow()]
- "public_pdf_worker_min_page_rotate": ".rotate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, ._getInheritableProperty(), shadow()]
- "public_pdf_worker_min_page_save": ".save()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, PartialEvaluator, warn()]
- "public_pdf_worker_min_page_xfadata": ".xfaData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, shadow(), .getBoundingBox()]
- "public_pdf_worker_min_pagearea_mr": ".[mr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageArea, mr, wr]
- "public_pdf_worker_min_pageoffset": "PageOffset" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .pageOffset(), .constructor()]
- "public_pdf_worker_min_pagination": "Pagination" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .pagination(), .constructor()]
- "public_pdf_worker_min_paginationoverride": "PaginationOverride" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .paginationOverride(), .constructor()]
- "public_pdf_worker_min_parser_tryshift": ".tryShift()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .makeStream(), .shift()]
- "public_pdf_worker_min_parsereofexception": "ParserEOFException" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getObj(), .constructor()]
- "public_pdf_worker_min_parsexfapath": "parseXFAPath()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getValue(), updateXFA()]
- "public_pdf_worker_min_part": "Part" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .part(), .constructor()]
- "public_pdf_worker_min_partialevaluator_buildcharcodetowidth": ".buildCharCodeToWidth()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .extractWidths(), .translateFont()]
- "public_pdf_worker_min_partialevaluator_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .setOptions(), RegionalImageCache]
- "public_pdf_worker_min_partialevaluator_fallbackfontdict": ".fallbackFontDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, Dict, shadow()]
- "public_pdf_worker_min_partialevaluator_fetchbuiltincmap": ".fetchBuiltInCMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .sendWithPromise(), .fetch()]
- "public_pdf_worker_min_partialevaluator_handlesmask": ".handleSMask()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, isPDFFunction(), .buildFormXObject()]
- "public_pdf_worker_min_partialevaluator_handletext": ".handleText()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .getOperatorList(), .buildFontPaths()]
- "public_pdf_worker_min_partialevaluator_isseriffont": ".isSerifFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .getBaseFontMetrics(), .translateFont()]
- "public_pdf_worker_min_partialevaluator_pdffunctionfactory": "._pdfFunctionFactory()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, PDFFunctionFactory, shadow()]
- "public_pdf_worker_min_passwordedit": "PasswordEdit" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .passwordEdit()]
- "public_pdf_worker_min_pattern": "Pattern" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .parseShading()]
- "public_pdf_worker_min_pcl": "Pcl" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .pcl(), .constructor()]
- "public_pdf_worker_min_pdf": "Pdf" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .pdf(), .constructor()]
- "public_pdf_worker_min_pdf20_checkownerpassword": ".checkOwnerPassword()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDF20, isArrayEqual(), ._hash()]
- "public_pdf_worker_min_pdf20_checkuserpassword": ".checkUserPassword()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDF20, isArrayEqual(), ._hash()]
- "public_pdf_worker_min_pdf20_getownerkey": ".getOwnerKey()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDF20, AES256Cipher, ._hash()]
- "public_pdf_worker_min_pdf20_getuserkey": ".getUserKey()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDF20, AES256Cipher, ._hash()]
- "public_pdf_worker_min_pdfa": "Pdfa" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .pdfa(), .constructor()]
- "public_pdf_worker_min_pdfdocument_annotationglobals": ".annotationGlobals()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .createGlobals(), shadow()]
- "public_pdf_worker_min_pdfdocument_checkfirstpage": ".checkFirstPage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .delete(), XRefParseException]
- "public_pdf_worker_min_pdfdocument_checkheader": ".checkHeader()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .skip(), warn()]
- "public_pdf_worker_min_pdfdocument_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, InvalidPDFException, XRef]
- "public_pdf_worker_min_pdfdocument_fieldobjects": ".fieldObjects()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .ensureDoc(), shadow()]
- "public_pdf_worker_min_pdfdocument_getpage": ".getPage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .getPageDict(), ._getLinearizationPage()]
- "public_pdf_worker_min_pdfdocument_hasjsactions": ".hasJSActions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .ensureDoc(), shadow()]
- "public_pdf_worker_min_pdfdocument_linearization": ".linearization()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, info(), shadow()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-052.json

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
