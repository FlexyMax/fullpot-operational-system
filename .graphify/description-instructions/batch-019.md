# Node Description Batch 20 of 139

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

- "public_pdf_worker_min_barcode_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Barcode, getInteger(), getKeyword(), getMeasurement(), getRatio(), getStringOption()]
- "public_pdf_worker_min_buttonwidgetannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ButtonWidgetAnnotation, ._processCheckBox(), ._processPushButton(), ._processRadioButton(), warn(), .hasFieldFlag()]
- "public_pdf_worker_min_caption": "Caption" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .[tn](), .[ur](), .caption()]
- "public_pdf_worker_min_catalog_attachments": ".attachments()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, FileSpec, .getAll(), NameTree, shadow(), stringToPDFString()]
- "public_pdf_worker_min_catalog_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, FormatError, GlobalImageCache, RefSet, RefSetCache, .getCatalogObj()]
- "public_pdf_worker_min_catalog_destinations": ".destinations()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, ._readDests(), fetchDest(), .getAll(), shadow(), stringToPDFString()]
- "public_pdf_worker_min_catalog_xfaimages": ".xfaImages()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, Dict, .getAll(), NameTree, shadow(), stringToPDFString()]
- "public_pdf_worker_min_ccittfaxdecoder_findtablecode": "._findTableCode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxDecoder, ._eatBits(), ._lookBits(), ._getBlackCode(), ._getTwoDimCode(), ._getWhiteCode()]
- "public_pdf_worker_min_ccittfaxdecoder_getblackcode": "._getBlackCode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxDecoder, ._eatBits(), ._findTableCode(), ._lookBits(), info(), .readNextChar()]
- "public_pdf_worker_min_ccittfaxdecoder_gettwodimcode": "._getTwoDimCode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxDecoder, ._eatBits(), ._findTableCode(), ._lookBits(), info(), .readNextChar()]
- "public_pdf_worker_min_ccittfaxdecoder_getwhitecode": "._getWhiteCode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxDecoder, ._eatBits(), ._findTableCode(), ._lookBits(), info(), .readNextChar()]
- "public_pdf_worker_min_cff": "CFF" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .duplicateFirstGlyph(), .hasGlyphId(), .parse(), .wrap()]
- "public_pdf_worker_min_cfffont_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFFont, .duplicateFirstGlyph(), CFFCompiler, ._createBuiltInEncoding(), CFFParser, warn()]
- "public_pdf_worker_min_checkdimensions": "checkDimensions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, yr, .[nn](), .[nn](), .[nn](), .[nn]()]
- "public_pdf_worker_min_choicewidgetannotation": "ChoiceWidgetAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .amendSavedDict(), .constructor(), ._getAppearance(), .getFieldObject()]
- "public_pdf_worker_min_choicewidgetannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChoiceWidgetAnnotation, .getArray(), getInheritableProperty(), ._decodeFormValue(), .hasFieldFlag(), .fetchIfRef()]
- "public_pdf_worker_min_choicewidgetannotation_getappearance": "._getAppearance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChoiceWidgetAnnotation, parseDefaultAppearance(), ._computeFontSize(), ._getFontData(), ._getTextWidth(), ._renderText()]
- "public_pdf_worker_min_chunkedstreammanager_onreceivedata": ".onReceiveData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, .hasChunk(), .nextEmptyChunk(), .onReceiveProgressiveData(), ._requestChunks(), .delete()]
- "public_pdf_worker_min_ciphertransform": "CipherTransform" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .createStream(), .decryptString(), .encryptString(), .createCipherTransform()]
- "public_pdf_worker_min_ciphertransform_encryptstring": ".encryptString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransform, bytesToString(), stringToBytes(), updateXFA(), writeStream(), writeValue()]
- "public_pdf_worker_min_ciphertransformfactory_createciphertransform": ".createCipherTransform()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransformFactory, ARCFourCipher, CipherTransform, updateXFA(), writeObject(), .fetchUncompressed()]
- "public_pdf_worker_min_ciphertransformfactory_j": ".#J()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransformFactory, AES128Cipher, AES256Cipher, ARCFourCipher, FormatError, NullCipher]
- "public_pdf_worker_min_collectjs": "_collectJS()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, collectActions(), isName(), .remove(), stringToPDFString(), .fetch()]
- "public_pdf_worker_min_compiledfont": "CompiledFont" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .compileGlyph(), .compileGlyphImpl(), .constructor(), .getPathJs(), .hasBuiltPath()]
- "public_pdf_worker_min_compositeglyph": "CompositeGlyph" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getSize(), .parse(), .scale(), .write()]
- "public_pdf_worker_min_confignamespace_log": ".log()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Log, info(), .readBlock(), .execute(), warn()]
- "public_pdf_worker_min_convertcidstring": "convertCidString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, FormatError, warn(), ._charToGlyph(), .checkAndRepair(), ._spaceWidth()]
- "public_pdf_worker_min_createcmaptable": "createCmapTable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getSearchParams(), string16(), string32(), .checkAndRepair(), .convert()]
- "public_pdf_worker_min_createvalidabsoluteurl": "createValidAbsoluteUrl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .baseUrl(), .parseDestDictionary(), stringToUTF8String(), fixURL()]
- "public_pdf_worker_min_createwrapper": "createWrapper()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, isPrintOnly(), .[nn](), .[nn](), .[nn](), .[nn]()]
- "public_pdf_worker_min_datetimeedit_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DateTimeEdit, ariaLabel(), .success(), isRequired(), toStyle(), wr]
- "public_pdf_worker_min_decodemmrbitmap": "decodeMMRBitmap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, decodeBitmap(), CCITTFaxDecoder, .readNextChar(), .onImmediateHalftoneRegion(), .onSymbolDictionary()]
- "public_pdf_worker_min_devicecmykcs": "DeviceCmykCS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getOutputLength(), .getRgbBuffer(), .getRgbItem(), .#t()]
- "public_pdf_worker_min_devicergbcs": "DeviceRgbCS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getOutputLength(), .getRgbBuffer(), .getRgbItem(), .isPassthrough()]
- "public_pdf_worker_min_dict_getasync": ".getAsync()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.loadResources(), Dict, .fetchAsync(), .loadXfaFonts(), .#Z(), writeStream()]
- "public_pdf_worker_min_draw_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Draw, getInteger(), getMeasurement(), getRelevant(), getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_errorfont": "ErrorFont" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .charsToGlyphs(), .constructor(), .encodeString(), .exportData(), .handleSetFont()]
- "public_pdf_worker_min_escapestring": "escapeString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .createNewAppearanceStream(), ._getCombAppearance(), ._getAppearance(), ._renderText(), writeValue()]
- "public_pdf_worker_min_evalstate": "EvalState" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .clone(), .constructor(), .fillColorSpace(), .strokeColorSpace(), .getOperatorList()]
- "public_pdf_worker_min_exclgroup_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExclGroup, getInteger(), getMeasurement(), getRelevant(), getStringOption(), XFAObjectArray]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-019.json

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
