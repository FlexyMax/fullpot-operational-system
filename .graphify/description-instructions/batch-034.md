# Node Description Batch 35 of 139

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

- "public_pdf_worker_min_annotation_setborderandbackgroundcolors": ".setBorderAndBackgroundColors()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor(), .getArray(), getRgbColor()]
- "public_pdf_worker_min_annotation_setlineendings": ".setLineEndings()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, warn(), .constructor(), .constructor()]
- "public_pdf_worker_min_annotation_setmodificationdate": ".setModificationDate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor(), .constructor(), .constructor()]
- "public_pdf_worker_min_annotationfactory_createglobals": ".createGlobals()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AnnotationFactory, .ensureCatalog(), .ensureDoc(), .annotationGlobals()]
- "public_pdf_worker_min_annotationfactory_generateimages": ".generateImages()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AnnotationFactory, warn(), .getOperatorList(), .createDocumentHandler()]
- "public_pdf_worker_min_ar": "Ar" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[Ar](), .[mr](), .[rn]()]
- "public_pdf_worker_min_arc": "Arc" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .arc()]
- "public_pdf_worker_min_arc_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Arc, getFloat(), getInteger(), getStringOption()]
- "public_pdf_worker_min_ascii85stream": "Ascii85Stream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .readBlock(), .makeFilter()]
- "public_pdf_worker_min_asciihexstream": "AsciiHexStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .readBlock(), .makeFilter()]
- "public_pdf_worker_min_assist": "Assist" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .assist()]
- "public_pdf_worker_min_astargument": "AstArgument" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .visit(), .compile()]
- "public_pdf_worker_min_astmin": "AstMin" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .visit(), buildMinOperation()]
- "public_pdf_worker_min_astvariable": "AstVariable" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .visit(), .compile()]
- "public_pdf_worker_min_astvariabledefinition": "AstVariableDefinition" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .visit(), .compile()]
- "public_pdf_worker_min_b": "B" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[jr](), .b()]
- "public_pdf_worker_min_behavioroverride": "BehaviorOverride" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .behaviorOverride()]
- "public_pdf_worker_min_binarycmapstream_readbyte": ".readByte()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.process(), BinaryCMapStream, .readHexNumber(), .readNumber()]
- "public_pdf_worker_min_binder_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, fr, tr, XmlObject]
- "public_pdf_worker_min_binder_isconsumedata": "._isConsumeData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, ._bindElement(), ._bindValue(), ._isMatchTemplate()]
- "public_pdf_worker_min_binder_setandbind": "._setAndBind()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, ._bindElement(), ._bindItems(), ._setProperties()]
- "public_pdf_worker_min_body": "Body" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .body()]
- "public_pdf_worker_min_booleanelement": "BooleanElement" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .boolean()]
- "public_pdf_worker_min_border_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Border, getRelevant(), getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_breakafter": "BreakAfter" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .breakAfter()]
- "public_pdf_worker_min_buildaddoperation": "buildAddOperation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, AstBinaryOperation, AstLiteral, .compile()]
- "public_pdf_worker_min_buildcomponentdata": "buildComponentData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getBlockBufferOffset(), quantizeAndInverse(), .parse()]
- "public_pdf_worker_min_builder_searchnamespace": "._searchNamespace()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Builder, ._addNamespacePrefix(), .build(), UnknownNamespace]
- "public_pdf_worker_min_buildminoperation": "buildMinOperation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, AstLiteral, AstMin, .compile()]
- "public_pdf_worker_min_buildmuloperation": "buildMulOperation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, AstBinaryOperation, AstLiteral, .compile()]
- "public_pdf_worker_min_buildsuboperation": "buildSubOperation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, AstBinaryOperation, AstLiteral, .compile()]
- "public_pdf_worker_min_button": "Button" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .button()]
- "public_pdf_worker_min_buttonwidgetannotation_getoperatorlist": ".getOperatorList()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ButtonWidgetAnnotation, .getArray(), lookupMatrix(), OperatorList]
- "public_pdf_worker_min_buttonwidgetannotation_processpushbutton": "._processPushButton()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ButtonWidgetAnnotation, .constructor(), .parseDestDictionary(), warn()]
- "public_pdf_worker_min_calgraycs_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CalGrayCS, FormatError, info(), warn()]
- "public_pdf_worker_min_catalog_documentoutline": ".documentOutline()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, ._readDocumentOutline(), shadow(), warn()]
- "public_pdf_worker_min_catalog_getdestination": ".getDestination()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, ._readDests(), fetchDest(), warn()]
- "public_pdf_worker_min_catalog_jsactions": ".jsActions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, ._collectJavaScript(), collectActions(), shadow()]
- "public_pdf_worker_min_catalog_markinfo": ".markInfo()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, ._readMarkInfo(), shadow(), warn()]
- "public_pdf_worker_min_catalog_o": ".#O()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .getArray(), stringToPDFString(), .fetch()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-034.json

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
