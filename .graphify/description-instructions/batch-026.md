# Node Description Batch 27 of 139

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

- "physical_route": "route.ts" | kind=code-symbol | source=src/app/api/sales/warehouses/physical/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "po_route": "route.ts" | kind=code-symbol | source=src/app/api/pos/history/po/route.ts:L1 | neighbors=[db.ts, executeQuery(), route.ts, authOptions, GET()]
- "product_classes_route": "route.ts" | kind=code-symbol | source=src/app/api/sales-reps/product-classes/route.ts:L1 | neighbors=[db.ts, executeProcedure(), DELETE(), GET(), POST()]
- "public_pdf_worker_min_addhtml": "addHTML()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createLine(), measureToString(), .[Vs](), .[Vs]()]
- "public_pdf_worker_min_aes128cipher": "AES128Cipher" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), ._expandKey(), .#J(), ._hash()]
- "public_pdf_worker_min_annotation_parsestringhelper": "._parseStringHelper()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, bidi(), stringToPDFString(), .setContents(), .setTitle()]
- "public_pdf_worker_min_annotation_setcolor": ".setColor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor(), getRgbColor(), .constructor(), .constructor()]
- "public_pdf_worker_min_annotation_setcontents": ".setContents()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor(), ._parseStringHelper(), .constructor(), .constructor()]
- "public_pdf_worker_min_annotation_setdefaultappearance": ".setDefaultAppearance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, getInheritableProperty(), parseDefaultAppearance(), .constructor(), .constructor()]
- "public_pdf_worker_min_annotation_settitle": ".setTitle()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor(), ._parseStringHelper(), .constructor(), .constructor()]
- "public_pdf_worker_min_annotation_transformpoint": "._transformPoint()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .extractTextContent(), getTransformMatrix(), .applyTransform(), .constructor()]
- "public_pdf_worker_min_annotationfactory_savenewannotations": ".saveNewAnnotations()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AnnotationFactory, Dict, .createNewAnnotation(), writeObject(), .getNewTemporaryRef()]
- "public_pdf_worker_min_arcfourcipher_encryptblock": ".encryptBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ARCFourCipher, .decryptBlock(), .encrypt(), .#L(), .#M()]
- "public_pdf_worker_min_area_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Area, getInteger(), getMeasurement(), getRelevant(), XFAObjectArray]
- "public_pdf_worker_min_arithmeticdecoder": "ArithmeticDecoder" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .byteIn(), .constructor(), .readBit(), .decoder()]
- "public_pdf_worker_min_baselocalcache": "BaseLocalCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getByName(), .getByRef(), .set()]
- "public_pdf_worker_min_binarycmapstream_readhexnumber": ".readHexNumber()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.process(), BinaryCMapStream, .readByte(), FormatError, .readHexSigned()]
- "public_pdf_worker_min_binder_createoccurrences": "._createOccurrences()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, ._bindElement(), kr, tr, wr]
- "public_pdf_worker_min_binder_finddatabynametoconsume": "._findDataByNameToConsume()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, ._bindElement(), dr, wr, xr]
- "public_pdf_worker_min_border": "Border" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .[ur](), .border()]
- "public_pdf_worker_min_br": "br" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[jr](), .[nn](), .[sn]()]
- "public_pdf_worker_min_breakbefore": "BreakBefore" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .[nn](), .breakBefore()]
- "public_pdf_worker_min_button_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Button, fixURL(), .success(), recoverJsURL(), wr]
- "public_pdf_worker_min_buttonwidgetannotation_processcheckbox": "._processCheckBox()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ButtonWidgetAnnotation, .constructor(), ._getDefaultCheckedAppearance(), .getKeys(), ._decodeFormValue()]
- "public_pdf_worker_min_buttonwidgetannotation_processradiobutton": "._processRadioButton()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ButtonWidgetAnnotation, .constructor(), ._getDefaultCheckedAppearance(), .getKeys(), ._decodeFormValue()]
- "public_pdf_worker_min_catalog_collectjavascript": "._collectJavaScript()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .getAll(), NameTree, stringToPDFString(), .jsActions()]
- "public_pdf_worker_min_catalog_openaction": ".openAction()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .parseDestDictionary(), Dict, objectSize(), shadow()]
- "public_pdf_worker_min_catalog_readstructtreeroot": "._readStructTreeRoot()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, StructTreeRoot, .init(), .fetchIfRef(), .structTreeRoot()]
- "public_pdf_worker_min_cffcompiler_compilecharset": ".compileCharset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compile(), .compileTypedArray(), .getSID(), warn()]
- "public_pdf_worker_min_cffcompiler_compilenameindex": ".compileNameIndex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compile(), .compileIndex(), CFFIndex, stringToBytes()]
- "public_pdf_worker_min_cffcompiler_compilestringindex": ".compileStringIndex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compile(), .compileIndex(), CFFIndex, stringToBytes()]
- "public_pdf_worker_min_cffdict_hasname": ".hasName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.compile(), .compilePrivateDicts(), CFFDict, .parse(), .parsePrivateDict()]
- "public_pdf_worker_min_cffdict_setbyname": ".setByName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.compile(), CFFDict, FormatError, .parsePrivateDict(), .wrap()]
- "public_pdf_worker_min_cffparser_createdict": ".createDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .setByKey(), .emptyPrivateDictionary(), .parse(), .parsePrivateDict()]
- "public_pdf_worker_min_cffparser_parsecharstrings": ".parseCharStrings()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .parse(), .getFDIndex(), .parseCharString(), warn()]
- "public_pdf_worker_min_cffparser_parsefdselect": ".parseFDSelect()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .parse(), CFFFDSelect, FormatError, warn()]
- "public_pdf_worker_min_cffparser_parseheader": ".parseHeader()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .parse(), CFFHeader, FormatError, info()]
- "public_pdf_worker_min_checkbutton": "CheckButton" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .[nn](), .checkButton()]
- "public_pdf_worker_min_choicelist": "ChoiceList" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .[nn](), .choiceList()]
- "public_pdf_worker_min_chunkedstream_ensurerange": ".ensureRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream, MissingDataException, .getByteRange(), .getBytes(), .makeSubStream()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-026.json

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
