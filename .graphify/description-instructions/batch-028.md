# Node Description Batch 29 of 139

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

- "public_pdf_worker_min_invalidpdfexception": "InvalidPDFException" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .indexObjects(), .parse()]
- "public_pdf_worker_min_istruetypecollectionfile": "isTrueTypeCollectionFile()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair(), getFontFileType(), .peekBytes(), bytesToString()]
- "public_pdf_worker_min_items": "Items" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindItems(), .constructor(), .[nn](), .items()]
- "public_pdf_worker_min_jbig2image_parsechunks": ".parseChunks()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Jbig2Image, processSegments(), readSegments(), SimpleSegmentVisitor, .decodeImage()]
- "public_pdf_worker_min_jpximage_parseimageproperties": ".parseImageProperties()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpxImage, .getInt32(), .skip(), JpxError, .constructor()]
- "public_pdf_worker_min_layouttext": "layoutText()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, layoutNode(), TextMeasure, .addString(), .compute()]
- "public_pdf_worker_min_lexer_gethexstring": ".getHexString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Lexer, ._hexStringWarn(), toHexDigit(), warn(), .getObj()]
- "public_pdf_worker_min_lexer_getobj": ".getObj()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Lexer, FormatError, .getHexString(), .getName(), .peekChar()]
- "public_pdf_worker_min_lexer_peekchar": ".peekChar()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Lexer, .getNumber(), .getObj(), .getString(), .peekByte()]
- "public_pdf_worker_min_lookuprect": "lookupRect()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .extractTextContent(), .getOperatorList(), .constructor(), isNumberArray()]
- "public_pdf_worker_min_lzwstream": "LZWStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .readBits(), .readBlock(), .makeFilter()]
- "public_pdf_worker_min_meshstreamreader_readcoordinate": ".readCoordinate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._decodeType4Shading(), ._decodeType5Shading(), ._decodeType6Shading(), ._decodeType7Shading(), MeshStreamReader]
- "public_pdf_worker_min_messagehandler_sendwithpromise": ".sendWithPromise()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MessageHandler, .buildPaintImageXObject(), .fetchBuiltInCMap(), .fetchStandardFontData(), .constructor()]
- "public_pdf_worker_min_metadataparser_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MetadataParser, ._parse(), ._repair(), SimpleXMLParser, .parseFromString()]
- "public_pdf_worker_min_murmurhash3_64": "MurmurHash3_64" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .hexdigest(), .update(), .preEvaluateFont()]
- "public_pdf_worker_min_nameornumbertree": "NameOrNumberTree" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .get(), .getAll(), .getRaw()]
- "public_pdf_worker_min_objectloader_load": ".load()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ObjectLoader, ._walk(), RefSet, .loadXfaFonts(), .loadXfaImages()]
- "public_pdf_worker_min_operatorlist_addimageops": ".addImageOps()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[addLocallyCachedImageOps(), OperatorList, .addOp(), .buildPaintImageXObject(), .getOperatorList()]
- "public_pdf_worker_min_overflow": "Overflow" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[ur](), .[nn](), .overflow()]
- "public_pdf_worker_min_p": "P" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[jr](), .[sn](), .p()]
- "public_pdf_worker_min_page_extracttextcontent": ".extractTextContent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, .ensureCatalog(), .getContentStream(), PartialEvaluator, .getTextContent()]
- "public_pdf_worker_min_page_savenewannotations": ".saveNewAnnotations()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, PartialEvaluator, RefSet, RefSetCache, writeObject()]
- "public_pdf_worker_min_page_view": ".view()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, isArrayEqual(), shadow(), .intersect(), warn()]
- "public_pdf_worker_min_pagearea_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageArea, getInteger(), getRelevant(), getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_pagearea_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageArea, .success(), measureToString(), _s, warn()]
- "public_pdf_worker_min_para_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Para, fixTextIndent(), measureToString(), toStyle(), .assign()]
- "public_pdf_worker_min_parsebfchar": "parseBfChar()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, expectString(), isCmd(), strToInt(), parseCMap()]
- "public_pdf_worker_min_parsedefaultappearance": "parseDefaultAppearance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .setDefaultAppearance(), ._getAppearance(), DefaultAppearanceEvaluator, ._getAppearance()]
- "public_pdf_worker_min_parser_d": ".#D()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .peekBytes(), bytesToString(), info(), isWhiteSpace()]
- "public_pdf_worker_min_parser_filter": ".filter()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, FormatError, .makeFilter(), warn(), .fetchIfRef()]
- "public_pdf_worker_min_partialevaluator_buildpath": ".buildPath()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .buildFontPaths(), .addOp(), warn(), .getOperatorList()]
- "public_pdf_worker_min_partialevaluator_ensurestatefont": ".ensureStateFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, FormatError, warn(), .getOperatorList(), .getTextContent()]
- "public_pdf_worker_min_partialevaluator_getbasefontmetrics": ".getBaseFontMetrics()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .extractWidths(), ia, .isSerifFont(), .translateFont()]
- "public_pdf_worker_min_partialevaluator_handletransferfunction": ".handleTransferFunction()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, isName(), isPDFFunction(), .fetchIfRef(), .setGState()]
- "public_pdf_worker_min_partialevaluator_readtounicode": ".readToUnicode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .extractDataStructures(), IdentityToUnicodeMap, ToUnicodeMap, warn()]
- "public_pdf_worker_min_pdfdocument_fingerprints": ".fingerprints()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, shadow(), stringToBytes(), toHexUtil(), vs]
- "public_pdf_worker_min_pdfdocument_startxref": ".startXRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .peekByte(), .skip(), isWhiteSpace(), shadow()]
- "public_pdf_worker_min_pdfdocument_xfadatasets": ".xfaDatasets()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, DatasetReader, shadow(), stringToUTF8String(), warn()]
- "public_pdf_worker_min_pdffunctionfactory_createfromarray": ".createFromArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), PDFFunctionFactory, .parseArray(), .fetch(), .constructor()]
- "public_pdf_worker_min_pdfimage_fillopacity": ".fillOpacity()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage, .createImageData(), FormatError, .fillGrayBuffer(), resizeImageMask()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-028.json

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
