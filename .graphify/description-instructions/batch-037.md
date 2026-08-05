# Node Description Batch 38 of 139

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

- "public_pdf_worker_min_highlightannotation_createnewdict": ".createNewDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[HighlightAnnotation, Dict, getModificationDate(), stringToAsciiOrUTF16BE()]
- "public_pdf_worker_min_html": "Html" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .html()]
- "public_pdf_worker_min_huffmantable_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[HuffmanTable, .assignPrefixCodes(), HuffmanTreeNode, .buildTree()]
- "public_pdf_worker_min_imageedit": "ImageEdit" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .imageEdit()]
- "public_pdf_worker_min_imageresizer_createimage": ".createImage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageResizer, ._encodeBMP(), log2(), .fill()]
- "public_pdf_worker_min_integerobject": "IntegerObject" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .[$s]()]
- "public_pdf_worker_min_isvalidexplicitdest": "isValidExplicitDest()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parseDestDictionary(), fetchDest(), fetchRemoteDest()]
- "public_pdf_worker_min_items_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Items, getInteger(), getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_items_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Items, fr, .success(), sn]
- "public_pdf_worker_min_jbig2image": "Jbig2Image" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parse(), .parseChunks(), .decodeImage()]
- "public_pdf_worker_min_jpegimage_canuseimagedecoder": ".canUseImageDecoder()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, JpegError, readUint16(), skipData()]
- "public_pdf_worker_min_jpxerror": "JpxError" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .decode(), .parseImageProperties()]
- "public_pdf_worker_min_jpximage": "JpxImage" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .cleanup(), .decode(), .parseImageProperties()]
- "public_pdf_worker_min_lexer_getname": ".getName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Lexer, toHexDigit(), warn(), .getObj()]
- "public_pdf_worker_min_line": "Line" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .line()]
- "public_pdf_worker_min_linear": "Linear" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .linear()]
- "public_pdf_worker_min_linearization_create": ".create()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Linearization, isCmd(), Lexer, Parser]
- "public_pdf_worker_min_localcolorspacecache": "LocalColorSpaceCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._localColorSpaceCache(), .set(), .getOperatorList()]
- "public_pdf_worker_min_localfunctioncache": "LocalFunctionCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .set(), ._localFunctionCache()]
- "public_pdf_worker_min_localgstatecache": "LocalGStateCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .set(), .getOperatorList(), .getTextContent()]
- "public_pdf_worker_min_localimagecache": "LocalImageCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .set(), .getOperatorList(), .getTextContent()]
- "public_pdf_worker_min_localtilingpatterncache": "LocalTilingPatternCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .set(), .getOperatorList()]
- "public_pdf_worker_min_lockdocument": "LockDocument" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .lockDocument()]
- "public_pdf_worker_min_lookupcmap": "lookupCmap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, compileCharString(), .getPathJs(), .hasBuiltPath()]
- "public_pdf_worker_min_margin": "Margin" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .margin()]
- "public_pdf_worker_min_markupannotation_createnewannotation": ".createNewAnnotation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.saveNewAnnotations(), MarkupAnnotation, writeObject(), .getNewTemporaryRef()]
- "public_pdf_worker_min_meshshading_buildfigurefrompatch": "._buildFigureFromPatch()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshShading, assert(), getB(), .constructor()]
- "public_pdf_worker_min_meshshading_decodetype5shading": "._decodeType5Shading()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshShading, .constructor(), .readComponents(), .readCoordinate()]
- "public_pdf_worker_min_meshstreamreader_readflag": ".readFlag()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._decodeType4Shading(), ._decodeType6Shading(), ._decodeType7Shading(), MeshStreamReader]
- "public_pdf_worker_min_metadataparser_parsearray": "._parseArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MetadataParser, ._parse(), ._getSequence(), .hasChildNodes()]
- "public_pdf_worker_min_missingdataexception": "MissingDataException" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .ensureByte(), .ensureRange(), .constructor()]
- "public_pdf_worker_min_mr": "mr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[mr](), .[mr](), .[rn]()]
- "public_pdf_worker_min_networkpdfmanager_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NetworkPdfManager, ChunkedStreamManager, .getStream(), PDFDocument]
- "public_pdf_worker_min_nullcipher": "NullCipher" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .#J(), .decryptBlock(), .encrypt()]
- "public_pdf_worker_min_numericedit": "NumericEdit" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .numericEdit()]
- "public_pdf_worker_min_occur": "Occur" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[$s](), .occur()]
- "public_pdf_worker_min_operatorlist_adddependencies": ".addDependencies()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[OperatorList, .addDependency(), .handleSetFont(), .handleTilingType()]
- "public_pdf_worker_min_operatorlist_addoplist": ".addOpList()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[OperatorList, .addOp(), warn(), .getOperatorList()]
- "public_pdf_worker_min_optionobject": "OptionObject" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .[$s]()]
- "public_pdf_worker_min_p_sn": ".[sn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[P, fr, sn, wr]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-037.json

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
