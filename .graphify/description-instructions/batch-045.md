# Node Description Batch 46 of 139

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

- "public_pdf_worker_min_bind": "Bind" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .bind()]
- "public_pdf_worker_min_binder_ismatchtemplate": "._isMatchTemplate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, ._bindValue(), ._isConsumeData()]
- "public_pdf_worker_min_binditems": "BindItems" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .bindItems()]
- "public_pdf_worker_min_bookend": "Bookend" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .bookend()]
- "public_pdf_worker_min_border_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Border, ur, .assign()]
- "public_pdf_worker_min_break": "Break" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .break()]
- "public_pdf_worker_min_break_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Break, getInteger(), getStringOption()]
- "public_pdf_worker_min_breakafter_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BreakAfter, getInteger(), getStringOption()]
- "public_pdf_worker_min_breakbefore_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BreakBefore, getInteger(), getStringOption()]
- "public_pdf_worker_min_builder_addnamespaceprefix": "._addNamespacePrefix()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Builder, ._searchNamespace(), .build()]
- "public_pdf_worker_min_builder_buildroot": ".buildRoot()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Builder, Root, .constructor()]
- "public_pdf_worker_min_builder_clean": ".clean()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Builder, .pop(), .[$s]()]
- "public_pdf_worker_min_builder_getnamespacetouse": "._getNamespaceToUse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Builder, .build(), warn()]
- "public_pdf_worker_min_buildhuffmantable": "buildHuffmanTable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .pop(), .parse()]
- "public_pdf_worker_min_buildtofontchar": "buildToFontChar()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getUnicodeForGlyph(), .fallbackToSystemFont()]
- "public_pdf_worker_min_buttonwidgetannotation_fallbackfontdict": ".fallbackFontDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ButtonWidgetAnnotation, Dict, shadow()]
- "public_pdf_worker_min_buttonwidgetannotation_save": ".save()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ButtonWidgetAnnotation, ._saveCheckbox(), ._saveRadioButton()]
- "public_pdf_worker_min_cache": "Cache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .cache()]
- "public_pdf_worker_min_calculate": "Calculate" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .calculate()]
- "public_pdf_worker_min_calendarsymbols": "CalendarSymbols" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .calendarSymbols()]
- "public_pdf_worker_min_calrgbcs_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CalRGBCS, FormatError, info()]
- "public_pdf_worker_min_caption_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Caption, getMeasurement(), getStringOption()]
- "public_pdf_worker_min_caretannotation": "CaretAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_catalog_acroform": ".acroForm()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, info(), shadow()]
- "public_pdf_worker_min_catalog_baseurl": ".baseUrl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, createValidAbsoluteUrl(), shadow()]
- "public_pdf_worker_min_catalog_collection": ".collection()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, info(), shadow()]
- "public_pdf_worker_min_catalog_lang": ".lang()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, shadow(), stringToPDFString()]
- "public_pdf_worker_min_catalog_pagescount": "._pagesCount()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, FormatError, shadow()]
- "public_pdf_worker_min_catalog_toplevelpagesdict": ".toplevelPagesDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, FormatError, shadow()]
- "public_pdf_worker_min_catalog_version": ".version()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, shadow(), warn()]
- "public_pdf_worker_min_ccittfaxdecoder_addpixels": "._addPixels()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxDecoder, info(), .readNextChar()]
- "public_pdf_worker_min_ccittfaxdecoder_addpixelsneg": "._addPixelsNeg()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxDecoder, info(), .readNextChar()]
- "public_pdf_worker_min_ccittfaxdecoder_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxDecoder, ._eatBits(), ._lookBits()]
- "public_pdf_worker_min_certificate": "Certificate" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .certificate()]
- "public_pdf_worker_min_certificates": "Certificates" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .certificates()]
- "public_pdf_worker_min_cffcompiler_compileencoding": ".compileEncoding()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compile(), .compileTypedArray()]
- "public_pdf_worker_min_cffcompiler_compilefdselect": ".compileFDSelect()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compile(), .compileTypedArray()]
- "public_pdf_worker_min_cffdict_createtables": ".createTables()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFDict, .tables(), .tables()]
- "public_pdf_worker_min_cffencoding": "CFFEncoding" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .parseEncoding()]
- "public_pdf_worker_min_cffoffsettracker_track": ".track()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.compileDict(), CFFOffsetTracker, FormatError]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-045.json

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
