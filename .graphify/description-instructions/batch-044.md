# Node Description Batch 45 of 139

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

- "products_route_get": "GET()" | kind=code-symbol | source=src/app/api/standing-orders/products/route.ts:L7 | neighbors=[route.ts, fmtDate(), t()]
- "products_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/products/route.tsx:L7 | neighbors=[route.ts, fmtDate(), GET()]
- "public_pdf_worker_min_acrobat": "Acrobat" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .acrobat()]
- "public_pdf_worker_min_acrobat7": "Acrobat7" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .acrobat7()]
- "public_pdf_worker_min_addchildren": "addChildren()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getRawValues(), ._walk()]
- "public_pdf_worker_min_addsilentprint": "AddSilentPrint" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .addSilentPrint()]
- "public_pdf_worker_min_addviewerpreferences": "AddViewerPreferences" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .addViewerPreferences()]
- "public_pdf_worker_min_adjustdata": "AdjustData" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .adjustData()]
- "public_pdf_worker_min_adjustwidths": "adjustWidths()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair(), .constructor()]
- "public_pdf_worker_min_adobeextensionlevel": "AdobeExtensionLevel" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .adobeExtensionLevel()]
- "public_pdf_worker_min_agent": "Agent" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .agent()]
- "public_pdf_worker_min_alwaysembed": "AlwaysEmbed" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .alwaysEmbed()]
- "public_pdf_worker_min_amd": "Amd" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .amd()]
- "public_pdf_worker_min_amendfallbacktounicode": "amendFallbackToUnicode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .fallbackToSystemFont()]
- "public_pdf_worker_min_an": "An" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .onBeginElement(), .onEndElement()]
- "public_pdf_worker_min_annotation_isprintable": "._isPrintable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, ._hasFlag(), .printable()]
- "public_pdf_worker_min_annotation_setflags": ".setFlags()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor(), .constructor()]
- "public_pdf_worker_min_annotation_setoptionalcontent": ".setOptionalContent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor(), warn()]
- "public_pdf_worker_min_annotation_setrectangle": ".setRectangle()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor(), lookupNormalRect()]
- "public_pdf_worker_min_annotationborderstyle_setdasharray": ".setDashArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.setBorderStyle(), AnnotationBorderStyle, .setStyle()]
- "public_pdf_worker_min_annotationborderstyle_setstyle": ".setStyle()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.setBorderStyle(), AnnotationBorderStyle, .setDashArray()]
- "public_pdf_worker_min_annotationborderstyle_setwidth": ".setWidth()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.setBorderStyle(), AnnotationBorderStyle, warn()]
- "public_pdf_worker_min_annotationfactory_printnewannotations": ".printNewAnnotations()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AnnotationFactory, JpegStream, .createNewPrintAnnotation()]
- "public_pdf_worker_min_appearancefilter": "AppearanceFilter" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .appearanceFilter()]
- "public_pdf_worker_min_appearancestreamevaluator_localcolorspacecache": "._localColorSpaceCache()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AppearanceStreamEvaluator, LocalColorSpaceCache, shadow()]
- "public_pdf_worker_min_appearancestreamevaluator_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AppearanceStreamEvaluator, .pop(), warn()]
- "public_pdf_worker_min_appearancestreamevaluator_pdffunctionfactory": "._pdfFunctionFactory()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AppearanceStreamEvaluator, PDFFunctionFactory, shadow()]
- "public_pdf_worker_min_arithmeticdecoder_bytein": ".byteIn()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ArithmeticDecoder, .constructor(), .readBit()]
- "public_pdf_worker_min_astnode": "AstNode" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .visit()]
- "public_pdf_worker_min_attributes": "Attributes" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .attributes()]
- "public_pdf_worker_min_autosave": "AutoSave" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .autoSave()]
- "public_pdf_worker_min_barcode": "Barcode" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .barcode()]
- "public_pdf_worker_min_base": "Base" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .base()]
- "public_pdf_worker_min_baselocalcache_getbyname": ".getByName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseLocalCache, .getByRef(), unreachable()]
- "public_pdf_worker_min_basepdfmanager_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager, createValidAbsoluteUrl(), warn()]
- "public_pdf_worker_min_basestream_getint32": ".getInt32()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, .checkAndRepair(), .parseImageProperties()]
- "public_pdf_worker_min_batchoutput": "BatchOutput" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .batchOutput()]
- "public_pdf_worker_min_binarycmapreader": "BinaryCMapReader" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .process(), createBuiltInCMap()]
- "public_pdf_worker_min_binarycmapstream_readhexsigned": ".readHexSigned()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.process(), BinaryCMapStream, .readHexNumber()]
- "public_pdf_worker_min_binarycmapstream_readnumber": ".readNumber()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BinaryCMapStream, .readByte(), FormatError]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-044.json

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
