# Node Description Batch 36 of 139

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

- "public_pdf_worker_min_catalog_optionalcontentconfig": ".optionalContentConfig()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, RefSetCache, shadow(), warn()]
- "public_pdf_worker_min_catalog_p": ".#P()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, RefSet, stringToPDFString(), .fetchIfRef()]
- "public_pdf_worker_min_catalog_pagelabels": ".pageLabels()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, ._readPageLabels(), shadow(), warn()]
- "public_pdf_worker_min_catalog_permissions": ".permissions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, ._readPermissions(), shadow(), warn()]
- "public_pdf_worker_min_catalog_readdests": "._readDests()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .destinations(), .getDestination(), NameTree]
- "public_pdf_worker_min_catalog_structtreeroot": ".structTreeRoot()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, ._readStructTreeRoot(), shadow(), warn()]
- "public_pdf_worker_min_catalog_viewerpreferences": ".viewerPreferences()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .getKeys(), shadow(), warn()]
- "public_pdf_worker_min_ccittfaxstream": "CCITTFaxStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .readBlock(), .makeFilter()]
- "public_pdf_worker_min_cff_duplicatefirstglyph": ".duplicateFirstGlyph()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFF, warn(), .constructor(), .checkAndRepair()]
- "public_pdf_worker_min_cffcharset": "CFFCharset" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .parseCharsets(), .wrap()]
- "public_pdf_worker_min_cffcompiler_compilecharstrings": ".compileCharStrings()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compile(), .compileIndex(), CFFIndex]
- "public_pdf_worker_min_cffcompiler_compiletypedarray": ".compileTypedArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compileCharset(), .compileEncoding(), .compileFDSelect()]
- "public_pdf_worker_min_cffcompiler_encodenumber": ".encodeNumber()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compileDict(), .encodeFloat(), .encodeInteger()]
- "public_pdf_worker_min_cffdict_removebyname": ".removeByName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.compile(), .compileTopDicts(), CFFDict, .parsePrivateDict()]
- "public_pdf_worker_min_cffdict_setbykey": ".setByKey()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFDict, warn(), .createDict(), .emptyPrivateDictionary()]
- "public_pdf_worker_min_cfffdselect": "CFFFDSelect" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getFDIndex(), .parseFDSelect()]
- "public_pdf_worker_min_cfffdselect_getfdindex": ".getFDIndex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFFDSelect, .parseCharStrings(), compileCharString(), .compileGlyph()]
- "public_pdf_worker_min_cffheader": "CFFHeader" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .parseHeader(), .wrap()]
- "public_pdf_worker_min_cffoffsettracker_offset": ".offset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.compileIndex(), .compilePrivateDicts(), .compileTopDicts(), CFFOffsetTracker]
- "public_pdf_worker_min_cffoffsettracker_setentrylocation": ".setEntryLocation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.compile(), .compilePrivateDicts(), CFFOffsetTracker, FormatError]
- "public_pdf_worker_min_cffparser_emptyprivatedictionary": ".emptyPrivateDictionary()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .setByKey(), .createDict(), .parsePrivateDict()]
- "public_pdf_worker_min_cffparser_parsecharsets": ".parseCharsets()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .parse(), CFFCharset, FormatError]
- "public_pdf_worker_min_cffparser_parsecharstring": ".parseCharString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .fill(), warn(), .parseCharStrings()]
- "public_pdf_worker_min_cffparser_parseencoding": ".parseEncoding()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .parse(), CFFEncoding, FormatError]
- "public_pdf_worker_min_cffparser_parseindex": ".parseIndex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .parse(), CFFIndex, .parsePrivateDict()]
- "public_pdf_worker_min_cffparser_parsestringindex": ".parseStringIndex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .parse(), bytesToString(), CFFStrings]
- "public_pdf_worker_min_cffprivatedict": "CFFPrivateDict" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .tables(), .wrap()]
- "public_pdf_worker_min_cfftopdict": "CFFTopDict" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .tables(), .wrap()]
- "public_pdf_worker_min_chunkedstream_ensurebyte": ".ensureByte()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream, MissingDataException, .getByte(), .makeSubStream()]
- "public_pdf_worker_min_chunkedstreammanager_abort": ".abort()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, .cancelAllRequests(), .destroy(), .terminate()]
- "public_pdf_worker_min_chunkedstreammanager_requestrange": ".requestRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, .getBeginChunk(), .getEndChunk(), ._requestChunks()]
- "public_pdf_worker_min_ciphertransform_createstream": ".createStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransform, DecryptStream, .makeInlineImage(), .makeStream()]
- "public_pdf_worker_min_ciphertransform_decryptstring": ".decryptString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransform, bytesToString(), stringToBytes(), .getObj()]
- "public_pdf_worker_min_ciphertransformfactory_l": ".#L()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransformFactory, ARCFourCipher, .encryptBlock(), vs]
- "public_pdf_worker_min_ciphertransformfactory_m": ".#M()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransformFactory, ARCFourCipher, .encryptBlock(), vs]
- "public_pdf_worker_min_clearglobalcaches": "clearGlobalCaches()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .cleanup(), .cleanup(), .createDocumentHandler()]
- "public_pdf_worker_min_cmap_addcodespacerange": ".addCodespaceRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.process(), CMap, .constructor(), parseCodespaceRange()]
- "public_pdf_worker_min_contentarea": "ContentArea" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .contentArea()]
- "public_pdf_worker_min_contentarea_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ContentArea, .success(), isPrintOnly(), measureToString()]
- "public_pdf_worker_min_contentobject": "ContentObject" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .[Wr]()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-035.json

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
